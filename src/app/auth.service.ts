import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import { ConfigService } from './config.service';
import { Configuration } from './configuration';
import { Jwt } from './jwt'

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

export class AuthValues {
  authorized: boolean;
  encoded: string;
  params: AuthParams;
  bearerToken: Jwt;
  idToken: Jwt;

  constructor(encoded: string) {
    this.encoded = encoded;
    this.params = <AuthParams>parseParams(atob(decodeURIComponent(this.encoded)));
    this.bearerToken = new Jwt(this.params.access_token);
    this.idToken = new Jwt(this.params.id_token);
  }

  get valid(): boolean {
    return this.bearerToken.valid;
  }
} 

export class AuthUrls {
  constructor(public authUrl: string, public logoutUrl: string) { }
} 

const AUTH_VALUES_KEY = 'demo_auth_values';

@Injectable()
export class AuthService {

  private encodedValues$: Subject<string> = new Subject<string>();
  private authValues$: Subject<AuthValues> = new Subject<AuthValues>();

  private authorized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); 
  public authorized$: Observable<boolean> = this.authorized.asObservable().distinctUntilChanged();

  public profile$: Observable<any>;

  constructor(private configService: ConfigService) {
    this.init();
  }

  // authUrls$(): Observable<AuthUrls> {
  //   return this.configService.configuration$
  //     .filter(cfg => !!cfg)
  //     .map(cfg => new AuthUrls(this.makeAuthUrl(cfg), this.makeLogoutUrl(cfg)) );
  // }

  deAuthorize() {
    this.encodedValues$.next(null);
  }

  private init() {

    var cfg$ = this.configService.configuration$.filter(cfg => !!cfg);
    var vals$ = this.authValues$.filter(vals => !!vals);
	  
    this.profile$ = this.authorized$
        .combineLatest(vals$, cfg$, (authorized, vals, cfg) => {
        return {
          vals: vals,
          authorized: authorized,
          cfg: cfg
        };
      })
      .distinctUntilChanged()
      .map(x => {
        return {name: 'Sammy Bean'};
      })
      .share();
    // .subscribe(creds => {
    //   var x = creds;
    // });

    // this.authorized$.subscribe(val => {
    //   this.trig(val);
    // });
    // this.authValues.subscribe(val => {
    //   this.trig(val);
    // });
    // this.configService.configuration$.subscribe(val => {
    //   this.trig(val);
    // });

    this.encodedValues$
      .subscribe(encoded => {
        var authValues: AuthValues;
        if (encoded) {
          authValues = new AuthValues(encoded);
          if (! authValues.valid) {
            authValues = null;
          }
        } 
        if (authValues) {
          window.sessionStorage.setItem(AUTH_VALUES_KEY, authValues.encoded);
        } else {
          window.sessionStorage.removeItem(AUTH_VALUES_KEY);
        }
        this.authValues$.next(authValues);
      });

    this.authValues$
      .subscribe(authValues => {
        var authorized = !!authValues && !!authValues.valid;
        this.authorized.next(authorized);
      });

    this.encodedValues$.next(this.loadEncodedValues());
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

  
  private trig(val: any) {
    var x = 2;
  }
  
  testProfile() {
    this.getResource();
  }
  
  // getResource() {
  //   this.configService.configuration$.subscribe(cfg => {
  //       var x = cfg;
  //   });
  // }
 
}          
    