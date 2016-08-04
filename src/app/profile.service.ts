import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/empty';
import { AuthService } from './auth.service';

export interface Profile {
  userName: string;
}

@Injectable()
export class ProfileService {
  xxx: string = 'JPW';
  public current$: Observable<any>;

  constructor(
    private http: Http,
    private auth: AuthService) {
    
    // this.current$ = this.auth.authorized$
    //   .map(authorized => {
    //     if (authorized) {
    //       var p: Profile = {userName: 'Spammy Jeans'};
    //       return p; 
    //     } else {
    //       return null;
    //     }
    //   });
      
    this.current$ = this.auth.authorized$
      // .combineLatest(this.auth.authValues$, (authorized, values) => {
      //   return {authorized: authorized, values: values};
      // })
      .flatMap<Profile>(authorized => {
        
        if (authorized) {
          var bearerToken = '';
          var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, application/scim+json',
            ['Authorization']: 'Bearer ' + bearerToken
          };

          return this.http.get('config/brand.json')
              .map(response => {
                var raw: Profile = response.json();
                raw.userName = 'Jim Bo';
                return raw;
              }); 
        } else {
          return Observable.empty();
        }
      });

  }

}