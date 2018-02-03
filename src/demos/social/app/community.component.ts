import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/auth.service';
import { ConnectedComponent } from './connected.component';
import { GeneralComponent } from './general.component';

@Component({
  selector: 'demo-community',
  templateUrl: 'app/community.component.html',
  directives: [ConnectedComponent, GeneralComponent]
})
export class CommunityComponent implements OnInit {
  authorized: boolean = false;
  user: string;
  
  constructor(
    private auth: AuthService) {    
  }

  ngOnInit() {
    this.auth.authorized$
      .subscribe(authorized => {
        this.authorized = authorized;
      });
    
  }
}