import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';

export class Brand {
  constructor(
    public title: string,
    public logo: string) { 
  }
}

@Injectable()
export class BrandingService {
  private _data: ReplaySubject<Brand> = new ReplaySubject<Brand>(1);
  public data$: Observable<Brand> = this._data.asObservable();

  
  constructor(private http: Http) {
    this.http.get('brand.json')
      .subscribe(response => {
        var raw: any = response.json();
         this._data.next( new Brand(raw.title, raw.logo) );
      });
  }
}

