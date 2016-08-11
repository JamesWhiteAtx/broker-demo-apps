import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { Configuration } from './configuration';

@Injectable()
export class ConfigService {
  private _configuration: ReplaySubject<Configuration> = new ReplaySubject<Configuration>(1);
  public configuration$: Observable<Configuration> = this._configuration.asObservable();

  constructor(private http: Http) {
    this.http.get('config/config.json')
      .subscribe(response => {
        var raw: any = response.json();
        
        this._configuration.next(
        	new Configuration(
            raw.IDENTITY_PROVIDER_URL, 
            raw.RESOURCE_SERVER_URL,
            raw.AUTHORIZE_ROUTE,
            raw.LOGOUT_ROUTE,
            raw.CLIENT_REDIRECT_URL,
            raw.CLIENT_ID,
            raw.SCOPES,
            raw.ACR_VALUES));
      });
  }

}