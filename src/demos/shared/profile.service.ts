import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { AuthService, AuthState } from './auth.service';

export interface Profile {
  userName: string;
  preferences: any[];
  name: {
    givenName: string,
    formatted: string;
  }
}

@Injectable()
export class ProfileService {

  private _profile: ReplaySubject<Profile> = new ReplaySubject<Profile>(null);
  public profile$: Observable<Profile> = this._profile.asObservable();

  constructor(
    private http: Http,
    private auth: AuthService) {

    this.auth.state$
      .subscribe(state => {
        if (state.authorized) {
          var bearerToken = state.accessToken.encoded;
          var headers = new Headers();
          headers.append('Content-Type', 'application/json');
          headers.append('Accept', 'application/json, application/scim+json');
          headers.set('Authorization', 'Bearer ' + bearerToken);

          this.http.get('/scim/v2/Me', {headers: headers} )
            .map<Profile>(response => {
              var profile = <Profile>response.json();
              
              var preferences = profile['urn:unboundid:schemas:sample:profile:1.0']['topicPreferences'] || [];
              preferences = preferences.filter(function filter(item) {
                return item.strength > 0;
              }).sort(function compare(a, b) {
                return a.strength - b.strength;
              });
              profile.preferences = preferences;
              return profile;
            })
            .subscribe(
              profile => {
                this._profile.next(profile);
              },
              error => {
                this.auth.invalidateToken(error.status +' '+ 
                  error.statusText +' '+ error.url);
              });
        } else {
          this._profile.next(null);
        }
                
      });
  }

}