document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js"><\\/script>');
document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/a9f1f24ad70bb41e4e2b5f1399519307dcede875/centros.js"><\\/script>');

(function(){
  'use strict';
  function addStyle(id,css){if(document.getElementById(id))return;var s=document.createElement('style');s.id=id;s.textContent=css;document.head.appendChild(s)}
  addStyle('trd-home-panel-fix','.home-intro .competition-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:stretch}.home-intro .competition-card{display:flex!important;flex-direction:column;align-items:flex-start;min-width:0;min-height:230px;height:100%;box-sizing:border-box;padding:26px!important;border:1px solid rgba(182,231,255,.12)!important;border-radius:20px!important;background:linear-gradient(145deg,#102b3f,#091d2d)!important;box-shadow:0 14px 34px rgba(0,0,0,.18)!important;color:#eef8fb!important;text-decoration:none!important}.home-intro .competition-card:hover{transform:translateY(-4px)!important;border-color:rgba(25,220,229,.42)!important}@media(max-width:800px){.home-intro .competition-grid{grid-template-columns:1fr!important}.home-intro .competition-card{min-height:205px!important}}');
  var icons={inicio:'<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-5.5h5V21"/></svg>',inscripcion:'<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7h7M8.5 11h7M8.5 15h3"/><path d="M16 14v5M13.5 16.5h5"/></svg>',participantes:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.4-3.5 2.2-5.5 5.5-5.5s5.1 2 5.5 5.5"/><circle cx="17" cy="9" r="2.3"/><path d="M15 15c2.7-.1 4.6 1.4 5.3 4"/></svg>',torneo:'<svg viewBox="0 0 24 24"><path d="M8 4h8v3a4 4 0 0 1-8 0Z"/><path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3"/><path d="M12 11v6M8 21h8M9 17h6"/></svg>',logistica:'<svg viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-11a7 7 0 0 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>',centros:'<svg viewBox="0 0 24 24"><path d="M4 21V5.5L12 3l8 2.5V21"/><path d="M8 9h2M14 9h2M8 13h2M14 13h2M10 21v-4h4v4"/></svg>'};
  addStyle('trd-nav-icon-fix','.nav>a{display:inline-flex!important;align-items:center!important;gap:8px!important}.nav>a .trd-nav-icon{display:grid;place-items:center;width:19px;height:19px;flex:0 0 19px;color:currentColor}.nav>a .trd-nav-icon svg{width:18px;height:18px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.nav>a.active .trd-nav-icon,.nav>a:hover .trd-nav-icon{color:var(--cyan)}');
  function ensureCentrosNav(){var nav=document.querySelector('.nav');if(!nav||nav.querySelector('[data-view="centros"]'))return;if(!document.getElementById('centros'))return;var a=document.createElement('a');a.href='#centros';a.dataset.view='centros';a.innerHTML='<span class="trd-nav-icon" aria-hidden="true">'+icons.centros+'</span><span>Centros educativos</span>';nav.appendChild(a)}
  function ensureNavIcons(){document.querySelectorAll('.nav>a[data-view]').forEach(function(a){var key=a.dataset.view;if(!icons[key]||a.querySelector('.trd-nav-icon'))return;var first=a.firstChild;if(first&&first.nodeType===3)first.remove();var icon=document.createElement('span');icon.className='trd-nav-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=icons[key];a.insertBefore(icon,a.firstChild)})}
  function allViews(){return Array.prototype.slice.call(document.querySelectorAll('.view-section'))}
  function openView(id,push){var section=document.getElementById(id);if(!section)return false;allViews().forEach(function(s){s.classList.toggle('view-hidden',s.id!==id)});document.querySelectorAll('.nav>a[data-view]').forEach(function(a){a.classList.toggle('active',a.dataset.view===id)});document.body.classList.add('viewing-section');if(push&&location.hash!=='#'+id)history.pushState(null,'','#'+id);window.scrollTo(0,0);return true}
  function openAdmin(){var section=document.getElementById('admin');if(!section)return false;allViews().forEach(function(s){s.classList.toggle('view-hidden',s.id!=='admin')});document.querySelectorAll('.nav>a[data-view]').forEach(function(a){a.classList.remove('active')});section.classList.remove('hidden');document.body.classList.add('viewing-section');window.scrollTo(0,0);return true}
  function route(id,push){return id==='admin'?openAdmin():openView(id||'inicio',push)}
  function bind(){ensureCentrosNav();ensureNavIcons()}

  /* ÚNICO CONTROLADOR DE NAVEGACIÓN: window capture se ejecuta antes que los listeners antiguos. */
  window.addEventListener('click',function(e){
    var target=e.target&&e.target.closest?e.target.closest('[data-view]'):null;
    if(target){
      var id=target.dataset.view;
      if(id==='centros'&&!document.getElementById('centros'))return;
      if(document.getElementById(id)){
        e.preventDefault();e.stopImmediatePropagation();route(id,true);return;
      }
    }
    var admin=e.target&&e.target.closest?e.target.closest('#adminBtn'):null;
    if(admin){
      var dialog=document.getElementById('loginDialog');
      if(dialog){e.preventDefault();e.stopImmediatePropagation();if(!dialog.open&&dialog.showModal)dialog.showModal();return}
    }
  },true);

  window.addEventListener('submit',function(e){
    var form=e.target;
    if(form&&form.id==='loginForm'&&typeof window.adminLogin==='function'){
      e.preventDefault();e.stopImmediatePropagation();window.adminLogin(e);
    }
  },true);

  window.addEventListener('hashchange',function(){route(location.hash.replace(/^#/,'')||'inicio',false)},true);
  window.addEventListener('popstate',function(){route(location.hash.replace(/^#/,'')||'inicio',false)},true);

  function start(){bind();var id=location.hash.replace(/^#/,'')||'inicio';if(id==='admin')openAdmin();else if(document.getElementById(id))openView(id,false);else openView('inicio',false)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  var tries=0;var timer=setInterval(function(){bind();if(++tries>100)clearInterval(timer)},100);
})();