(()=>{
  const districts=[
    {id:'17-01',name:'Yamasá'},
    {id:'17-02',name:'Monte Plata'},
    {id:'17-03',name:'Bayaguana'},
    {id:'17-04',name:'Sabana Grande de Boyá'},
    {id:'17-05',name:'Peralvillo'}
  ];
  const centers=[
    ['17-01','09147','Politécnico Virginia Fidelina Matos de la Cruz'],['17-01','13388','Francisco Alberto Caamaño Deñó'],['17-01','04628','La Ceja'],['17-01','09196','Ángel María Santamaría'],['17-01','14367','Politécnico José de la Luz Guillén'],['17-01','13387','Politécnico José Reyes'],['17-01','09168','Politécnico General Eusebio Manzueta'],['17-01','09189','Politécnico Parroquial Sor Susana Daly – Centro de Promoción Rural'],
    ['17-02','04522','Río Boyá'],['17-02','09121','Genaro Soriano Guzmán'],['17-02','04507','El Mamey'],['17-02','14234','Politécnico Ciudad del Conocimiento'],['17-02','05703','José Fco. Peña Gómez'],['17-02','09190','PROMAPEC'],['17-02','13164','Politécnico Julio Abreu Cuello'],['17-02','04740','Santa María'],
    ['17-03','04543','Pedro Pimentel'],['17-03','04536','27 de Febrero'],['17-03','04561','General Gaspar Polanco'],['17-03','09126','Politécnico Morayma Veloz de Báez'],['17-03','14998','Centro Educativo en Artes Prof. Félix Rafael Nova'],
    ['17-04','04714','Ana Virginia Reynoso'],['17-04','04583','Lorenzo Jiménez Santana'],['17-04','14726','Presbítero Carlos Nouel'],['17-04','09135','Lic. Yolanda Esther Rivera'],['17-04','09143','Gregorio Aybar Contreras'],
    ['17-05','04665','Modesto Belén'],['17-05','09186','Hilario Vásquez de León'],['17-05','09185','Gregorio Luperón'],['17-05','09166','Rafael Castillo Reinoso']
  ].map(([district,code,name])=>({district,code,name}));

  function render(filter='all'){
    const grid=document.getElementById('centrosGrid');
    if(!grid)return;
    const list=filter==='all'?centers:centers.filter(c=>c.district===filter);
    grid.innerHTML=list.map(c=>`<article class="centro-card"><div class="centro-top"><span class="centro-code">${c.code}</span><span class="centro-district">${c.district}</span></div><h3>${c.name}</h3><p>Educación secundaria · ${districts.find(d=>d.id===c.district)?.name||c.district}</p></article>`).join('')||'<div class="empty">No hay centros registrados para este distrito.</div>';
  }

  function activate(){
    const section=document.getElementById('centros');
    if(!section)return;
    document.querySelectorAll('.view-section').forEach(s=>s.classList.add('view-hidden'));
    section.classList.remove('view-hidden');
    document.body.classList.add('viewing-section');
    document.querySelectorAll('[data-view]').forEach(a=>a.classList.toggle('active',a.dataset.view==='centros'&&a.closest('.nav')));
  }

  function hide(){
    const section=document.getElementById('centros');
    if(section)section.classList.add('view-hidden');
  }

  function inject(){
    if(document.getElementById('centros'))return;
    const nav=document.querySelector('.nav');
    if(nav&&!nav.querySelector('[data-view="centros"]')){
      const a=document.createElement('a');
      a.href='#centros';
      a.dataset.view='centros';
      a.innerHTML='⌂ <span>Centros</span>';
      nav.appendChild(a);
    }
    const main=document.querySelector('main');
    if(!main)return;
    const section=document.createElement('section');
    section.id='centros';
    section.className='section view-section view-hidden centros-view';
    section.innerHTML=`
      <div class="section-heading centros-heading">
        <div><span class="eyebrow">REGIONAL 17 · EDUCACIÓN SECUNDARIA</span><h2>Centros educativos</h2></div>
        <p>Consulta los centros de secundaria y técnico-profesionales identificados por distrito.</p>
      </div>
      <div class="centros-summary"><div><strong>${centers.length}</strong><span>centros registrados</span></div><div><strong>5</strong><span>distritos educativos</span></div></div>
      <div class="centros-filters" role="tablist" aria-label="Filtrar por distrito">
        <button class="btn small primary" data-centro-filter="all">Todos</button>
        ${districts.map(d=>`<button class="btn small outline" data-centro-filter="${d.id}">${d.id} · ${d.name}</button>`).join('')}
      </div>
      <div id="centrosGrid" class="centros-grid"></div>
      <div class="centros-source-note"><strong>Fuente:</strong> catálogo de centros de secundaria y técnico-profesionales verificados con referencias públicas del MINERD/DGES. La vista está organizada por los cinco distritos de la Regional 17.</div>`;
    main.appendChild(section);
    render();
    document.addEventListener('click',e=>{
      const filter=e.target.closest('[data-centro-filter]');
      if(!filter)return;
      document.querySelectorAll('[data-centro-filter]').forEach(b=>b.classList.toggle('primary',b===filter));
      document.querySelectorAll('[data-centro-filter]').forEach(b=>b.classList.toggle('outline',b!==filter));
      render(filter.dataset.centroFilter);
    });
    if(location.hash==='#centros')activate();
  }

  document.addEventListener('click',e=>{
    const link=e.target.closest('[data-view]');
    if(!link)return;
    if(link.dataset.view==='centros'){
      e.preventDefault();
      history.pushState({},'', '#centros');
      activate();
    }else{
      hide();
    }
  });
  window.addEventListener('popstate',()=>location.hash==='#centros'?activate():hide());
  window.addEventListener('hashchange',()=>location.hash==='#centros'?activate():hide());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();