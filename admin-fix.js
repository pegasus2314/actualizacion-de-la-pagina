(()=>{
'use strict';

const EVENT_SLUG='trd-la-regional-esmeralda';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const label=s=>({approved:'Aprobado',rejected:'Rechazado',completed:'Completado',in_progress:'En curso',scheduled:'Programada'})[s]||'Pendiente';

let bound=false;
let loading=false;
let eventCache=null;

function db(){return window.__TRD_DB||null}
function panel(){return $('#adminPanel')}
function setPanel(title,body){const p=panel();if(p)p.innerHTML=`<div class="admin-toolbar"><div><h3>${title}</h3></div><button type="button" class="btn small outline" data-admin-fix="refresh">↻ Actualizar</button></div>${body}`}
function errorPanel(message){setPanel('Administración',`<div class="empty" style="padding:28px"><strong>No se pudo cargar Administración.</strong><p style="margin:8px 0 0">${esc(message)}</p><button type="button" class="btn small primary" data-admin-fix="refresh" style="margin-top:14px">Reintentar</button></div>`)}

async function waitForDb(timeout=10000){
  const started=Date.now();
  while(!db()){
    if(Date.now()-started>timeout)throw new Error('Supabase no terminó de inicializarse.');
    await new Promise(r=>setTimeout(r,100));
  }
  if(!db().auth)throw new Error('El cliente de Supabase no tiene Auth disponible.');
  return db();
}

async function getEvent(client){
  if(eventCache)return eventCache;
  const {data,error}=await client.from('esmeralda_events').select('id,slug,name').eq('slug',EVENT_SLUG).maybeSingle();
  if(error)throw new Error('No se pudo consultar el evento: '+error.message);
  if(!data)throw new Error('No existe el evento TRD La Regional Esmeralda en la base de datos.');
  eventCache=data;
  return data;
}

async function getStaff(client){
  const {data:{session},error:sessionError}=await client.auth.getSession();
  if(sessionError)throw new Error('No se pudo comprobar la sesión: '+sessionError.message);
  if(!session?.user)throw new Error('La sesión administrativa no está activa.');
  const {data,error}=await client.from('esmeralda_staff_roles').select('role').eq('user_id',session.user.id).maybeSingle();
  if(error)throw new Error('No se pudo comprobar el permiso administrativo: '+error.message);
  if(!data?.role)throw new Error('La cuenta no tiene un rol administrativo autorizado.');
  return data.role;
}

async function overview(client,event){
  const [teams,debaters]=await Promise.all([
    client.from('esmeralda_teams').select('status').eq('event_id',event.id),
    client.from('esmeralda_debaters').select('id',{count:'exact',head:true})
  ]);
  if(teams.error)throw new Error('No se pudieron cargar los equipos: '+teams.error.message);
  if(debaters.error)throw new Error('No se pudieron cargar los debatientes: '+debaters.error.message);
  const rows=teams.data||[];
  setPanel('Resumen',`<div class="admin-grid"><div class="admin-card"><span>Equipos</span><strong>${rows.length}</strong></div><div class="admin-card"><span>Pendientes</span><strong>${rows.filter(x=>x.status==='pending').length}</strong></div><div class="admin-card"><span>Aprobados</span><strong>${rows.filter(x=>x.status==='approved').length}</strong></div><div class="admin-card"><span>Rechazados</span><strong>${rows.filter(x=>x.status==='rejected').length}</strong></div><div class="admin-card"><span>Debatientes</span><strong>${debaters.count||0}</strong></div></div>`);
}

async function teams(client,event){
  const {data,error}=await client.from('esmeralda_teams').select('id,team_name,school_name,district,status,created_at').eq('event_id',event.id).order('created_at',{ascending:false});
  if(error)throw new Error('No se pudieron cargar los equipos: '+error.message);
  setPanel('Equipos',`<div class="table-wrap"><table class="data-table"><thead><tr><th>Equipo</th><th>Centro</th><th>Distrito</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${(data||[]).map(t=>`<tr><td><b>${esc(t.team_name)}</b></td><td>${esc(t.school_name||'—')}</td><td>${esc(t.district||'—')}</td><td>${label(t.status)}</td><td><button type="button" class="btn small outline" data-admin-fix="view-team" data-id="${t.id}">Ver</button> ${t.status!=='approved'?`<button type="button" class="btn small primary" data-admin-fix="approve" data-id="${t.id}">Aprobar</button>`:''} ${t.status!=='rejected'?`<button type="button" class="btn small danger" data-admin-fix="reject" data-id="${t.id}">Rechazar</button>`:''} <button type="button" class="btn small danger" data-admin-fix="delete-team" data-id="${t.id}">Eliminar equipo</button></td></tr>`).join('')||'<tr><td colspan="5">No hay equipos registrados.</td></tr>'}</tbody></table></div>`);
}

async function rounds(client,event){
  const {data,error}=await client.from('esmeralda_rounds').select('id,round_number,name,scheduled_at,status').eq('event_id',event.id).order('round_number');
  if(error)throw new Error('No se pudieron cargar las rondas: '+error.message);
  setPanel('Rondas',`<form id="adminFixRoundForm" class="form-grid"><label>Número<input name="round_number" type="number" min="1" required></label><label>Nombre<input name="name" required placeholder="Ej. Ronda 1"></label><label>Fecha y hora<input name="scheduled_at" type="datetime-local"></label><label>Estado<select name="status"><option value="scheduled">Programada</option><option value="in_progress">En curso</option><option value="completed">Completada</option></select></label><button class="btn primary" type="submit">Crear ronda</button></form><div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Ronda</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>${(data||[]).map(r=>`<tr><td>${r.round_number}</td><td>${esc(r.name)}</td><td>${r.scheduled_at?new Date(r.scheduled_at).toLocaleString('es-DO'):'—'}</td><td>${label(r.status)}</td><td><button type="button" class="btn small danger" data-admin-fix="delete-round" data-id="${r.id}">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="5">No hay rondas creadas.</td></tr>'}</tbody></table></div>`);
  $('#adminFixRoundForm')?.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const {error}=await client.from('esmeralda_rounds').insert({event_id:event.id,round_number:Number(fd.get('round_number')),name:fd.get('name'),format:'debate',status:fd.get('status'),scheduled_at:fd.get('scheduled_at')?new Date(fd.get('scheduled_at')).toISOString():null});if(error)alert(error.message);else render('rounds')});
}

async function announcements(client,event){
  const {data,error}=await client.from('esmeralda_announcements').select('id,title,content,published,created_at').eq('event_id',event.id).order('created_at',{ascending:false});
  if(error)throw new Error('No se pudieron cargar los anuncios: '+error.message);
  setPanel('Anuncios',`<form id="adminFixAnnouncementForm" class="glass-form"><div class="form-grid"><label>Título<input name="title" required></label><label>Publicar<select name="published"><option value="false">No</option><option value="true">Sí</option></select></label></div><label>Contenido<textarea name="content" rows="4" required></textarea></label><button class="btn primary" type="submit">Crear anuncio</button></form><div class="table-wrap" style="margin-top:18px"><table class="data-table"><thead><tr><th>Título</th><th>Publicado</th><th></th></tr></thead><tbody>${(data||[]).map(a=>`<tr><td>${esc(a.title)}</td><td>${a.published?'Sí':'No'}</td><td><button type="button" class="btn small danger" data-admin-fix="delete-announcement" data-id="${a.id}">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="3">No hay anuncios.</td></tr>'}</tbody></table></div>`);
  $('#adminFixAnnouncementForm')?.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const {error:insertError}=await client.from('esmeralda_announcements').insert({event_id:event.id,title:fd.get('title'),content:fd.get('content'),published:fd.get('published')==='true'});if(insertError)alert(insertError.message);else render('announcements')});
}

async function render(name='overview'){
  if(loading)return;
  loading=true;
  const p=panel();
  if(p)p.innerHTML='<div class="empty" style="padding:32px">Cargando Administración…</div>';
  try{
    const client=await waitForDb();
    const role=await getStaff(client);
    const event=await getEvent(client);
    if($('#adminWelcome'))$('#adminWelcome').textContent=`Sesión activa · rol ${role}`;
    if(name==='teams')await teams(client,event);
    else if(name==='rounds')await rounds(client,event);
    else if(name==='announcements')await announcements(client,event);
    else await overview(client,event);
    if(p)p.dataset.loaded='1';
  }catch(error){
    console.error('TRD Administración:',error);
    errorPanel(error?.message||'Error desconocido.');
  }finally{loading=false}
}

async function status(id,status){
  try{
    const client=await waitForDb();
    const {error}=await client.from('esmeralda_teams').update({status,updated_at:new Date().toISOString()}).eq('id',id);
    if(error)throw error;
    await client.from('esmeralda_registrations').update({status,updated_at:new Date().toISOString()}).eq('team_id',id).eq('registration_type','team');
    await render('teams');
    window.dispatchEvent(new CustomEvent('trd:admin-data-changed'));
  }catch(error){alert('No se pudo actualizar el equipo: '+(error.message||error))}
}

async function deleteParticipant(id){
  if(!confirm('¿Eliminar este participante? Esta acción no se puede deshacer.'))return;
  try{
    const client=await waitForDb();
    const {error}=await client.from('esmeralda_debaters').delete().eq('id',id);
    if(error)throw error;
    document.getElementById('teamDetailDialog')?.close();
    alert('Participante eliminado correctamente.');
    await render('teams');
    window.dispatchEvent(new CustomEvent('trd:admin-data-changed'));
  }catch(error){alert('No se pudo eliminar el participante: '+(error.message||error))}
}

async function deleteTeam(id){
  if(!confirm('¿Eliminar este equipo y todos sus participantes, coach y registro? Esta acción no se puede deshacer.'))return;
  try{
    const client=await waitForDb();
    const cleanup=[
      ['esmeralda_debaters','team_id'],
      ['esmeralda_coaches','team_id'],
      ['esmeralda_registrations','team_id']
    ];
    for(const [table,column] of cleanup){
      const {error}=await client.from(table).delete().eq(column,id);
      if(error)throw new Error(`No se pudo limpiar ${table}: ${error.message}`);
    }
    const {error}=await client.from('esmeralda_teams').delete().eq('id',id);
    if(error)throw error;
    alert('Equipo eliminado correctamente.');
    await render('teams');
    window.dispatchEvent(new CustomEvent('trd:admin-data-changed'));
  }catch(error){alert('No se pudo eliminar el equipo: '+(error.message||error))}
}

async function showTeamDetails(id){
  const [{data:t,error:tError},{data:coach},{data:debaters}]=await Promise.all([db().from('esmeralda_teams').select('*').eq('id',id).maybeSingle(),db().from('esmeralda_coaches').select('*').eq('team_id',id).maybeSingle(),db().from('esmeralda_debaters').select('id,full_name,email,role').eq('team_id',id).order('created_at')]);
  if(tError||!t){alert('Equipo no encontrado.');return}
  let d=$('#teamDetailDialog');if(!d){d=document.createElement('dialog');d.id='teamDetailDialog';document.body.appendChild(d)}
  d.innerHTML=`<div class="team-ficha-shell"><header class="team-ficha-header"><div><span class="eyebrow">FICHA DEL EQUIPO</span><h2>${esc(t.team_name)}</h2><p>${esc(t.school_name||'Centro no registrado')}${t.district?' · '+esc(t.district):''}</p></div><button type="button" class="team-ficha-close" data-admin-fix="close-detail">×</button></header><main class="team-ficha-content"><section class="team-ficha-section"><div class="team-ficha-section-title"><span>Información del equipo</span><span class="team-ficha-status ${esc(t.status||'pending')}">${label(t.status)}</span></div><div class="team-ficha-grid"><div class="team-ficha-item"><small>Centro educativo</small><strong>${esc(t.school_name||'—')}</strong></div><div class="team-ficha-item"><small>Distrito</small><strong>${esc(t.district||'—')}</strong></div><div class="team-ficha-item"><small>Responsable</small><strong>${esc(t.contact_name||'—')}</strong></div><div class="team-ficha-item"><small>Correo</small><strong>${esc(t.contact_email||'—')}</strong></div></div></section><section class="team-ficha-section"><div class="team-ficha-section-title"><span>Docente coach</span></div>${coach?`<div class="team-ficha-coach"><strong>${esc(coach.full_name||'—')}</strong><span>${esc(coach.email||'Sin correo')}</span></div>`:'<div class="team-ficha-empty">No hay docente coach registrado.</div>'}</section><section class="team-ficha-section"><div class="team-ficha-section-title"><span>Integrantes</span><span class="team-ficha-count">${(debaters||[]).length}</span></div><div class="team-ficha-members">${(debaters||[]).map((x,i)=>`<div class="team-ficha-member"><span class="team-ficha-number">${i+1}</span><div><strong>${esc(x.full_name||'Sin nombre')}</strong><span>${x.role==='alternate'?'Suplente':'Debatiente'}${x.email?' · '+esc(x.email):''}</span></div><button type="button" class="btn small danger" data-admin-fix="delete-participant" data-id="${x.id}">Eliminar</button></div>`).join('')||'<div class="team-ficha-empty">No hay integrantes registrados.</div>'}</div></section></main><footer class="team-ficha-footer"><button type="button" class="btn outline" data-admin-fix="close-detail">Cerrar</button><div><button type="button" class="btn danger" data-admin-fix="delete-team" data-id="${t.id}">Eliminar equipo</button> ${t.status!=='rejected'?`<button type="button" class="btn danger" data-admin-fix="reject" data-id="${t.id}">Rechazar</button>`:''}${t.status!=='approved'?`<button type="button" class="btn primary" data-admin-fix="approve" data-id="${t.id}">Aprobar equipo</button>`:''}</div></footer></div>`;
  d.showModal()
}

function removeLegacy(){document.querySelectorAll('.admin-nav button').forEach(b=>{const t=b.textContent.trim().toLowerCase();if(t.includes('enfrentamientos')||t.includes('parejas'))b.remove()})}

function bind(){
  if(bound)return;
  bound=true;
  document.addEventListener('click',async e=>{
    const nav=e.target.closest?.('.admin-nav button[data-panel]');
    if(nav){
      e.preventDefault();e.stopImmediatePropagation();
      const name=nav.dataset.panel;
      if(!['overview','teams','rounds','announcements'].includes(name))return;
      document.querySelectorAll('.admin-nav button').forEach(b=>b.classList.toggle('active',b===nav));
      await render(name);
      return;
    }
    const action=e.target.closest?.('[data-admin-fix]');
    if(!action)return;
    const type=action.dataset.adminFix,id=action.dataset.id;
    if(type==='refresh')return render('overview');
    if(type==='approve')return status(id,'approved');
    if(type==='reject'){if(confirm('¿Confirmas que quieres rechazar este equipo?'))return status(id,'rejected')}
    if(type==='view-team')return showTeamDetails(id);
    if(type==='close-detail'){document.getElementById('teamDetailDialog')?.close();return}
    if(type==='delete-participant')return deleteParticipant(id);
    if(type==='delete-team')return deleteTeam(id);
    if(type==='delete-round'){if(!confirm('Eliminar esta ronda. ¿Continuar?'))return;try{const {error}=await db().from('esmeralda_rounds').delete().eq('id',id);if(error)throw error;await render('rounds')}catch(error){alert(error.message)}}
    if(type==='delete-announcement'){if(!confirm('¿Eliminar este anuncio?'))return;try{const {error}=await db().from('esmeralda_announcements').delete().eq('id',id);if(error)throw error;await render('announcements')}catch(error){alert(error.message)}}
  },true);
  removeLegacy();
}

function observe(){
  const admin=$('#admin');
  if(admin){
    new MutationObserver(()=>{
      removeLegacy();
      if(!admin.classList.contains('hidden')&&location.hash==='#admin'&&!panel()?.dataset.loaded&&!loading)render('overview');
    }).observe(admin,{attributes:true,attributeFilter:['class']});
  }
  window.addEventListener('hashchange',()=>{if(location.hash==='#admin'&&$('#admin')&&!$('#admin').classList.contains('hidden'))render('overview')});
  window.addEventListener('trd:admin-data-changed',()=>{if(location.hash==='#admin'&&$('#admin')&&!$('#admin').classList.contains('hidden'))render('overview')});
}

async function boot(){
  bind();
  observe();
  removeLegacy();
  if(location.hash==='#admin'&&$('#admin')&&!$('#admin').classList.contains('hidden'))await render('overview');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
