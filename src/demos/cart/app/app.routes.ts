import { provideRouter, RouterConfig }  from '@angular/router';
import { ReviewComponent } from './review.component';
import { SessionComponent } from '../../shared/session.component';

const ROUTES: RouterConfig = [
  {
    path: '',
    component: ReviewComponent
  },
  {
    path: 'review',
    component: ReviewComponent
  },
  {
    path: 'session',
    component: SessionComponent
  }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(ROUTES)
];