import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/distinctUntilChanged';
import { ProfileService } from './profile.service';
import { ProductService, Product } from './product.service';
import { StorageService } from './storage.service';

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
  private _items: BehaviorSubject<Item[]> = new BehaviorSubject<Item[]>(null);
  public items$: Observable<Item[]> = this._items.asObservable();
  private _qty: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public qty$: Observable<number> = this._qty.asObservable();
  private _total: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public total$: Observable<number> = this._total.asObservable();  

  private user: string;
  private last: string;
  
  constructor(
    private profileService: ProfileService,
    private products: ProductService,
    private storage: StorageService) {

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
    
    this.items$.subscribe(items => {
      if (items) {
        this.updateStored(items);
        this.updateQty(items);
        this.updateTotal(items);
      }
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
    var stored = this.storage.getObject<CartData>(CART_KEY) || <CartData>{};
    stored.items = stored.items || [];
    return stored;
  }

	private updateStored(items: Item[]) {
    var stored = this.storage.getObject<CartData>(CART_KEY) || <CartData>{};
    stored.last = this.user || stored.last;
    stored.items = items;
    this.storage.setObject(CART_KEY, stored);
  }
  
  private updateQty(items: Item[]) {
    var qty: number = 0;
    items.forEach(item => {
      qty += item.qty;
    });
    this._qty.next(qty);
  }

  private updateTotal(items: Item[]) {
    var total: number = 0;
    items.forEach(item => {
      total += item.qty * item.price;
    });
    this._total.next(total);
  }
  
}