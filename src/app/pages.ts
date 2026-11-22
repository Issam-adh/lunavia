import { Component, ElementRef, inject, signal, computed } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconComponent } from './icon';
import { FlightSceneComponent, JourneyProgressDirective } from './flight';
import { UmrahFeatureComponent } from './umrah';
import { TripCardComponent } from './card';
import { TravelStore, RevealDirective } from './store';
import { AgencyVisitComponent } from './agency';
const shared=[RouterLink,IconComponent,RevealDirective];
@Component({standalone:true,imports:[...shared,FlightSceneComponent,JourneyProgressDirective,UmrahFeatureComponent,AgencyVisitComponent],templateUrl:'./home.html'})
export class HomeComponent {
 s=inject(TravelStore);motionPaused=signal(false);
 services=[
  {icon:'plane',fr:'Billets d’avion',ar:'تذاكر الطيران',desc:'Votre destination, vos dates, vos besoins en bagages. Préparons votre demande de vol.',descAr:'وجهتك ومواعيدك واحتياجات الأمتعة. لنعدّ طلب تذكرة الطيران.'},
  {icon:'hotel',fr:'Hôtels & séjours',ar:'الفنادق والإقامة',desc:'Une ville, des dates, un nombre de chambres. Parlons de votre hébergement.',descAr:'مدينة ومواعيد وعدد غرف. لنتحدث عن إقامتك.'},
  {icon:'moon',fr:'Omra',ar:'العمرة',desc:'Confiez-nous votre projet de voyage spirituel et parlons des possibilités.',descAr:'شاركنا مشروع رحلتك الروحانية ولنناقش الخيارات.'},
  {icon:'compass',fr:'Excursions',ar:'الرحلات الاستكشافية',desc:'Partagez votre lieu de départ, vos dates et votre groupe pour discuter du programme.',descAr:'شاركنا مكان الانطلاق ومواعيدك وعدد المشاركين لمناقشة البرنامج.'}
 ];
 faqs=[
  {fr:'Comment préparer mon voyage avec Lunavia ?',ar:'كيف أخطط لرحلتي مع لونافيا؟',answer:'Choisissez votre service, puis préparez votre demande par WhatsApp ou email. Vous pouvez aussi appeler directement l’agence.',answerAr:'اختر خدمتك ثم أعدّ طلبك عبر واتساب أو البريد الإلكتروني. يمكنك أيضاً الاتصال بالوكالة مباشرة.'},
  {fr:'Puis-je demander un voyage personnalisé ?',ar:'هل يمكنني طلب رحلة مخصصة؟',answer:'Oui, partagez votre destination, vos dates approximatives, le nombre de voyageurs et votre budget. L’agence pourra vous répondre sur les possibilités.',answerAr:'نعم، شاركنا وجهتك ومواعيدك التقريبية وعدد المسافرين وميزانيتك. سترد عليك الوكالة بشأن الخيارات المتاحة.'},
  {fr:'Peut-on réserver directement sur le site ?',ar:'هل يمكن الحجز مباشرة عبر الموقع؟',answer:'Le site vous permet de découvrir des idées et de préparer une demande. Le programme, les tarifs, les disponibilités et la réservation sont confirmés directement avec l’agence.',answerAr:'يساعدك الموقع على اكتشاف الأفكار وإعداد طلبك. يتم تأكيد البرنامج والأسعار والتوفر والحجز مباشرة مع الوكالة.'},
  {fr:'Où se trouve l’agence ?',ar:'أين توجد الوكالة؟',answer:'Retrouvez Lunavia à Ras Ettabia, Chebbia AFH, Tozeur, Tunisie. Vous pouvez aussi nous joindre au +216 29 783 093 ou par email.',answerAr:'تجد لونافيا في رأس الطابية، الشابية AFH، توزر، تونس. يمكنك أيضاً الاتصال على ‎+216 29 783 093 أو مراسلتنا عبر البريد الإلكتروني.'}
 ];
}
@Component({standalone:true,imports:[RouterLink,IconComponent,FormsModule,TripCardComponent],templateUrl:'./destinations.html'})
export class DestinationsComponent {
 s=inject(TravelStore);route=inject(ActivatedRoute);router=inject(Router);category=signal('all');country=signal('all');search=signal('');onlyFavorites=signal(false);
 constructor(){this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(p=>{this.category.set(p.get('category')||'all');this.country.set(p.get('country')||'all');this.onlyFavorites.set(p.get('favoris')==='true');});}
 results=computed(()=>this.s.trips.filter(t=>
  (this.category()==='all'||t.category===this.category()) &&
  (this.country()==='all'||(this.country()==='tunisie'?t.country==='Tunisie':t.country==='Turquie')) &&
  (!this.onlyFavorites()||this.s.favorites().includes(t.slug)) &&
  (t.name+' '+t.nameAr+' '+t.country+' '+t.countryAr).toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(this.search().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''))
 ));
 reset(){this.search.set('');this.router.navigate(['/destinations']);this.category.set('all');this.country.set('all');this.onlyFavorites.set(false);}
}
@Component({standalone:true,imports:[RouterLink,IconComponent,TripCardComponent],templateUrl:'./detail.html'})
export class TripDetailComponent {
 s=inject(TravelStore);route=inject(ActivatedRoute);slug=signal('');galleryOpen=signal(false);galleryIndex=signal(0);
 trip=computed(()=>this.s.trips.find(t=>t.slug===this.slug()));
 constructor(){this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(p=>{this.slug.set(p.get('slug')||'');});}
 related=computed(()=>this.s.trips.filter(t=>t.slug!==this.slug()).slice(0,3));
 mail(){return 'mailto:'+this.s.agencyEmail+'?subject='+encodeURIComponent(this.s.text('Demande de voyage : ','طلب رحلة: ')+(this.trip()?.name||''))+'&body='+encodeURIComponent(this.s.text('Bonjour Lunavia,\n\nJe souhaite en savoir plus sur un voyage à ','مرحباً لونافيا،\n\nأود معرفة المزيد عن رحلة إلى ')+this.s.text(this.trip()?.name||'',this.trip()?.nameAr||'')+'.\n\n'+this.s.text('Mes dates :\nNombre de voyageurs :\nMon projet :','مواعيدي:\nعدد المسافرين:\nمشروعي:'));}
}
@Component({standalone:true,imports:[IconComponent,FormsModule],templateUrl:'./contact.html'})
export class ContactComponent {
 s=inject(TravelStore);route=inject(ActivatedRoute);private host=inject<ElementRef<HTMLElement>>(ElementRef);
 channel=signal<'whatsapp'|'email'>('whatsapp');
 name='';email='';destination='';date='';travelers:number|null=null;budget='';message='';
 prepared=signal(false);dateInvalid=signal(false);copyState=signal<'idle'|'copied'|'error'>('idle');
 minDate=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
 budgets=[
  {value:'under-1000',fr:'Moins de 1 000 TND par personne',ar:'أقل من 1000 دينار للشخص'},
  {value:'1000-2500',fr:'1 000 à 2 500 TND par personne',ar:'من 1000 إلى 2500 دينار للشخص'},
  {value:'2500-5000',fr:'2 500 à 5 000 TND par personne',ar:'من 2500 إلى 5000 دينار للشخص'},
  {value:'over-5000',fr:'Plus de 5 000 TND par personne',ar:'أكثر من 5000 دينار للشخص'}
 ];
 constructor(){this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(p=>{
  this.destination=(p.get('destination')||p.get('service')||'').slice(0,200);
  this.prepared.set(false);
 });}
 chooseChannel(channel:'whatsapp'|'email'){this.channel.set(channel);this.invalidate();}
 invalidate(){this.prepared.set(false);this.dateInvalid.set(false);this.copyState.set('idle');}
 body(){
  const lines=[this.s.text('Nom : ','الاسم: ')+this.name.trim(),this.s.text('Destination / service : ','الوجهة / الخدمة: ')+this.destination.trim()];
  if(this.channel()==='email')lines.push(this.s.text('Email : ','البريد الإلكتروني: ')+this.email.trim());
  if(this.date)lines.push(this.s.text('Date souhaitée : ','التاريخ المرغوب: ')+this.date);
  if(this.travelers!==null)lines.push(this.s.text('Voyageurs : ','عدد المسافرين: ')+this.travelers);
  const budget=this.budgets.find(b=>b.value===this.budget);
  if(budget)lines.push(this.s.text('Budget indicatif : ','الميزانية التقريبية: ')+this.s.text(budget.fr,budget.ar));
  if(this.message.trim())lines.push(this.s.text('Mon projet : ','مشروعي: ')+this.message.trim());
  return this.s.text('Bonjour Lunavia, voici mon projet de voyage :','مرحباً لونافيا، هذا مشروع رحلتي:')+'\n\n'+lines.join('\n');
 }
 emailHref(){return 'mailto:'+this.s.agencyEmail+'?subject='+encodeURIComponent(this.s.text('Demande de devis — ','طلب عرض سعر — ')+this.destination.trim())+'&body='+encodeURIComponent(this.body());}
 whatsappHref(){return this.s.whatsapp+'?text='+encodeURIComponent(this.body());}
 sendHref(){return this.channel()==='whatsapp'?this.whatsappHref():this.emailHref();}
 async copy(){try{await navigator.clipboard.writeText(this.body());this.copyState.set('copied');}catch{this.copyState.set('error');}}
 prepare(form:NgForm){
  this.dateInvalid.set(!!this.date && this.date<this.minDate);
  if(this.name.trim().length<2)form.controls['fullName']?.setErrors({minlength:true});
  if(this.destination.trim().length<2)form.controls['destination']?.setErrors({minlength:true});
  if(this.travelers!==null && (!Number.isInteger(this.travelers)||this.travelers<1||this.travelers>50))
   form.controls['travelers']?.setErrors({wholeNumber:true});
  if(form.invalid||this.dateInvalid()){
   form.control.markAllAsTouched();
   const options=this.host.nativeElement.querySelector<HTMLDetailsElement>('#trip-options');
   if(options&&(this.dateInvalid()||form.controls['travelers']?.invalid))options.open=true;
   const invalidName=['fullName','email','destination','travelers'].find(name=>form.controls[name]?.invalid);
   const invalid=this.dateInvalid()?this.host.nativeElement.querySelector<HTMLInputElement>('#date'):
    invalidName?this.host.nativeElement.querySelector<HTMLInputElement>('[name="'+invalidName+'"]'):null;
   invalid?.focus();return;
  }
  this.prepared.set(true);this.copyState.set('idle');
  setTimeout(()=>this.host.nativeElement.querySelector<HTMLElement>('#prepared-title')?.focus(),0);
 }
}
@Component({standalone:true,imports:[...shared,AgencyVisitComponent],templateUrl:'./about.html'})
export class AboutComponent {s=inject(TravelStore);}
