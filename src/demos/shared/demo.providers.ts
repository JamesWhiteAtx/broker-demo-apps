import { HTTP_PROVIDERS } from '@angular/http';
 import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { NavComponent } from './nav.component';
import { BrandingService } from './branding.service';
import { ProfileService } from './profile.service';

export const DEMO_PROVIDERS = [
  HTTP_PROVIDERS, 
  { provide: LocationStrategy, useClass: HashLocationStrategy }, 
  { provide: 'Window',  useValue: window },
  ConfigService,
  StorageService,
  AuthService,
  BrandingService,
  ProfileService
];

// import { AuthGuard } from './auth-guard.service';
  //AuthGuard,
