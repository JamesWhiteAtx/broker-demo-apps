import { OnInit, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavComponent } from './nav.component'

@Component({
  selector: 'demo-app',
  template: '<demo-nav></demo-nav> <h1>Angular Demo App Template</h1>',
  directives: [NavComponent]
})
export class AppComponent implements OnInit { 
  public constructor(private titleService: Title ) { }

  ngOnInit() {
    this.titleService.setTitle( 'ShopCo' );
  }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }
}
