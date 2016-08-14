import { provideRouter, RouterConfig }  from '@angular/router';
import { CommunityComponent } from './community.component';
import { SessionComponent } from '../../shared/session.component';

const ROUTES: RouterConfig = [
  {
    path: '',
    component: CommunityComponent
  },
  {
    path: 'community',
    component: CommunityComponent
  },
  {
    path: 'session',
    component: SessionComponent
  }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(ROUTES)
];