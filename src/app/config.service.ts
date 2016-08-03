import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Configuration } from './configuration';

@Injectable()
export class ConfigService {
  
  public configuration$: Observable<Configuration>;

  constructor(private http: Http) {
    this.configuration$ = this.http.get('config/config.json')
      .map(response => {
        var raw: any = response.json();
        return new Configuration(
          raw.IDENTITY_PROVIDER_URL, 
          raw.RESOURCE_SERVER_URL,
          raw.AUTHORIZE_ROUTE,
          raw.LOGOUT_ROUTE,
          raw.CLIENT_REDIRECT_URL,
          raw.CLIENT_ID,
          raw.SCOPES,
          raw.ACR_VALUES
        );
      })
      .share();
  }

}