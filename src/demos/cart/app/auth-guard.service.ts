import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../../shared/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private authorized: boolean = false;
  
  constructor(
    private authService: AuthService, 
    private router: Router) {

    //https://github.com/angular/angular/pull/10412
    this.authService.authorized$.subscribe(authorized => {
      this.authorized = authorized;
    });
  }

  canActivate() {
    if (this.authorized) {
      return true;
    } else {
      this.router.navigate(['/review']);
      return false;
    }
  }
}