(() => {
  const districts = [
    { id: '17-01', name: 'Yamasá' },
    { id: '17-02', name: 'Monte Plata' },
    { id: '17-03', name: 'Bayaguana' },
    { id: '17-04', name: 'Sabana Grande de Boyá' },
    { id: '17-05', name: 'Peralvillo' }
  ];

  // Catálogo verificado con fuentes públicas del MINERD/DGES. Se evita presentar
  // como exhaustivos los registros que no están confirmados en el dataset 2026.
  const centers = [
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
  ].map(([district, code, name]) => ({ district, code, name }));

  const esc = (v='') => String(v).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));

  function inject() {
    if (document.getElementById('centros')) return;

    const nav = document.querySelector('.nav');
    if (nav && !nav.querySelector('[data-view="centros"]')) {
      const a = document.createElement('a');
      a.href = '#centros';
      a.dataset.view = 'centros';
      a.innerHTML = '⌂ <span>Centros</span>';
      nav.appendChild(a);
    }

    const main = document.querySelector('main');
    if (!main) return;
    const section = document.createElement('section');
    section.id = 'centros';
    section.className = 'section view-section view-hidden centros-view';
    section.innerHTML = `
      <div class="section-heading centros-heading">
        <div><span class="eyebrow">REGIONAL 17 · EDUCACIÓN SECUNDARIA</span><h2>Centros educativos</h2></div>
        <p>Consulta los centros de secundaria y técnico-profesionales identificados por distrito.</p>
      </div>
      <div class="centros-summary">
        <div><strong>${centers.length}</strong><span>registros verificados</span></div>
        <div><strong>5</strong><span>distritos educativos</span></div>
      </div>
      <div class="centros-filters" role="tablist" aria-label="Filtrar por distrito">
        <button class="btn small primary" data-centro-filter="all">Todos</button>
        ${districts.map(d => `<button class="btn small outline" data-centro-filter="${d.id}">${d.id} · ${d.name}</button>`).join('')}
      </div>
      <div id="centrosGrid" class="centros-grid"></div>
      <div class="centros-source-note"><strong>Fuente:</strong> catálogo construido con referencias públicas del MINERD/DGES. El portal oficial de datos abiertos del MINERD publica el conjunto nacional de centros educativos 2026; la lista de esta vista se mantiene limitada a registros de secundaria/técnico-profesional que pudimos verificar.</div>
    `;
    main.appendChild(section);
    render('all');

    section.querySelectorAll('[data-centro-filter]').forEach(btn => btn.addEventListener('click', () => {
      section.querySelectorAll('[data-centro-filter]').forEach(b => b.classList.remove('primary'));
      section.querySelectorAll('[data-centro-filter]').forEach(b => b.classList.add('outline'));
      btn.classList.remove('outline');
      btn.classList.add('primary');
      render(btn.dataset.centroFilter);
    }));
  }

  function render(filter) {
    const grid = document.getElementById('centrosGrid');
    if (!grid) return;
    const items = filter === 'all' ? centers : centers.filter(c => c.district === filter);
    grid.innerHTML = items.map(c => {
      const d = districts.find(x => x.id === c.district);
      return `<article class="centro-card"><div class="centro-code">${esc(c.code)}</div><div class="centro-body"><span>${esc(c.district)} · ${esc(d?.name || '')}</span><h3>${esc(c.name)}</h3><small>Educación secundaria / técnico-profesional</small></div></article>`;
    }).join('');
  }

  function activate() {
    const section = document.getElementById('centros');
    if (!section) return;
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('view-hidden'));
    section.classList.remove('view-hidden');
    document.body.classList.add('viewing-section');
    document.querySelectorAll('[data-view]').forEach(a => a.classList.toggle('active', a.dataset.view === 'centros'));
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('[data-view="centros"]');
    if (link) {
      e.preventDefault();
      history.pushState({}, '', '#centros');
      activate();
    }
  });

  window.addEventListener('popstate', () => { if (location.hash === '#centros') activate(); });
  window.addEventListener('hashchange', () => { if (location.hash === '#centros') activate(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
})();
