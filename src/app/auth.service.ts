import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import { ConfigService } from './config.service';
import { Configuration } from './configuration';
import { Jwt } from './jwt'

interface UrlParms {
  [key: string]: string;
}

export class AuthParams {
  raw: string;
  access_token: string;
  expires_in: string;
  id_token: string;
  scope: string;
  state: string;
  token_type: string;
  error: string;
  error_description: string;
  bearerToken: Jwt;
  idToken: Jwt;

  constructor(raw: string) {
    this.ra
    
  }
} 

export class AuthUrls {
  constructor(public authUrl: string, public logoutUrl: string) { }
} 

@Injectable()
export class AuthService {

  constructor(private configService: ConfigService) {
    this.init();
  }

  authUrls$(): Observable<AuthUrls> {
    return this.configService.configuration$
      .filter(cfg => !!cfg)
      .map(cfg => new AuthUrls(this.makeAuthUrl(cfg), this.makeLogoutUrl(cfg)) );
  }

  private init() {
    var authParams: AuthParams;
    var chash: string;
    var searchParams: Object;
    
    searchParams = this.parseParams(window.location.search);
    if (searchParams) {
      chash = searchParams['chash'];
      if (chash) {
        authParams = this.decodeAuthParams(chash);
      }
    }

  }

  private buildUrl(base: string, path: string): string {
    if (base && base.lastIndexOf('/') === base.length - 1) {
      base = base.substring(0, base.length - 1);
    }
    if (path && path.indexOf('/') === 0) {
      path = path.substring(1);
    }
    return (base || '') + '/' + (path || '');
  }

  private decodeAuthParams(encoded: string): AuthParams {
    var authParams = <AuthParams>this.parseParams(atob(decodeURIComponent(encoded)));

    authParams.raw = encoded;
    authParams.bearerToken = new Jwt(authParams.access_token);
    authParams.idToken = new Jwt(authParams.id_token);
    
    return authParams;    
  }

  private parseParams(url: string): UrlParms {
    var params: UrlParms = {}, regex = /([^&=]+)=([^&]*)/g, m: RegExpExecArray;
    url = url.substring(1);
    while (m = regex.exec(url)) {
      params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
  }

  private makeAuthUrl(cfg: Configuration) {
    var state = this.makeState();
	  
    return this.buildUrl(cfg.identityProviderUrl,cfg.authorizeRoute) + '?' +
      'response_type=' + encodeURIComponent('token id_token') + '&' +
      'client_id=' + encodeURIComponent(cfg.clientID) + '&' +
      'redirect_uri=' + encodeURIComponent(cfg.clientRedirectUrl) + '&' +
      'scope=' + encodeURIComponent(cfg.scopes.join(' ')) + '&' +
      'acr_values=' + encodeURIComponent(cfg.acrValues.join(' ')) + '&' +
      'nonce=' + encodeURIComponent(state) + '&' +
      'state=' + encodeURIComponent(state);
  }

  private makeLogoutUrl(cfg: Configuration) {
    return this.buildUrl(cfg.identityProviderUrl, cfg.logoutRoute) + '?' +
      'post_logout_redirect_uri=' + encodeURIComponent(cfg.clientRedirectUrl) + '&' +
      'state=' + encodeURIComponent(this.makeState());
  }

  private makeState(): string {
    var rand = Math.floor(Math.random() * (999999 - 0 + 1)) + 0;
    var state = rand.toString();
    return state;
  }

}          
    