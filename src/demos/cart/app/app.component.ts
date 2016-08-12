import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
  selector: 'cart-app',
  template: `
    <h1>cart app component template</h1>`,
  directives: [ROUTER_DIRECTIVES]
  // template: `
  //   <demo-nav></demo-nav> 
  //   <router-outlet></router-outlet>`,
  //directives: [ROUTER_DIRECTIVES, NavComponent],
  //providers: [Branding, ProductService, ProfileService, CartService]
})
export class AppComponent {}
