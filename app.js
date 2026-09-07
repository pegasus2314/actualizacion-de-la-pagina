(()=>{
  const LEGACY_APP='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js';
  const baseCenters=[
    ['17-01','09147','Politécnico Virginia Fidelina Matos de la Cruz'],['17-01','13388','Francisco Alberto Caamaño Deñó'],['17-01','04628','La Ceja'],['17-01','09196','Ángel María Santamaría'],['17-01','14367','Politécnico José de la Luz Guillén'],['17-01','13387','Politécnico José Reyes'],['17-01','09168','Politécnico General Eusebio Manzueta'],['17-01','09189','Politécnico Parroquial Sor Susana Daly – Centro de Promoción Rural'],
    ['17-02','04522','Río Boyá'],['17-02','09121','Genaro Soriano Guzmán'],['17-02','04507','El Mamey'],['17-02','14234','Politécnico Ciudad del Conocimiento'],['17-02','05703','José Fco. Peña Gómez'],['17-02','09190','PROMAPEC'],['17-02','13164','Politécnico Julio Abreu Cuello'],['17-02','04740','Santa María'],
    ['17-03','04543','Pedro Pimentel'],['17-03','04536','27 de Febrero'],['17-03','04561','General Gaspar Polanco'],['17-03','09126','Politécnico Morayma Veloz de Báez'],['17-03','14998','Centro Educativo en Artes Prof. Félix Rafael Nova'],
    ['17-04','04714','Ana Virginia Reynoso'],['17-04','04583','Lorenzo Jiménez Santana'],['17-04','14726','Presbítero Carlos Nouel'],['17-04','09135','Lic. Yolanda Esther Rivera'],['17-04','09143','Gregorio Aybar Contreras'],
    ['17-05','04665','Modesto Belén'],['17-05','09186','Hilario Vásquez de León'],['17-05','09185','Gregorio Luperón'],['17-05','09166','Rafael Castillo Reinoso']
  ];
  const districts={'17-01':'Yamasá','17-02':'Monte Plata','17-03':'Bayaguana','17-04':'Sabana Grande de Boyá','17-05':'Peralvillo'};
  let centers=JSON.parse(localStorage.getItem('trd_centros')||'null')||baseCenters.slice();

  function ensureShell(){
    const nav=document.querySelector('.nav');
    if(nav&&!nav.querySelector('[data-view="centros"]')){
      const a=document.createElement('a');a.href='#centros';a.dataset.view='centros';a.innerHTML='▦ <span>Centros</span>';nav.appendChild(a);
    }
    const main=document.querySelector('main');if(!main)return null;
    let section=document.getElementById('centros');
    if(!section){
      section=document.createElement('section');section.id='centros';section.className='section view-section view-hidden centros-view';
      section.innerHTML='<div class="centros-header"><div><span class="eyebrow">REGIONAL 17 · EDUCACIÓN SECUNDARIA</span><h2>Centros educativos</h2><p>Administra y consulta los centros registrados en la Regional 17.</p></div><button type="button" class="btn primary centros-add" id="addCentroBtn">＋ Agregar centro</button></div><div class="centros-summary"><div><span class="centros-summary-icon">⌂</span><strong id="centrosCount">30</strong><span>centros registrados</span></div><div><span class="centros-summary-icon">▦</span><strong>5</strong><span>distritos educativos</span></div><div><span class="centros-summary-icon">✓</span><strong id="centrosVisible">30</strong><span>mostrados</span></div></div><div class="centros-toolbar"><div class="centros-filters" role="tablist" aria-label="Filtrar por distrito"><button type="button" class="btn small primary" data-centro-filter="all">Todos</button><button type="button" class="btn small outline" data-centro-filter="17-01">17-01 · Yamasá</button><button type="button" class="btn small outline" data-centro-filter="17-02">17-02 · Monte Plata</button><button type="button" class="btn small outline" data-centro-filter="17-03">17-03 · Bayaguana</button><button type="button" class="btn small outline" data-centro-filter="17-04">17-04 · Sabana Grande de Boyá</button><button type="button" class="btn small outline" data-centro-filter="17-05">17-05 · Peralvillo</button></div></div><div id="centrosGrid" class="centros-grid"></div><div class="centros-source-note"><strong>Fuente:</strong> catálogo de centros de secundaria y técnico-profesionales de la Regional 17.</div><dialog id="centroDialog" class="centro-dialog"><form method="dialog" id="centroForm"><div class="centro-dialog-head"><div><span class="eyebrow">NUEVO REGISTRO</span><h3>Agregar centro educativo</h3><p>Completa los datos del centro para incorporarlo al listado.</p></div><button type="button" class="centro-close" id="closeCentroDialog" aria-label="Cerrar">×</button></div><div class="centro-form-grid"><label>Distrito<select id="centroDistrito" required><option value="17-01">17-01 · Yamasá</option><option value="17-02">17-02 · Monte Plata</option><option value="17-03">17-03 · Bayaguana</option><option value="17-04">17-04 · Sabana Grande de Boyá</option><option value="17-05">17-05 · Peralvillo</option></select></label><label>Código del centro<input id="centroCodigo" maxlength="10" required placeholder="Ej. 15001"></label><label class="full">Nombre del centro<input id="centroNombre" maxlength="140" required placeholder="Nombre oficial del centro educativo"></label></div><div class="centro-dialog-actions"><button type="button" class="btn outline" id="cancelCentro">Cancelar</button><button type="submit" class="btn primary">Guardar centro</button></div></form></dialog>';
      main.appendChild(section);
    }
    return section;
  }

  function render(filter){
    const grid=document.getElementById('centrosGrid');if(!grid)return;
    const list=filter==='all'?centers:centers.filter(c=>c[0]===filter);
    const count=document.getElementById('centrosCount'),visible=document.getElementById('centrosVisible');
    if(count)count.textContent=centers.length;if(visible)visible.textContent=list.length;
    grid.innerHTML=list.map((c,i)=>'<article class="centro-card"><div class="centro-card-top"><span class="centro-district-badge">'+c[0]+' · '+districts[c[0]]+'</span><span class="centro-code">'+c[1]+'</span></div><div class="centro-card-icon">▦</div><h3>'+c[2]+'</h3><div class="centro-card-meta"><span>Educación secundaria</span><span>Regional 17</span></div></article>').join('');
  }

  function openAdd(){
    const dialog=document.getElementById('centroDialog');if(dialog){dialog.showModal();setTimeout(()=>document.getElementById('centroNombre')?.focus(),50);}
  }
  function closeAdd(){document.getElementById('centroDialog')?.close();}
  function saveCenter(){
    const district=document.getElementById('centroDistrito')?.value,code=document.getElementById('centroCodigo')?.value.trim(),name=document.getElementById('centroNombre')?.value.trim();
    if(!district||!code||!name)return;
    if(centers.some(c=>c[1]===code)){alert('Ya existe un centro con ese código.');return;}
    centers.push([district,code,name]);localStorage.setItem('trd_centros',JSON.stringify(centers));
    document.getElementById('centroForm')?.reset();closeAdd();render('all');
  }

  function showCentros(push){
    const section=ensureShell();if(!section)return;
    document.querySelectorAll('.view-section').forEach(s=>s.classList.toggle('view-hidden',s!==section));
    document.querySelectorAll('.nav [data-view]').forEach(a=>a.classList.toggle('active',a.dataset.view==='centros'));
    document.body.classList.add('viewing-section');render('all');
    if(push&&location.hash!=='#centros')history.pushState(null,'','#centros');window.scrollTo({top:0,behavior:'smooth'});
  }
  function loadLegacy(){if(document.querySelector('script[data-trd-legacy]'))return;const s=document.createElement('script');s.src=LEGACY_APP;s.dataset.trdLegacy='1';document.head.appendChild(s);}

  ensureShell();
  document.addEventListener('click',e=>{
    const link=e.target.closest('[data-view="centros"]');if(link){e.preventDefault();e.stopImmediatePropagation();showCentros(true);return;}
    if(e.target.closest('#addCentroBtn')){e.preventDefault();openAdd();return;}
    if(e.target.closest('#closeCentroDialog,#cancelCentro')){e.preventDefault();closeAdd();return;}
    const filter=e.target.closest('[data-centro-filter]');if(filter){e.preventDefault();document.querySelectorAll('[data-centro-filter]').forEach(b=>{b.classList.toggle('primary',b===filter);b.classList.toggle('outline',b!==filter)});render(filter.dataset.centroFilter);}
  },true);
  document.addEventListener('submit',e=>{if(e.target.id==='centroForm'){e.preventDefault();saveCenter();}},true);
  window.addEventListener('hashchange',()=>{if(location.hash==='#centros')showCentros(false);});
  window.addEventListener('popstate',()=>{if(location.hash==='#centros')showCentros(false);});
  document.addEventListener('DOMContentLoaded',()=>{ensureShell();if(location.hash==='#centros')showCentros(false);loadLegacy();},{once:true});
  setTimeout(()=>{ensureShell();loadLegacy();},50);
})();