(()=>{
'use strict';
const EVENT_SLUG='trd-la-regional-esmeralda';
let admin=false;
const getDb=()=>window.db||window.supabaseClient||null;
async function checkAdmin(){
  const db=getDb();
  if(!db?.auth)return false;
  try{
    const {data:{session}}=await db.auth.getSession();
    if(!session?.user)return false;
    const {data,error}=await db.from('esmeralda_staff_roles').select('role').eq('user_id',session.user.id).maybeSingle();
    admin=!error&&!!data?.role;
  }catch(_){admin=false}
  return admin;
}
function protectButton(){
  const button=document.querySelector('#exportParticipantsPdf');
  if(!button)return;
  button.hidden=!admin;
  button.setAttribute('aria-hidden',admin?'false':'true');
  if(!admin){
    const replacement=button.cloneNode(true);
    replacement.hidden=true;
    button.replaceWith(replacement);
  }
}
async function sync(){await checkAdmin();protectButton()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
if(window.db?.auth?.onAuthStateChange)window.db.auth.onAuthStateChange(()=>setTimeout(sync,0));
new MutationObserver(()=>{const b=document.querySelector('#exportParticipantsPdf');if(b&&!admin)protectButton()}).observe(document.documentElement,{childList:true,subtree:true});
})();
