import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, Item } from '../../shared/cart.service';
import { AuthService } from '../../shared/auth.service';
import { ItemsComponent } from './items.component';

@Component({
  selector: 'demo-review',
  templateUrl: 'app/review.component.html',
  directives: [ItemsComponent]
})
export class ReviewComponent implements OnInit {
  public items: Item[] = [];
  public total: number = 0;
  public qty: number = 0;
  
  constructor(
    private router: Router,
    private auth: AuthService,
    private cart: CartService) {}

  ngOnInit() {
    this.cart.items$
      .subscribe(items => {
        if (items) {
          this.items = items;
        }
      });

    this.cart.total$
      .subscribe(total => {
        this.total = total;
      })
      
    this.cart.qty$
      .subscribe(qty => {
        this.qty = qty;
      })
  }

  checkout() {
    this.auth.authorized$
      .subscribe(authorized => {
        if (authorized) {
          this.router.navigate(['/checkout']);
        } else {
          this.auth.requestAuth();
        }
      });
  }

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