import { Component, OnInit } from '@angular/core';
import { ConfigService } from './config.service';
import { Configuration } from './configuration';
import { AuthService, AuthState } from './auth.service';
import { JwtComponent } from './jwt.component'

//import { ProfileService } from './profile.service';
interface NameValue {name: string, value?: string}

@Component({
  selector: 'demo-session',
  templateUrl: 'app/session.component.html',
  directives: [JwtComponent]
})
export class SessionComponent {
  private state: AuthState;
  private authSegments: NameValue[];
  private response: NameValue[];
  private accDecoded: boolean = true;
  private idDecoded: boolean = true;
  
  constructor(
    private config: ConfigService,
    private auth: AuthService) {
    
    this.config.configuration$.subscribe(configuration => {
      var src = 'endpoint=' + configuration.authUrl
      this.authSegments = src.split(/[?&]/g)
        .map(seg => {
          var arr = seg.split('=');
          return {
            name: arr[0], 
            value: arr[1] ? decodeURIComponent(arr[1]) : null
          };
        });

      //this.authUrl = this.formatUrl(configuration.authUrl);
    });

    this.auth.state$.subscribe(state => {
      this.state = state;

      state.respParams.expiresTime = this.secondsToHms(state.respParams.expires_in);

      this.response = [];
      for(var prop in state.respParams) {
        this.response.push({
          name: prop,
          value: state.respParams[prop]
        });
      }
    });

  }

  // private formatUrl(url: string): string {
  //   var formatted = decodeURIComponent(url);
  //   formatted = formatted.replace(/[&]/g, '\n\r    &');
  //   formatted = formatted.replace(/[?]/g, '\n\r    ?');
  //   return formatted;
  // }
  toggleAcc() {
    this.accDecoded = ! this.accDecoded;
    return false;
  }
  toggleId() {
    this.idDecoded = ! this.idDecoded;
    return false;
  }
  private secondsToHms(arg: any): string {
    var seconds = Number(arg);
    var h = Math.floor(seconds / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s); 
  }
}

