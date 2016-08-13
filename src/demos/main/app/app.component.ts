import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { NavComponent } from '../../shared/nav.component';
import { BrandingService } from '../../shared/branding.service';
// import { ProductService } from './product.service';
// import { ProfileService } from './profile.service';
// import { CartService } from './cart.service';

@Component({
  selector: 'main-app',
  template: `
    <demo-nav></demo-nav>
    <div>main app component template</div>
    <div class="row"><div class="col-sm-3"><a href="../cart">Cart</a></div><div class="col-sm-3"><a href="../social">Social</a></div></div>
    <router-outlet></router-outlet>`,
  // template: `
  //   <demo-nav></demo-nav> 
  //   <router-outlet></router-outlet>`,
  directives: [ROUTER_DIRECTIVES, NavComponent],
  providers: [BrandingService
  //, ProductService, ProfileService, CartService
  ]
})
export class AppComponent {}
