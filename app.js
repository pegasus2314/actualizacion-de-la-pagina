(()=>{
  const LEGACY_APP='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js';
  const centers=[
    ['17-01','09147','Politécnico Virginia Fidelina Matos de la Cruz'],['17-01','13388','Francisco Alberto Caamaño Deñó'],['17-01','04628','La Ceja'],['17-01','09196','Ángel María Santamaría'],['17-01','14367','Politécnico José de la Luz Guillén'],['17-01','13387','Politécnico José Reyes'],['17-01','09168','Politécnico General Eusebio Manzueta'],['17-01','09189','Politécnico Parroquial Sor Susana Daly – Centro de Promoción Rural'],
    ['17-02','04522','Río Boyá'],['17-02','09121','Genaro Soriano Guzmán'],['17-02','04507','El Mamey'],['17-02','14234','Politécnico Ciudad del Conocimiento'],['17-02','05703','José Fco. Peña Gómez'],['17-02','09190','PROMAPEC'],['17-02','13164','Politécnico Julio Abreu Cuello'],['17-02','04740','Santa María'],
    ['17-03','04543','Pedro Pimentel'],['17-03','04536','27 de Febrero'],['17-03','04561','General Gaspar Polanco'],['17-03','09126','Politécnico Morayma Veloz de Báez'],['17-03','14998','Centro Educativo en Artes Prof. Félix Rafael Nova'],
    ['17-04','04714','Ana Virginia Reynoso'],['17-04','04583','Lorenzo Jiménez Santana'],['17-04','14726','Presbítero Carlos Nouel'],['17-04','09135','Lic. Yolanda Esther Rivera'],['17-04','09143','Gregorio Aybar Contreras'],
    ['17-05','04665','Modesto Belén'],['17-05','09186','Hilario Vásquez de León'],['17-05','09185','Gregorio Luperón'],['17-05','09166','Rafael Castillo Reinoso']
  ];
  const districts={'17-01':'Yamasá','17-02':'Monte Plata','17-03':'Bayaguana','17-04':'Sabana Grande de Boyá','17-05':'Peralvillo'};

  function ensureShell(){
    const nav=document.querySelector('.nav');
    if(nav&&!nav.querySelector('[data-view="centros"]')){
      const a=document.createElement('a');a.href='#centros';a.dataset.view='centros';a.innerHTML='▦ <span>Centros</span>';nav.appendChild(a);
    }
    const main=document.querySelector('main');
    if(!main)return null;
    let section=document.getElementById('centros');
    if(!section){
      section=document.createElement('section');section.id='centros';section.className='section view-section view-hidden centros-view';
      section.innerHTML='<div class="section-heading centros-heading"><span class="eyebrow">REGIONAL 17 · EDUCACIÓN SECUNDARIA</span><h2>Centros educativos</h2><p>Consulta los centros educativos registrados por distrito.</p></div><div class="centros-summary"><div><strong>30</strong><span>centros registrados</span></div><div><strong>5</strong><span>distritos educativos</span></div></div><div class="centros-filters" role="tablist" aria-label="Filtrar por distrito"><button type="button" class="btn small primary" data-centro-filter="all">Todos</button><button type="button" class="btn small outline" data-centro-filter="17-01">17-01 · Yamasá</button><button type="button" class="btn small outline" data-centro-filter="17-02">17-02 · Monte Plata</button><button type="button" class="btn small outline" data-centro-filter="17-03">17-03 · Bayaguana</button><button type="button" class="btn small outline" data-centro-filter="17-04">17-04 · Sabana Grande de Boyá</button><button type="button" class="btn small outline" data-centro-filter="17-05">17-05 · Peralvillo</button></div><div id="centrosGrid" class="centros-grid"></div><div class="centros-source-note"><strong>Fuente:</strong> catálogo de centros de secundaria y técnico-profesionales de la Regional 17.</div>';
      main.appendChild(section);
    }
    return section;
  }

  function render(filter){
    const grid=document.getElementById('centrosGrid');if(!grid)return;
    const list=filter==='all'?centers:centers.filter(c=>c[0]===filter);
    grid.innerHTML=list.map(c=>'<article class="centro-card"><div class="centro-top"><span class="centro-code">'+c[1]+'</span><span class="centro-district">'+c[0]+'</span></div><h3>'+c[2]+'</h3><p>Educación secundaria · '+districts[c[0]]+'</p></article>').join('');
  }

  function showCentros(push){
    const section=ensureShell();if(!section)return;
    document.querySelectorAll('.view-section').forEach(s=>s.classList.toggle('view-hidden',s!==section));
    document.querySelectorAll('.nav [data-view]').forEach(a=>a.classList.toggle('active',a.dataset.view==='centros'));
    document.body.classList.add('viewing-section');
    render('all');
    if(push&&location.hash!=='#centros')history.pushState(null,'','#centros');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function loadLegacy(){
    if(document.querySelector('script[data-trd-legacy]'))return;
    const s=document.createElement('script');s.src=LEGACY_APP;s.dataset.trdLegacy='1';document.head.appendChild(s);
  }

  // Centros se controla aquí mismo: no depende de centros.js ni del orden de carga.
  ensureShell();
  document.addEventListener('click',e=>{
    const link=e.target.closest('[data-view="centros"]');
    if(link){e.preventDefault();e.stopImmediatePropagation();showCentros(true);return;}
    const filter=e.target.closest('[data-centro-filter]');
    if(filter){e.preventDefault();document.querySelectorAll('[data-centro-filter]').forEach(b=>{b.classList.toggle('primary',b===filter);b.classList.toggle('outline',b!==filter)});render(filter.dataset.centroFilter);}
  },true);
  window.addEventListener('hashchange',()=>{if(location.hash==='#centros')showCentros(false);});
  window.addEventListener('popstate',()=>{if(location.hash==='#centros')showCentros(false);});
  document.addEventListener('DOMContentLoaded',()=>{ensureShell();if(location.hash==='#centros')showCentros(false);loadLegacy();},{once:true});
  setTimeout(()=>{ensureShell();loadLegacy();},50);
})();