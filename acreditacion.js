const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const app=document.querySelector('#app');
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const params=new URLSearchParams(location.search),id=params.get('id'),type=params.get('type')||'accreditation';
const labelStatus=s=>s==='accredited'?'ACREDITADO':s==='rejected'?'RECHAZADO':'PENDIENTE';
const labelRole=r=>r==='judge'?'JUEZ':r==='staff'?'STAFF':r==='alternate'?'SUPLENTE':'DEBATIENTE';
function render(data,privateData=false){
 const status=data.status||data.accreditation_status||'pending';
 app.innerHTML=`<span class="eyebrow">VERIFICACIÓN QR · ${esc(labelRole(data.role))}</span><h1>${esc(data.first_name||data.full_name||'Participante')}</h1><div class="status ${esc(status)}">${labelStatus(status)}</div><div class="grid"><div class="field"><span>Nombre completo</span><strong>${esc(data.first_name?`${data.first_name} ${data.last_name||''}`:data.full_name)}</strong></div><div class="field"><span>Rol</span><strong>${esc(labelRole(data.role))}</strong></div><div class="field"><span>Centro educativo</span><strong>${esc(data.school_name||'—')}</strong></div><div class="field"><span>Distrito educativo</span><strong>${esc(data.district||'—')}</strong></div>${data.team_name?`<div class="field"><span>Equipo</span><strong>${esc(data.team_name)}</strong></div>`:''}</div>${privateData?`<div class="private"><div class="grid"><div class="field"><span>Teléfono</span><strong>${esc(data.phone||'—')}</strong></div><div class="field"><span>Cédula</span><strong>${esc(data.id_number||'—')}</strong></div><div class="field"><span>Alergias</span><strong>${esc(data.allergies||'Ninguna registrada')}</strong></div><div class="field"><span>Medicamentos</span><strong>${esc(data.medications||'Ninguno registrado')}</strong></div></div></div>`:`<p class="note">Los datos personales y médicos completos solo se muestran al personal autorizado del torneo.</p>`}<a class="btn" href="./">Volver al sitio</a>`;
}
async function load(){
 if(!id){app.innerHTML='<h1>QR no válido</h1><p class="error">No se recibió un identificador de acreditación.</p>';return}
 if(type==='participant'){
  const {data,error}=await db.rpc('get_esmeralda_public_debaters',{p_event_id:'00000000-0000-0000-0000-000000000000'});
  if(error){app.innerHTML='<h1>No se pudo verificar</h1><p class="error">No fue posible consultar la acreditación.</p>';return}
  const p=(data||[]).find(x=>x.id===id);
  if(!p){app.innerHTML='<h1>Participante no encontrado</h1><p class="error">El código QR no corresponde a un participante publicado.</p>';return}
  render({full_name:p.full_name,role:p.role,school_name:p.school_name,district:p.district,team_name:p.team_name,status:p.accreditation_status});
  const {data:user}=await db.auth.getUser();
  if(user?.user){const {data:priv}=await db.from('esmeralda_debaters').select('*').eq('id',id).maybeSingle();if(priv)render({...p,...priv,first_name:priv.first_name||p.full_name.split(' ')[0],last_name:priv.last_name||p.full_name.split(' ').slice(1).join(' '),school_name:p.school_name,district:p.district,status:priv.accreditation_status},true)}
  return;
 }
 const {data:pub,error}=await db.rpc('get_esmeralda_accreditation_public',{p_id:id});
 if(error||!pub?.length){app.innerHTML='<h1>Acreditación no encontrada</h1><p class="error">El código QR no corresponde a un registro válido.</p>';return}
 render(pub[0]);
 const {data:user}=await db.auth.getUser();
 if(user?.user){const {data:priv}=await db.rpc('get_esmeralda_accreditation_private',{p_id:id});if(priv?.length)render(priv[0],true)}
}
load();