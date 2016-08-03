import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
//import { Brand } from './brand';

export class Product {
  constructor(
    public id: string,
    public price: number,
    public descr1: string,
    public descr2: string,
    public img: string) { 
  }
}

export class Group {
  constructor(
    public urn: string,
    public display: string,
    public poducts: Product[]) {
  }
}

@Injectable()
export class ProductService {

  public preferences$: Observable<Group[]>;
  public general$: Observable<Group[]>;
  public sections$: Observable<any>;

  constructor(private http: Http) {
    this.sections$ = this.http.get('config/products.json')
      .map(response => {
        var raw: any = response.json();
        return raw;
      })
      .share();
  }
}