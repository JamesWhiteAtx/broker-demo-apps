import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/combineLatest';
import { AuthService, AuthState } from './auth.service';

export interface Profile {
  userName: string;
  preferences: any[];
}

@Injectable()
export class ProfileService {

  private _profile: BehaviorSubject<Profile>;
  public profile$: Observable<Profile>;

  constructor(
    private http: Http,
    private auth: AuthService) {

    this._profile = new BehaviorSubject<Profile>(null);
    this.profile$ = this._profile.asObservable();

    this.auth.authorized$
      .combineLatest(this.auth.state$, (authorized: boolean, state: AuthState) => {
        return {authorized: authorized, state: state};
      })
      .subscribe(args => {
        if (args.authorized) {
          var bearerToken = args.state.bearerToken.encoded;
          var headers = new Headers();
          headers.append('Content-Type', 'application/json');
          headers.append('Accept', 'application/json, application/scim+json');
          headers.set('Authorization', 'Bearer ' + bearerToken);

          this.http.get('/scim/v2/Me', {headers: headers} )
            .map(response => {
              var profile = <Profile>response.json();
              
              var preferences = profile['urn:unboundid:schemas:sample:profile:1.0']['topicPreferences'] || [];
              preferences = preferences.filter(function filter(item) {
                return item.strength > 0;
              }).sort(function compare(a, b) {
                return a.strength - b.strength;
              });
              profile.preferences = preferences;

              return profile;

            }).subscribe(profile => {
              this._profile.next(profile);
            });
        } else {
          this._profile.next(null);
        }
                
      });
  }

}