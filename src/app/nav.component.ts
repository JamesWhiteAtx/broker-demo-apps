import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Branding } from './branding.service';
import { Brand } from './brand';
import { ConfigService } from './config.service';
import { Configuration } from './configuration';

@Component({
  selector: 'demo-nav',
  templateUrl: 'app/nav.component.html',
  directives: [ROUTER_DIRECTIVES],
  providers: [Branding, Title, ConfigService]
})
export class NavComponent { 
  brand: Brand;
  config: Configuration;

  public constructor(
    private branding: Branding,
    private titleService: Title,
    private configService: ConfigService ) { }
  
  ngOnInit() {
    
    this.branding.brand$.subscribe(brand => {
      this.brand = brand;
      if (this.brand && this.brand.title) {
        this.titleService.setTitle( this.brand.title );
      }
    });

    this.configService.configuration$.subscribe(config => {
      this.config = config;
    });
    
  }
  
}