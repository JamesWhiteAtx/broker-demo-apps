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
  providers: [Title]
})
export class NavComponent { 
  brand: Brand;
  authorized: boolean;
  authUrl: string;
  logoutUrl: string;

  public constructor(
    private branding: Branding,
    private title: Title,
    private auth: AuthService) { }
  
  ngOnInit() {
    
    this.branding.brand$.subscribe(brand => {
      this.brand = brand;
      if (this.brand && this.brand.title) {
        this.title.setTitle( this.brand.title );
      }
    });

    this.auth.authUrls$().subscribe(urls => {
        this.authUrl = urls.authUrl;
        this.logoutUrl = urls.logoutUrl;
      });

    this.auth.authorized$.subscribe(authorized => {
        this.authorized = authorized;
      });

  }

  authToggle() {
    this.auth.deAuthorize();
  }
  
}