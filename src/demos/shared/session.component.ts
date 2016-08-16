import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/combineLatest';
import { AuthState, AuthStore } from './auth.service';
import { StorageService, KeyHash } from './storage.service';
import { Jwt } from './jwt'
import { DecodeComponent, Decoded, LabelDescr } from './decode.component'

export class ClientSession {
  public open: boolean = false;
  constructor(
    public clientId: string,
    public request: Decoded,
    public response: any) {  
  }
  
  toggle() {
    this.open = ! this.open;
    return false;
  } 
}

@Component({
  selector: 'demo-session',
  templateUrl: '../shared/session.component.html',
  styles: ['.session.container {padding-top: 30px;}', 
    '.session .row.section {margin-top: 5px;}'],
  directives: [DecodeComponent]
})
export class SessionComponent {
  public clients: ClientSession[] = [];  
  constructor(
    private storage: StorageService) {
  }

  ngOnInit() {
    this.clients = [];
    let multi = this.storage.getMulti();
    if (multi) {
      for (let key in multi) {
        let client = this.decodeStored(key, <AuthStore>multi[key]);
        if (client) {
          this.clients.push(client);
        }
      }

      if (this.clients.length === 1) {
        this.clients[0].open = true;
      }
    }
  }

  private decodeStored(id: string, authStore: AuthStore): ClientSession {
    let request: Decoded;
    let state: AuthState;
    let response: Decoded;
    let sess: ClientSession;

    // Request
    if (authStore.reqUrl) {
      let url = 'endpoint=' + authStore.reqUrl;
      var reqValues = url.split(/[?&]/g)
        .map(seg => {
          var arr = seg.split('=');
          return {
            label: arr[0], 
            descr: arr[1] ? decodeURIComponent(arr[1]) : null
          };
        });

      request = new Decoded('Request', authStore.reqUrl, reqValues);
    }

    // Response
    if (authStore.respFrag) {
      state = new AuthState(authStore);

      let respValues = [
        {label: 'Token Type', descr: state.respParams.token_type},
        {label: 'Duration', descr: this.secondsToHms(state.respParams.expires_in)},
        {label: 'Scope', descr: state.respParams.scope},
        {label: 'State', descr: state.respParams.state},
        this.decodeJwt('Access Token', state.accessToken),
        this.decodeJwt('ID Token', state.idToken)
      ];

      let errors = [];
      if (state.errors && state.errors.length) {
        state.errors.forEach(err => {
          errors.push({label: err.error, descr: err.description});
        });
      }

      response = new Decoded('Response', authStore.respFrag, respValues, errors);
    }
    
    if (request || response) {
      sess = new ClientSession(id, request, response);
    }
    return sess;
  }
  
  private decodeJwt(label: string, jwt: Jwt): Decoded {
    var values: LabelDescr[] = [];

    addValue('Valid', jwt.valid.toString());
    jwt.errors.forEach(err => {
      addValue('Error', err);  
    });
    if (jwt.payload.auth_time) {
      addValue('Authorized', Jwt.dateToString(jwt.payload.auth_time).toLocaleString());
    }
    addValue('Issued', jwt.payload.issued.toLocaleString());
    addValue('Expires', jwt.payload.expires.toLocaleString());
    addValue('Subject', jwt.payload.sub);
    addValue('Scope', jwt.payload.scope);
    addValue('Client ID', jwt.payload.client_id);
    addValue('ACR', jwt.payload.acr);
    addValue('Audience', jwt.payload.aud);
    addValue('Issuer', jwt.payload.iss);
    addValue('Nonce', jwt.payload.nonce);
    addValue('AMR', jwt.payload.amr);

    return new Decoded(label, jwt.encoded, values);

    function addValue(label: string, descr: Object) {
      var descrStr: string;
      if (typeof descr === 'string') {
        descrStr = descr;
      } else if (descr && descr.toString) {
        descrStr = descr.toString();
      }
      if (descrStr) {
        values.push({label: label, descr: descrStr});
      }
    }
  } 

  private secondsToHms(arg: any): string {
    var seconds = Number(arg);
    var h = Math.floor(seconds / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s); 
  }
}