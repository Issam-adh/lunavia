import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TravelStore, RevealDirective } from './store';
import { IconComponent } from './icon';
@Component({selector:'app-umrah-feature',standalone:true,imports:[RouterLink,IconComponent,RevealDirective],template:`
 <section class="umrah-feature" id="omra">
  <div class="umrah-pattern" aria-hidden="true"></div>
  <div class="container umrah-feature-grid">
   <div class="umrah-copy" reveal>
    <p class="eyebrow">{{s.text('OMRA · UN VOYAGE DE FOI','العمرة · رحلة إيمان')}}</p>
    <h2>{{s.text('Un voyage vers','رحلة نحو')}}<br><em>{{s.text('l’essentiel.','جوهر الإيمان.')}}</em></h2>
    <p>{{s.text('Il est des voyages qui se vivent aussi à l’intérieur. À La Mecque, l’Omra est un temps de dévotion et de recueillement.','بعض الرحلات نعيشها في أعماقنا أيضاً. العمرة في مكة المكرمة وقت للعبادة والخشوع.')}}</p>
    <p>{{s.text('Dates, hébergement, vols et transferts : découvrez les points à préciser avec Lunavia pour préparer votre séjour.','المواعيد والإقامة والرحلات الجوية والتنقلات: اكتشف ما تناقشه مع لونافيا للتحضير لإقامتك.')}}</p>
    <div class="umrah-feature-points"><span><app-icon name="moon"/>{{s.text('Préparer son séjour','إعداد إقامتك')}}</span><span><app-icon name="compass"/>{{s.text('Découvrir les rites','اكتشاف المناسك')}}</span></div>
    <div class="umrah-feature-actions"><a class="button button-gold" routerLink="/omra">{{s.text('Préparer mon Omra','التحضير لعمرتي')}}</a><a class="umrah-secondary" routerLink="/contact" [queryParams]="{service:s.text('Omra','العمرة')}">{{s.text('Parlons de votre projet','لنتحدث عن رحلتك')}}</a></div>
   </div>
   <div class="umrah-image-composition" reveal>
    <span class="umrah-arch-outline" aria-hidden="true"></span>
    <div class="umrah-arch-image"><img src="/images/umrah.jpg" [alt]="s.text('La Kaaba illuminée à la mosquée al-Haram, à La Mecque','الكعبة المشرفة في المسجد الحرام بمكة المكرمة')" loading="lazy" width="1600" height="2844"></div>
    <span class="umrah-image-inscription" lang="ar">لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ</span>
    <div class="umrah-location-card"><span class="location-card-symbol"><app-icon name="kaaba"/></span><span><small>{{s.text('LA MECQUE · ARABIE SAOUDITE','مكة المكرمة · السعودية')}}</small><strong>{{s.text('L’intention d’un beau départ.','بداية بنية صادقة.')}}</strong></span></div>
   </div>
  </div>
 </section>
`})
export class UmrahFeatureComponent {s=inject(TravelStore);}
@Component({standalone:true,imports:[RouterLink,IconComponent,RevealDirective],templateUrl:'./umrah.html'})
export class UmrahPageComponent {
 s=inject(TravelStore);active=signal(0);
 rites=[
  {fr:'L’ihram',ar:'الإحرام',label:'L’intention',labelAr:'النية',icon:'moon',desc:'L’intention d’entrer dans les rites et l’état de sacralisation qui marque le début de l’Omra.',descAr:'نية الدخول في المناسك وحالة الإحرام التي تبدأ بها العمرة.'},
  {fr:'Le tawaf',ar:'الطواف',label:'Autour de la Kaaba',labelAr:'حول الكعبة',icon:'kaaba',desc:'Sept tours autour de la Kaaba, accomplis dans le respect des rites et des indications sur place.',descAr:'سبعة أشواط حول الكعبة المشرفة، مع احترام المناسك والإرشادات في المكان.'},
  {fr:'Le sa’i',ar:'السعي',label:'Entre Safa et Marwa',labelAr:'بين الصفا والمروة',icon:'compass',desc:'Sept trajets entre Safa et Marwa, en commençant à Safa et en terminant à Marwa.',descAr:'سبعة أشواط بين الصفا والمروة، تبدأ من الصفا وتنتهي بالمروة.'},
  {fr:'Le tahallul',ar:'التحلل',label:'L’accomplissement',labelAr:'إتمام المناسك',icon:'check',desc:'La coupe ou le raccourcissement des cheveux selon les règles du rite, pour sortir de l’état d’ihram.',descAr:'حلق الشعر أو تقصيره وفق أحكام النسك، للخروج من حالة الإحرام.'}
 ];
 preparations=[
  {icon:'calendar',fr:'Vos dates & la durée',ar:'مواعيدك ومدة الإقامة',desc:'Précisez votre période de départ, la durée souhaitée et le nombre de voyageurs. Demandez les dates et programmes disponibles.',descAr:'حدد فترة المغادرة والمدة المرغوبة وعدد المسافرين. اسأل عن المواعيد والبرامج المتوفرة.'},
  {icon:'hotel',fr:'Les hôtels & leur emplacement',ar:'الفنادق وموقعها',desc:'Demandez les villes du séjour, les noms et catégories des hôtels, la distance aux lieux de culte et les repas prévus.',descAr:'اسأل عن مدن الإقامة وأسماء الفنادق وتصنيفاتها والمسافة إلى أماكن العبادة والوجبات المتضمنة.'},
  {icon:'plane',fr:'Les vols & les transferts',ar:'الرحلات الجوية والتنقلات',desc:'Vérifiez les aéroports, les horaires, les bagages et les trajets sur place. Faites préciser les transferts inclus dans le devis.',descAr:'تحقق من المطارات والمواعيد والأمتعة والتنقلات المحلية. اطلب توضيح التنقلات المتضمنة في عرض السعر.'},
  {icon:'bookmark',fr:'Les prestations & les formalités',ar:'الخدمات والإجراءات',desc:'Faites détailler le prix, les services inclus et les suppléments éventuels. Confirmez les documents, les démarches et les conditions de réservation avec l’agence.',descAr:'اطلب تفاصيل السعر والخدمات المتضمنة والتكاليف الإضافية المحتملة. أكد الوثائق والإجراءات وشروط الحجز مع الوكالة.'}
 ];
 select(i:number){this.active.set(i);}
 key(event:KeyboardEvent,index:number){let next=index;const right=this.s.lang()==='ar'?-1:1;if(event.key==='ArrowRight')next=(index+right+4)%4;else if(event.key==='ArrowLeft')next=(index-right+4)%4;else if(event.key==='Home')next=0;else if(event.key==='End')next=3;else return;event.preventDefault();this.active.set(next);document.getElementById('rite-tab-'+next)?.focus();}
}
