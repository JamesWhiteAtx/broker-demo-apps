import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BrandingService, Brand } from './branding.service';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';
import { ProfileService, Profile } from './profile.service';

@Component({
  selector: 'demo-nav',
  templateUrl: '../shared/nav.component.html',
  directives: [ROUTER_DIRECTIVES],
  providers: [Title]
})
export class NavComponent implements OnInit {
  brand: Brand;
  authorized: boolean;
  appName: string;
  authUrl: string;
  logoutUrl: string;
  accountUrl: string;
  profile: Profile;

  public constructor(
    private branding: BrandingService,
    private title: Title,
    private config: ConfigService,
    private auth: AuthService,
    private proSrvc: ProfileService
    // private cart: CartService
  ) { }

  ngOnInit() { 
    this.branding.data$
      .subscribe(brand => {
        this.brand = brand;
        if (this.brand && this.brand.title) {
          this.title.setTitle( this.brand.title );
        }
      });

    this.config.data$
      .subscribe(cfg => {
        this.appName = cfg.appName;
      });    

    this.auth.authorized$
      .subscribe(authorized => {
        this.authorized = authorized;
      });
    
    this.proSrvc.profile$
      .subscribe(profile => {
        this.profile = profile;
      });
  }
}