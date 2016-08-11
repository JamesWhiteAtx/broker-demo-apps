import { Component, OnInit } from '@angular/core';
import { CartService, Item } from './cart.service';

@Component({
  selector: 'demo-review',
  templateUrl: 'app/review.component.html'
})
export class ReviewComponent { //implements OnInit {

  constructor(private cart: CartService) {}

  //ngOnInit() {}

  dec(item: Item) {
    if (item && item.qty > 0) {
      item.qty -= 1;
      this.cart.add(item);
    }
  }
  inc(item: Item) {
    if (item) {
      item.qty += 1;
      this.cart.add(item);
    }
  }
  remove(item: Item) {
    this.cart.remove(item);
  }

}