import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, Item } from '../../shared/cart.service';
import { AuthService } from '../../shared/auth.service';
import { ItemsComponent } from './items.component';

@Component({
  selector: 'demo-review',
  templateUrl: 'app/review.component.html',
  directives: [ItemsComponent]
})
export class ReviewComponent implements OnInit {
  public authorized: boolean = false;
  public qty: number = 0;
  
  constructor(
    private router: Router,
    private auth: AuthService,
    private cart: CartService) {}

  ngOnInit() {
    this.cart.qty$
      .subscribe(qty => {
        this.qty = qty;
      })
  }

  checkout() {
    this.auth.authorized$
      .subscribe(authorized => {
        this.authorized = authorized;
        if (authorized) {
          this.router.navigate(['/checkout']);
        } else {
          this.auth.requestAuth();
        }
      });
  }

}