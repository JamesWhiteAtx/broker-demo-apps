import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/auth.service';
import { CartService, Item } from '../../shared/cart.service';


@Component({
  selector: 'demo-review',
  templateUrl: 'app/checkout.component.html'
})
export class CheckoutComponent implements OnInit {

  constructor(
    private auth: AuthService) {
  }

  ngOnInit() {
    this.auth.authorized$
      .subscribe(authorized => {
        let x = authorized;
      });    
  }
}
 