import { bootstrap }    from '@angular/platform-browser-dynamic';
import { DEMO_PROVIDERS } from '../../shared/demo.providers';
import { APP_ROUTER_PROVIDERS } from './app.routes';
import { AppComponent } from './app.component';

bootstrap(AppComponent, [ 
  APP_ROUTER_PROVIDERS,
  DEMO_PROVIDERS
])
.then(
  () => window.console.info( 'Finished bootstrapping Main!' ),
  (error) => {
    console.warn( 'Unable to bootstrap Main application.' );
    console.error( error );
  }
);
