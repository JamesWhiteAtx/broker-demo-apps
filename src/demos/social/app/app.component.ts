import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { NavComponent } from '../../shared/nav.component';
import { BrandingService } from '../../shared/branding.service';

@Component({
  selector: 'social-app',
  template: `
    <demo-nav></demo-nav> 
    <router-outlet></router-outlet>
    `,
  directives: [ROUTER_DIRECTIVES, NavComponent],
  providers: [BrandingService]
})
export class AppComponent {}
