import { Component, OnInit } from '@angular/core';
//import { AuthService } from '../../shared/auth.service';
import { CartService, Item } from '../../shared/cart.service';
import { ProfileService, Profile } from '../../shared/profile.service';
import { ItemsComponent } from './items.component';

@Component({
  selector: 'demo-review',
  templateUrl: 'app/checkout.component.html',
  directives: [ItemsComponent]
})
export class CheckoutComponent implements OnInit {
  public total: number = 0;
  public tax: number = 0;
  public qty: number = 0;
  public profile: Profile;
  public address: any;

  constructor(
    private cart: CartService,
    private profSrvc: ProfileService) {
  }

  ngOnInit() {
    this.cart.total$
      .subscribe(total => {
        this.total = total;
        this.tax = total * 0.08;
      })
      
    this.cart.qty$
      .subscribe(qty => {
        this.qty = qty;
      })
    
    this.profSrvc.profile$
      .subscribe(profile => {
        if (profile) {
          this.profile = profile;
          this.address = profile.addresses[0];
        }
      })
  }
}
 