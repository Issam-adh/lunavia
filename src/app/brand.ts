import { Component } from '@angular/core';
@Component({selector:'app-official-brand',standalone:true,template:`
 <span class="official-brand" role="img" aria-label="Lunavia Travel & Tourism — logo officiel">
  <span class="official-mark"><img src="/images/lunavia-official-logo.jpg" alt="" width="1024" height="1024"></span>
  <span class="official-wordmark"><img src="/images/lunavia-official-logo.jpg" alt="" width="1024" height="1024"></span>
 </span>
`,styles:[`
 :host{--logo-scale:1;display:block;width:calc(224px * var(--logo-scale));height:calc(70px * var(--logo-scale));flex:none}
 .official-brand{display:flex;align-items:center;gap:8px;width:224px;height:70px;transform:scale(var(--logo-scale));transform-origin:top left;direction:ltr}
 .official-mark{width:70px;height:62px;overflow:hidden;display:block;position:relative;flex:none}
 .official-mark img{position:absolute;width:150px;max-width:none;height:150px;left:-37px;top:-24px;object-fit:contain}
 .official-wordmark{width:146px;height:40px;overflow:hidden;display:block;position:relative;flex:none}
 .official-wordmark img{position:absolute;width:242px;max-width:none;height:242px;left:-49px;top:-135px;object-fit:contain}
 @media(max-width:760px){:host{--logo-scale:.78}}
 @media(max-width:360px){:host{--logo-scale:.67}}
` ]})
export class OfficialBrandComponent {}
