import { Component, OnInit } from '@angular/core';
import { Profile, ProfileService } from './profile.service';

@Component({
  selector: 'demo-profile',
  templateUrl: 'app/profile.component.html'
})
export class ProfileComponent implements OnInit {
  profile: Profile; 

  public constructor(private profileService: ProfileService) { }
  
  ngOnInit() {  
    this.profileService.profile$.subscribe(profile => {
      this.profile = profile;
    });
  }
}