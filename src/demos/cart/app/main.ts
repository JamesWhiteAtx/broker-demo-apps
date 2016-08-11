import { bootstrap }    from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';

bootstrap(AppComponent, [ 
  HTTP_PROVIDERS, 
  { provide: LocationStrategy, useClass: HashLocationStrategy }
])
  .then(
    () => window.console.info( 'Angular finished bootstrapping cart!' ),
    (error) => {
      console.warn( 'Angular was not able to bootstrap cart application.' );
      console.error( error );
    }
  );
