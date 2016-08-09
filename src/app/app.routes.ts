import { provideRouter, RouterConfig }  from '@angular/router';
import { ShopComponent } from './shop.component';
import { ProfileComponent } from './profile.component';
import { BuyComponent } from './buy.component';
import { ReviewComponent } from './review.component'

const ROUTES: RouterConfig = [
  {
    path: '',
    component: ShopComponent
  },
  {
    path: 'shop',
    component: ShopComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'buy/:id',
    component: BuyComponent
  },
  {
    path: 'review',
    component: ReviewComponent
  }
  
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(ROUTES)
];