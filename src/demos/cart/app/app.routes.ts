import { provideRouter, RouterConfig }  from '@angular/router';
import { ReviewComponent } from './review.component';
import { CheckoutComponent } from './checkout.component';
import { SessionComponent } from '../../shared/session.component';
import { AuthGuard } from './auth-guard.service'

const ROUTES: RouterConfig = [
  {
    path: '',
    component: CheckoutComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'review',
    component: ReviewComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'session',
    component: SessionComponent
  }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(ROUTES)
];