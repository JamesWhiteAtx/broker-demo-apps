import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Branding } from './branding.service';
import { Brand } from './brand';
import { AuthService } from './auth.service';

@Component({
  selector: 'demo-nav',
  templateUrl: 'app/nav.component.html',
  directives: [ROUTER_DIRECTIVES],
  providers: [Branding, Title, AuthService]
})
export class NavComponent { 
  brand: Brand;
  authUrl: string;
  logoutUrl: string;

  public constructor(
    private branding: Branding,
    private titleService: Title,
    private authService: AuthService) { }
  
  ngOnInit() {
    
    this.branding.brand$.subscribe(brand => {
      this.brand = brand;
      if (this.brand && this.brand.title) {
        this.titleService.setTitle( this.brand.title );
      }
    });

    this.authService.authUrls$().subscribe(urls => {
        this.authUrl = urls.authUrl;
        this.logoutUrl = urls.logoutUrl;
      });

  }
  
}