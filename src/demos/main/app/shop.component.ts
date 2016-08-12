import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
// import { ProductService, Product } from './product.service';
// import { Profile, ProfileService } from './profile.service';

@Component({
  selector: 'demo-shop',
  template: `<h1>shop component template</h1>`
  //templateUrl: 'app/shop.component.html',
})
export class ShopComponent { // implements OnInit
  public constructor(
    private router: Router,
    private auth: AuthService,
    // private products: ProductService,
    // private profile: ProfileService
    ) {}
  
  //ngOnInit() {}

  // buy(product: Product) {
  //   let link = ['/buy', product.id];
  //   this.router.navigate(link);
  //   return false;
  // }   
}