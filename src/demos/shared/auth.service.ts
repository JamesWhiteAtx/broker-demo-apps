import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/combineLatest';
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
          this.addAuthErr(this.respParams.error, this.respParams.error_description);
        }

        // compare state  
        if (authStore.reqState != this.respParams.state) {
          this.addAuthErr('State', 'Request state (' + authStore.reqState +
            ') does not match response state (' + this.respParams.state + ').');
        }

        this.accessToken = new Jwt(this.respParams.access_token);
        this.accessToken.errors.forEach(descr => this.addAuthErr('Access Token', descr));

        if (this.respParams.id_token) {
          this.idToken = new Jwt(this.respParams.id_token);
          this.idToken.errors.forEach(descr => this.addAuthErr('ID Token', descr));
        }

        if (authStore.errors && authStore.errors.length) {
          Array.prototype.push.apply(this.errors, authStore.errors);
        }

        this._authorized = (this.errors.length === 0) && this.accessToken.valid;
      }
    }
  }

  get authorized(): boolean {
    if (this._authorized && this.accessToken) {
      if (!this.accessToken.valid) {
        this.addAuthErr('Token Error', 'Access Token is not valid');
      }
      this._authorized =  (this.errors.length === 0);
    }
    return this._authorized;
  }

  public addAuthErr(error: string, description: string) {
    this.errors.push({error: error, description: description});
  }
} 

export class AuthStore {
  reqUrl: string;
  reqState: string;
  respFrag: string;
  errors: AuthErr[];
}

@Injectable()
export class AuthService {

  private _state: ReplaySubject<AuthState> = new ReplaySubject<AuthState>();
  public state$: Observable<AuthState> = this._state.asObservable();

  private _authorized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authorized$: Observable<boolean> = this._authorized.asObservable().distinctUntilChanged();

  private _error: ReplaySubject<AuthErr[]> = new ReplaySubject<AuthErr[]>();
  public error$: Observable<AuthErr[]> = this._error.asObservable().distinctUntilChanged();

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

  public invalidateToken(err: string) {
    this.state$.subscribe(state => {
      state.addAuthErr('Invalid Access Token', err);
      this._state.next(state);
    })
    .unsubscribe();
  }

  private subscribeToStateChange() {
    this.state$
      .combineLatest(this.config.data$, (state: AuthState, cfg: Configuration) => {
        return {state: state, cfg: cfg};
      })
      .distinctUntilChanged()
      .subscribe(arg => {
        var authorized = !!arg.state && !!arg.state.authorized;

        var authStore = this.getStore(arg.cfg);
        authStore.respFrag = arg.state.respFrag;
        authStore.errors = arg.state.errors;
        this.setStore(arg.cfg, authStore);

        this._authorized.next(authorized);
        this._error.next(arg.state.errors);
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
          delete authStore.errors;
        }
      }
    }

    return authStore;
  }

  public requestAuth() {
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

  public logout() {
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
    