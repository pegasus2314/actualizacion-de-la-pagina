(()=>{
'use strict';
const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
if(!window.supabase)return;
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const ROLE_LABELS={admin:'Administrador',subsecretario_acreditacion:'Subsecretario de Acreditación',debatiente:'Debatiente'};
const PANEL_RULES={admin:['overview','teams','rounds','matches','announcements','accreditation','logistics'],subsecretario_acreditacion:['overview','accreditation','logistics'],debatiente:[]};
let currentRole=null;
const normalize=v=>String(v||'').toLowerCase().trim().replace(/\s+/g,'_');
async function getRole(){
  try{
    const {data:{user}}=await db.auth.getUser();
    if(!user)return null;
    const {data,error}=await db.from('esmeralda_staff_roles').select('role').eq('user_id',user.id).maybeSingle();
    if(error){console.warn('role-access',error.message);return null}
    const r=normalize(data?.role);
    return ROLE_LABELS[r]?r:null;
  }catch(e){console.warn('role-access',e);return null}
}
function textOf(el){return(el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
function inferPanel(el){
  const raw=(el?.dataset?.panel||el?.dataset?.view||textOf(el)).toLowerCase();
  if(raw.includes('resumen')||raw.includes('overview'))return'overview';
  if(raw.includes('equipo'))return'teams';
  if(raw.includes('ronda'))return'rounds';
  if(raw.includes('enfrent')||raw.includes('match'))return'matches';
  if(raw.includes('anuncio'))return'announcements';
  if(raw.includes('acredit'))return'accreditation';
  if(raw.includes('log'))return'logistics';
  return null;
}
function setVisible(el,visible){
  if(!el)return;
  el.hidden=!visible;
  el.setAttribute('aria-hidden',String(!visible));
  el.classList.toggle('role-hidden',!visible);
}
function applyRole(){
  if(!currentRole)return;
  const allowed=PANEL_RULES[currentRole]||[];
  document.documentElement.dataset.trdRole=currentRole;
  const adminBtn=document.querySelector('#adminBtn');
  if(adminBtn)setVisible(adminBtn,currentRole!=='debatiente');
  document.querySelectorAll('#adminNav a,#adminNav button,.admin-nav a,.admin-nav button,[data-panel]').forEach(el=>{
    const panel=inferPanel(el);
    if(panel)setVisible(el,currentRole==='admin'||allowed.includes(panel));
  });
  const welcome=document.querySelector('#adminWelcome');
  if(welcome)welcome.textContent=`Sesión activa · ${ROLE_LABELS[currentRole]}`;
  let badge=document.querySelector('#trdRoleBadge');
  if(!badge&&welcome){
    badge=document.createElement('span');
    badge.id='trdRoleBadge';
    badge.className='trd-role-badge';
    welcome.parentElement?.appendChild(badge);
  }
  if(badge)badge.textContent=ROLE_LABELS[currentRole];
  document.querySelectorAll('[data-role]').forEach(el=>setVisible(el,el.dataset.role.split(',').map(normalize).includes(currentRole)));
}
function guardClicks(e){
  if(!currentRole)return;
  const el=e.target.closest('#adminNav a,#adminNav button,.admin-nav a,.admin-nav button,[data-panel]');
  if(!el)return;
  const panel=inferPanel(el),allowed=PANEL_RULES[currentRole]||[];
  if(panel&&currentRole!=='admin'&&!allowed.includes(panel)){
    e.preventDefault();
    e.stopImmediatePropagation();
    alert('No tienes permisos para acceder a esta sección.');
  }
}
async function refresh(){
  const role=await getRole();
  if(role){currentRole=role;applyRole()}
}
document.addEventListener('click',guardClicks,true);
const observer=new MutationObserver(()=>{if(currentRole)applyRole()});
if(document.body)observer.observe(document.body,{childList:true,subtree:true});
// No hacemos llamadas async dentro de onAuthStateChange: Supabase documenta que esto puede provocar un deadlock.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
const style=document.createElement('style');
style.textContent='.role-hidden{display:none!important}.trd-role-badge{display:inline-flex;align-items:center;margin-left:9px;padding:5px 9px;border:1px solid rgba(25,220,229,.2);border-radius:999px;background:rgba(25,220,229,.07);color:#7de7ec;font-size:10px;font-weight:800}';
document.head.appendChild(style);
})();