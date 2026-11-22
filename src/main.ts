import { inject, provideAppInitializer } from '@angular/core';
import { TravelStore } from './app/store';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { UmrahPageComponent } from './app/umrah';
import { AppComponent } from './app/app';
import { HomeComponent, DestinationsComponent, TripDetailComponent, ContactComponent, AboutComponent } from './app/pages';
bootstrapApplication(AppComponent, {
 providers: [provideAppInitializer(()=>inject(TravelStore).loadPublished()), provideRouter([
  { path: '', component: HomeComponent, title: 'Lunavia — Le monde vous attend' },
  { path: 'destinations', component: DestinationsComponent, title: 'Destinations — Lunavia' },
  { path: 'voyage/:slug', component: TripDetailComponent, title: 'Votre prochaine évasion — Lunavia' },
  { path: 'omra', component: UmrahPageComponent, title: 'Omra — Un voyage de foi | Lunavia' },
  { path: 'contact', component: ContactComponent, title: 'Parlons de votre voyage — Lunavia' },
  { path: 'agence', component: AboutComponent, title: 'Notre agence à Tozeur — Lunavia' },
  { path: '**', redirectTo: '' }
 ], withInMemoryScrolling({scrollPositionRestoration:'enabled', anchorScrolling:'enabled'}))]
}).catch(console.error);
