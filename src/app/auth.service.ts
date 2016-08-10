import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/distinctUntilChanged';
import { Jwt } from './jwt';

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

const AUTH_VALUES_KEY = 'demo_auth_values';

@Injectable()
export class AuthService {

  private _state: BehaviorSubject<AuthState> = new BehaviorSubject<AuthState>(new AuthState());
  public state$: Observable<AuthState> = this._state.asObservable();
  private _authorized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authorized$: Observable<boolean> = this._authorized.asObservable().distinctUntilChanged();

  constructor() {
    this.init();
  }
  
  deAuthorize() {
    this.decodeAuth(null);
  }

  private init() {
    this.state$ 
      .subscribe(state => {
        var authorized = !!state && !!state.authorized;
        this._authorized.next(authorized);
      });

    this.decodeAuth(this.loadEncodedValues());
  }

  private decodeAuth(encoded) {
    var state: AuthState = new AuthState(encoded);
    
    if (state.authorized) {
      window.sessionStorage.setItem(AUTH_VALUES_KEY, state.encoded);
    } else {
      window.sessionStorage.removeItem(AUTH_VALUES_KEY);
    }

    this._state.next(state);
  }

  private loadEncodedValues(): string {
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
    // if not return yet, try to read the auth values string from storage 
    return window.sessionStorage.getItem(AUTH_VALUES_KEY);
  }

}          
    