import { Injectable, signal, effect, Directive, ElementRef, afterNextRender, OnDestroy } from '@angular/core';
export type Lang = 'fr' | 'ar';
export interface Trip {
 slug: string; name: string; nameAr: string; country: string; countryAr: string;
 tagline: string; taglineAr: string; description: string; descriptionAr: string;
 image: string; category: string; days: number; icon: string;
 itinerary: {title:string; titleAr:string; text:string; textAr:string}[];
}
@Injectable({providedIn:'root'})
export class TravelStore {
 lang = signal<Lang>(this.read('lunavia-lang') === 'ar' ? 'ar' : 'fr');
 favorites = signal<string[]>(this.readList());
 toast = signal('');
 private timer?: ReturnType<typeof setTimeout>;
 constructor(){ effect(()=>{document.documentElement.lang=this.lang();document.documentElement.dir=this.lang()==='ar'?'rtl':'ltr';}); }
 private readonly overrides = signal<Record<string, Partial<Record<Lang,string>>>>({});
 async loadPublished(){
  try {
   const response=await fetch('/api/lunavia/content',{cache:'no-store',signal:AbortSignal.timeout(4000)});
   if(response.ok && response.headers.get('content-type')?.includes('application/json')){
    const content=await response.json();
    if(content && typeof content==='object' && !Array.isArray(content))this.overrides.set(content);
   }
  } catch { /* The bundled translations are available offline. */ }
 }
 text(fr:string,ar:string){
  const lang=this.lang(), saved=this.overrides()[JSON.stringify([fr,ar])]?.[lang];
  return saved ?? (lang==='fr'?fr:ar);
 }
 setLang(lang:Lang){this.lang.set(lang);try{localStorage.setItem('lunavia-lang',lang);}catch{}}
 private read(key:string){try{return localStorage.getItem(key);}catch{return null;}}
 private readList():string[]{try{const v=JSON.parse(this.read('lunavia-favorites')||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];}catch{return [];}}
 toggle(slug:string){
  const exists=this.favorites().includes(slug);
  this.favorites.update(v=>exists?v.filter(x=>x!==slug):[...v,slug]);
  try{localStorage.setItem('lunavia-favorites',JSON.stringify(this.favorites()));}catch{}
  this.toast.set(exists?this.text('Destination retirée des favoris','تمت إزالة الوجهة من المفضلة'):this.text('Destination ajoutée aux favoris','تمت إضافة الوجهة إلى المفضلة'));
  clearTimeout(this.timer);this.timer=setTimeout(()=>this.toast.set(''),2600);
 }
 agencyEmail='Contact.lunaviatravel@gmail.com';
 phone='+216 29 783 093';
 whatsapp='https://wa.me/21629783093';
 facebook='https://www.facebook.com/share/1FRuAoEqbp/';
 agencyMaps='https://maps.app.goo.gl/SWYfZvRjhtC3eXrCA?g_st=ac';
 categories=[{id:'all',fr:'Toutes les envies',ar:'كل التجارب'},{id:'sahara',fr:'Sahara & nature',ar:'الصحراء والطبيعة'},{id:'culture',fr:'Culture & découverte',ar:'الثقافة والاكتشاف'},{id:'adventure',fr:'Aventure',ar:'المغامرة'},{id:'sea',fr:'Bord de mer',ar:'على شاطئ البحر'}];
 trips:Trip[]=[
  {slug:'tozeur-sahara',name:'Tozeur & le Sahara',nameAr:'توزر والصحراء',country:'Tunisie',countryAr:'تونس',tagline:'Là où le temps prend son temps.',taglineAr:'حيث يصبح للوقت معنى آخر.',description:'Des ruelles de la médina aux dunes dorées, imaginez une parenthèse entre oasis, lumière et grands espaces. Une invitation à découvrir le Sud tunisien à votre rythme.',descriptionAr:'من أزقة المدينة العتيقة إلى الكثبان الذهبية، تخيّل رحلة بين الواحات والنور والفضاءات الواسعة. دعوة لاكتشاف الجنوب التونسي على إيقاعك.',image:'/images/desert.jpg',category:'sahara',days:3,icon:'sun',itinerary:[
   {title:'Au rythme de l’oasis',titleAr:'على إيقاع الواحة',text:'Flâner dans les ruelles de Tozeur et prendre le temps de découvrir sa palmeraie.',textAr:'تجوّل في أزقة توزر واكتشف جمال واحة النخيل.'},
   {title:'Une échappée dans le désert',titleAr:'رحلة إلى الصحراء',text:'Imaginer une excursion dans les dunes et un coucher de soleil sur les paysages du Sud.',textAr:'استمتع بفكرة رحلة بين الكثبان وغروب الشمس على مناظر الجنوب.'},
   {title:'Les couleurs du Sud',titleAr:'ألوان الجنوب',text:'Explorer les environs selon vos envies, avant un retour tout en douceur.',textAr:'اكتشف المناطق المحيطة حسب رغباتك قبل العودة بهدوء.'}
  ]},
  {slug:'istanbul',name:'Istanbul',nameAr:'إسطنبول',country:'Turquie',countryAr:'تركيا',tagline:'Deux continents. Mille émotions.',taglineAr:'قارّتان وآلاف المشاعر.',description:'Des rives du Bosphore aux coupoles de la vieille ville, laissez-vous inspirer par une ville qui relie les cultures. Ruelles animées, saveurs nouvelles et horizons à découvrir.',descriptionAr:'من ضفاف البوسفور إلى قباب المدينة القديمة، استلهم رحلتك من مدينة تجمع الثقافات. أزقة نابضة بالحياة ونكهات جديدة وآفاق تنتظر اكتشافك.',image:'/images/istanbul.jpg',category:'culture',days:5,icon:'compass',itinerary:[
   {title:'Premiers regards sur Istanbul',titleAr:'اللقاء الأول مع إسطنبول',text:'S’installer et découvrir le quartier de votre hébergement, au gré des petites rues.',textAr:'استقر في مكان إقامتك واكتشف الحي وأزقته.'},
   {title:'L’histoire au fil des pas',titleAr:'التاريخ مع كل خطوة',text:'Consacrer une journée au patrimoine et aux places emblématiques de la ville.',textAr:'خصص يوماً للتراث وساحات المدينة المميزة.'},
   {title:'Le Bosphore et ses quartiers',titleAr:'البوسفور وأحياؤه',text:'Profiter des vues sur le détroit, puis explorer les quartiers selon vos centres d’intérêt.',textAr:'استمتع بإطلالات المضيق ثم استكشف الأحياء حسب اهتماماتك.'}
  ]},
  {slug:'cappadoce',name:'La Cappadoce',nameAr:'كابادوكيا',country:'Turquie',countryAr:'تركيا',tagline:'Un rêve, les yeux grands ouverts.',taglineAr:'حلم تعيشه بعينين مفتوحتين.',description:'Des vallées sculptées par le temps et des horizons ponctués de montgolfières. Imaginez une escapade où chaque matin ouvre une nouvelle perspective.',descriptionAr:'وديان نحتها الزمن وآفاق تزيّنها المناطيد. تخيّل رحلة يحمل فيها كل صباح منظوراً جديداً.',image:'/images/cappadocia.jpg',category:'adventure',days:4,icon:'spark',itinerary:[
   {title:'Bienvenue en Cappadoce',titleAr:'مرحباً بك في كابادوكيا',text:'Découvrir les premiers panoramas et choisir les expériences qui vous ressemblent.',textAr:'اكتشف المناظر الأولى واختر التجارب التي تناسبك.'},
   {title:'Vallées et villages',titleAr:'الوديان والقرى',text:'Imaginer une journée de découverte entre paysages rocheux et villages de caractère.',textAr:'تخيّل يوماً بين المناظر الصخرية والقرى المميزة.'},
   {title:'Un matin hors du temps',titleAr:'صباح خارج الزمن',text:'Admirer le lever du soleil. Toute activité en montgolfière dépend d’une confirmation et des conditions locales.',textAr:'تأمل شروق الشمس. تتطلب أنشطة المناطيد تأكيداً وتخضع للظروف المحلية.'}
  ]},
  {slug:'sidi-bou-said',name:'Sidi Bou Saïd',nameAr:'سيدي بوسعيد',country:'Tunisie',countryAr:'تونس',tagline:'Une parenthèse en bleu et blanc.',taglineAr:'استراحة بالأزرق والأبيض.',description:'Une lumière méditerranéenne, des portes bleues et des ruelles pleines de charme. Prenez le temps d’imaginer une escapade tournée vers la mer.',descriptionAr:'ضوء متوسطي وأبواب زرقاء وأزقة مفعمة بالسحر. خذ وقتك لتتخيّل رحلة تطل على البحر.',image:'/images/sidi-bou-said.jpg',category:'sea',days:2,icon:'sun',itinerary:[
   {title:'Les ruelles bleues',titleAr:'الأزقة الزرقاء',text:'Se perdre doucement dans les ruelles et découvrir les détails de l’architecture locale.',textAr:'تجوّل بهدوء في الأزقة واكتشف تفاصيل العمارة المحلية.'},
   {title:'L’horizon méditerranéen',titleAr:'الأفق المتوسطي',text:'Prendre une pause face à la mer et prolonger la découverte selon vos envies.',textAr:'استرح أمام البحر وواصل الاكتشاف حسب رغباتك.'}
  ]}
 ];
}
@Directive({selector:'[reveal]',standalone:true})
export class RevealDirective implements OnDestroy {
 private observer?:IntersectionObserver;
 constructor(el:ElementRef<HTMLElement>){afterNextRender(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window))return;
  el.nativeElement.classList.add('reveal-ready');
  this.observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){el.nativeElement.classList.add('is-visible');this.observer?.unobserve(el.nativeElement);}}),{threshold:0.08});
  this.observer.observe(el.nativeElement);
 });}
 ngOnDestroy(){this.observer?.disconnect();}
}
