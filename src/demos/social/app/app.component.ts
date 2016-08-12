import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
  selector: 'social-app',
  template: `
    <h1>social app component template</h1>`,
  directives: [ROUTER_DIRECTIVES]
})
export class AppComponent {}
