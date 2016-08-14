import { bootstrap }    from '@angular/platform-browser-dynamic';
import { DEMO_PROVIDERS } from '../../shared/demo.providers';
import { AppComponent } from './app.component';

bootstrap(AppComponent, [ 
  DEMO_PROVIDERS
])
.then(
  () => window.console.info( 'Finished bootstrapping Socail!' ),
  (error) => {
    console.warn( 'Unable to bootstrap Social application.' );
    console.error( error );
  }
);