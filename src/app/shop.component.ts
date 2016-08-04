import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service'
import { ProductService } from './product.service';

@Component({
  selector: 'demo-shop',
  templateUrl: 'app/shop.component.html',
})
export class ShopComponent { 
  public constructor(
    private auth: AuthService,
    private products: ProductService) { }
  
  ngOnInit() {
    this.products.groups$.subscribe(val => {
      var z = val;
    });
  }
}