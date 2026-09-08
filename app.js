(function(){
  'use strict';

  var LEGACY_SRC='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js';
  var legacyLoaded=false;

  var districts=[
    {id:'17-01',name:'Yamasá'},
    {id:'17-02',name:'Monte Plata'},
    {id:'17-03',name:'Bayaguana'},
    {id:'17-04',name:'Sabana Grande de Boyá'},
    {id:'17-05',name:'Peralvillo'}
  ];

  var centers=[
    ['17-01','09147','Politécnico Virginia Fidelina Matos de la Cruz'],['17-01','13388','Francisco Alberto Caamaño Deñó'],['17-01','04628','La Ceja'],['17-01','09196','Ángel María Santamaría'],['17-01','14367','Politécnico José de la Luz Guillén'],['17-01','13387','Politécnico José Reyes'],['17-01','09168','Politécnico General Eusebio Manzueta'],['17-01','09189','Politécnico Parroquial Sor Susana Daly – Centro de Promoción Rural'],
    ['17-02','04522','Río Boyá'],['17-02','09121','Genaro Soriano Guzmán'],['17-02','04507','El Mamey'],['17-02','14234','Politécnico Ciudad del Conocimiento'],['17-02','05703','José Fco. Peña Gómez'],['17-02','09190','PROMAPEC'],['17-02','13164','Politécnico Julio Abreu Cuello'],['17-02','04740','Santa María'],
    ['17-03','04543','Pedro Pimentel'],['17-03','04536','27 de Febrero'],['17-03','04561','General Gaspar Polanco'],['17-03','09126','Politécnico Morayma Veloz de Báez'],['17-03','14998','Centro Educativo en Artes Prof. Félix Rafael Nova'],
    ['17-04','04714','Ana Virginia Reynoso'],['17-04','04583','Lorenzo Jiménez Santana'],['17-04','14726','Presbítero Carlos Nouel'],['17-04','09135','Lic. Yolanda Esther Rivera'],['17-04','09143','Gregorio Aybar Contreras'],
    ['17-05','04665','Modesto Belén'],['17-05','09186','Hilario Vásquez de León'],['17-05','09185','Gregorio Luperón'],['17-05','09166','Rafael Castillo Reinoso']
  ].map(function(item){return {district:item[0],code:item[1],name:item[2]};});

  function districtName(id){var found=districts.find(function(d){return d.id===id;});return found?found.name:id;}

  var icons={
    inicio:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
    inscripcion:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/></svg>',
    participantes:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M14 15c3.5-.5 5.5 1.2 6 5"/></svg>',
    torneo:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></svg>',
    logistica:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    centros:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V6l8-3 8 3v15"/><path d="M8 9h2M14 9h2M8 13h2M14 13h2M10 21v-4h4v4"/></svg>',
    admin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4"/></svg>'
  };

  function injectVisualPolish(){
    if(document.getElementById('trd-icon-panel-polish'))return;
    var style=document.createElement('style');
    style.id='trd-icon-panel-polish';
    style.textContent=''
      +'.nav a,.hero-actions .btn,#adminBtn{display:inline-flex;align-items:center;gap:8px}'
      +'.trd-ui-icon{width:18px;height:18px;display:grid;place-items:center;flex:0 0 18px}'
      +'.trd-ui-icon svg,.competition-card>span svg,.centro-card-icon svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'
      +'.nav a .trd-ui-icon{width:16px;height:16px;flex-basis:16px;opacity:.88}'
      +'.nav a.active .trd-ui-icon,.nav a:hover .trd-ui-icon{opacity:1}'
      +'.competition-card>span{width:52px!important;height:52px!important;border-radius:15px!important;background:linear-gradient(145deg,rgba(25,220,229,.12),rgba(182,231,255,.035))!important;border-color:rgba(25,220,229,.28)!important;padding:13px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}'
      +'.competition-card>span svg{width:100%;height:100%}'
      +'.home-intro .competition-card{min-height:224px!important;padding:26px!important;border-radius:18px!important;box-shadow:0 14px 34px rgba(0,0,0,.18)!important}'
      +'.home-intro .competition-card b{font-size:28px!important;margin-top:17px!important}'
      +'.home-intro .competition-card small{font-size:12px!important;line-height:1.55!important}'
      +'.home-intro .competition-card strong{padding-top:18px!important}'
      +'.panel,.admin-content,.glass-form,.team-card,.participant-team,.logistics-card,.centro-card{box-shadow:0 12px 30px rgba(0,0,0,.16)!important}'
      +'.panel,.admin-content{border-radius:16px!important}'
      +'.panel-heading .section-icon{width:40px;height:40px;border-radius:12px;background:rgba(25,220,229,.07);border:1px solid rgba(25,220,229,.18)}'
      +'.panel-heading .section-icon svg{width:20px;height:20px}'
      +'.centro-card{min-height:218px!important;padding:21px!important;border-radius:18px!important}'
      +'.centro-card-icon{width:44px!important;height:44px!important;padding:11px!important;margin-top:16px!important;border-radius:12px!important;background:rgba(25,220,229,.065)!important;border-color:rgba(25,220,229,.18)!important}'
      +'.centro-card h3{font-size:24px!important;line-height:1.08!important;margin:11px 0 12px!important}'
      +'.admin-card{border-radius:14px!important;transition:transform .18s ease,border-color .18s ease,background .18s ease}'
      +'.admin-card:hover{transform:translateY(-2px);border-color:rgba(25,220,229,.25);background:rgba(10,29,43,.6)}'
      +'@media(max-width:800px){.nav a .trd-ui-icon{width:18px;height:18px;flex-basis:18px}.home-intro .competition-card{min-height:195px!important}.centro-card{min-height:190px!important}.competition-card>span{width:48px!important;height:48px!important}}';
    document.head.appendChild(style);

    document.querySelectorAll('.nav a[data-view]').forEach(function(a){
      var id=a.dataset.view;
      if(!icons[id]||a.querySelector('.trd-ui-icon'))return;
      var old=a.querySelector('span:not(.trd-ui-icon)');
      if(old)old.textContent=old.textContent.trim();
      Array.from(a.childNodes).forEach(function(n){if(n.nodeType===3)n.remove();});
      var icon=document.createElement('span');icon.className='trd-ui-icon';icon.innerHTML=icons[id];a.insertBefore(icon,a.firstChild);
    });

    document.querySelectorAll('.competition-card').forEach(function(card){
      var href=(card.getAttribute('href')||'').replace('#','');
      var holder=card.querySelector(':scope > span');
      if(holder&&icons[href]&&!holder.querySelector('svg'))holder.innerHTML=icons[href];
    });

    var admin=document.getElementById('adminBtn');
    if(admin&&!admin.querySelector('.trd-ui-icon')){
      Array.from(admin.childNodes).forEach(function(n){if(n.nodeType===3)n.remove();});
      var ai=document.createElement('span');ai.className='trd-ui-icon';ai.innerHTML=icons.admin;admin.insertBefore(ai,admin.firstChild);
      admin.appendChild(document.createTextNode('Administración'));
    }
  }

  function renderCentros(filter){
    var grid=document.getElementById('centrosGrid');if(!grid)return;
    filter=filter||'all';
    var list=filter==='all'?centers:centers.filter(function(c){return c.district===filter;});
    grid.innerHTML=list.map(function(c){
      return '<article class="centro-card"><div class="centro-top"><span class="centro-code">'+c.code+'</span><span class="centro-district">'+c.district+'</span></div><div class="centro-card-icon">'+icons.centros+'</div><h3>'+c.name+'</h3><div class="centro-card-meta"><span>Educación secundaria</span><span>'+districtName(c.district)+'</span></div></article>';
    }).join('')||'<div class="empty">No hay centros registrados para este distrito.</div>';
    injectVisualPolish();
  }

  function ensureCentros(){
    var nav=document.querySelector('.nav'),main=document.querySelector('main');if(!nav||!main)return;
    if(!nav.querySelector('a[data-view="centros"]')){
      var link=document.createElement('a');link.href='#centros';link.dataset.view='centros';link.innerHTML='▦ <span>Centros educativos</span>';nav.appendChild(link);
    }
    var section=document.getElementById('centros');
    if(!section){
      section=document.createElement('section');section.id='centros';section.className='section view-section view-hidden centros-view';
      section.innerHTML='<div class="section-heading centros-heading"><div><span class="eyebrow">REGIONAL 17 · EDUCACIÓN SECUNDARIA</span><h2>Centros educativos</h2></div><p>Consulta los centros de secundaria y técnico-profesionales identificados por distrito.</p></div><div class="centros-summary"><div><strong>'+centers.length+'</strong><span>centros registrados</span></div><div><strong>'+districts.length+'</strong><span>distritos educativos</span></div></div><div class="centros-filters" role="tablist" aria-label="Filtrar por distrito"><button type="button" class="btn small primary" data-centro-filter="all">Todos</button>'+districts.map(function(d){return '<button type="button" class="btn small outline" data-centro-filter="'+d.id+'">'+d.id+' · '+d.name+'</button>';}).join('')+'</div><div id="centrosGrid" class="centros-grid"></div><div class="centros-source-note"><strong>Fuente:</strong> catálogo de centros de secundaria y técnico-profesionales verificados con referencias públicas del MINERD/DGES.</div>';
      main.appendChild(section);renderCentros('all');
    }else if(document.getElementById('centrosGrid')&&!document.getElementById('centrosGrid').children.length)renderCentros('all');
    injectVisualPolish();
  }

  function showView(id){
    if(id==='centros')ensureCentros();
    var section=document.getElementById(id);if(!section)return false;
    document.querySelectorAll('.view-section').forEach(function(s){s.classList.toggle('view-hidden',s.id!==id);});
    document.querySelectorAll('.nav a[data-view]').forEach(function(a){a.classList.toggle('active',a.dataset.view===id);});
    document.body.classList.add('viewing-section');window.scrollTo(0,0);injectVisualPolish();return true;
  }

  function bindNavigation(){
    document.addEventListener('click',function(e){
      var filter=e.target.closest&&e.target.closest('[data-centro-filter]');
      if(filter){e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('[data-centro-filter]').forEach(function(b){b.classList.toggle('primary',b===filter);b.classList.toggle('outline',b!==filter);});renderCentros(filter.dataset.centroFilter);return;}
      var link=e.target.closest&&e.target.closest('.nav a[data-view]');
      if(link){var id=link.dataset.view;e.preventDefault();e.stopImmediatePropagation();showView(id);if(location.hash!=='#'+id)history.pushState(null,'','#'+id);return;}
      var admin=e.target.closest&&e.target.closest('#adminBtn');
      if(admin){e.preventDefault();e.stopImmediatePropagation();var dialog=document.getElementById('loginDialog');if(dialog&&typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();return;}
    },true);
    window.addEventListener('popstate',function(){var id=location.hash.slice(1)||'inicio';if(id==='admin'){var admin=document.getElementById('admin');if(admin)admin.classList.remove('hidden');return;}showView(document.getElementById(id)?id:'inicio');});
    window.addEventListener('hashchange',function(){var id=location.hash.slice(1)||'inicio';if(id==='centros')showView('centros');else if(id!=='admin')showView(document.getElementById(id)?id:'inicio');});
  }

  function loadLegacy(){
    if(legacyLoaded)return;legacyLoaded=true;
    var script=document.createElement('script');script.src=LEGACY_SRC;script.onload=function(){console.log('TRD core loaded');injectVisualPolish();};script.onerror=function(){console.error('No se pudo cargar el núcleo de TRD');};document.head.appendChild(script);
  }

  ensureCentros();
  bindNavigation();
  injectVisualPolish();
  loadLegacy();

  var observer=new MutationObserver(function(){ensureCentros();injectVisualPolish();});
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});
})();