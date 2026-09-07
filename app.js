(()=>{
  const LEGACY_APP='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js';
  const CENTROS_APP='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/main/centros.js';

  function ensureCentrosShell(){
    const nav=document.querySelector('.nav');
    if(nav && !nav.querySelector('[data-view="centros"]')){
      const link=document.createElement('a');
      link.href='#centros';
      link.dataset.view='centros';
      link.innerHTML='▦ <span>Centros</span>';
      nav.appendChild(link);
    }

    const main=document.querySelector('main');
    if(!main || document.getElementById('centros')) return;

    const section=document.createElement('section');
    section.id='centros';
    section.className='section view-section view-hidden centros-view';
    section.innerHTML=`
      <div class="section-heading centros-heading">
        <div><span class="eyebrow">REGIONAL 17 · EDUCACIÓN SECUNDARIA</span><h2>Centros educativos</h2></div>
        <p>Consulta los centros de secundaria y técnico-profesionales identificados por distrito.</p>
      </div>
      <div class="centros-summary">
        <div><strong>30</strong><span>centros registrados</span></div>
        <div><strong>5</strong><span>distritos educativos</span></div>
      </div>
      <div class="centros-filters" role="tablist" aria-label="Filtrar por distrito">
        <button type="button" class="btn small primary" data-centro-filter="all">Todos</button>
        <button type="button" class="btn small outline" data-centro-filter="17-01">17-01 · Yamasá</button>
        <button type="button" class="btn small outline" data-centro-filter="17-02">17-02 · Monte Plata</button>
        <button type="button" class="btn small outline" data-centro-filter="17-03">17-03 · Bayaguana</button>
        <button type="button" class="btn small outline" data-centro-filter="17-04">17-04 · Sabana Grande de Boyá</button>
        <button type="button" class="btn small outline" data-centro-filter="17-05">17-05 · Peralvillo</button>
      </div>
      <div id="centrosGrid" class="centros-grid"></div>
      <div class="centros-source-note"><strong>Fuente:</strong> catálogo de centros de secundaria y técnico-profesionales verificados con referencias públicas del MINERD/DGES.</div>`;
    main.appendChild(section);
  }

  function loadScript(src){
    if(document.querySelector(`script[data-trd-src="${src}"]`)) return;
    const script=document.createElement('script');
    script.src=src;
    script.dataset.trdSrc=src;
    script.defer=false;
    document.head.appendChild(script);
  }

  // Primero dejamos creados el botón y la vista para que el controlador
  // de navegación de index.html los conozca desde el inicio.
  ensureCentrosShell();

  // Conservamos toda la lógica existente del sistema y cargamos Centros
  // como un módulo independiente, sin document.write ni carreras de carga.
  loadScript(LEGACY_APP);
  loadScript(CENTROS_APP);

  document.addEventListener('DOMContentLoaded',ensureCentrosShell,{once:true});
  setTimeout(ensureCentrosShell,50);
  setTimeout(ensureCentrosShell,300);
})();