import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { NavComponent } from '../../shared/nav.component';

@Component({
  selector: 'cart-app',
  template: `
    <demo-nav></demo-nav> 
    <router-outlet></router-outlet>
    `,
  directives: [ROUTER_DIRECTIVES, NavComponent]
})
export class AppComponent {}
