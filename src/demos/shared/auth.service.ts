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

export class AuthState {
  encoded: string;
  respParams: AuthParams;
  bearerToken: Jwt;
  idToken: Jwt;

  private _authorized: boolean;

  constructor(encoded?: string) {
    if (encoded) {
      this.encoded = encoded;
      this.respParams = <AuthParams>parseParams(atob(decodeURIComponent(this.encoded)));
      this.bearerToken = new Jwt(this.respParams.access_token);
      this.idToken = new Jwt(this.respParams.id_token);
      
      this._authorized = this.bearerToken.valid;
    } else {
      this._authorized = false;
    }
  }

  get authorized(): boolean {
    if (this._authorized) {
      this._authorized = this.bearerToken.valid;
    }
    return this._authorized;
  }

  private decode(encoded: string): AuthParams {
    return parseParams(atob(decodeURIComponent(this.encoded)));
  }
} 

class AuthStore {
  reqUrl: string;
  reqState: string;
  respFrag: string;
}

const AUTH_VALUES_KEY = 'demo_auth_values';
const AUTH_STATE_KEY = 'demo_auth_state';
const AUTH_LAST_URL = 'demo_last_url';

@Injectable()
export class AuthService {

  private _state: BehaviorSubject<AuthState> = new BehaviorSubject<AuthState>(new AuthState());
  public state$: Observable<AuthState> = this._state.asObservable();
  private _authorized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authorized$: Observable<boolean> = this._authorized.asObservable().distinctUntilChanged();

  constructor(
    private config: ConfigService,
    private storage: StorageService) {
    this.init();
  }
  
  private init() {
    this.state$ 
      .subscribe(state => {
        var authorized = !!state && !!state.authorized;
        
        if (authorized) {
          var stateToken = window.sessionStorage.getItem(AUTH_STATE_KEY);
          authorized = (state.respParams.state === stateToken);
        }

        this._authorized.next(authorized);
      });

    this.config.data$.subscribe(cfg => {
      this.decodeAuth(cfg, this.loadEncodedValues(cfg));
    });
    //.unsubscribe();

  }

  lastAuthUtl() {
    return window.sessionStorage.getItem(AUTH_LAST_URL);
  }

  private decodeAuth(cfg: Configuration, encoded) {
    var state: AuthState = new AuthState(encoded);
    
    if (state.authorized) {
      window.sessionStorage.setItem(AUTH_VALUES_KEY, state.encoded);
    } else {
      window.sessionStorage.removeItem(AUTH_VALUES_KEY);
    }

    this._state.next(state);
  }

  private loadEncodedValues(cfg: Configuration): string {
    var searchParams: Object;
    var chash: Object;
    
    searchParams = parseParams(window.location.search);
    if (searchParams) {
      chash = searchParams['chash'];
      if (typeof chash === 'string') {  // there is a chash param
        if (chash.length > 0) {         // the chash has a value
          return chash;
        } else {                        // the chash is an empty string, logout
          return null;                  // the auth values are cleared
        }
      }
    }

    var id = cfg.clientID;
    var authStore = this.storage.getObject<AuthStore>(id);

    // if not return yet, try to read the auth values string from storage 
    return window.sessionStorage.getItem(AUTH_VALUES_KEY);
  }

  private requestAuth() {
    var stateToken = this.makeStateToken();
    
    this.config.data$.subscribe(cfg => {
      var url = cfg.getAuthorizeUrl(stateToken);
      window.sessionStorage.setItem(AUTH_STATE_KEY, stateToken);
      window.sessionStorage.setItem(AUTH_LAST_URL, url);

      var id = cfg.clientID;
      var authStore = new AuthStore();
      authStore.reqState = stateToken;
      authStore.reqUrl = url;
      this.storage.setObject(id, authStore);

      window.location.assign(url);
    })
    .unsubscribe();
    return false;
  }

  private logout() {
    this.config.data$.subscribe(cfg => {
      var stateToken = window.sessionStorage.getItem(AUTH_STATE_KEY);
      var url = cfg.getLogoutUrl(stateToken);
      window.location.assign(url);
    })
    .unsubscribe();
    return false;
  }

  private makeStateToken(): string {
    var rand = Math.floor(Math.random() * (999999 - 0 + 1)) + 0;
    var stateToken = rand.toString();
    return stateToken;
  }

  // deAuthorize() {
  //   this.decodeAuth(null);
  // }
}          
    