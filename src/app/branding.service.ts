import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Brand } from './brand';

@Injectable()
export class Branding {

  public brand$: Observable<Brand>;

  constructor(private http: Http) {
    this.brand$ = this.http.get('config/brand.json')
      .map(response => {
        var raw: any = response.json();
        return new Brand(raw.title, raw.logo);
      })
      .share();
  }
}