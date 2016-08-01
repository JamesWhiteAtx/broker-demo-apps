import { bootstrap }    from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import { LocationStrategy,
         HashLocationStrategy } from '@angular/common';

import { APP_ROUTER_PROVIDERS } from './app.routes';
import { AppComponent } from './app.component';

bootstrap(AppComponent, [ 
  HTTP_PROVIDERS, 
  APP_ROUTER_PROVIDERS,
  { provide: LocationStrategy, useClass: HashLocationStrategy }
])
  .then(
    () => window.console.info( 'Angular finished bootstrapping your application!' ),
    (error) => {
      console.warn( 'Angular was not able to bootstrap your application.' );
      console.error( error );
    }
  );
