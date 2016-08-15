import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/combineLatest';
import { AuthService, AuthState, AuthStore } from './auth.service';
import { ConfigService } from './config.service';
import { Configuration } from './configuration';
import { StorageService, KeyHash } from './storage.service';
import { Jwt } from './jwt'
import { DecodeComponent, Decoded, LabelDescr } from './decode.component'

export class ClientSession {
  constructor(
    public clientId: string,
    public request: Decoded,
    public response: any) {  
  } 
}

@Component({
  selector: 'demo-session',
  templateUrl: '../shared/session.component.html',
  //styles: ['.session .row {margin-bottom: 10px;}', '.session .title {margin-top: 20px;}'],
  directives: [DecodeComponent]
})
export class SessionComponent {
  public clients: ClientSession[] = [];  
  constructor(
    private auth: AuthService,
    private config: ConfigService,
    private storage: StorageService) {
    
    // this.decoded = new Decoded('First of all...', 'gobbleygook',
    //   [
    //     {label: 'Secondly', descr: 'two'},
    //     {label: 'In addition', descr: 'three'},
    //     new Decoded('As well as..', 'kalfisticticexialidocious', [
    //       {label: 'Uno', descr: '1'},
    //       {label: 'Dos', descr: '2'}
    //     ])
    //   ]);
    // this.decoded.kids.push(new Decoded('Secondly'));
    // this.decoded.kids.push(new Decoded('In addition'));
  }

  ngOnInit() {
    this.auth.state$
      .combineLatest(this.config.data$, (state: AuthState, cfg: Configuration) => {})
      .subscribe(args => {
        this.clients = [];
        let multi = this.storage.getMulti();
        if (multi) {
          for (let key in multi) {
            this.clients.push(this.decodeStored(key, <AuthStore>multi[key]));
          }
        }
      });
  }

  private decodeStored(id: string, authStore: AuthStore): ClientSession {
    // Request
    let req = 'endpoint=' + authStore.reqUrl;
    var reqValues = req.split(/[?&]/g)
      .map(seg => {
        var arr = seg.split('=');
        return {
          label: arr[0], 
          descr: arr[1] ? decodeURIComponent(arr[1]) : null
        };
      });

    let request = new Decoded('Request', authStore.reqUrl, reqValues);

    // Response
    let state = new AuthState(authStore);

    let respValues = [
      {label: 'Token Type', descr: state.respParams.token_type},
      {label: 'Duration', descr: this.secondsToHms(state.respParams.expires_in)},
      {label: 'Scope', descr: state.respParams.scope},
      {label: 'State', descr: state.respParams.state},
      this.decodeJwt('Access Token', state.accessToken),
      this.decodeJwt('ID Token', state.idToken)
    ];

    let response = new Decoded('Response', authStore.respFrag, respValues);

    let sess = new ClientSession(id, request, response);
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