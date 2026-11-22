import { Component, inject } from '@angular/core';
import { TravelStore } from './store';
import { IconComponent } from './icon';
import { OfficialBrandComponent } from './brand';
@Component({selector:'app-agency-visit',standalone:true,imports:[IconComponent,OfficialBrandComponent],templateUrl:'./agency.html'})
export class AgencyVisitComponent {s=inject(TravelStore);}
