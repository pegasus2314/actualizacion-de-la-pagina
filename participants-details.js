(()=>{
'use strict';
const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
const HEADERS={apikey:SUPABASE_KEY,'Content-Type':'application/json',Accept:'application/json'};
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const role=v=>v==='alternate'?'Suplente':'Debatiente';
const status=v=>v==='accredited'?'ACREDITADO':v==='rejected'?'RECHAZADO':'PENDIENTE';
const statusClass=v=>v==='accredited'?'accredited':v==='rejected'?'rejected':'pending';
let loading=false;

const api=async(path,options={})=>{
  const r=await fetch(SUPABASE_URL+path,{...options,headers:{...HEADERS,...(options.headers||{})}});
  const text=await r.text();let data=null;
  try{data=text?JSON.parse(text):null}catch(_){data=text}
  if(!r.ok)throw new Error(data?.message||data?.error_description||data?.hint||`HTTP ${r.status}`);
  return data;
};

function getGrid(){
  let grid=document.querySelector('#teamsGrid');
  const section=document.querySelector('#participantes');
  if(!grid&&!section)return null;
  if(!grid){grid=document.createElement('div');grid.id='teamsGrid';section.appendChild(grid)}
  return grid;
}

function badge(s){return `<span class="status-pill ${statusClass(s)}"><i></i>${status(s)}</span>`}
function personCard(p){
  const search=[p.full_name,p.team_name,p.school_name,p.district,p.grade,role(p.role)].filter(Boolean).join(' ').toLowerCase();
  return `<article class="person-card" data-search="${esc(search)}"><div class="person-avatar">${esc((p.full_name||'?')[0].toUpperCase())}</div><div class="person-main"><div class="person-title-row"><div><h3>${esc(p.full_name||'Participante')}</h3><span class="person-role">${esc(role(p.role))}</span></div>${badge(p.accreditation_status)}</div><div class="person-info"><span><b>Centro</b>${esc(p.school_name||'No indicado')}</span><span><b>Distrito</b>${esc(p.district||'No indicado')}</span><span><b>Equipo</b>${esc(p.team_name||'Sin equipo')}</span>${p.grade?`<span><b>Grado</b>${esc(p.grade)}</span>`:''}</div></div></article>`;
}
function teamCard(t){
  return `<article class="participant-team-card"><header class="team-card-head"><div class="team-mark">👥</div><div class="team-card-title"><span class="section-label">EQUIPO</span><h3>${esc(t.team_name)}</h3><p>${esc(t.school_name||'Centro educativo')}${t.district?' · '+esc(t.district):''}</p></div><span class="team-count">${t.members.length} integrantes</span></header><div class="team-members">${t.members.map((p,i)=>`<div class="team-member"><span class="member-number">${i+1}</span><div class="member-data"><strong>${esc(p.full_name||'Participante')}</strong><span>${esc(role(p.role))}${p.grade?' · '+esc(p.grade):''}</span></div>${badge(p.accreditation_status)}</div>`).join('')}</div></article>`;
}

function render(grid,data){
  const groups=new Map();
  data.forEach(p=>{const key=p.team_id||`no-team-${p.id}`;if(!groups.has(key))groups.set(key,{team_name:p.team_name,school_name:p.school_name,district:p.district,members:[]});groups.get(key).members.push(p)});
  const teams=[...groups.values()].filter(t=>t.team_name);
  const accredited=data.filter(p=>p.accreditation_status==='accredited').length;
  grid.innerHTML=`<section class="participants-hero"><div><span class="participants-kicker">TRD LA REGIONAL ESMERALDA</span><h2>Participantes</h2><p>Consulta los participantes registrados y organiza la información por equipo.</p></div><div class="participants-summary"><div><strong>${data.length}</strong><span>Participantes</span></div><div><strong>${teams.length}</strong><span>Equipos</span></div><div><strong>${accredited}</strong><span>Acreditados</span></div></div></section><nav class="participants-tabs" role="tablist"><button type="button" class="participants-tab active" data-participants-tab="people" role="tab" aria-selected="true">👤 <b>PARTICIPANTES</b><em>${data.length}</em></button><button type="button" class="participants-tab" data-participants-tab="teams" role="tab" aria-selected="false">👥 <b>EQUIPOS</b><em>${teams.length}</em></button></nav><section class="participants-pane participants-panel" data-participants-pane="people"><div class="participants-list-head"><div><span class="section-label">PARTICIPANTES</span><h3>Participantes registrados</h3></div><input class="participants-search" type="search" placeholder="Buscar participante, equipo o centro..."></div><div class="people-list">${data.map(personCard).join('')}</div></section><section class="participants-pane participants-panel" data-participants-pane="teams" hidden><div class="participants-list-head"><div><span class="section-label">EQUIPOS</span><h3>Equipos registrados</h3></div><span class="panel-count">${teams.length} equipos</span></div><div class="teams-list">${teams.map(teamCard).join('')}</div></section>`;
  grid.querySelectorAll('[data-participants-tab]').forEach(btn=>btn.addEventListener('click',()=>{
    const target=btn.dataset.participantsTab;
    grid.querySelectorAll('[data-participants-tab]').forEach(x=>{const active=x===btn;x.classList.toggle('active',active);x.setAttribute('aria-selected',active?'true':'false')});
    grid.querySelectorAll('[data-participants-pane]').forEach(x=>{x.hidden=x.dataset.participantsPane!==target;x.classList.toggle('is-active',x.dataset.participantsPane===target)});
  }));
  const search=grid.querySelector('.participants-search');
  search?.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();grid.querySelectorAll('.person-card').forEach(card=>card.classList.toggle('hidden',!!q&&!card.dataset.search.includes(q)))});
}

function empty(grid,message){grid.innerHTML=`<section class="participants-panel participants-empty"><span>👥</span><h3>Participantes</h3><p>${esc(message)}</p></section>`}
async function load(){
  if(loading)return;const grid=getGrid();if(!grid)return;loading=true;
  try{
    const events=await api('/rest/v1/esmeralda_events?select=id&slug=eq.trd-la-regional-esmeralda&limit=1');
    const event=Array.isArray(events)?events[0]:null;if(!event?.id)return empty(grid,'No se pudo cargar el evento.');
    const data=await api('/rest/v1/rpc/get_esmeralda_public_debaters',{method:'POST',body:JSON.stringify({p_event_id:event.id})});
    render(grid,Array.isArray(data)?data:[]);
  }catch(e){console.error('TRD participantes:',e);empty(grid,'No se pudieron cargar los participantes.')}
  finally{loading=false}
}

const style=document.createElement('style');
style.textContent=`
#participantes #teamsGrid{display:flex!important;flex-direction:column!important;gap:20px!important;width:100%!important;min-width:0!important;margin:0 auto!important}
#participantes .participants-hero,#participantes .participants-tabs,#participantes .participants-panel{box-sizing:border-box!important;width:100%!important;min-width:0!important}
#participantes .participants-hero{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:26px 28px;border:1px solid rgba(182,231,255,.14);border-radius:20px;background:linear-gradient(145deg,rgba(12,34,49,.98),rgba(7,23,35,.98));box-shadow:0 14px 34px rgba(0,0,0,.16);overflow:hidden}
#participantes .participants-hero h2{margin:5px 0;font-size:32px;line-height:1.05}#participantes .participants-hero p{margin:0;color:#8fa8b6;font-size:13px;line-height:1.5}.participants-kicker,.section-label{display:block;color:#6fdfea;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
#participantes .participants-summary{display:grid;grid-template-columns:repeat(3,minmax(82px,1fr));gap:9px;flex:0 0 auto}.participants-summary div{padding:11px 14px;border:1px solid rgba(182,231,255,.10);border-radius:13px;background:rgba(0,0,0,.14);text-align:center}.participants-summary strong{display:block;font-size:22px;line-height:1.1}.participants-summary span{display:block;margin-top:4px;color:#7893a1;font-size:9px;text-transform:uppercase}
#participantes .participants-tabs{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px!important}.participants-tab{display:flex;align-items:center;gap:12px;padding:15px 17px;border:1px solid rgba(182,231,255,.13);border-radius:15px;background:rgba(5,20,34,.82);color:#c9d9df;cursor:pointer;transition:.18s}.participants-tab.active{border-color:rgba(111,223,234,.48);background:rgba(25,220,229,.10);box-shadow:0 8px 22px rgba(0,0,0,.12)}.participants-tab b{font-size:13px;letter-spacing:.06em}.participants-tab em{margin-left:auto;color:#6fdfea;font-style:normal;font-weight:900}
#participantes .participants-panel{padding:22px;border:1px solid rgba(182,231,255,.12);border-radius:18px;background:linear-gradient(145deg,rgba(12,34,49,.96),rgba(7,23,35,.98));box-shadow:0 12px 30px rgba(0,0,0,.14);overflow:hidden}.participants-pane[hidden]{display:none!important}.participants-panel.is-active{display:block}
#participantes .participants-list-head{display:flex;justify-content:space-between;align-items:center;gap:18px;margin:0;padding-bottom:16px;border-bottom:1px solid rgba(182,231,255,.08)}.participants-list-head h3{margin:4px 0 0;font-size:22px}.panel-count{padding:7px 10px;border-radius:999px;background:rgba(25,220,229,.08);color:#6fdfea;font-size:10px;font-weight:900;white-space:nowrap}.participants-search{width:min(340px,100%);box-sizing:border-box;padding:11px 13px;border:1px solid rgba(182,231,255,.12);border-radius:11px;background:rgba(5,20,34,.72);color:#eef8fb;outline:0}
#participantes .people-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}.person-card,.participant-team-card{box-sizing:border-box;min-width:0;border:1px solid rgba(182,231,255,.10);border-radius:15px;background:rgba(5,20,34,.72);overflow:hidden}.person-card{display:grid;grid-template-columns:46px minmax(0,1fr);gap:13px;padding:17px}.person-avatar,.team-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:13px;background:rgba(25,220,229,.09);color:#6fdfea;font-weight:900}.person-main{min-width:0}.person-title-row{display:flex;justify-content:space-between;gap:10px}.person-title-row h3{margin:0;font-size:17px}.person-role,.person-info{font-size:10px;color:#7893a1}.person-role{display:block;margin-top:4px;text-transform:uppercase}.person-info{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:12px}.person-info span{min-width:0;padding:7px;border-radius:8px;background:rgba(182,231,255,.025);overflow:hidden;text-overflow:ellipsis}.person-info b{display:block;font-size:8px;color:#607985}
#participantes .teams-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:16px}.participant-team-card{background:linear-gradient(145deg,rgba(8,27,42,.95),rgba(5,20,32,.98));box-shadow:0 10px 25px rgba(0,0,0,.13)}.team-card-head{display:grid;grid-template-columns:46px minmax(0,1fr) auto;align-items:center;gap:13px;padding:19px;border-bottom:1px solid rgba(182,231,255,.08)}.team-card-title{min-width:0}.team-card-title h3{margin:4px 0;font-size:23px;overflow-wrap:anywhere}.team-card-title p{margin:0;color:#7893a1;font-size:11px;overflow-wrap:anywhere}.team-count{font-size:9px;text-transform:uppercase;color:#9ab0ba;white-space:nowrap}.team-members{padding:8px 12px}.team-member{display:grid;grid-template-columns:32px minmax(0,1fr) auto;align-items:center;gap:10px;padding:11px 9px;border-bottom:1px solid rgba(182,231,255,.06)}.team-member:last-child{border-bottom:0}.member-number{display:grid;place-items:center;width:29px;height:29px;border-radius:50%;background:rgba(182,231,255,.07);color:#cce3eb;font-weight:800}.member-data{min-width:0}.member-data strong{display:block;font-size:14px;overflow-wrap:anywhere}.member-data span{display:block;margin-top:2px;color:#7893a1;font-size:10px}.status-pill{display:inline-flex;align-items:center;gap:5px;width:max-content;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:900;white-space:nowrap}.status-pill i{width:5px;height:5px;border-radius:50%;background:currentColor}.status-pill.accredited{background:rgba(67,211,120,.12);color:#63df91}.status-pill.pending{background:rgba(246,190,64,.12);color:#f4c65a}.status-pill.rejected{background:rgba(244,86,86,.12);color:#ff7777}.person-card.hidden{display:none!important}.participants-empty{text-align:center;padding:42px 20px}.participants-empty span{font-size:28px}.participants-empty h3{margin:10px 0 4px}.participants-empty p{margin:0;color:#829ba9}
@media(max-width:900px){#participantes .participants-hero{align-items:flex-start;flex-direction:column}.participants-summary{width:100%}.people-list,.teams-list{grid-template-columns:1fr!important}}
@media(max-width:600px){#participantes .participants-panel{padding:17px}.participants-tabs{grid-template-columns:1fr!important}.participants-list-head{align-items:stretch;flex-direction:column}.participants-search{width:100%}.person-info{grid-template-columns:1fr 1fr}.team-card-head{grid-template-columns:42px minmax(0,1fr)}.team-count{grid-column:2}.team-member{grid-template-columns:30px minmax(0,1fr);align-items:start}.team-member>.status-pill{grid-column:2}}
`;
document.head.appendChild(style);

async function boot(){for(let i=0;i<30;i++){if(getGrid()){await load();return}await new Promise(r=>setTimeout(r,200))}console.warn('TRD participantes: no se encontró la sección pública de participantes.')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
