import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Configuration } from './configuration';

@Injectable()
export class ConfigService {

  private configuration: BehaviorSubject<Configuration> = new BehaviorSubject(null);
  public configuration$: Observable<Configuration> = this.configuration.asObservable();

  /**
   *
   */
  constructor(private http: Http) {
    this.init();    
  }

  private init() {
    this.load().subscribe((brand: Configuration) => {
      this.configuration.next(brand); 
    });
  }

  private load(): Observable<Configuration> {
    return this.http.get('config/config.json')
      .map(response => {
        var raw: any = response.json();
        return new Configuration(
          raw.IDENTITY_PROVIDER_URL, 
          raw.RESOURCE_SERVER_UR,
          raw.AUTHORIZE_ROUTE,
          raw.LOGOUT_ROUTE,
          raw.CLIENT_REDIRECT_URL,
          raw.CLIENT_ID,
          raw.SCOPES,
          raw.ACR_VALUES
        );
      });
  }
}