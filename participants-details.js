(()=>{
  'use strict';
  const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
  const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
  const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const role=r=>r==='alternate'?'Suplente':'Debatiente';
  const origin=location.href.split('#')[0].replace(/index\.html?$/,'');
  const qrUrl=id=>origin+'acreditacion.html?type=participant&id='+encodeURIComponent(id);
  const status=s=>s==='accredited'?'ACREDITADO':s==='rejected'?'RECHAZADO':'PENDIENTE';
  const statusClass=s=>s==='accredited'?'accredited':s==='rejected'?'rejected':'pending';
  const QR_ROLES=new Set(['admin','coordinator','reviewer','subsecretario_acreditacion','logistica','logistico','coordinador_logistica']);
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
      const {data:staff}=await db.from('esmeralda_staff_roles').select('role').eq('user_id',user.id).maybeSingle();
      canSeeQr=!!staff?.role && QR_ROLES.has(staff.role);
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
    lastData=data;renderShell(grid,data);
  }

  function renderShell(grid,data){
    const groups=new Map();
    data.forEach(p=>{if(!groups.has(p.team_id))groups.set(p.team_id,{team_name:p.team_name,school_name:p.school_name,district:p.district,members:[]});groups.get(p.team_id).members.push(p)});
    grid.classList.add('participants-detail-grid');
    grid.innerHTML=`<div class="participants-switcher" role="tablist"><button type="button" class="participants-tab active" data-participants-tab="teams">Equipos <span>${groups.size}</span></button><button type="button" class="participants-tab" data-participants-tab="people">Participantes <span>${data.length}</span></button></div><div class="participants-pane" data-participants-pane="teams"></div><div class="participants-pane hidden" data-participants-pane="people"></div>`;
    const teamsPane=grid.querySelector('[data-participants-pane="teams"]');
    teamsPane.innerHTML=groups.size?[...groups.values()].map(team=>`<article class="participant-detail-team"><header class="participant-detail-team-head"><div><span class="eyebrow">EQUIPO APROBADO</span><h3>${esc(team.team_name)}</h3><p>${esc(team.school_name||'Centro educativo')}${team.district?' · '+esc(team.district):''}</p></div><span class="member-count">${team.members.length} ${team.members.length===1?'participante':'participantes'}</span></header><div class="participant-detail-members">${team.members.map((p,i)=>memberRow(p,i+1)).join('')}</div></article>`).join(''):'<div class="empty">Aún no hay participantes de equipos aprobados.</div>';
    const peoplePane=grid.querySelector('[data-participants-pane="people"]');
    peoplePane.innerHTML=data.length?`<div class="participants-toolbar"><div><strong>Participantes registrados</strong><small>Selecciona una persona para consultar su acreditación.</small></div><input class="participants-search" type="search" placeholder="Buscar participante..."></div><div class="people-list">${data.map(personCard).join('')}</div>`:'<div class="empty">No hay participantes disponibles.</div>';
    grid.querySelectorAll('[data-participants-tab]').forEach(tab=>tab.onclick=()=>{const target=tab.dataset.participantsTab;grid.querySelectorAll('[data-participants-tab]').forEach(x=>x.classList.toggle('active',x===tab));grid.querySelectorAll('[data-participants-pane]').forEach(x=>x.classList.toggle('hidden',x.dataset.participantsPane!==target))});
    const search=grid.querySelector('.participants-search');
    if(search)search.oninput=()=>{const q=search.value.trim().toLowerCase();grid.querySelectorAll('.person-card').forEach(card=>card.classList.toggle('hidden',q&&!card.dataset.search.includes(q)))};
    bindQr(grid);
  }

  function qrButton(p){return canSeeQr?`<button class="participant-detail-qr" type="button" data-public-qr="${esc(p.id)}">▣ QR</button>`:''}
  function memberRow(p,i){return `<article class="participant-detail-card"><div class="participant-detail-number">${i}</div><div class="participant-detail-main"><div class="participant-detail-name">${esc(p.full_name)}</div><div class="participant-detail-meta"><span>${esc(role(p.role))}</span>${p.grade?`<span>Grado: ${esc(p.grade)}</span>`:''}<span>${esc(p.school_name||'Centro no indicado')}</span>${p.district?`<span>${esc(p.district)}</span>`:''}<span class="status-pill ${statusClass(p.accreditation_status)}">${status(p.accreditation_status)}</span></div></div>${qrButton(p)}</article>`}
  function personCard(p){const search=[p.full_name,p.team_name,p.school_name,p.district,p.grade,role(p.role)].filter(Boolean).join(' ').toLowerCase();return `<article class="person-card" data-search="${esc(search)}"><div class="person-avatar">${esc((p.full_name||'?').trim().charAt(0).toUpperCase())}</div><div class="person-main"><h3>${esc(p.full_name)}</h3><p>${esc(p.team_name||'Equipo no indicado')}</p><div class="person-meta"><span>${esc(p.school_name||'Centro no indicado')}</span>${p.district?`<span>${esc(p.district)}</span>`:''}${p.grade?`<span>${esc(p.grade)}</span>`:''}<span>${esc(role(p.role))}</span></div><span class="status-pill ${statusClass(p.accreditation_status)}">${status(p.accreditation_status)}</span></div>${canSeeQr?`<button class="person-view-qr participant-detail-qr" type="button" data-public-qr="${esc(p.id)}">Ver QR</button>`:''}</article>`}

  function bindQr(root){
    if(!canSeeQr)return;
    root.querySelectorAll('[data-public-qr]').forEach(btn=>btn.onclick=async()=>{
      const ok=await ensureQrCode();
      if(!ok){alert('No se pudo cargar el generador QR. Revisa la conexión a Internet.');return}
      const id=btn.dataset.publicQr,p=lastData.find(x=>String(x.id)===String(id));
      const d=document.createElement('dialog');d.className='participant-public-qr-dialog';
      d.innerHTML=`<div class="participant-public-qr-card"><button class="close" type="button">×</button><span class="eyebrow">ACREDITACIÓN DEL PARTICIPANTE</span><h2>${esc(p?.full_name||'Participante')}</h2><p>${esc(p?.team_name||'')} ${p?.school_name?'· '+esc(p.school_name):''}</p><div class="public-qr-box" aria-label="Código QR"></div><p>Presenta este código para verificar la acreditación.</p></div>`;
      document.body.appendChild(d);d.showModal();
      d.querySelector('.close').onclick=()=>{d.close();d.remove()};d.addEventListener('click',e=>{if(e.target===d){d.close();d.remove()}});
      new QRCode(d.querySelector('.public-qr-box'),{text:qrUrl(id),width:220,height:220,correctLevel:QRCode.CorrectLevel.H});
    });
  }

  const style=document.createElement('style');style.textContent=`
    .participants-detail-grid{display:grid;gap:18px}.participants-switcher{display:flex;gap:8px;padding:6px;border:1px solid rgba(182,231,255,.1);border-radius:15px;background:rgba(5,20,34,.72);width:max-content;max-width:100%}.participants-tab{border:0;background:transparent;color:#8fa8b6;border-radius:10px;padding:11px 18px;font:700 13px Barlow,sans-serif;cursor:pointer}.participants-tab.active{background:rgba(25,220,229,.1);color:var(--cyan)}.participants-tab span{margin-left:6px;opacity:.65}.participants-pane.hidden,.person-card.hidden{display:none!important}.participant-detail-team{border:1px solid rgba(182,231,255,.12);border-radius:20px;background:rgba(5,20,34,.72);overflow:hidden}.participant-detail-team-head{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:20px 22px;border-bottom:1px solid rgba(182,231,255,.1)}.participant-detail-team-head h3{margin:4px 0 3px;font-size:25px}.participant-detail-team-head p{margin:0;opacity:.72}.participant-detail-members{padding:12px}.participant-detail-card{display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:14px;padding:15px 12px;border-radius:14px}.participant-detail-number{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(182,231,255,.1);font-weight:700}.participant-detail-name{font-weight:700;font-size:17px}.participant-detail-meta{display:flex;flex-wrap:wrap;gap:6px 10px;margin-top:5px;font-size:13px;opacity:.72}.participant-detail-qr{min-width:58px;border:1px solid rgba(25,220,229,.3);background:rgba(25,220,229,.06);color:var(--cyan);border-radius:10px;padding:9px 13px;font-weight:800;cursor:pointer}.participant-detail-qr:hover{background:rgba(25,220,229,.14)}.participants-toolbar{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:18px 20px;border:1px solid rgba(182,231,255,.1);border-radius:16px;background:rgba(5,20,34,.65)}.participants-toolbar strong{display:block;font-size:18px}.participants-toolbar small{display:block;color:#8fa8b6;margin-top:3px}.participants-search{width:min(310px,100%);border:1px solid rgba(182,231,255,.14);background:rgba(0,0,0,.12);color:inherit;border-radius:10px;padding:11px 13px;outline:none}.people-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}.person-card{display:grid;grid-template-columns:44px minmax(0,1fr) auto;align-items:center;gap:13px;padding:16px;border:1px solid rgba(182,231,255,.1);border-radius:16px;background:rgba(5,20,34,.72)}.person-avatar{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:rgba(25,220,229,.09);color:var(--cyan);font:800 20px 'Barlow Condensed',sans-serif}.person-main{min-width:0}.person-main h3{margin:0;font-size:16px}.person-main p{margin:3px 0;color:#8fa8b6;font-size:12px}.person-meta{display:flex;flex-wrap:wrap;gap:4px 9px;color:#8199a6;font-size:11px}.person-view-qr{white-space:nowrap}.participant-public-qr-dialog{border:0;background:transparent;padding:0}.participant-public-qr-dialog::backdrop{background:rgba(1,8,16,.82);backdrop-filter:blur(6px)}.participant-public-qr-card{position:relative;width:min(390px,calc(100vw - 28px));padding:28px;border-radius:22px;background:#081b2a;color:#edf8fb;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.55)}.participant-public-qr-card h2{margin:8px 0 7px}.participant-public-qr-card p{color:#8fa8b6;font-size:12px;margin:0 0 15px}.participant-public-qr-card .close{position:absolute;right:14px;top:10px;border:0;background:none;color:inherit;font-size:28px;cursor:pointer}.public-qr-box{display:grid;place-items:center;background:#fff;border-radius:14px;padding:14px;width:max-content;min-width:248px;min-height:248px;margin:0 auto 14px}.public-qr-box canvas,.public-qr-box img{display:block;width:220px!important;height:220px!important}
    @media(max-width:760px){.participants-toolbar{align-items:stretch;flex-direction:column}.participants-search{width:100%}.people-list{grid-template-columns:1fr}.participant-detail-team-head{align-items:flex-start;flex-direction:column}.participant-detail-card{grid-template-columns:32px minmax(0,1fr) auto;gap:9px}.participant-detail-meta{font-size:12px}.participant-detail-qr{min-width:52px;padding:8px 10px}.participants-switcher{width:100%}.participants-tab{flex:1}}
  `;document.head.appendChild(style);
  function start(){load();clearInterval(timer);timer=setInterval(load,30000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();