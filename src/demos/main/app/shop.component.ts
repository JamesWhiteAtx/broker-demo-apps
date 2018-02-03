import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { ProductService, Group, Product } from '../../shared/product.service';
import { Profile, ProfileService } from '../../shared/profile.service';

@Component({
  selector: 'demo-shop',
  templateUrl: 'app/shop.component.html'
})

export class ShopComponent implements OnInit {
  authorized: boolean = false;
  profile: Profile;
  groups: Group[] = [];
  public constructor(
    private router: Router,
    private auth: AuthService,
    private product: ProductService,
    private profSrvc: ProfileService
    ) { }
  
  ngOnInit() {
    this.auth.authorized$
      .subscribe(authorized => {
        this.authorized = authorized;
      });
    
    this.profSrvc.profile$
      .subscribe(profile => {
        this.profile = profile;
      });
    
    this.product.groups$
      .subscribe(groups => {
        this.groups = groups;
      });
  }

  buy(product: Product) {
    let link = ['/buy', product.id];
    this.router.navigate(link);
    return false;
  }   
}