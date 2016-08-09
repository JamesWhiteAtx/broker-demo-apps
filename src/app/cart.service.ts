import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/distinctUntilChanged';
import { ProfileService } from './profile.service';
import { ProductService, Product } from './product.service';

export interface Item extends Product {
  qty: number;
  added: number;
}

interface CartData {
  user?: string;
  last?: string;
  items: Item[];
}

const CART_KEY = 'demo_cart';

@Injectable()
export class CartService {
  private _items: BehaviorSubject<Item[]>;
  public items$: Observable<Item[]>;
  public qty$: Observable<number>;
  public total$: Observable<number>;  

  private user: string;
  private last: string;
  
  constructor(
    private profileService: ProfileService,
    private products: ProductService) {

    this._items = new BehaviorSubject<Item[]>([]);
    this.items$ = this._items.asObservable();

    this.qty$ = this.items$.map<number>(items => {
      var qty: number = 0;
      items.forEach(item => {
        qty += item.qty;
      });
      return qty;
    })
    .share();

    this.total$ = this.items$.map<number>(items => {
      var total: number = 0;
      items.forEach(item => {
        total += item.qty * item.price;
      });
      return total;
    })
    .share();

    this.profileService.profile$.distinctUntilChanged()
      .subscribe(profile => {
        this.user = profile ? profile.userName : null;

        var stored = this.getStoredCart();
        if ( stored.last && this.user && (stored.last !== this.user) ) {
          window.sessionStorage.removeItem(CART_KEY);
          stored = {items: []}
        }
        this._items.next(stored.items);
      });
    
    this.items$
      .subscribe(items => {
          var serialized = window.sessionStorage.getItem(CART_KEY);
          var stored = this.getStoredCart();

          stored.last = this.user || stored.last;
          stored.items = items;

          window.sessionStorage.setItem(CART_KEY, JSON.stringify(stored));
      });
    
  }

  add(item: Item) {
    item.added = item.qty;
    var items = this._items.getValue();
    if (items.indexOf(item) === -1) {
      items.push(item);
    }
    this._items.next(items);
  }

  getById(id: string): Observable<Item> {
    return this.products.getById(id)
      .map<Item>(prod => {
        var items = this._items.getValue();
        var item = items.filter(item => item.id == prod.id)[0];
        if (! item) {
          item = <Item>prod;
          item.qty = 0;
          item.added = 0;
        }
        return item;
      });
  }

  remove(item: Item) {
    item.added = 0; 
    item.qty = 0;
    var items = this._items.getValue();
    var idx = items.indexOf(item); 
    if (idx !== -1) {
      items.splice(idx, 1);
    }
    this._items.next(items);
  }

  private getStoredCart(): CartData {
    var serialized = window.sessionStorage.getItem(CART_KEY);
    var stored = (serialized) ? <CartData>JSON.parse(serialized) : <CartData>{};
    stored.items = stored.items || [];
    return stored;
  }
}