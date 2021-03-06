import { bootstrap }    from '@angular/platform-browser-dynamic';
import { DEMO_PROVIDERS } from '../../shared/demo.providers';
import { APP_ROUTER_PROVIDERS } from './app.routes';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth-guard.service';

bootstrap(AppComponent, [
  APP_ROUTER_PROVIDERS,
  DEMO_PROVIDERS,
  AuthGuard
])
.then(
  () => window.console.info( 'Finished bootstrapping Cart!' ),
  (error) => {
    console.warn( 'Unable to bootstrap Cart application.' );
    console.error( error );
  }
);
