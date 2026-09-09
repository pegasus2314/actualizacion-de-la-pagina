const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiKT7N';
const db=window.__TRD_DB||(window.__TRD_DB=supabase.createClient(SUPABASE_URL,SUPABASE_KEY));
const EVENT_SLUG='trd-la-regional-esmeralda';
let event=null,debaterIndex=0,currentPanel='overview',staffRole=null;
const $=s=>document.querySelector(s);
const esc=(v='')=>String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
const fmtDate=v=>v?new Date(v).toLocaleString('es-DO',{dateStyle:'medium',timeStyle:'short'}):'—';
const notify=(msg,type='ok')=>{const el=$('#formMessage');if(el){el.textContent=msg;el.style.color=type==='error'?'var(--danger)':'var(--mint)'}};
