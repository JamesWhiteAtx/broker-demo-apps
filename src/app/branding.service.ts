import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Brand } from './brand';

@Injectable()
export class Branding {

  private brand: BehaviorSubject<Brand> = new BehaviorSubject(null);
  public brand$: Observable<Brand> = this.brand.asObservable();

  /**
   *
   */
  constructor(private http: Http) {
    this.init();    
  }

  private init() {
    this.load().subscribe((brand: Brand) => {
      this.brand.next(brand); 
    });
  }

  private load(): Observable<Brand> {
    return this.http.get('config/brand.json')
      .map(response => {
        var raw: any = response.json();
        return new Brand(raw.title, raw.logo);
      });
  }

}