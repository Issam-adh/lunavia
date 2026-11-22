import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon';
import { TravelStore, Trip } from './store';
@Component({selector:'app-trip-card',standalone:true,imports:[RouterLink,IconComponent],template:`
 <article class="trip-card">
  <a class="trip-photo" [routerLink]="['/voyage',trip().slug]" [attr.aria-label]="s.text('Découvrir ','اكتشف ')+s.text(trip().name,trip().nameAr)">
   <img [src]="trip().image" [alt]="s.text(trip().name,trip().nameAr)" loading="lazy" width="640" height="800">
   <span class="trip-label"><app-icon [name]="trip().icon"/>{{category()}}</span>
   <div class="trip-photo-caption"><span>{{s.text(trip().country,trip().countryAr)}}</span><h3>{{s.text(trip().name,trip().nameAr)}}</h3></div>
  </a>
  <button class="favorite-button" [class.is-favorite]="s.favorites().includes(trip().slug)" (click)="s.toggle(trip().slug)" [attr.aria-label]="s.text('Favori : ','المفضلة: ')+s.text(trip().name,trip().nameAr)" [attr.aria-pressed]="s.favorites().includes(trip().slug)"><app-icon name="heart"/></button>
  <div class="trip-card-bottom"><div><span class="trip-duration">{{trip().days}} {{s.text('jours d’inspiration','أيام من الإلهام')}}</span><p>{{s.text(trip().tagline,trip().taglineAr)}}</p></div><a class="trip-details-link" [routerLink]="['/voyage',trip().slug]">{{s.text('Découvrir','اكتشف')}}</a></div>
 </article>
`})
export class TripCardComponent {trip=input.required<Trip>();s=inject(TravelStore);category(){const c=this.s.categories.find(c=>c.id===this.trip().category);return c?this.s.text(c.fr,c.ar):'';}}
