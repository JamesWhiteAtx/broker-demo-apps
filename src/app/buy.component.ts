import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { ProductService, Product } from './product.service';
import { CartService, Item } from './cart.service';

@Component({
  selector: 'demo-shop',
  templateUrl: 'app/buy.component.html',
  directives: [ROUTER_DIRECTIVES]
})
export class BuyComponent implements OnInit {
  item: Item;
  constructor(
    private route: ActivatedRoute,
    private products: ProductService,
    private cart: CartService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id'] !== undefined) {
        let id = params['id'];

        this.cart.getById(id)
          .subscribe(item => {
            this.item = item;
          });

      } else {
        this.item = null;
      }
    });
  }

  inc() {
    if (this.item) {
      this.item.qty += 1;
    }
  }
  dec() {
    if (this.item && this.item.qty > 0) {
      this.item.qty -= 1;
    }
  }
  add(item: Item) {
    this.cart.add(item);
  }   

  subs: any[] = [];
  testadd() {
    this.subs.push(this.cart.qty$.subscribe(q => q));
  }
  testclear() {
    this.subs.forEach(s => s.unsubscribe()  )
  }

}