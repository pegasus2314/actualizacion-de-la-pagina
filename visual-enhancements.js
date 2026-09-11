(()=>{'use strict';
// Nunca crea su propio cliente de Supabase: reutiliza siempre window.__TRD_DB
// (inicializado por app.js) para evitar múltiples instancias de GoTrueClient
// compitiendo por la misma sesión en el mismo storage key.
function getClient(){return window.__TRD_DB||null}
function eventId(){const client=getClient();if(!client)return Promise.resolve(null);return client.from('esmeralda_events').select('id').eq('slug','trd-la-regional-esmeralda').maybeSingle().then(r=>r.data?.id||null)}
function setupField(input,kind){if(!input||input.dataset.trdSchoolReady)return;input.dataset.trdSchoolReady='1';const box=document.createElement('div');box.className='trd-school-people';input.insertAdjacentElement('afterend',box);let timer;const update=()=>{const client=getClient();if(!client)return;const school=input.value.trim();clearTimeout(timer);if(!school){box.innerHTML='';box.classList.remove('show');return}box.classList.add('show');box.innerHTML='<span class="trd-school-loading">Consultando participantes registrados…</span>';timer=setTimeout(async()=>{try{const eid=await eventId();if(!eid)return;const {data,error}=await client.rpc('trd_school_participant_count',{p_event_id:eid,p_school_name:school});if(error)throw error;const count=Number(data?.count||0);box.innerHTML=`<strong>${count}</strong><span>${count===1?'participante registrado':'participantes registrados'} de este centro</span>${kind==='coach'?'<small>Dato informativo del centro.</small>':''}`}catch(err){console.error('school count',err);box.innerHTML='<span class="trd-school-muted">No se pudo consultar el registro ahora.</span>'}},180)};input.addEventListener('input',update);input.addEventListener('change',update);input.addEventListener('blur',update)}
function init(){
  // Los estilos de .trd-school-people viven en styles.css (sistema de
  // diseño compartido); este archivo ya no inyecta su propia hoja de estilos.
  setupField(document.querySelector('#registrationForm input[name="school_name"]'),'school');
  setupField(document.querySelector('#registrationForm input[name="coach_school"]'),'coach')
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();new MutationObserver(init).observe(document.body,{childList:true,subtree:true});
})();