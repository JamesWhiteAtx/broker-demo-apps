import { Component, OnInit } from '@angular/core';
import { AuthService, AuthState } from './auth.service';
import { JwtComponent } from './jwt.component'

//import { ProfileService } from './profile.service';
interface NameValue {name: string, value?: string}

@Component({
  selector: 'demo-session',
  templateUrl: 'app/session.component.html',
  styles: ['.session .row {margin-bottom: 10px;}', '.session .title {margin-top: 20px;}'],
  directives: [JwtComponent]
})
export class SessionComponent implements OnInit {
  private state: AuthState;
  private reqSegs: NameValue[];
  private respSegs: NameValue[];
  private accDecoded: boolean = true;
  private idDecoded: boolean = true;
  private duration: string;  
  
  constructor(private auth: AuthService) {}

  ngOnInit() {    

    this.auth.state$.subscribe(state => {
      this.state = state;

      var src = 'endpoint=' + this.auth.lastAuthUtl();
      this.reqSegs = src.split(/[?&]/g)
        .map(seg => {
          var arr = seg.split('=');
          return {
            name: arr[0], 
            value: arr[1] ? decodeURIComponent(arr[1]) : null
          };
        });


      this.duration = this.secondsToHms(state.respParams.expires_in);

      // list any that are not explicitly inclued in the template.
      var exclude = ['access_token', 'id_token', 'token_type', 'state', 'scope', 'expires_in'];
      this.respSegs = [];
      for(var prop in state.respParams) {
        if (exclude.indexOf(prop) === -1) {
          this.respSegs.push({
            name: prop,
            value: state.respParams[prop]
          });
        }
      }
    });

  }

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

