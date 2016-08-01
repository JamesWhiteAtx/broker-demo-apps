import { OnInit, Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { NavComponent } from './nav.component'

@Component({
  selector: 'demo-app',
  template: `
    <demo-nav></demo-nav> 
    <h1>Angular Demo App Template</h1>
    <router-outlet></router-outlet>`,
  directives: [ROUTER_DIRECTIVES, NavComponent]
})
export class AppComponent implements OnInit { 
  public constructor() { }

  ngOnInit() {
  }

}
