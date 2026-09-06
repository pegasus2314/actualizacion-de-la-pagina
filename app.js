const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const EVENT_SLUG='trd-la-regional-esmeralda';
let event=null,debaterIndex=0,currentPanel='overview',staffRole=null;
const $=s=>document.querySelector(s);
const esc=(v='')=>String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const fmtDate=v=>v?new Date(v).toLocaleString('es-DO',{dateStyle:'medium',timeStyle:'short'}):'—';
const notify=(msg,type='ok')=>{const el=$('#formMessage');if(el){el.textContent=msg;el.style.color=type==='error'?'var(--danger)':'var(--mint)'}};

async function loadEvent(){
  const {data,error}=await db.from('esmeralda_events').select('*').eq('slug',EVENT_SLUG).maybeSingle();
  if(error) console.error('loadEvent',error);
  event=data;
  const form=$('#registrationForm');
  if(event&&form) form.dataset.eventId=event.id;
}

function addDebater(){
  const box=$('#debaters');if(!box)return;
  const id=debaterIndex++,row=document.createElement('div');
  row.className='debater-row';row.dataset.id=id;
  row.innerHTML=`<input name="debater_name_${id}" required placeholder="Nombre completo" aria-label="Nombre del integrante"><input name="debater_email_${id}" type="email" placeholder="Correo"><select name="debater_role_${id}"><option value="debater" selected>Debatiente</option><option value="alternate">Suplente</option></select><button type="button" class="remove" aria-label="Eliminar integrante">×</button>`;
  row.querySelector('.remove').onclick=()=>row.remove();box.appendChild(row);
}

async function submitRegistration(e){
  e.preventDefault();
  const form=e.currentTarget,btn=form.querySelector('button[type=submit]');
  notify('Enviando inscripción…');btn.disabled=true;
  try{
    if(!event) throw new Error('El evento no está disponible.');
    const fd=new FormData(form),rows=[...document.querySelectorAll('.debater-row')];
    if(!rows.length) throw new Error('Añade al menos un integrante.');
    const teamId=crypto.randomUUID();
    const team={id:teamId,event_id:event.id,team_name:fd.get('team_name'),school_name:fd.get('school_name'),district:fd.get('district')||null,contact_name:fd.get('contact_name'),contact_email:fd.get('contact_email'),contact_phone:fd.get('contact_phone'),status:'pending'};
    let r=await db.from('esmeralda_teams').insert(team);if(r.error)throw r.error;
    const coach={team_id:teamId,full_name:fd.get('coach_name'),email:fd.get('coach_email'),phone:fd.get('coach_phone'),school_name:fd.get('coach_school'),district:fd.get('coach_district')||fd.get('district')||null,consent:$('#coachConsent').checked};
    r=await db.from('esmeralda_coaches').insert(coach);if(r.error)throw r.error;
    const consent=$('#consent').checked;
    const debaters=rows.map(row=>({team_id:teamId,full_name:row.querySelector('[name^="debater_name_"]').value,email:row.querySelector('[name^="debater_email_"]').value||null,role:row.querySelector('select').value,consent}));
    r=await db.from('esmeralda_debaters').insert(debaters);if(r.error)throw r.error;
    r=await db.from('esmeralda_registrations').insert({event_id:event.id,team_id:teamId,registration_type:'team',status:'pending',payload:{team_name:team.team_name,school_name:team.school_name,contact_email:team.contact_email,coach_name:coach.full_name,coach_email:coach.email}});if(r.error)throw r.error;
    form.reset();$('#debaters').innerHTML='';addDebater();notify('✓ Inscripción enviada. Quedará pendiente de revisión.');
    await loadStats();
  }catch(err){console.error('submitRegistration',err);notify('No se pudo enviar la inscripción: '+(err.message||'error desconocido'),'error')}
  finally{btn.disabled=false}
}

async function loadStats(){
  const {data,error}=await db.from('esmeralda_public_stats').select('*').maybeSingle();
  if(error){console.error('loadStats',error);return}
  const set=(id,value)=>{const el=$(id);if(el)el.textContent=value};
  set('#teamCount',data?.team_count??0);set('#debaterCount',data?.debater_count??0);set('#roundCount',data?.round_count??0);set('#publicRounds',data?.round_count??0);set('#publicMatches',data?.match_count??0);
}

async function loadPublicTeams(){
  const grid=$('#teamsGrid');if(!grid)return;
  const {data,error}=await db.from('esmeralda_events').select('id').eq('slug',EVENT_SLUG).maybeSingle();
  if(error||!data){grid.innerHTML='<div class="empty">No hay un evento disponible.</div>';return}
  const {data:teams,error:tError}=await db.from('esmeralda_public_teams').select('team_name,school_name,district').eq('event_id',data.id).order('team_name');
  if(tError){console.error('loadPublicTeams',tError);grid.innerHTML='<div class="empty">No se pudieron cargar los participantes.</div>';return}
  grid.innerHTML=teams?.length?teams.map(t=>`<article class="team-card"><small>● EQUIPO APROBADO</small><h3>${esc(t.team_name)}</h3><p>${esc(t.school_name)}${t.district?' · '+esc(t.district):''}</p></article>`).join(''):'<div class="empty">Aún no hay equipos aprobados publicados.</div>';
}

function statusLabel(s){return s==='approved'?'Aprobado':s==='rejected'?'Rechazado':s==='completed'?'Completado':s==='in_progress'?'En curso':'Pendiente'}
function adminShell(title,body){return `<div class="admin-toolbar"><div><h3>${title}</h3></div><button class="btn small outline" data-action="refresh">↻ Actualizar</button></div>${body}`}

async function adminLogin(e){
  e.preventDefault();const msg=$('#loginMessage');msg.textContent='Verificando…';
  const {data,error}=await db.auth.signInWithPassword({email:$('#loginEmail').value,password:$('#loginPassword').value});
  if(error){msg.textContent='Credenciales no válidas.';msg.style.color='var(--danger)';return}
  const {data:role,error:roleError}=await db.from('esmeralda_staff_roles').select('role').eq('user_id',data.user.id).maybeSingle();
  if(roleError||!role){await db.auth.signOut();msg.textContent='Tu cuenta no tiene permisos para este sistema.';msg.style.color='var(--danger)';return}
  staffRole=role.role;$('#loginDialog').close();$('#admin').classList.remove('hidden');$('#adminWelcome').textContent=`Sesión activa · rol ${staffRole}`;location.hash='admin';await loadAdmin();
}

async function signOut(){await db.auth.signOut();staffRole=null;$('#admin').classList.add('hidden');location.hash='inicio'}

async function loadAdmin(){
  if(!staffRole||!event)return;
  const [{data:teams,error:tErr},{count:debaterCount,error:dErr},{count:pendingCount,error:rErr}]=await Promise.all([
    db.from('esmeralda_teams').select('id,event_id,team_name,school_name,district,status,created_at').eq('event_id',event.id).order('created_at',{ascending:false}),
    db.from('esmeralda_debaters').select('id',{count:'exact',head:true}),
    db.from('esmeralda_registrations').select('id',{count:'exact',head:true}).eq('status','pending')
  ]);
  if(tErr)console.error('loadAdmin teams',tErr);if(dErr)console.error('loadAdmin debaters',dErr);if(rErr)console.error('loadAdmin pending',rErr);
  await renderAdmin(teams||[],{debaterCount:debaterCount||0,pendingCount:pendingCount||0});
}

async function renderAdmin(teams=[],stats={}){
  const panel=$('#adminPanel');if(!panel)return;
  if(currentPanel==='overview'){
    const pending=teams.filter(t=>t.status==='pending').length,approved=teams.filter(t=>t.status==='approved').length,rejected=teams.filter(t=>t.status==='rejected').length;
    panel.innerHTML=adminShell('Resumen',`<div class="admin-grid"><div class="admin-card"><span>Equipos</span><strong>${teams.length}</strong></div><div class="admin-card"><span>Pendientes</span><strong>${pending}</strong></div><div class="admin-card"><span>Aprobados</span><strong>${approved}</strong></div><div class="admin-card"><span>Rechazados</span><strong>${rejected}</strong></div><div class="admin-card"><span>Debatientes</span><strong>${stats.debaterCount}</strong></div></div><div class="empty">Flujo: inscripción → revisión → aprobación → publicación → rondas → enfrentamientos → evaluación → resultados.</div>`);return;
  }
  if(currentPanel==='teams'){panel.innerHTML=adminShell('Gestión de equipos',`<div class="table-wrap"><table class="data-table"><thead><tr><th>Equipo</th><th>Centro</th><th>Distrito</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${teams.map(adminTeamRow).join('')||'<tr><td colspan="5">No hay equipos registrados.</td></tr>'}</tbody></table></div>`);return}
  if(currentPanel==='rounds'){await renderRounds(panel);return}
  if(currentPanel==='matches'){await renderMatches(panel);return}
  if(currentPanel==='announcements'){await renderAnnouncements(panel);return}
}

function adminTeamRow(t){return `<tr><td><b>${esc(t.team_name)}</b></td><td>${esc(t.school_name)}</td><td>${esc(t.district||'—')}</td><td>${statusLabel(t.status)}</td><td><button class="btn small outline" data-action="view-team" data-id="${t.id}">Ver</button> ${t.status!=='approved'?`<button class="btn small primary" data-action="approve" data-id="${t.id}">Aprobar</button>`:''} ${t.status!=='rejected'?`<button class="btn small danger" data-action="reject" data-id="${t.id}">Rechazar</button>`:''}</td></tr>`}

async function setTeamStatus(id,status){
  const {error}=await db.from('esmeralda_teams').update({status,updated_at:new Date().toISOString()}).eq('id',id);
  if(error){alert('No se pudo actualizar el equipo: '+error.message);return}
  const {error:regError}=await db.from('esmeralda_registrations').update({status,updated_at:new Date().toISOString()}).eq('team_id',id).eq('registration_type','team');
  if(regError)console.error('setTeamStatus registration',regError);
  document.getElementById('teamDetailDialog')?.close();await loadAdmin();await loadPublicTeams();await loadStats();
}

async function showTeamDetails(id){
  const [{data:t,error:tError},{data:coach},{data:debaters}]=await Promise.all([
    db.from('esmeralda_teams').select('*').eq('id',id).maybeSingle(),
    db.from('esmeralda_coaches').select('*').eq('team_id',id).maybeSingle(),
    db.from('esmeralda_debaters').select('full_name,email,role').eq('team_id',id).order('created_at')
  ]);
  if(tError||!t){alert('Equipo no encontrado.');return}
  let d=document.getElementById('teamDetailDialog');if(!d){d=document.createElement('dialog');d.id='teamDetailDialog';document.body.appendChild(d)}
  d.innerHTML=`<div class="login-card team-detail-dialog"><button type="button" class="close" data-action="close-detail">×</button><span class="eyebrow">FICHA DEL EQUIPO</span><h2>${esc(t.team_name)}</h2><p><b>Centro:</b> ${esc(t.school_name)}<br><b>Distrito:</b> ${esc(t.district||'—')}<br><b>Responsable:</b> ${esc(t.contact_name||'—')}<br><b>Correo:</b> ${esc(t.contact_email||'—')}<br><b>Teléfono:</b> ${esc(t.contact_phone||'—')}<br><b>Estado:</b> ${statusLabel(t.status)}</p><hr><h3>Docente Coach</h3><p>${coach?`${esc(coach.full_name)} · ${esc(coach.email)}${coach.phone?' · '+esc(coach.phone):''}`:'No registrado'}</p><h3>Integrantes</h3><ul>${(debaters||[]).map(x=>`<li>${esc(x.full_name)} · ${x.role==='alternate'?'Suplente':'Debatiente'}${x.email?' · '+esc(x.email):''}</li>`).join('')||'<li>Sin integrantes</li>'}</ul><div class="form-footer">${t.status!=='approved'?`<button class="btn primary" data-action="approve" data-id="${t.id}">Aprobar equipo</button>`:''}${t.status!=='rejected'?`<button class="btn danger" data-action="reject" data-id="${t.id}">Rechazar</button>`:''}</div></div>`;
  d.showModal();
}

async function renderRounds(panel){
  const {data:rounds,error}=await db.from('esmeralda_rounds').select('*').eq('event_id',event.id).order('round_number');
  if(error){panel.innerHTML=adminShell('Rondas','<div class="empty">No se pudieron cargar las rondas.</div>');return}
  panel.innerHTML=adminShell('Rondas',`<form id="roundForm" class="form-grid"><label>Número<input name="round_number" type="number" min="1" required></label><label>Nombre<input name="name" required placeholder="Ej. Ronda 1"></label><label>Fecha y hora<input name="scheduled_at" type="datetime-local"></label><label>Estado<select name="status"><option value="scheduled">Programada</option><option value="in_progress">En curso</option><option value="completed">Completada</option></select></label><button class="btn primary" type="submit">Crear ronda</button></form><div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Ronda</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${(rounds||[]).map(r=>`<tr><td>${r.round_number}</td><td>${esc(r.name)}</td><td>${fmtDate(r.scheduled_at)}</td><td>${statusLabel(r.status)}</td><td><button class="btn small danger" data-action="delete-round" data-id="${r.id}">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="5">No hay rondas creadas.</td></tr>'}</tbody></table></div>`);
  $('#roundForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const {error}=await db.from('esmeralda_rounds').insert({event_id:event.id,round_number:Number(fd.get('round_number')),name:fd.get('name'),format:'debate',status:fd.get('status'),scheduled_at:fd.get('scheduled_at')?new Date(fd.get('scheduled_at')).toISOString():null});if(error)alert(error.message);else{await renderRounds(panel);await loadStats()}};
}

async function renderMatches(panel){
  const [{data:rounds,error:rError},{data:teams,error:tError}]=await Promise.all([db.from('esmeralda_rounds').select('id,round_number,name').eq('event_id',event.id).order('round_number'),db.from('esmeralda_teams').select('id,team_name').eq('event_id',event.id).eq('status','approved').order('team_name')]);
  if(rError||tError)console.error('renderMatches',rError||tError);
  const roundIds=(rounds||[]).map(r=>r.id);let matches=[];
  if(roundIds.length){const {data,error}=await db.from('esmeralda_matches').select('id,round_id,team_a_id,team_b_id,room,status,winner_team_id').in('round_id',roundIds).order('created_at');if(error)console.error('matches',error);matches=data||[]}
  const teamMap=Object.fromEntries((teams||[]).map(t=>[t.id,t.team_name])),roundMap=Object.fromEntries((rounds||[]).map(r=>[r.id,`${r.round_number}. ${r.name}`]));
  panel.innerHTML=adminShell('Enfrentamientos',`<p class="form-message">Los cruces se crean manualmente hasta que estén definidas las reglas oficiales del torneo.</p><form id="matchForm" class="form-grid"><label>Ronda<select name="round_id" required>${(rounds||[]).map(r=>`<option value="${r.id}">${r.round_number}. ${esc(r.name)}</option>`).join('')}</select></label><label>Equipo A<select name="team_a_id" required>${(teams||[]).map(t=>`<option value="${t.id}">${esc(t.team_name)}</option>`).join('')}</select></label><label>Equipo B<select name="team_b_id" required><option value="">Selecciona equipo</option>${(teams||[]).map(t=>`<option value="${t.id}">${esc(t.team_name)}</option>`).join('')}</select></label><label>Sala<input name="room" placeholder="Ej. Aula 3"></label><button class="btn primary" type="submit">Crear enfrentamiento</button></form><div class="table-wrap"><table class="data-table"><thead><tr><th>Ronda</th><th>Equipo A</th><th>Equipo B</th><th>Sala</th><th>Estado</th><th>Acción</th></tr></thead><tbody>${matches.map(m=>`<tr><td>${esc(roundMap[m.round_id]||'—')}</td><td>${esc(teamMap[m.team_a_id]||'—')}</td><td>${esc(teamMap[m.team_b_id]||'—')}</td><td>${esc(m.room||'—')}</td><td>${statusLabel(m.status)}</td><td><button class="btn small danger" data-action="delete-match" data-id="${m.id}">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="6">No hay enfrentamientos creados.</td></tr>'}</tbody></table></div>`);
  const form=$('#matchForm');if(form)form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);if(!fd.get('round_id')||!fd.get('team_a_id')||!fd.get('team_b_id'))return;if(fd.get('team_a_id')===fd.get('team_b_id')){alert('Los dos equipos deben ser diferentes.');return}const {error}=await db.from('esmeralda_matches').insert({round_id:fd.get('round_id'),team_a_id:fd.get('team_a_id'),team_b_id:fd.get('team_b_id'),room:fd.get('room')||null,status:'scheduled'});if(error)alert(error.message);else{await renderMatches(panel);await loadStats()}};
}

async function renderAnnouncements(panel){
  const {data,error}=await db.from('esmeralda_announcements').select('*').eq('event_id',event.id).order('created_at',{ascending:false});
  if(error){panel.innerHTML=adminShell('Anuncios','<div class="empty">No se pudieron cargar los anuncios.</div>');return}
  panel.innerHTML=adminShell('Anuncios',`<form id="announcementForm" class="glass-form"><div class="form-grid"><label>Título<input name="title" required></label><label>Publicar ahora<select name="published"><option value="false">No</option><option value="true">Sí</option></select></label></div><label>Contenido<textarea name="content" rows="4" required></textarea></label><button class="btn primary" type="submit">Crear anuncio</button></form><div class="table-wrap"><table class="data-table"><thead><tr><th>Título</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr></thead><tbody>${(data||[]).map(a=>`<tr><td><b>${esc(a.title)}</b><br><small>${esc(a.content)}</small></td><td>${a.published?'Publicado':'Borrador'}</td><td>${fmtDate(a.created_at)}</td><td><button class="btn small outline" data-action="toggle-announcement" data-id="${a.id}" data-published="${a.published}">${a.published?'Ocultar':'Publicar'}</button> <button class="btn small danger" data-action="delete-announcement" data-id="${a.id}">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="4">No hay anuncios.</td></tr>'}</tbody></table></div>`);
  const form=$('#announcementForm');if(form)form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const {error}=await db.from('esmeralda_announcements').insert({event_id:event.id,title:fd.get('title'),content:fd.get('content'),published:fd.get('published')==='true'});if(error)alert(error.message);else await renderAnnouncements(panel)};
}

async function handleAdminAction(target){
  const action=target.dataset.action,id=target.dataset.id;
  if(action==='refresh'){await loadAdmin();return}
  if(action==='view-team'){await showTeamDetails(id);return}
  if(action==='close-detail'){document.getElementById('teamDetailDialog')?.close();return}
  if(action==='approve'){await setTeamStatus(id,'approved');return}
  if(action==='reject'){if(confirm('¿Confirmas que quieres rechazar este equipo?'))await setTeamStatus(id,'rejected');return}
  if(action==='delete-round'){if(confirm('Eliminar esta ronda también puede afectar sus enfrentamientos. ¿Continuar?')){const {error}=await db.from('esmeralda_rounds').delete().eq('id',id);if(error)alert(error.message);else await renderRounds($('#adminPanel'))}return}
  if(action==='delete-match'){if(confirm('¿Eliminar este enfrentamiento?')){const {error}=await db.from('esmeralda_matches').delete().eq('id',id);if(error)alert(error.message);else{await renderMatches($('#adminPanel'));await loadStats()}}return}
  if(action==='toggle-announcement'){const published=target.dataset.published!=='true';const {error}=await db.from('esmeralda_announcements').update({published,updated_at:new Date().toISOString()}).eq('id',id);if(error)alert(error.message);else await renderAnnouncements($('#adminPanel'));return}
  if(action==='delete-announcement'){if(confirm('¿Eliminar este anuncio?')){const {error}=await db.from('esmeralda_announcements').delete().eq('id',id);if(error)alert(error.message);else await renderAnnouncements($('#adminPanel'))}}
}

$('#addDebater')?.addEventListener('click',addDebater);
$('#registrationForm')?.addEventListener('submit',submitRegistration);
$('#adminBtn')?.addEventListener('click',()=>$('#loginDialog')?.showModal());
$('#closeLogin')?.addEventListener('click',()=>$('#loginDialog')?.close());
$('#loginForm')?.addEventListener('submit',adminLogin);
$('#adminPanel')?.addEventListener('click',e=>{const t=e.target.closest('[data-action]');if(t)handleAdminAction(t)});
$('.admin-nav')?.addEventListener('click',async e=>{const b=e.target.closest('[data-panel]');if(!b)return;currentPanel=b.dataset.panel;document.querySelectorAll('.admin-nav button').forEach(x=>x.classList.toggle('active',x===b));await loadAdmin()});

addDebater();
(async()=>{await loadEvent();await loadStats();await loadPublicTeams()})();

db.auth.onAuthStateChange(async(_event,session)=>{if(session){const {data:role}=await db.from('esmeralda_staff_roles').select('role').eq('user_id',session.user.id).maybeSingle();if(role){staffRole=role.role;$('#admin')?.classList.remove('hidden');$('#adminWelcome').textContent=`Sesión activa · rol ${staffRole}`;await loadAdmin()}}else{staffRole=null}});