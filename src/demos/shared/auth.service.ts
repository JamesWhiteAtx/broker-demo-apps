import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/distinctUntilChanged';
import { Jwt } from './jwt';
import { ConfigService } from './config.service';
import { Configuration } from './configuration';
import { StorageService } from './storage.service';

interface UrlParms {
  [key: string]: string;
}

function parseParams(url: string): UrlParms {
  var params: UrlParms = {}, regex = /([^&=]+)=([^&]*)/g, m: RegExpExecArray;
  url = url.substring(1);
  while (m = regex.exec(url)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  return params;
}

export interface AuthParams {
  access_token?: string;
  expires_in?: string;
  id_token?: string;
  scope?: string;
  state?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
} 

export interface AuthErr {
  error: string;
  description: string;
}

export class AuthState {
  respFrag: string;
  respParams: AuthParams;
  accessToken: Jwt;
  idToken: Jwt;
  errors: AuthErr[];

  private _authorized: boolean;

  constructor(authStore?: AuthStore) {
    this._authorized = false;
    this.errors = [];
    
    if (authStore) {
      this.respFrag = authStore.respFrag;
      if (this.respFrag) {
        this.respParams = <AuthParams>parseParams(atob(decodeURIComponent(this.respFrag)));

        // check for response errors
        if (this.respParams.error) {
          this.addErr(this.respParams.error, this.respParams.error_description);
        }

        // compare state  
        if (authStore.reqState != this.respParams.state) {
          this.addErr('State', 'Request state (' + authStore.reqState +
            ') does not match response state (' + this.respParams.state + ').');
        }

        this.accessToken = new Jwt(this.respParams.access_token);
        this.accessToken.errors.forEach(descr => this.addErr('Access Token', descr));

        if (this.respParams.id_token) {
          this.idToken = new Jwt(this.respParams.id_token);
          this.idToken.errors.forEach(descr => this.addErr('ID Token', descr));
        }

        this._authorized = this.accessToken.valid;
      }
    }
  }

  get authorized(): boolean {
    if (this._authorized) {
      this._authorized = this.accessToken.valid;
    }
    return this._authorized;
  }

  private addErr(error: string, description: string) {
    this.errors.push({error: error, description: description});
  }
  
} 

export class AuthStore {
  reqUrl: string;
  reqState: string;
  respFrag: string;
}

@Injectable()
export class AuthService {

  private _state: BehaviorSubject<AuthState> = new BehaviorSubject<AuthState>(new AuthState());
  public state$: Observable<AuthState> = this._state.asObservable();
  private _authorized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authorized$: Observable<boolean> = this._authorized.asObservable().distinctUntilChanged();

  private responseSearch: string;

  constructor(
    private config: ConfigService,
    private storage: StorageService) {
    
    this.responseSearch = window.location.search;

    this.subscribeToStateChange();

    this.config.data$.subscribe(cfg => {
      this.decodeAuth(cfg, this.loadAuthStore(cfg));
    });
  }

  private subscribeToStateChange() {
    this.state$ 
      .subscribe(state => {
        var authorized = !!state && !!state.authorized;

        this._authorized.next(authorized);
        //this._error.next(any errors);
      });
  }

  private decodeAuth(cfg: Configuration, authStore: AuthStore) {
    var state: AuthState = new AuthState(authStore);
    this._state.next(state);
  }

  private loadAuthStore(cfg: Configuration): AuthStore {
    var searchParams: Object;
    var chash: Object;

    var authStore = this.getStore(cfg);
    
    searchParams = parseParams(this.responseSearch);
    if (searchParams) {
      chash = searchParams['chash'];
      if (typeof chash === 'string') {  // there is a chash param
        if (chash.length > 0) {         // the chash has a value
          authStore.respFrag = chash;
          this.setStore(cfg, authStore);
        }
      }
    }

    return authStore;
  }

  private requestAuth() {
    var stateToken = this.makeStateToken();
    
    this.config.data$.subscribe(cfg => {
      var url = cfg.getAuthorizeUrl(stateToken);

      var authStore = new AuthStore();
      authStore.reqState = stateToken;
      authStore.reqUrl = url;

      this.setStore(cfg, authStore);

      window.location.assign(url);
    })
    .unsubscribe();
    return false;
  }

  private logout() {
    this.config.data$.subscribe(cfg => {

      var authStore = this.getStore(cfg);
      var url = cfg.getLogoutUrl(authStore.reqState);
      this.removeStore(cfg);

      window.location.assign(url);
    })
    .unsubscribe();
    return false;
  }

  private setStore(cfg: Configuration, authStore: AuthStore) {
    this.storage.set(cfg.clientID, authStore);
  }
  private getStore(cfg: Configuration): AuthStore {
    var authStore = this.storage.get<AuthStore>(cfg.clientID);
    if (! authStore) {
      authStore = new AuthStore;
    }
    return authStore;
  }
  private removeStore(cfg: Configuration) {
    this.storage.remove(cfg.clientID);
    var authStore = this.storage.get<AuthStore>(cfg.clientID);
  }

  private makeStateToken(): string {
    var rand = Math.floor(Math.random() * (999999 - 0 + 1)) + 0;
    var stateToken = rand.toString();
    return stateToken;
  }

}          
    