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
    ['17-01','09147','Politécnico Virginia Fidelina Matos de la Cruz'],
    ['17-01','13388','Francisco Alberto Caamaño Deñó'],
    ['17-01','04628','La Ceja'],
    ['17-01','09196','Ángel María Santamaría'],
    ['17-01','14367','Politécnico José de la Luz Guillén'],
    ['17-01','13387','Politécnico José Reyes'],
    ['17-01','09168','Politécnico General Eusebio Manzueta'],
    ['17-01','09189','Politécnico Parroquial Sor Susana Daly – Centro de Promoción Rural'],
    ['17-02','04522','Río Boyá'],
    ['17-02','09121','Genaro Soriano Guzmán'],
    ['17-02','04507','El Mamey'],
    ['17-02','14234','Politécnico Ciudad del Conocimiento'],
    ['17-02','05703','José Fco. Peña Gómez'],
    ['17-02','09190','PROMAPEC'],
    ['17-02','13164','Politécnico Julio Abreu Cuello'],
    ['17-02','04740','Santa María'],
    ['17-03','04543','Pedro Pimentel'],
    ['17-03','04536','27 de Febrero'],
    ['17-03','04561','General Gaspar Polanco'],
    ['17-03','09126','Politécnico Morayma Veloz de Báez'],
    ['17-03','14998','Centro Educativo en Artes Prof. Félix Rafael Nova'],
    ['17-04','04714','Ana Virginia Reynoso'],
    ['17-04','04583','Lorenzo Jiménez Santana'],
    ['17-04','14726','Presbítero Carlos Nouel'],
    ['17-04','09135','Lic. Yolanda Esther Rivera'],
    ['17-04','09143','Gregorio Aybar Contreras'],
    ['17-05','04665','Modesto Belén'],
    ['17-05','09186','Hilario Vásquez de León'],
    ['17-05','09185','Gregorio Luperón'],
    ['17-05','09166','Rafael Castillo Reinoso']
  ].map(function(item){
    return {district:item[0],code:item[1],name:item[2]};
  });

  function districtName(id){
    var found=districts.find(function(d){return d.id===id;});
    return found?found.name:id;
  }

  function renderCentros(filter){
    var grid=document.getElementById('centrosGrid');
    if(!grid)return;
    filter=filter||'all';
    var list=filter==='all'?centers:centers.filter(function(c){return c.district===filter;});
    grid.innerHTML=list.map(function(c){
      return '<article class="centro-card"><div class="centro-top"><span class="centro-code">'+c.code+'</span><span class="centro-district">'+c.district+'</span></div><h3>'+c.name+'</h3><p>Educación secundaria · '+districtName(c.district)+'</p></article>';
    }).join('')||'<div class="empty">No hay centros registrados para este distrito.</div>';
  }

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

    var section=document.getElementById('centros');
    if(!section){
      section=document.createElement('section');
      section.id='centros';
      section.className='section view-section view-hidden centros-view';
      section.innerHTML='<div class="section-heading centros-heading"><div><span class="eyebrow">REGIONAL 17 · EDUCACIÓN SECUNDARIA</span><h2>Centros educativos</h2></div><p>Consulta los centros de secundaria y técnico-profesionales identificados por distrito.</p></div><div class="centros-summary"><div><strong>'+centers.length+'</strong><span>centros registrados</span></div><div><strong>'+districts.length+'</strong><span>distritos educativos</span></div></div><div class="centros-filters" role="tablist" aria-label="Filtrar por distrito"><button type="button" class="btn small primary" data-centro-filter="all">Todos</button>'+districts.map(function(d){return '<button type="button" class="btn small outline" data-centro-filter="'+d.id+'">'+d.id+' · '+d.name+'</button>';}).join('')+'</div><div id="centrosGrid" class="centros-grid"></div><div class="centros-source-note"><strong>Fuente:</strong> catálogo de centros de secundaria y técnico-profesionales verificados con referencias públicas del MINERD/DGES.</div>';
      main.appendChild(section);
      renderCentros('all');
    }else if(document.getElementById('centrosGrid') && !document.getElementById('centrosGrid').children.length){
      renderCentros('all');
    }
  }

  function showView(id){
    if(id==='centros')ensureCentros();
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
      var filter=e.target.closest&&e.target.closest('[data-centro-filter]');
      if(filter){
        e.preventDefault();
        e.stopImmediatePropagation();
        document.querySelectorAll('[data-centro-filter]').forEach(function(b){
          b.classList.toggle('primary',b===filter);
          b.classList.toggle('outline',b!==filter);
        });
        renderCentros(filter.dataset.centroFilter);
        return;
      }

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

    window.addEventListener('hashchange',function(){
      var id=location.hash.slice(1)||'inicio';
      if(id==='centros')showView('centros');
      else if(id!=='admin')showView(document.getElementById(id)?id:'inicio');
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

  ensureCentros();
  bindNavigation();
  loadLegacy();

  var observer=new MutationObserver(function(){ensureCentros();});
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});
})();