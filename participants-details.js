(()=>{
  'use strict';
  const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
  const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
  const API_HEADERS={apikey:SUPABASE_KEY,'Content-Type':'application/json',Accept:'application/json'};
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const role=r=>r==='alternate'?'Suplente':'Debatiente';
  const status=s=>s==='accredited'?'ACREDITADO':s==='rejected'?'RECHAZADO':'PENDIENTE';
  const statusClass=s=>s==='accredited'?'accredited':s==='rejected'?'rejected':'pending';
  let lastData=[],loading=false;

  function getGrid(){
    let grid=document.querySelector('#teamsGrid');
    if(grid)return grid;
    const section=document.querySelector('#participantes');
    if(!section)return null;
    grid=document.createElement('div');
    grid.id='teamsGrid';
    grid.className='participants-detail-grid';
    section.appendChild(grid);
    return grid;
  }

  async function api(path,options={}){
    const response=await fetch(`${SUPABASE_URL}${path}`,{...options,headers:{...API_HEADERS,...(options.headers||{})}});
    const text=await response.text();
    let data=null;
    try{data=text?JSON.parse(text):null}catch(_){data=text}
    if(!response.ok){
      const message=data?.message||data?.error_description||data?.hint||`HTTP ${response.status}`;
      throw new Error(message);
    }
    return data;
  }

  async function load(){
    if(loading)return;
    const grid=getGrid();
    if(!grid)return;
    loading=true;
    try{
      const events=await api('/rest/v1/esmeralda_events?select=id&slug=eq.trd-la-regional-esmeralda&limit=1');
      const event=Array.isArray(events)?events[0]:null;
      if(!event?.id){showEmpty(grid,'No se pudo cargar el evento.');return;}
      const data=await api('/rest/v1/rpc/get_esmeralda_public_debaters',{method:'POST',body:JSON.stringify({p_event_id:event.id})});
      lastData=Array.isArray(data)?data:[];
      render(grid,lastData);
    }catch(error){
      console.error('TRD participantes:',error);
      showEmpty(grid,'No se pudieron cargar los participantes.');
    }finally{loading=false}
  }

  function showEmpty(grid,message){grid.innerHTML=`<div class="participants-empty"><span>👥</span><h3>Participantes</h3><p>${esc(message)}</p></div>`}

  function render(grid,data){
    const groups=new Map();
    data.forEach(p=>{const key=p.team_id||`no-team-${p.id}`;if(!groups.has(key))groups.set(key,{team_name:p.team_name,school_name:p.school_name,district:p.district,members:[]});groups.get(key).members.push(p)});
    const teams=[...groups.values()].filter(t=>t.team_name);
    const accredited=data.filter(p=>p.accreditation_status==='accredited').length;
    grid.innerHTML=`
      <section class="participants-hero"><div><span class="participants-kicker">TRD LA REGIONAL ESMERALDA</span><h2>Participantes</h2><p>Consulta los participantes registrados y organiza la información por equipo.</p></div><div class="participants-summary"><div><strong>${data.length}</strong><span>Participantes</span></div><div><strong>${teams.length}</strong><span>Equipos</span></div><div><strong>${accredited}</strong><span>Acreditados</span></div></div></section>
      <nav class="participants-tabs" role="tablist"><button type="button" class="participants-tab active" data-participants-tab="people" role="tab" aria-selected="true">👤 <b>PARTICIPANTES</b><em>${data.length}</em></button><button type="button" class="participants-tab" data-participants-tab="teams" role="tab" aria-selected="false">👥 <b>EQUIPOS</b><em>${teams.length}</em></button></nav>
      <div class="participants-pane" data-participants-pane="people"></div><div class="participants-pane" data-participants-pane="teams" hidden></div>`;
    const peoplePane=grid.querySelector('[data-participants-pane="people"]');
    const teamsPane=grid.querySelector('[data-participants-pane="teams"]');
    peoplePane.innerHTML=`<div class="participants-list-head"><div><span class="section-label">LISTADO</span><h3>Participantes registrados</h3></div><input class="participants-search" type="search" placeholder="Buscar participante, equipo o centro..."></div><div class="people-list">${data.map(personCard).join('')}</div>`;
    teamsPane.innerHTML=`<div class="participants-list-head"><div><span class="section-label">EQUIPOS</span><h3>Equipos registrados</h3></div></div><div class="teams-list">${teams.map(teamCard).join('')}</div>`;
    grid.querySelectorAll('[data-participants-tab]').forEach(button=>button.addEventListener('click',()=>{
      const target=button.dataset.participantsTab;
      grid.querySelectorAll('[data-participants-tab]').forEach(x=>{const active=x===button;x.classList.toggle('active',active);x.setAttribute('aria-selected',active?'true':'false')});
      grid.querySelectorAll('[data-participants-pane]').forEach(x=>x.toggleAttribute('hidden',x.dataset.participantsPane!==target));
    }));
    const search=grid.querySelector('.participants-search');
    search?.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();grid.querySelectorAll('.person-card').forEach(card=>card.classList.toggle('hidden',!!q&&!card.dataset.search.includes(q)))});
  }

  function personCard(p){
    const search=[p.full_name,p.team_name,p.school_name,p.district,p.grade,role(p.role)].filter(Boolean).join(' ').toLowerCase();
    return `<article class="person-card" data-search="${esc(search)}"><div class="person-avatar">${esc((p.full_name||'?')[0].toUpperCase())}</div><div class="person-main"><div class="person-title-row"><div><h3>${esc(p.full_name||'Participante')}</h3><span class="person-role">${esc(role(p.role))}</span></div>${statusBadge(p.accreditation_status)}</div><div class="person-info"><span><b>Centro</b>${esc(p.school_name||'No indicado')}</span><span><b>Distrito</b>${esc(p.district||'No indicado')}</span><span><b>Equipo</b>${esc(p.team_name||'Sin equipo')}</span>${p.grade?`<span><b>Grado</b>${esc(p.grade)}</span>`:''}</div></div></article>`;
  }

  function teamCard(team){return `<article class="participant-team-card"><header class="team-card-head"><div class="team-mark">👥</div><div class="team-card-title"><span class="section-label">EQUIPO</span><h3>${esc(team.team_name)}</h3><p>${esc(team.school_name||'Centro educativo')}${team.district?' · '+esc(team.district):''}</p></div><span class="team-count">${team.members.length} integrantes</span></header><div class="team-members">${team.members.map((p,i)=>`<div class="team-member"><span class="member-number">${i+1}</span><div class="member-data"><strong>${esc(p.full_name||'Participante')}</strong><span>${esc(role(p.role))}${p.grade?' · '+esc(p.grade):''}</span></div>${statusBadge(p.accreditation_status)}</div>`).join('')}</div></article>`}
  function statusBadge(s){return `<span class="status-pill ${statusClass(s)}"><i></i>${status(s)}</span>`}

  const style=document.createElement('style');
  style.textContent=`
    #participantes #teamsGrid{display:grid;gap:18px;width:100%;margin-top:0}
    .participants-hero{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:26px 28px;border:1px solid rgba(182,231,255,.12);border-radius:20px;background:linear-gradient(135deg,rgba(7,33,68,.88),rgba(5,20,34,.76))}
    .participants-kicker,.section-label{display:block;color:#6fdfea;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.participants-hero h2{margin:5px 0;font-size:32px}.participants-hero p{margin:0;color:#8fa8b6;font-size:13px}.participants-summary{display:flex;gap:10px}.participants-summary div{min-width:88px;padding:11px 14px;border:1px solid rgba(182,231,255,.09);border-radius:13px;background:rgba(0,0,0,.12);text-align:center}.participants-summary strong{display:block;font-size:21px}.participants-summary span{display:block;margin-top:4px;color:#7893a1;font-size:9px;text-transform:uppercase}
    .participants-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.participants-tab{display:flex;align-items:center;gap:12px;padding:15px 17px;border:1px solid rgba(182,231,255,.12);border-radius:16px;background:rgba(5,20,34,.72);color:#c9d9df;cursor:pointer}.participants-tab.active{border-color:rgba(111,223,234,.45);background:rgba(25,220,229,.10)}.participants-tab b{font-size:13px;letter-spacing:.06em}.participants-tab em{margin-left:auto;color:#6fdfea;font-style:normal;font-weight:900}.participants-pane[hidden]{display:none!important}.participants-list-head{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-top:2px}.participants-list-head h3{margin:4px 0;font-size:22px}.participants-search{width:min(340px,100%);padding:11px 13px;border:1px solid rgba(182,231,255,.12);border-radius:11px;background:rgba(5,20,34,.72);color:#eef8fb;outline:0}.people-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}.person-card,.participant-team-card{box-sizing:border-box;min-width:0;border:1px solid rgba(182,231,255,.10);border-radius:17px;background:rgba(5,20,34,.68);overflow:hidden}.person-card{display:grid;grid-template-columns:46px minmax(0,1fr);gap:13px;padding:17px}.person-avatar,.team-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:13px;background:rgba(25,220,229,.09);color:#6fdfea;font-weight:900}.person-main{min-width:0}.person-title-row{display:flex;justify-content:space-between;gap:10px}.person-title-row h3{margin:0;font-size:17px}.person-role,.person-info{font-size:10px;color:#7893a1}.person-role{display:block;margin-top:4px;text-transform:uppercase}.person-info{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:12px}.person-info span{min-width:0;padding:7px;border-radius:8px;background:rgba(182,231,255,.025);overflow:hidden;text-overflow:ellipsis}.person-info b{display:block;font-size:8px;color:#607985}.status-pill{display:inline-flex;align-items:center;gap:5px;width:max-content;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:900}.status-pill i{width:5px;height:5px;border-radius:50%;background:currentColor}.status-pill.accredited{background:rgba(67,211,120,.12);color:#63df91}.status-pill.pending{background:rgba(246,190,64,.12);color:#f4c65a}.status-pill.rejected{background:rgba(244,86,86,.12);color:#ff7777}.teams-list{display:grid;gap:14px;margin-top:14px}.team-card-head{display:grid;grid-template-columns:46px minmax(0,1fr) auto;align-items:center;gap:13px;padding:19px;border-bottom:1px solid rgba(182,231,255,.08)}.team-card-title h3{margin:4px 0;font-size:23px}.team-card-title p{margin:0;color:#7893a1;font-size:11px}.team-count{font-size:9px;text-transform:uppercase;color:#9ab0ba}.team-members{padding:7px 12px}.team-member{display:grid;grid-template-columns:32px minmax(0,1fr) auto;align-items:center;gap:10px;padding:11px 9px;border-radius:10px}.member-number{display:grid;place-items:center;width:29px;height:29px;border-radius:50%;background:rgba(182,231,255,.07)}.member-data strong{display:block;font-size:14px}.member-data span{display:block;margin-top:2px;color:#7893a1;font-size:10px}.participants-empty{padding:45px 20px;text-align:center;border:1px dashed rgba(182,231,255,.12);border-radius:18px}.person-card.hidden{display:none!important}
    @media(max-width:850px){.participants-hero{align-items:flex-start;flex-direction:column}.participants-summary{width:100%}.participants-summary div{flex:1}.people-list{grid-template-columns:1fr}.person-info{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:600px){.participants-tabs{grid-template-columns:1fr}.participants-list-head{align-items:stretch;flex-direction:column}.participants-search{width:100%}.person-info{grid-template-columns:1fr}.team-card-head{grid-template-columns:42px minmax(0,1fr)}.team-count{grid-column:2}}
  `;
  document.head.appendChild(style);

  async function boot(){
    for(let i=0;i<30;i++){
      if(getGrid()){await load();return}
      await new Promise(r=>setTimeout(r,200));
    }
    console.warn('TRD participantes: no se encontró la sección pública de participantes.');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
