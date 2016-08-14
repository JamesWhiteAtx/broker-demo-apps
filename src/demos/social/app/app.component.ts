import { Component } from '@angular/core';
//import { ROUTER_DIRECTIVES } from '@angular/router';
import { NavComponent } from '../../shared/nav.component';
import { BrandingService } from '../../shared/branding.service';

@Component({
  selector: 'social-app',
  template: `
    <demo-nav></demo-nav> 
    <div>social app component template</div>
    <div class="row"><div class="col-sm-3"><a href="../main">Main</a></div><div class="col-sm-3"><a href="../cart">Cart</a></div></div>
    `,
  directives: [NavComponent],
  providers: [BrandingService]
})
export class AppComponent {}
