(function(){
  'use strict';

  var LEGACY_SRC='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js';
  var legacyLoaded=false;

  function ensureCentros(){
    var nav=document.querySelector('.nav');
    var main=document.querySelector('main');
    if(!nav||!main)return;

    if(!nav.querySelector('a[data-view="centros"]')){
      var link=document.createElement('a');
      link.href='#centros';
      link.dataset.view='centros';
      link.innerHTML='▦ <span>Centros educativos</span>';
      nav.appendChild(link);
    }

    if(document.getElementById('centros'))return;

    var section=document.createElement('section');
    section.id='centros';
    section.className='section view-section view-hidden centros-view';
    section.innerHTML='<div class="section-heading centros-heading"><div><span class="eyebrow">REGIONAL 17 · EDUCACIÓN SECUNDARIA</span><h2>Centros educativos</h2></div><p>Consulta los centros de secundaria y técnico-profesionales identificados por distrito.</p></div><div class="centros-summary"><div><strong>30</strong><span>centros registrados</span></div><div><strong>5</strong><span>distritos educativos</span></div></div><div class="centros-filters"><button type="button" class="btn small primary" data-centro-filter="all">Todos</button><button type="button" class="btn small outline" data-centro-filter="17-01">17-01 · Yamasá</button><button type="button" class="btn small outline" data-centro-filter="17-02">17-02 · Monte Plata</button><button type="button" class="btn small outline" data-centro-filter="17-03">17-03 · Bayaguana</button><button type="button" class="btn small outline" data-centro-filter="17-04">17-04 · Sabana Grande de Boyá</button><button type="button" class="btn small outline" data-centro-filter="17-05">17-05 · Peralvillo</button></div><div id="centrosGrid" class="centros-grid"></div></section>';
    main.appendChild(section);
  }

  function showView(id){
    var section=document.getElementById(id);
    if(!section)return false;
    document.querySelectorAll('.view-section').forEach(function(s){s.classList.toggle('view-hidden',s.id!==id);});
    document.querySelectorAll('.nav a[data-view]').forEach(function(a){a.classList.toggle('active',a.dataset.view===id);});
    document.body.classList.add('viewing-section');
    window.scrollTo(0,0);
    return true;
  }

  function bindNavigation(){
    document.addEventListener('click',function(e){
      var link=e.target.closest&&e.target.closest('.nav a[data-view]');
      if(link){
        var id=link.dataset.view;
        e.preventDefault();
        e.stopImmediatePropagation();
        showView(id);
        if(location.hash!=='#'+id)history.pushState(null,'','#'+id);
        return;
      }

      var admin=e.target.closest&&e.target.closest('#adminBtn');
      if(admin){
        e.preventDefault();
        e.stopImmediatePropagation();
        var dialog=document.getElementById('loginDialog');
        if(dialog&&typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();
        return;
      }
    },true);

    window.addEventListener('popstate',function(){
      var id=location.hash.slice(1)||'inicio';
      if(id==='admin'){
        var admin=document.getElementById('admin');
        if(admin)admin.classList.remove('hidden');
        return;
      }
      showView(document.getElementById(id)?id:'inicio');
    });
  }

  function loadLegacy(){
    if(legacyLoaded)return;
    legacyLoaded=true;
    var script=document.createElement('script');
    script.src=LEGACY_SRC;
    script.onload=function(){console.log('TRD core loaded');};
    script.onerror=function(){console.error('No se pudo cargar el núcleo de TRD');};
    document.head.appendChild(script);
  }

  // Ejecutar inmediatamente: app.js está después de todo el HTML principal.
  // Así el router inline posterior ve también la sección Centros.
  ensureCentros();
  bindNavigation();
  loadLegacy();

  // Mantener el botón aunque otro módulo reconstruya la navegación.
  var observer=new MutationObserver(function(){ensureCentros();});
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});
})();
