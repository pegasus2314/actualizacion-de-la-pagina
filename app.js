document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js"><\\/script>');
document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/a9f1f24ad70bb41e4e2b5f1399519307dcede875/centros.js"><\\/script>');

(function(){
  'use strict';
  var originalDocumentAdd=document.addEventListener.bind(document);
  var originalWindowAdd=window.addEventListener.bind(window);

  document.addEventListener=function(type,listener,options){
    if(type==='click' && typeof listener==='function'){
      var src=Function.prototype.toString.call(listener);
      if(src.indexOf('allowed.has(view)')!==-1 || src.indexOf("location.hash.slice(1)||'inicio'")!==-1)return;
    }
    return originalDocumentAdd(type,listener,options);
  };

  window.addEventListener=function(type,listener,options){
    if(type==='hashchange' && typeof listener==='function'){
      var src=Function.prototype.toString.call(listener);
      if(src.indexOf("showView(location.hash.slice(1)||'inicio',false)")!==-1)return;
    }
    return originalWindowAdd(type,listener,options);
  };

  function addStyle(id,css){
    if(document.getElementById(id))return;
    var s=document.createElement('style');s.id=id;s.textContent=css;document.head.appendChild(s);
  }

  addStyle('trd-home-panel-fix',` .home-intro .competition-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:stretch}.home-intro .competition-card{display:flex!important;flex-direction:column;align-items:flex-start;min-width:0;min-height:230px;height:100%;box-sizing:border-box;padding:26px!important;border:1px solid rgba(182,231,255,.12)!important;border-radius:20px!important;background:linear-gradient(145deg,#102b3f,#091d2d)!important;box-shadow:0 14px 34px rgba(0,0,0,.18)!important;color:#eef8fb!important;text-decoration:none!important;overflow:hidden;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease,background .2s ease!important}.home-intro .competition-card:hover{transform:translateY(-4px)!important;border-color:rgba(25,220,229,.42)!important;box-shadow:0 20px 42px rgba(0,0,0,.24)!important;background:linear-gradient(145deg,#12364c,#0a2132)!important}.home-intro .competition-card>span{flex:0 0 auto;width:48px!important;height:48px!important;display:grid!important;place-items:center!important;margin:0!important;border-radius:13px!important;background:rgba(25,220,229,.08)!important;border:1px solid rgba(25,220,229,.28)!important;color:var(--cyan)!important;font-size:21px!important}.home-intro .competition-card b{display:block!important;margin:20px 0 7px!important;font-family:'Barlow Condensed',Barlow,sans-serif!important;font-size:30px!important;line-height:1!important;color:#fff!important}.home-intro .competition-card small{display:block!important;margin:0!important;max-width:440px!important;color:#9bb1bd!important;font-size:13px!important;line-height:1.55!important}.home-intro .competition-card strong{display:inline-flex!important;align-items:center!important;gap:9px!important;margin-top:auto!important;padding:11px 0 0!important;color:var(--cyan)!important;font-size:12px!important;font-weight:800!important}.home-intro .competition-card strong::after{width:25px!important;height:1px!important;background:currentColor!important}@media(max-width:800px){.home-intro .competition-grid{grid-template-columns:1fr!important;gap:14px}.home-intro .competition-card{min-height:205px!important;padding:23px!important}}`);

  var icons={inicio:'<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-5.5h5V21"/></svg>',inscripcion:'<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7h7M8.5 11h7M8.5 15h3"/><path d="M16 14v5M13.5 16.5h5"/></svg>',participantes:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.4-3.5 2.2-5.5 5.5-5.5s5.1 2 5.5 5.5"/><circle cx="17" cy="9" r="2.3"/><path d="M15 15c2.7-.1 4.6 1.4 5.3 4"/></svg>',torneo:'<svg viewBox="0 0 24 24"><path d="M8 4h8v3a4 4 0 0 1-8 0Z"/><path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3"/><path d="M12 11v6M8 21h8M9 17h6"/></svg>',logistica:'<svg viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-11a7 7 0 0 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>',centros:'<svg viewBox="0 0 24 24"><path d="M4 21V5.5L12 3l8 2.5V21"/><path d="M8 9h2M14 9h2M8 13h2M14 13h2M10 21v-4h4v4"/></svg>'};

  addStyle('trd-nav-icon-fix',`.nav>a{display:inline-flex!important;align-items:center!important;gap:8px!important}.nav>a .trd-nav-icon{display:grid;place-items:center;width:19px;height:19px;flex:0 0 19px;color:currentColor;opacity:.9}.nav>a .trd-nav-icon svg{width:18px;height:18px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.nav>a.active .trd-nav-icon,.nav>a:hover .trd-nav-icon{color:var(--cyan)}`);

  function ensureCentrosNav(){
    var nav=document.querySelector('.nav');
    if(!nav || nav.querySelector('[data-view="centros"]'))return;
    var a=document.createElement('a');a.href='#centros';a.dataset.view='centros';a.innerHTML='<span class="trd-nav-icon" aria-hidden="true">'+icons.centros+'</span><span>Centros educativos</span>';nav.appendChild(a);
  }
  function ensureNavIcons(){
    document.querySelectorAll('.nav>a[data-view]').forEach(function(a){var key=a.dataset.view;if(!icons[key]||a.querySelector('.trd-nav-icon'))return;var first=a.firstChild;if(first&&first.nodeType===3)first.remove();var icon=document.createElement('span');icon.className='trd-nav-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=icons[key];a.insertBefore(icon,a.firstChild)});
  }
  function allViews(){return Array.prototype.slice.call(document.querySelectorAll('.view-section'))}
  function openView(id,updateHash){var section=document.getElementById(id);if(!section)return false;allViews().forEach(function(s){s.classList.toggle('view-hidden',s.id!==id)});document.querySelectorAll('.nav>a[data-view]').forEach(function(a){a.classList.toggle('active',a.dataset.view===id)});document.body.classList.add('viewing-section');if(updateHash&&location.hash!=='#'+id)history.pushState(null,'','#'+id);window.scrollTo(0,0);return true}
  function openAdmin(){var admin=document.getElementById('admin');if(!admin)return false;admin.classList.remove('hidden');allViews().forEach(function(s){s.classList.toggle('view-hidden',s.id!=='admin')});document.querySelectorAll('.nav>a[data-view]').forEach(function(a){a.classList.remove('active')});document.body.classList.add('viewing-section');window.scrollTo(0,0);return true}
  function route(id,updateHash){if(id==='admin')return openAdmin();if(!id)id='inicio';return openView(id,updateHash)}

  originalDocumentAdd('click',function(e){var link=e.target.closest&&e.target.closest('.nav>a[data-view]');if(!link)return;var id=link.dataset.view;if(!id||!document.getElementById(id))return;e.preventDefault();e.stopPropagation();route(id,true)},true);
  originalWindowAdd('hashchange',function(){route(location.hash.replace(/^#/,'')||'inicio',false)});

  function bindAdmin(){
    var btn=document.getElementById('adminBtn'),dialog=document.getElementById('loginDialog');
    if(btn&&dialog&&btn.dataset.trdBound!=='1'){btn.dataset.trdBound='1';btn.type='button';btn.addEventListener('click',function(){if(!dialog.open&&typeof dialog.showModal==='function')dialog.showModal()})}
    var form=document.getElementById('loginForm');if(form&&typeof window.adminLogin==='function'&&form.dataset.trdBound!=='1'){form.dataset.trdBound='1';form.addEventListener('submit',window.adminLogin)}
    var close=document.getElementById('closeLogin');if(close&&dialog&&close.dataset.trdBound!=='1'){close.dataset.trdBound='1';close.addEventListener('click',function(){dialog.close()})}
  }
  function start(){ensureCentrosNav();ensureNavIcons();bindAdmin();var id=location.hash.replace(/^#/,'')||'inicio';if(id==='admin')openAdmin();else if(document.getElementById(id))openView(id,false);else openView('inicio',false)}
  if(document.readyState==='loading')originalDocumentAdd('DOMContentLoaded',start,{once:true});else start();
  var tries=0;var timer=setInterval(function(){ensureCentrosNav();ensureNavIcons();bindAdmin();if(++tries>80)clearInterval(timer)},100);
})();