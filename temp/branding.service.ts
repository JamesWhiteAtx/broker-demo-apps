import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';

export class Brand {
  constructor(
    public title: string,
    public logo: string
  ) { }
}

@Injectable()
export class Branding {
  private _brand: ReplaySubject<Brand> = new ReplaySubject<Brand>(1);
  public brand$: Observable<Brand> = this._brand.asObservable();

  constructor(private http: Http) {
    this.http.get('config/brand.json')
      .subscribe(response => {
        var raw: any = response.json();
        this._brand.next( new Brand(raw.title, raw.logo) );
      });
  }
}