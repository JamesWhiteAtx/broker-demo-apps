import { bootstrap }    from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { ConfigService } from '../../shared/config.service';
import { AuthService } from '../../shared/auth.service';

bootstrap(AppComponent, [ 
  HTTP_PROVIDERS, 
  { provide: LocationStrategy, useClass: HashLocationStrategy },
  ConfigService, 
  AuthService
])
  .then(
    () => window.console.info( 'Angular finished bootstrapping Social application!' ),
    (error) => {
      console.warn( 'Angular was not able to bootstrap Social application.' );
      console.error( error );
    }
  );
