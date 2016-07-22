import { bootstrap }    from '@angular/platform-browser-dynamic';
import { Title } from '@angular/platform-browser';
import { AppComponent } from './app.component';

bootstrap(AppComponent, [ Title ])
  .then(
    () => window.console.info( 'Angular finished bootstrapping your application!' ),
    (error) => {
      console.warn( 'Angular was not able to bootstrap your application.' );
      console.error( error );
    }
  );
