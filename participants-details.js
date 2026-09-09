(()=>{
  'use strict';

  const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
  const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
  const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const role=r=>r==='alternate'?'Suplente':'Debatiente';
  const status=s=>s==='accredited'?'ACREDITADO':s==='rejected'?'RECHAZADO':'PENDIENTE';
  const statusClass=s=>s==='accredited'?'accredited':s==='rejected'?'rejected':'pending';
  const origin=location.href.split('#')[0].replace(/index\.html?$/,'');
  const qrUrl=id=>origin+'acreditacion.html?type=participant&id='+encodeURIComponent(id);
  const QR_ROLES=new Set(['admin','admin_maestro','coordinador','coordinator','acreditacion','reviewer','subsecretario_acreditacion','logistica','logistico','coordinador_logistica']);
  let timer,lastData=[],canSeeQr=false;

  async function ensureQrCode(){
    if(window.QRCode)return true;
    return new Promise(resolve=>{
      const existing=document.querySelector('script[data-trd-qrcode]');
      if(existing){existing.addEventListener('load',()=>resolve(!!window.QRCode),{once:true});existing.addEventListener('error',()=>resolve(false),{once:true});return}
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      s.async=true;s.dataset.trdQrcode='1';
      s.onload=()=>resolve(!!window.QRCode);s.onerror=()=>resolve(false);
      document.head.appendChild(s);
    });
  }

  async function resolveQrPermission(){
    canSeeQr=false;
    try{
      const {data:{user}}=await db.auth.getUser();
      if(!user)return;
      const {data:staff}=await db.from('esmeralda_staff_roles').select('role').eq('user_id',user.id).in('role',[...QR_ROLES]).limit(1);
      canSeeQr=!!staff?.length;
    }catch(_){canSeeQr=false}
  }

  async function load(){
    const grid=document.querySelector('#teamsGrid');
    if(!grid||!window.supabase)return;
    await resolveQrPermission();
    const {data:event}=await db.from('esmeralda_events').select('id').eq('slug','trd-la-regional-esmeralda').maybeSingle();
    if(!event?.id)return;
    const {data,error}=await db.rpc('get_esmeralda_public_debaters',{p_event_id:event.id});
    if(error||!data)return;
    lastData=data;
    render(grid,data);
  }

  function render(grid,data){
    const groups=new Map();
    data.forEach(p=>{
      const key=p.team_id||('no-team-'+p.id);
      if(!groups.has(key))groups.set(key,{team_name:p.team_name,school_name:p.school_name,district:p.district,members:[]});
      groups.get(key).members.push(p);
    });

    const teams=[...groups.values()].filter(t=>t.team_name);
    const accredited=data.filter(p=>p.accreditation_status==='accredited').length;

    grid.classList.add('participants-detail-grid');
    grid.innerHTML=`
      <section class="participants-hero">
        <div>
          <span class="participants-kicker">TRD LA REGIONAL ESMERALDA</span>
          <h2>Participantes</h2>
          <p>Consulta los participantes registrados y organiza la información por equipo.</p>
        </div>
        <div class="participants-summary">
          <div><strong>${data.length}</strong><span>Participantes</span></div>
          <div><strong>${teams.length}</strong><span>Equipos</span></div>
          <div><strong>${accredited}</strong><span>Acreditados</span></div>
        </div>
      </section>

      <nav class="participants-tabs" aria-label="Participantes y equipos" role="tablist">
        <button type="button" class="participants-tab active" data-participants-tab="people" role="tab" aria-selected="true">
          <span class="tab-icon">👤</span><span><b>PARTICIPANTES</b><small>Listado individual</small></span><em>${data.length}</em>
        </button>
        <button type="button" class="participants-tab" data-participants-tab="teams" role="tab" aria-selected="false">
          <span class="tab-icon">👥</span><span><b>EQUIPOS</b><small>Integrantes por equipo</small></span><em>${teams.length}</em>
        </button>
      </nav>

      <div class="participants-pane" data-participants-pane="people"></div>
      <div class="participants-pane hidden" data-participants-pane="teams"></div>`;

    renderPeople(grid.querySelector('[data-participants-pane="people"]'),data);
    renderTeams(grid.querySelector('[data-participants-pane="teams"]'),teams);

    grid.querySelectorAll('[data-participants-tab]').forEach(button=>button.onclick=()=>{
      const target=button.dataset.participantsTab;
      grid.querySelectorAll('[data-participants-tab]').forEach(x=>{
        const active=x===button;
        x.classList.toggle('active',active);
        x.setAttribute('aria-selected',active?'true':'false');
      });
      grid.querySelectorAll('[data-participants-pane]').forEach(x=>x.classList.toggle('hidden',x.dataset.participantsPane!==target));
      bindQr(grid);
    });

    const search=grid.querySelector('.participants-search');
    if(search)search.oninput=()=>{
      const q=search.value.trim().toLowerCase();
      grid.querySelectorAll('.person-card').forEach(card=>card.classList.toggle('hidden',!!q&&!card.dataset.search.includes(q)));
    };
    bindQr(grid);
  }

  function renderPeople(pane,data){
    if(!data.length){pane.innerHTML='<div class="participants-empty"><span>👤</span><h3>No hay participantes</h3><p>Aún no existen participantes registrados.</p></div>';return}
    pane.innerHTML=`
      <div class="participants-list-head">
        <div><span class="section-label">LISTADO</span><h3>Participantes registrados</h3><p>Información esencial de cada participante.</p></div>
        <div class="search-wrap"><span>⌕</span><input class="participants-search" type="search" placeholder="Buscar participante, equipo o centro..." aria-label="Buscar participante"></div>
      </div>
      <div class="people-list">${data.map(personCard).join('')}</div>`;
  }

  function renderTeams(pane,teams){
    if(!teams.length){pane.innerHTML='<div class="participants-empty"><span>👥</span><h3>No hay equipos</h3><p>Aún no existen equipos registrados.</p></div>';return}
    pane.innerHTML=`
      <div class="participants-list-head teams-list-head">
        <div><span class="section-label">EQUIPOS</span><h3>Equipos registrados</h3><p>Cada equipo con sus integrantes numerados y su QR individual.</p></div>
      </div>
      <div class="teams-list">${teams.map(team=>teamCard(team)).join('')}</div>`;
  }

  function personCard(p){
    const search=[p.full_name,p.team_name,p.school_name,p.district,p.grade,role(p.role),status(p.accreditation_status)].filter(Boolean).join(' ').toLowerCase();
    return `<article class="person-card" data-search="${esc(search)}">
      <div class="person-avatar">${esc((p.full_name||'?').trim().charAt(0).toUpperCase())}</div>
      <div class="person-main">
        <div class="person-title-row"><div><h3>${esc(p.full_name||'Participante')}</h3><span class="person-role">${esc(role(p.role))}</span></div>${statusBadge(p.accreditation_status)}</div>
        <div class="person-info">
          <span><b>Centro</b>${esc(p.school_name||'No indicado')}</span>
          <span><b>Distrito</b>${esc(p.district||'No indicado')}</span>
          <span><b>Equipo</b>${esc(p.team_name||'Sin equipo')}</span>
          ${p.grade?`<span><b>Grado</b>${esc(p.grade)}</span>`:''}
        </div>
      </div>
      ${canSeeQr?`<button class="person-view-qr" type="button" data-public-qr="${esc(p.id)}"><span>▣</span> Ver QR</button>`:''}
    </article>`;
  }

  function teamCard(team){
    return `<article class="participant-team-card">
      <header class="team-card-head">
        <div class="team-mark">👥</div>
        <div class="team-card-title"><span class="section-label">EQUIPO</span><h3>${esc(team.team_name)}</h3><p>${esc(team.school_name||'Centro educativo')}${team.district?' · '+esc(team.district):''}</p></div>
        <span class="team-count">${team.members.length} ${team.members.length===1?'integrante':'integrantes'}</span>
      </header>
      <div class="team-members">${team.members.map((p,i)=>`<div class="team-member">
        <span class="member-number">${i+1}</span>
        <div class="member-data"><strong>${esc(p.full_name||'Participante')}</strong><span>${esc(role(p.role))}${p.grade?' · '+esc(p.grade):''}</span></div>
        ${statusBadge(p.accreditation_status)}
        ${canSeeQr?`<button class="member-qr" type="button" data-public-qr="${esc(p.id)}" title="Ver QR de ${esc(p.full_name||'participante')}">▣ QR</button>`:''}
      </div>`).join('')}</div>
    </article>`;
  }

  function statusBadge(s){return `<span class="status-pill ${statusClass(s)}"><i></i>${status(s)}</span>`}

  function bindQr(root){
    if(!canSeeQr)return;
    root.querySelectorAll('[data-public-qr]').forEach(btn=>{
      if(btn.dataset.qrBound)return;
      btn.dataset.qrBound='1';
      btn.onclick=async()=>{
        const ok=await ensureQrCode();
        if(!ok){alert('No se pudo cargar el generador QR. Revisa la conexión a Internet.');return}
        const id=btn.dataset.publicQr;
        const p=lastData.find(x=>String(x.id)===String(id));
        const d=document.createElement('dialog');
        d.className='participant-public-qr-dialog';
        d.innerHTML=`<div class="participant-public-qr-card">
          <button class="qr-close" type="button" aria-label="Cerrar">×</button>
          <span class="participants-kicker">ACREDITACIÓN</span>
          <h2>${esc(p?.full_name||'Participante')}</h2>
          <p>${esc(p?.team_name||'Sin equipo')}${p?.school_name?' · '+esc(p.school_name):''}</p>
          <div class="public-qr-box" aria-label="Código QR"></div>
          <small>Este QR identifica únicamente al participante y abre su proceso protegido de acreditación.</small>
        </div>`;
        document.body.appendChild(d);d.showModal();
        const close=()=>{d.close();d.remove()};
        d.querySelector('.qr-close').onclick=close;
        d.addEventListener('click',e=>{if(e.target===d)close()});
        new QRCode(d.querySelector('.public-qr-box'),{text:qrUrl(id),width:220,height:220,correctLevel:QRCode.CorrectLevel.H});
      };
    });
  }

  const style=document.createElement('style');
  style.textContent=`
    .participants-detail-grid{display:grid;gap:18px;width:100%;color:inherit}
    .participants-hero{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:26px 28px;border:1px solid rgba(182,231,255,.10);border-radius:22px;background:linear-gradient(135deg,rgba(7,33,68,.88),rgba(5,20,34,.76));box-shadow:0 18px 45px rgba(0,0,0,.12)}
    .participants-kicker,.section-label{display:block;color:#6fdfea;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
    .participants-hero h2{margin:5px 0 6px;font-size:32px;line-height:1.05;letter-spacing:-.02em}
    .participants-hero p{margin:0;color:#8fa8b6;font-size:13px}
    .participants-summary{display:flex;gap:10px;flex-wrap:wrap}
    .participants-summary div{min-width:88px;padding:11px 14px;border:1px solid rgba(182,231,255,.09);border-radius:14px;background:rgba(0,0,0,.12);text-align:center}
    .participants-summary strong{display:block;font-size:21px;line-height:1;color:#edf8fb}.participants-summary span{display:block;margin-top:5px;color:#7893a1;font-size:9px;text-transform:uppercase;letter-spacing:.05em}
    .participants-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .participants-tab{display:grid;grid-template-columns:46px 1fr auto;align-items:center;gap:12px;width:100%;padding:13px 16px;border:1px solid rgba(182,231,255,.11);border-radius:17px;background:rgba(5,20,34,.70);color:#829aa7;text-align:left;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}
    .participants-tab:hover{transform:translateY(-1px);border-color:rgba(111,223,234,.28)}
    .participants-tab.active{border-color:rgba(111,223,234,.42);background:linear-gradient(135deg,rgba(25,220,229,.12),rgba(5,20,34,.82));color:#dffcff;box-shadow:0 10px 30px rgba(0,0,0,.12)}
    .tab-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:13px;background:rgba(182,231,255,.055);font-size:19px}.participants-tab.active .tab-icon{background:rgba(25,220,229,.10)}
    .participants-tab b{display:block;font-size:13px;letter-spacing:.06em}.participants-tab small{display:block;margin-top:3px;color:#718b99;font-size:10px}.participants-tab em{font-style:normal;font-weight:900;font-size:13px;color:#6fdfea}
    .participants-pane.hidden,.person-card.hidden{display:none!important}
    .participants-list-head{display:flex;justify-content:space-between;align-items:end;gap:18px;padding:4px 2px 2px}.participants-list-head h3{margin:4px 0 3px;font-size:22px}.participants-list-head p{margin:0;color:#7893a1;font-size:12px}.search-wrap{display:flex;align-items:center;gap:7px;width:min(340px,100%);padding:0 12px;border:1px solid rgba(182,231,255,.11);border-radius:12px;background:rgba(5,20,34,.65)}.search-wrap span{color:#6fdfea;font-size:19px}.search-wrap input{width:100%;padding:11px 0;border:0;outline:0;background:transparent;color:inherit;font:inherit;font-size:12px}.search-wrap input::placeholder{color:#607985}
    .people-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
    .person-card{display:grid;grid-template-columns:46px minmax(0,1fr) auto;align-items:center;gap:13px;padding:17px;border:1px solid rgba(182,231,255,.09);border-radius:17px;background:rgba(5,20,34,.68);transition:border-color .18s ease,transform .18s ease}.person-card:hover{border-color:rgba(111,223,234,.18);transform:translateY(-1px)}
    .person-avatar{width:44px;height:44px;display:grid;place-items:center;border-radius:13px;background:rgba(25,220,229,.09);color:#6fdfea;font:800 20px 'Barlow Condensed',sans-serif}.person-main{min-width:0}.person-title-row{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.person-title-row h3{margin:0;font-size:17px;line-height:1.15}.person-role{display:block;margin-top:4px;color:#7893a1;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.person-info{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:12px}.person-info span{min-width:0;padding:7px 8px;border-radius:9px;background:rgba(182,231,255,.025);color:#c5d6dc;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.person-info b{display:block;margin-bottom:2px;color:#607985;font-size:8px;text-transform:uppercase;letter-spacing:.07em}.person-view-qr,.member-qr{white-space:nowrap;border:1px solid rgba(25,220,229,.27);background:rgba(25,220,229,.055);color:#6fdfea;border-radius:10px;padding:9px 11px;font-weight:800;font-size:10px;cursor:pointer}.person-view-qr span{margin-right:4px}.person-view-qr:hover,.member-qr:hover{background:rgba(25,220,229,.12)}
    .status-pill{display:inline-flex;align-items:center;gap:5px;width:max-content;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:900;letter-spacing:.04em}.status-pill i{width:5px;height:5px;border-radius:50%;background:currentColor}.status-pill.accredited{background:rgba(67,211,120,.12);color:#63df91}.status-pill.pending{background:rgba(246,190,64,.12);color:#f4c65a}.status-pill.rejected{background:rgba(244,86,86,.12);color:#ff7777}
    .teams-list{display:grid;gap:14px;margin-top:14px}.participant-team-card{overflow:hidden;border:1px solid rgba(182,231,255,.10);border-radius:20px;background:rgba(5,20,34,.68)}.team-card-head{display:grid;grid-template-columns:48px minmax(0,1fr) auto;align-items:center;gap:13px;padding:19px 20px;border-bottom:1px solid rgba(182,231,255,.08);background:rgba(182,231,255,.018)}.team-mark{width:46px;height:46px;display:grid;place-items:center;border-radius:13px;background:rgba(25,220,229,.09);font-size:19px}.team-card-title h3{margin:4px 0 3px;font-size:23px}.team-card-title p{margin:0;color:#7893a1;font-size:11px}.team-count{padding:7px 10px;border:1px solid rgba(182,231,255,.08);border-radius:9px;color:#9ab0ba;font-size:9px;font-weight:800;text-transform:uppercase}.team-members{padding:7px 12px}.team-member{display:grid;grid-template-columns:32px minmax(0,1fr) auto auto;align-items:center;gap:10px;padding:11px 9px;border-radius:11px}.team-member:hover{background:rgba(182,231,255,.025)}.member-number{width:29px;height:29px;display:grid;place-items:center;border-radius:50%;background:rgba(182,231,255,.07);color:#b7cbd2;font-size:11px;font-weight:900}.member-data strong{display:block;font-size:14px}.member-data span{display:block;margin-top:2px;color:#7893a1;font-size:10px}.member-qr{padding:7px 9px}
    .participants-empty{padding:50px 20px;text-align:center;border:1px dashed rgba(182,231,255,.12);border-radius:18px;background:rgba(5,20,34,.42)}.participants-empty>span{font-size:28px}.participants-empty h3{margin:10px 0 4px}.participants-empty p{margin:0;color:#7893a1;font-size:12px}
    .participant-public-qr-dialog{border:0;background:transparent;padding:0}.participant-public-qr-dialog::backdrop{background:rgba(1,8,16,.84);backdrop-filter:blur(5px)}.participant-public-qr-card{position:relative;width:min(390px,calc(100vw - 28px));padding:28px;border-radius:22px;background:#081b2a;color:#edf8fb;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.55)}.participant-public-qr-card h2{margin:8px 0 5px;font-size:24px}.participant-public-qr-card p{color:#8fa8b6;font-size:11px;margin:0 0 16px}.participant-public-qr-card small{display:block;color:#718b99;font-size:10px;line-height:1.45}.qr-close{position:absolute;right:12px;top:8px;border:0;background:none;color:#edf8fb;font-size:27px;cursor:pointer}.public-qr-box{display:grid;place-items:center;width:max-content;min-width:248px;min-height:248px;margin:0 auto 15px;padding:14px;border-radius:14px;background:#fff}.public-qr-box canvas,.public-qr-box img{display:block;width:220px!important;height:220px!important}
    @media(max-width:900px){.participants-hero{align-items:flex-start;flex-direction:column}.participants-summary{width:100%}.participants-summary div{flex:1}.people-list{grid-template-columns:1fr}.person-info{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:650px){.participants-tabs{grid-template-columns:1fr}.participants-list-head{align-items:stretch;flex-direction:column}.search-wrap{width:100%}.person-card{grid-template-columns:38px minmax(0,1fr);align-items:start}.person-avatar{width:36px;height:36px}.person-view-qr{grid-column:2;width:max-content}.person-info{grid-template-columns:1fr}.team-card-head{grid-template-columns:42px minmax(0,1fr)}.team-mark{width:40px;height:40px}.team-count{grid-column:2;width:max-content}.team-member{grid-template-columns:29px minmax(0,1fr) auto}.team-member .status-pill{grid-column:2}.member-qr{grid-column:3;grid-row:1/3}}
  `;
  document.head.appendChild(style);

  function start(){load();clearInterval(timer);timer=setInterval(load,30000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();