import { Component, Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';
import { TravelStore } from './store';
@Component({selector:'app-flight-scene',standalone:true,host:{'[class.paused]':'paused()'},template:`
 <div class="flight-stage" aria-hidden="true">
  <div class="flight-aura"></div>
  <div class="orbital-ring orbit-one"></div><div class="orbital-ring orbit-two"></div>
  <div class="flight-globe"><div class="world-map"></div><svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="190"/><ellipse cx="200" cy="200" rx="95" ry="190"/><ellipse cx="200" cy="200" rx="155" ry="190"/><ellipse cx="200" cy="200" rx="190" ry="70"/><ellipse cx="200" cy="200" rx="190" ry="135"/><path d="M10 200h380M200 10v380"/></svg><div class="globe-shine"></div></div>
  <svg class="flight-trail" viewBox="0 0 600 550"><defs><linearGradient id="trail-gold"><stop stop-color="#c7a56d" stop-opacity="0"/><stop offset=".55" stop-color="#f6dc9f"/><stop offset="1" stop-color="#fff0ca"/></linearGradient></defs><path class="trail-launch" pathLength="1" d="M55 400C-40 160 280 45 453 200S555 508 356 468"/><path class="trail-base" d="M55 400C-40 160 280 45 453 200S555 508 356 468"/><path class="trail-light" pathLength="1" d="M55 400C-40 160 280 45 453 200S555 508 356 468"/></svg>
  <div class="cloud cloud-a"></div><div class="cloud cloud-b"></div><div class="cloud cloud-c"></div>
  <div class="jet-takeoff"><div class="jet-parallax"><img class="jet-aircraft" src="/images/lunavia-jet.svg" alt="" width="260" height="440"><span class="wing-glint"></span></div></div>
  <span class="flight-origin"><span class="origin-dot"></span>TOZEUR<small>TRAVEL & TOURISM</small></span>
  <span class="flight-destination">{{s.text('L’ENVIE D’AILLEURS','آفاق جديدة')}}<span class="destination-star">✦</span></span>
  <div class="flight-caption"><span class="caption-line"></span><span>{{s.text('La prochaine histoire ?','الحكاية القادمة؟')}}<strong>{{s.text('La vôtre.','حكايتك.')}}</strong></span></div>
 </div>
 `,styleUrl:'./flight.css'})
export class FlightSceneComponent implements OnDestroy {
 paused=input(false);s=inject(TravelStore);private el=inject(ElementRef<HTMLElement>);private observer?:IntersectionObserver;private cleanup?:()=>void;private raf=0;
 constructor(){afterNextRender(()=>{
  const host=this.el.nativeElement;
  this.observer=new IntersectionObserver(entries=>host.classList.toggle('out-of-view',!entries[0].isIntersecting),{rootMargin:'100px'});this.observer.observe(host);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(pointer:fine)').matches)return;
  const move=(e:PointerEvent)=>{cancelAnimationFrame(this.raf);this.raf=requestAnimationFrame(()=>{const r=host.getBoundingClientRect();host.style.setProperty('--drift-x',((e.clientX-r.left)/r.width-.5)*24+'px');host.style.setProperty('--drift-y',((e.clientY-r.top)/r.height-.5)*18+'px');});};
  const reset=()=>{host.style.setProperty('--drift-x','0px');host.style.setProperty('--drift-y','0px');};
  host.addEventListener('pointermove',move);host.addEventListener('pointerleave',reset);this.cleanup=()=>{host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',reset);};
 });}
 ngOnDestroy(){this.observer?.disconnect();this.cleanup?.();cancelAnimationFrame(this.raf);}
}
@Directive({selector:'[journeyProgress]',standalone:true})
export class JourneyProgressDirective implements OnDestroy {
 private el=inject(ElementRef<HTMLElement>);private cleanup?:()=>void;private raf=0;
 constructor(){afterNextRender(()=>{const host=this.el.nativeElement;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced){host.style.setProperty('--journey-progress','.65');host.style.setProperty('--journey-y','8px');host.style.setProperty('--journey-angle','98deg');return;}const update=()=>{cancelAnimationFrame(this.raf);this.raf=requestAnimationFrame(()=>{const r=host.getBoundingClientRect();const progress=Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight+r.height)));host.style.setProperty('--journey-progress',String(progress));host.style.setProperty('--journey-y',(52-48*progress*(1-progress)*4)+'px');host.style.setProperty('--journey-angle',(63+54*progress)+'deg');});};window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update,{passive:true});update();this.cleanup=()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};});}
 ngOnDestroy(){this.cleanup?.();cancelAnimationFrame(this.raf);}
}
