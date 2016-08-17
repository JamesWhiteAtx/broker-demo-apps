import { Component, OnInit, Input } from '@angular/core';
import { CartService, Item } from '../../shared/cart.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'demo-items',
  templateUrl: 'app/items.component.html'
})
export class ItemsComponent implements OnInit {
  public items: Item[] = [];
  public total: number = 0;
  public qty: number = 0;

  @Input() totals: boolean = false;

  constructor(
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