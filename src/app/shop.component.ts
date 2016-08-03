import { Component, OnInit } from '@angular/core';
import { ProductService } from './product.service';

@Component({
  selector: 'demo-shop',
  template: `
    <h1>Shoping template</h1>
  `,
  providers: [ProductService]
})
export class ShopComponent { 
  public constructor(private prodService: ProductService) { }
  
  ngOnInit() {
    
    this.prodService.sections$.subscribe(val => {
      var x = val;
    });

    this.prodService.sections$.subscribe(val => {
      var a = val;
    });

    this.prodService.sections$.subscribe(val => {
      var z = val;
    });

  }
}