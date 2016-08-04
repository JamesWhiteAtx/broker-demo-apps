import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Branding } from './branding.service';
import { Brand } from './brand';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';
import { Profile, ProfileService } from './profile.service';

@Component({
  selector: 'demo-nav',
  templateUrl: 'app/nav.component.html',
  directives: [ROUTER_DIRECTIVES],
  providers: [Title]
})
export class NavComponent implements OnInit { 
  brand: Brand;
  authorized: boolean;
  authUrl: string;
  logoutUrl: string;
  profile: Profile;

  public constructor(
    private branding: Branding,
    private title: Title,
    private auth: AuthService,
    private config: ConfigService,
    private profileService: ProfileService) { }
  
  ngOnInit() {
    
    this.branding.brand$
      .subscribe(brand => {
        this.brand = brand;
        if (this.brand && this.brand.title) {
          this.title.setTitle( this.brand.title );
        }
      });

    this.config.configuration$
      .subscribe(cfg => {
        this.authUrl = cfg.authUrl;
        this.logoutUrl = cfg.logoutUrl;
      });

    this.auth.authorized$
      .subscribe(authorized => {
        this.authorized = authorized;
      });

    this.profileService.current$
      .subscribe(profile => {
        this.profile = profile;
      });

  }

  authToggle() {
    this.auth.deAuthorize();
  }
  
}