import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import { Profile, ProfileService } from './profile.service';

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

class ProdData {
  preferences: Group[];
  general: Group[];
  products: Product[];

  constructor(raw: any, relativeUrl: string) {
    this.preferences = raw.preferences;
    this.general = raw.general;

    this.products = [];
    this.addGroupProds(this.preferences, relativeUrl);
    this.addGroupProds(this.general, relativeUrl);
  }

  private addGroupProds(groups: Group[], relativeUrl: string) {
    groups.forEach(group => {
      group.products.forEach(product => {
        product.price = +product.price;
        product.img = relativeUrl + product.img;
        this.products.push(product);
      });
    });
  }
}

@Injectable()
export class ProductService {

  private _data: ReplaySubject<ProdData> = new ReplaySubject<ProdData>(1);
  public data$: Observable<ProdData> = this._data.asObservable();

  private _groups: ReplaySubject<Group[]> = new ReplaySubject<Group[]>(1);
  public groups$: Observable<Group[]> = this._groups.asObservable();

  constructor(
    private http: Http, 
    private profileService: ProfileService) {

    let relativeUrl = '../shared/';
    this.http.get(relativeUrl + 'products.json')
      .map<ProdData>(response => {
        return new ProdData(response.json(), relativeUrl);
      })
      .subscribe(data => {
        this._data.next(data);
      });

    this.data$
      .combineLatest(this.profileService.profile$,  (data: ProdData, profile: Profile) => {
        var groups: Group[];
        if (data) {
          if (profile) {
            groups = this.prefGroups(data.preferences, profile.preferences);
          } else {
            groups = data.general;
          }
        }
        return groups;
      })
      .subscribe(groups => {
        this._groups.next(groups);
      });
      
  }

  getById(id: string): Observable<Product> {
    return this.data$
      .map(data => {
        var product: Product;
        if (data) {
          product = data.products.filter(prod => prod.id == id)[0];
        }
        return product;
      })
      .filter(product => !!product) ;
  }

  private prefGroups(allGroups: Group[], prefs: any[]): Group[] {
    var groups: Group[] = [];
    var found: any;
    
    if ( allGroups && allGroups.length) {
      allGroups.forEach(group => {
        found = prefs.filter(pref => pref.id === group.urn)[0];
        if (found) {
          found.display = group.display;
          groups.push(group);
        }        
      });
    }
    
    return groups;
  }

}
