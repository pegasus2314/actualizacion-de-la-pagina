const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
const {createClient}=supabase;
const db=createClient(SUPABASE_URL,SUPABASE_KEY);
const EVENT_SLUG='trd-la-regional-esmeralda';
let event=null,debaterIndex=0;
const $=s=>document.querySelector(s);
const esc=(v='')=>String(v).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

async function loadEvent(){
  const {data,error}=await db.from('esmeralda_events').select('*').eq('slug',EVENT_SLUG).maybeSingle();
  if(error) console.error(error);
  event=data;
  if(event) $('#registrationForm').dataset.eventId=event.id;
}

function addDebater(){
  const id=debaterIndex++;
  const row=document.createElement('div');
  row.className='debater-row';
  row.dataset.id=id;
  row.innerHTML=`<input name="debater_name_${id}" required placeholder="Nombre completo" aria-label="Nombre del integrante"/><input name="debater_email_${id}" type="email" placeholder="Correo"/><select name="debater_role_${id}"><option value="debater" selected>Debatiente</option><option value="alternate">Suplente</option></select><button type="button" class="remove" aria-label="Eliminar integrante">×</button>`;
  row.querySelector('.remove').onclick=()=>row.remove();
  $('#debaters').appendChild(row);
}

async function submitRegistration(e){
  e.preventDefault();
  const form=e.currentTarget,msg=$('#formMessage'),btn=form.querySelector('button[type=submit]');
  msg.textContent='Enviando inscripción…';
  btn.disabled=true;
  try{
    if(!event) throw new Error('El evento no está disponible para inscripción.');
    const fd=new FormData(form),rows=[...document.querySelectorAll('.debater-row')];
    if(!rows.length) throw new Error('Añade al menos un integrante.');
    const teamPayload={event_id:event.id,team_name:fd.get('team_name'),school_name:fd.get('school_name'),district:fd.get('district')||null,contact_name:fd.get('contact_name'),contact_email:fd.get('contact_email'),contact_phone:fd.get('contact_phone'),status:'pending'};
    const {data:team,error:teamError}=await db.from('esmeralda_teams').insert(teamPayload).select('id').single();
    if(teamError) throw teamError;

    const coachPayload={team_id:team.id,full_name:fd.get('coach_name'),email:fd.get('coach_email'),phone:fd.get('coach_phone'),school_name:fd.get('coach_school'),district:fd.get('coach_district')||fd.get('district')||null,consent:$('#coachConsent').checked};
    const {error:coachError}=await db.from('esmeralda_coaches').insert(coachPayload);
    if(coachError) throw coachError;

    const debaters=rows.map(r=>({team_id:team.id,full_name:r.querySelector(`[name^="debater_name_"]`).value,email:r.querySelector(`[name^="debater_email_"]`).value||null,role:r.querySelector('select').value,consent:$('#consent').checked}));
    const {error:dError}=await db.from('esmeralda_debaters').insert(debaters);
    if(dError) throw dError;

    const {error:rError}=await db.from('esmeralda_registrations').insert({event_id:event.id,team_id:team.id,registration_type:'team',status:'pending',payload:{team_name:teamPayload.team_name,school_name:teamPayload.school_name,contact_email:teamPayload.contact_email,coach_name:coachPayload.full_name,coach_email:coachPayload.email}});
    if(rError) throw rError;

    form.reset();
    $('#debaters').innerHTML='';
    addDebater();
    msg.textContent='✓ Inscripción enviada correctamente. Equipo y docente Coach registrados.';
    msg.style.color='var(--mint)';
    loadStats();
  }catch(err){
    console.error(err);
    msg.textContent='No se pudo enviar la inscripción: '+(err.message||'error desconocido');
    msg.style.color='var(--danger)';
  }finally{btn.disabled=false;}
}

async function loadStats(){
  const {data,error}=await db.from('esmeralda_public_stats').select('*').maybeSingle();
  if(error){console.error(error);return}
  $('#teamCount').textContent=data?.team_count??0;
  $('#debaterCount').textContent=data?.debater_count??0;
  if($('#roundCount')) $('#roundCount').textContent=data?.round_count??0;
  if($('#publicRounds')) $('#publicRounds').textContent=data?.round_count??0;
  if($('#publicMatches')) $('#publicMatches').textContent=data?.match_count??0;
}

async function loadPublicTeams(){
  const grid=$('#teamsGrid'),{data,error}=await db.from('esmeralda_events').select('id').eq('slug',EVENT_SLUG).maybeSingle();
  if(error||!data){grid.innerHTML='<div class="empty">No hay un evento disponible.</div>';return}
  const {data:teams,error:tError}=await db.from('esmeralda_public_teams').select('team_name,school_name,district').eq('event_id',data.id).order('team_name');
  if(tError){grid.innerHTML='<div class="empty">La consulta de participantes está temporalmente cerrada.</div>';return}
  grid.innerHTML=teams?.length?teams.map(t=>`<article class="team-card"><small>● EQUIPO APROBADO</small><h3>${esc(t.team_name)}</h3><p>${esc(t.school_name)}${t.district?' · '+esc(t.district):''}</p></article>`).join(''):'<div class="empty">Aún no hay equipos aprobados publicados.</div>';
}

async function adminLogin(e){
  e.preventDefault();
  const msg=$('#loginMessage');msg.textContent='Verificando…';
  const {data,error}=await db.auth.signInWithPassword({email:$('#loginEmail').value,password:$('#loginPassword').value});
  if(error){msg.textContent='Credenciales no válidas.';msg.style.color='var(--danger)';return}
  const {data:role}=await db.from('esmeralda_staff_roles').select('role').eq('user_id',data.user.id).maybeSingle();
  if(!role){await db.auth.signOut();msg.textContent='Tu cuenta no tiene permisos para este sistema.';msg.style.color='var(--danger)';return}
  $('#loginDialog').close();$('#admin').classList.remove('hidden');$('#adminWelcome').textContent=`Sesión activa · rol ${role.role}`;location.hash='admin';await loadAdmin();
}

async function loadAdmin(){
  const [{data:teams},{data:debaters},{data:regs}]=await Promise.all([
    db.from('esmeralda_teams').select('id,team_name,school_name,district,status').order('created_at',{ascending:false}),
    db.from('esmeralda_debaters').select('id',{count:'exact'}),
    db.from('esmeralda_registrations').select('id',{count:'exact'}).eq('status','pending')
  ]);
  $('#adminTeams').textContent=teams?.length??0;
  $('#adminDebaters').textContent=debaters?.length??0;
  $('#adminPending').textContent=regs?.length??0;
  $('#adminTable').innerHTML=(teams||[]).map(t=>`<tr><td>${esc(t.team_name)}</td><td>${esc(t.school_name)}</td><td>${esc(t.district||'—')}</td><td class="status">${esc(t.status)}</td></tr>`).join('');
}

$('#addDebater').onclick=addDebater;
$('#registrationForm').addEventListener('submit',submitRegistration);
$('#adminBtn').onclick=()=>$('#loginDialog').showModal();
$('#closeLogin').onclick=()=>$('#loginDialog').close();
$('#loginForm').addEventListener('submit',adminLogin);
addDebater();loadEvent();loadStats();loadPublicTeams();
db.auth.onAuthStateChange((_event,session)=>{if(session)loadAdmin()});