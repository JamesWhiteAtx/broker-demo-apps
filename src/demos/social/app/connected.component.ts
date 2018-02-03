import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../shared/profile.service';

interface Message {
  sent: Date;
  from?: string;
  msg: string;
}

@Component({
  selector: 'demo-connected',
  templateUrl: 'app/connected.component.html'
})
export class ConnectedComponent implements OnInit {
  authorized: boolean = false;
  user: string;
  sender: string = 'Customer Care Larry Jones'
  messages: Message[] = [];
  date: Date;
  
  constructor(
    private profileService: ProfileService) {    
  }

  ngOnInit() {
    this.profileService.profile$.distinctUntilChanged()
      .subscribe(profile => {
        if (profile) {
          if (profile.name && profile.name.formatted) {
            this.user = profile.name.formatted;
          } else {
            this.user = profile.userName || 'you';
          }
        }
      });
    
    this.date = new Date();
    this.date.setDate( this.date.getDate() - 30 );

    let ask = (msg: string) => {
      this.date.setMinutes( this.date.getMinutes() + 76 );
      this.messages.push({
        sent: new Date( this.date.getTime() ),
        msg: msg
      });
    }

    let reply = (msg: string) => {
      this.date.setMinutes( this.date.getMinutes() + 12 );
      this.messages.push({
        sent: new Date( this.date.getTime() ),
        from: this.sender,
        msg: msg
      });
    }

    ask('Hi I have a question about a product that you offer on your online e-commerce web site.');
    reply('Welcome to Help! I would glad assist you. What is your question?');
    ask('Does the product that I am interested in have the features that I like installed from the factory? Or do I have to special order the product in question from you online e-commerce web site?');
    reply('That depends on several factors. If the product is of a certain color or size or type in relation to factory setting, then yes you have to special order. On the other hand if you order on a day ending with "y", we can configure your layout to meet any specifications that adhere to our coherence protocol.');
    ask('I see. So if I understand you, I can get the product that I am interested in from your online e-commerce site with custom underpinnings featuring the side-ways facing flanges in the color range from puce to pomegranate. I plan on ordering on some day in the foreseeable future.');
    reply('That is correct. As long as the purchase falls within our constrained period on constraint.');
    ask('Great, thanks');
    reply('Your welcome. Do you have any further questions?');
    ask('No, I have what I need. Have a good day.');
    reply('You too. Goodbye.');

  }

}