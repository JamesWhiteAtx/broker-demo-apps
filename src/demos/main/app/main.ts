import { bootstrap }    from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { APP_ROUTER_PROVIDERS } from './app.routes';
import { AppComponent } from './app.component';
import { ConfigService } from '../../shared/config.service';
import { StorageService } from '../../shared/storage.service';
import { AuthService } from '../../shared/auth.service';
// import { AuthGuard } from './auth-guard.service';

bootstrap(AppComponent, [ 
  HTTP_PROVIDERS, 
  APP_ROUTER_PROVIDERS,
  { provide: LocationStrategy, useClass: HashLocationStrategy },
  { provide: 'Window',  useValue: window },  
  ConfigService, 
  StorageService,
  AuthService  
  // , AuthGuard
])
.then(
  () => window.console.info( 'Finished bootstrapping application!' ),
  (error) => {
    console.warn( 'Unable to bootstrap application.' );
    console.error( error );
  }
);
