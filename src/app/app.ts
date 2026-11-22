import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TravelStore } from './store';
import { OfficialBrandComponent } from './brand';
import { IconComponent } from './icon';
@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive,IconComponent,OfficialBrandComponent],templateUrl:'./app.html'})
export class AppComponent {
 s=inject(TravelStore);menu=signal(false);router=inject(Router);
 constructor(){this.router.events.subscribe(e=>{if(e instanceof NavigationEnd){this.menu.set(false);}});}
}
