import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/combineLatest';
import { AuthService, AuthState } from './auth.service';
import { ConfigService } from './config.service';
import { Configuration } from './configuration';
import { StorageService, KeyHash } from './storage.service';
//import { JwtComponent } from './jwt.component'

@Component({
  selector: 'demo-session',
  template: `<div>session component template</div>`
  //templateUrl: 'app/session.component.html',
  //styles: ['.session .row {margin-bottom: 10px;}', '.session .title {margin-top: 20px;}'],
  //directives: [JwtComponent]
})
export class SessionComponent {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
    private storage: StorageService) {
  }

  ngOnInit() {
    this.auth.state$
      .combineLatest(this.config.data$, (state: AuthState, cfg: Configuration) => {
        
      })
      .subscribe(args => {
        let multi = this.storage.getMulti();
      });
  }
}