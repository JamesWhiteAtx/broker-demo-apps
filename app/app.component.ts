import { Injectable, Inject, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavComponent } from './nav.component'

@Component({
  selector: 'demo-app',
  template: '<demo-nav></demo-nav> <h1>My First Angular Pepper App</h1>',
  directives: [NavComponent]
})
export class AppComponent { 
  public constructor(@Inject(Title) private titleService: Title ) { }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }
}
