const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const app=document.querySelector('#app');
const params=new URLSearchParams(location.search),id=params.get('id'),type=params.get('type')||'accreditation';
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const labelStatus=s=>s==='accredited'?'ACREDITADO':s==='rejected'?'RECHAZADO':'PENDIENTE';
const labelRole=r=>r==='judge'?'JUEZ':r==='staff'?'STAFF':r==='alternate'?'SUPLENTE':'DEBATIENTE';
const shortCode=id=>id?String(id).slice(0,8).toUpperCase():'—';
function render(data){
  const status=data.status||data.accreditation_status||'pending';
  const fullName=data.first_name?`${data.first_name} ${data.last_name||''}`.trim():data.full_name||'Participante';
  app.innerHTML=`
    <span class="eyebrow">VERIFICACIÓN QR · ${esc(labelRole(data.role))}</span>
    <h1>${esc(fullName)}</h1>
    <div class="status ${esc(status)}">${labelStatus(status)}</div>
    <div class="grid">
      <div class="field"><span>Nombre completo</span><strong>${esc(fullName)}</strong></div>
      <div class="field"><span>Rol</span><strong>${esc(labelRole(data.role))}</strong></div>
      <div class="field"><span>Centro educativo</span><strong>${esc(data.school_name||'—')}</strong></div>
      <div class="field"><span>Distrito educativo</span><strong>${esc(data.district||'—')}</strong></div>
      ${data.team_name?`<div class="field"><span>Equipo</span><strong>${esc(data.team_name)}</strong></div>`:''}
      ${data.grade?`<div class="field"><span>Grado</span><strong>${esc(data.grade)}</strong></div>`:''}
      <div class="field"><span>Código de acreditación</span><strong>${esc(shortCode(data.id))}</strong></div>
    </div>
    <div class="verification-ok">
      <strong>✓ Código verificado</strong>
      <span>Esta ficha se puede consultar directamente desde el teléfono. No necesitas iniciar sesión para verificar la acreditación.</span>
    </div>
    <p class="note">Por seguridad, el QR público no expone cédula, teléfono, alergias ni medicamentos. Esa información queda reservada para la gestión interna autorizada del torneo.</p>
    <a class="btn" href="./">Volver al sitio</a>`;
}
async function load(){
  if(!id){app.innerHTML='<h1>QR no válido</h1><p class="error">No se recibió un identificador de acreditación.</p>';return}
  if(type==='participant'){
    const {data:p,error}=await db.rpc('get_esmeralda_public_debater',{p_debater_id:id});
    if(error||!p?.length){app.innerHTML='<h1>Participante no encontrado</h1><p class="error">El código QR no corresponde a un participante publicado.</p>';return}
    render(p[0]);
    return;
  }
  const {data:pub,error}=await db.rpc('get_esmeralda_accreditation_public',{p_id:id});
  if(error||!pub?.length){app.innerHTML='<h1>Acreditación no encontrada</h1><p class="error">El código QR no corresponde a un registro válido.</p>';return}
  render(pub[0]);
}
load();
