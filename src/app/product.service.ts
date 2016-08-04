import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';

export interface Product {
  id: string;
	price: number;
  descr1: string;
  descr2: string;
  img: string; 
}

export interface Group {
  urn: string;
  display: string;
  products: Product[];
}

@Injectable()
export class ProductService {

  groups$: Observable<Group[]>;
  private products$: Observable<any>;

  constructor(
    private http: Http, 
    private auth: AuthService) {
    
    this.products$ = this.http.get('config/products.json')
      .map(response => {
        var raw: any = response.json();
        return raw;
      })
      .share();

    this.groups$ = this.products$
      .combineLatest(this.auth.authorized$, (products, authorized) => {
        var groups: Group[];
        if (authorized) {
          groups = products.preferences;
        } else {
          groups = products.general;
        }
        return groups;
      });
  }
}