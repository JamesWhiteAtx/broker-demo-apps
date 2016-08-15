import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
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
        let cfg = new Configuration();
        cfg.identityProviderUrl = raw.IDENTITY_PROVIDER_URL;
        cfg.resourceServerUrl = raw.RESOURCE_SERVER_URL;
        cfg.authorizeRoute = raw.AUTHORIZE_ROUTE;
        cfg.logoutRoute = raw.LOGOUT_ROUTE;
        cfg.clientRedirectUrl = raw.CLIENT_REDIRECT_URL;
        cfg.responseType = raw.RESPONSE_TYPE;
        cfg.appName = raw.APP_NAME;
        cfg.clientID = raw.CLIENT_ID;
        cfg.scopes = raw.SCOPES;
        cfg.acrValues = raw.ACR_VALUES;

        this._data.next(cfg);
      });
  }

}