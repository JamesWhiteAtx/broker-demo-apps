import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { Configuration } from './configuration';

@Injectable()
export class ConfigService {
  private _data: ReplaySubject<Configuration> = new ReplaySubject<Configuration>(1);
  public data$: Observable<Configuration> = this._data.asObservable();

  constructor(private http: Http) {
    this.http.get('config.json')
      .subscribe(response => {
        var raw: any = response.json();
        
        this._data.next(
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