import { provideRouter, RouterConfig }  from '@angular/router';
import { ShopComponent } from './shop.component';
import { BuyComponent } from './buy.component';
import { SessionComponent } from '../../shared/session.component';

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
    path: 'session',
    component: SessionComponent
  },
  {
    path: 'buy/:id',
    component: BuyComponent
  }
  
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(ROUTES)
];