import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service'
import { ProductService } from './product.service';
import { Profile, ProfileService } from './profile.service';

@Component({
  selector: 'demo-shop',
  templateUrl: 'app/shop.component.html',
})
export class ShopComponent { //implements OnInit
  public constructor(
    private auth: AuthService,
    private products: ProductService,
    private profile: ProfileService) { }
  
  // ngOnInit() {
  //   this.products.groups$.subscribe(val => {
  //     var z = val;
  //   });
  // }
}