import { provideRouter, RouterConfig }  from '@angular/router';
import { ShopComponent } from './shop.component';
import { ProfileComponent } from './profile.component';

const ROUTES: RouterConfig = [
  { path: '', redirectTo: '/shop', pathMatch: 'full' }, 
  {
    path: 'shop',
    component: ShopComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  }
  
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(ROUTES)
];