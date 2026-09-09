(()=>{
  const restoreViews=()=>{
    const main=document.querySelector('main');
    const sections=[...document.querySelectorAll('.view-section')];
    if(main) main.style.display='block';
    if(!sections.length)return;
    const visible=sections.some(s=>getComputedStyle(s).display!=='none' && !s.classList.contains('view-hidden'));
    if(!visible){
      sections.forEach(s=>s.classList.remove('view-hidden'));
      const home=document.getElementById('inicio');
      sections.forEach(s=>{s.style.display=s===home?'block':'none'});
      document.body.classList.add('viewing-section');
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',restoreViews,{once:true}); else restoreViews();
  setTimeout(restoreViews,300);
  setTimeout(restoreViews,1200);

  const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
  const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
  const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const role=r=>r==='alternate'?'Suplente':'Debatiente';
  const origin=location.href.split('#')[0].replace(/index\.html?$/,'');
  const qrUrl=id=>origin+'acreditacion.html?type=participant&id='+encodeURIComponent(id);

  function openQr(p){
    if(!p?.id)return;
    document.querySelector('#teamMemberQrDialog')?.remove();
    const d=document.createElement('dialog');d.id='teamMemberQrDialog';d.className='qr-dialog';
    const name=p.full_name||`${p.first_name||''} ${p.last_name||''}`.trim()||'Participante';
    d.innerHTML=`<div class="qr-card team-member-qr-card"><button class="close" type="button" aria-label="Cerrar">×</button><span class="eyebrow">ACREDITACIÓN QR</span><h2>${esc(name)}</h2><p>${esc(p.team_name||'')} · ${esc(role(p.role))}</p><div class="qr-code"></div><div class="team-member-qr-data"><span>Centro: ${esc(p.school_name||'—')}</span><span>Distrito: ${esc(p.district||'—')}</span><span>Estado: ${esc(p.accreditation_status==='accredited'?'Acreditado':p.accreditation_status==='rejected'?'Rechazado':'Pendiente')}</span></div><small>Este QR identifica al participante mediante su ficha pública de acreditación. Los datos sensibles no se incluyen en el código.</small><div class="qr-actions"><button class="btn primary" type="button" data-download-team-qr>Descargar QR</button></div></div>`;
    document.body.appendChild(d);
    d.querySelector('.close').onclick=()=>{d.close();d.remove()};
    d.addEventListener('click',e=>{if(e.target===d){d.close();d.remove()}});
    d.showModal();
    if(window.QRCode){
      new QRCode(d.querySelector('.qr-code'),{text:qrUrl(p.id),width:220,height:220,correctLevel:QRCode.CorrectLevel.H});
      d.querySelector('[data-download-team-qr]').onclick=()=>{const q=d.querySelector('.qr-code'),img=q.querySelector('img'),canvas=q.querySelector('canvas'),a=document.createElement('a');a.href=canvas?canvas.toDataURL('image/png'):img?.src||'';a.download='QR-'+name.replace(/[^a-z0-9áéíóúñü]+/gi,'-')+'.png';a.click()};
    }else d.querySelector('.qr-code').textContent='No se pudo cargar el generador QR.';
  }

  function decorateMembers(dialog,teamId,members){
    const box=dialog.querySelector('.team-ficha-members');
    if(!box)return;
    box.classList.add('team-member-detail-grid');
    box.innerHTML=members.length?members.map((p,i)=>`<article class="team-member-detail"><div class="team-member-detail-top"><span class="team-ficha-number">${String(i+1).padStart(2,'0')}</span><div class="team-member-detail-name"><strong>${esc(p.full_name||'Sin nombre')}</strong><span>${esc(role(p.role))}${p.accreditation_status?' · '+esc(p.accreditation_status==='accredited'?'Acreditado':p.accreditation_status==='rejected'?'Rechazado':'Pendiente'):''}</span></div><button type="button" class="qr-btn team-member-qr-btn" data-member-qr="${esc(p.id)}">QR</button></div><div class="team-member-detail-fields"><div><small>Correo</small><strong>${esc(p.email||'—')}</strong></div><div><small>Teléfono</small><strong>${esc(p.phone||'—')}</strong></div><div><small>Grado</small><strong>${esc(p.grade||'—')}</strong></div><div><small>Centro</small><strong>${esc(p.school_name||'—')}</strong></div><div><small>Distrito</small><strong>${esc(p.district||'—')}</strong></div><div><small>Cédula</small><strong>${esc(p.id_number||'—')}</strong></div><div><small>Alergias</small><strong>${esc(p.allergies||'Ninguna registrada')}</strong></div><div><small>Medicamentos</small><strong>${esc(p.medications||'Ninguno registrado')}</strong></div></div></article>`).join(''):'<div class="team-ficha-empty">No hay integrantes registrados.</div>';
    box.querySelectorAll('[data-member-qr]').forEach(btn=>btn.addEventListener('click',()=>{const p=members.find(x=>x.id===btn.dataset.memberQr);if(p)openQr({...p,team_id:teamId})}));
  }

  async function enhance(dialog){
    if(!dialog||dialog.dataset.membersLoaded==='1')return;
    const id=dialog.querySelector('[data-action="approve"]')?.dataset.id||dialog.querySelector('[data-action="reject"]')?.dataset.id;
    if(!id)return;
    dialog.dataset.membersLoaded='1';
    const {data,error}=await db.from('esmeralda_debaters').select('id,first_name,last_name,full_name,email,phone,grade,role,school_name,district,id_number,allergies,medications,accreditation_status').eq('team_id',id).order('created_at');
    if(error){console.error('team-ficha-qr',error);dialog.dataset.membersLoaded='';return}
    const members=(data||[]).map(p=>({...p,team_id:id}));
    const count=dialog.querySelector('.team-ficha-section-title .team-ficha-count');if(count)count.textContent=`${members.length} ${members.length===1?'integrante':'integrantes'}`;
    decorateMembers(dialog,id,members);
  }

  const observer=new MutationObserver(()=>{const d=document.querySelector('#teamDetailDialog');if(d?.open)enhance(d)});
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('click',e=>{const btn=e.target.closest('[data-action="view-team"]');if(btn)setTimeout(()=>{const d=document.querySelector('#teamDetailDialog');if(d)enhance(d)},80)});

  const style=document.createElement('style');
  style.textContent=`
.team-member-detail-grid{grid-template-columns:1fr!important;gap:10px!important}
.team-member-detail{padding:13px;border:1px solid rgba(182,231,255,.08);border-radius:15px;background:rgba(255,255,255,.025)}
.team-member-detail-top{display:flex;align-items:center;gap:10px;min-width:0}
.team-member-detail-name{min-width:0;flex:1}.team-member-detail-name strong,.team-member-detail-name span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.team-member-detail-name strong{font-size:13px}.team-member-detail-name span{margin-top:3px;color:#7f99a7;font-size:10px}
.team-member-qr-btn{flex:0 0 auto;min-width:48px}
.team-member-detail-fields{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(182,231,255,.06)}
.team-member-detail-fields>div{min-width:0;padding:8px 9px;border-radius:10px;background:rgba(182,231,255,.025)}.team-member-detail-fields small,.team-member-detail-fields strong{display:block}.team-member-detail-fields small{color:#6f8a9a;font-size:8px;text-transform:uppercase;letter-spacing:.07em;font-weight:800}.team-member-detail-fields strong{margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#d9edf2;font-size:10px}
.team-member-qr-card .team-member-qr-data{display:grid;gap:4px;margin:-6px 0 14px;color:#8fa8b6;font-size:10px}.team-member-qr-card .team-member-qr-data span{display:block}
@media(max-width:720px){.team-member-detail-fields{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:430px){.team-member-detail-fields{grid-template-columns:1fr}}

.trd-registration-success{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:rgba(1,8,15,.78);backdrop-filter:blur(8px)}
.trd-registration-success[hidden]{display:none}
.trd-registration-card{width:min(560px,100%);padding:34px;border:1px solid rgba(182,231,255,.14);border-radius:26px;background:linear-gradient(145deg,#0b2639,#061823);color:#eef8fb;text-align:center;box-shadow:0 30px 100px rgba(0,0,0,.5)}
.trd-registration-check{width:68px;height:68px;margin:0 auto 18px;display:grid;place-items:center;border-radius:50%;background:rgba(64,220,159,.10);border:1px solid rgba(64,220,159,.3);color:#42dc9f;font-size:34px}
.trd-registration-card .eyebrow{display:block}.trd-registration-card h2{margin:8px 0 10px;font-family:'Barlow Condensed',Barlow,sans-serif;font-size:36px}.trd-registration-card p{margin:0;color:#a9bec9;line-height:1.65;font-size:13px}.trd-registration-status{display:flex;align-items:center;justify-content:center;gap:9px;margin:22px 0;padding:13px 16px;border-radius:13px;background:rgba(25,220,229,.055);border:1px solid rgba(25,220,229,.13);font-size:12px}.trd-registration-status b{color:#f0c95a}.trd-registration-card .btn{margin-top:20px}
`;
  document.head.appendChild(style);

  function showRegistrationSuccess(){
    let modal=document.querySelector('#trdRegistrationSuccess');
    if(!modal){
      modal=document.createElement('div');modal.id='trdRegistrationSuccess';modal.className='trd-registration-success';modal.hidden=true;
      modal.innerHTML=`<div class="trd-registration-card" role="dialog" aria-modal="true" aria-labelledby="trdRegistrationSuccessTitle"><div class="trd-registration-check">✓</div><span class="eyebrow">TRD LA REGIONAL ESMERALDA</span><h2 id="trdRegistrationSuccessTitle">¡Solicitud enviada!</h2><p>Hemos recibido correctamente tu solicitud de participación en el <strong>Torneo Regional de Debate de la Regional 17</strong>.</p><div class="trd-registration-status"><span>●</span><b> Pendiente de revisión</b></div><p>Tu información será revisada por el equipo organizador. Cuando tu solicitud sea aprobada, recibirás una comunicación en el correo electrónico proporcionado.</p><button type="button" class="btn primary" data-close-registration-success>Entendido</button></div>`;
      document.body.appendChild(modal);
      modal.querySelector('[data-close-registration-success]').onclick=()=>{modal.hidden=true};
      modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});
    }
    modal.hidden=false;
  }

  let lastRegistrationMessage='';
  function checkRegistrationMessage(){
    const message=document.querySelector('#formMessage');
    if(!message)return;
    const text=(message.textContent||'').replace(/\s+/g,' ').trim();
    const isSuccess=/inscripci[oó]n enviada/i.test(text);
    if(isSuccess && text!==lastRegistrationMessage)showRegistrationSuccess();
    lastRegistrationMessage=text;
  }
  const registrationMessageObserver=new MutationObserver(checkRegistrationMessage);
  registrationMessageObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',checkRegistrationMessage);else checkRegistrationMessage();

  const participantScript=document.createElement('script');
  participantScript.src='participants-details.js';
  participantScript.async=false;
  document.head.appendChild(participantScript);

  const roleScript=document.createElement('script');
  roleScript.src='role-access.js';
  roleScript.async=false;
  document.head.appendChild(roleScript);

  // Refuerzo de las pestañas PARTICIPANTES / EQUIPOS.
  // Se carga después de participants-details.js para evitar que estilos globales
  // vuelvan a mostrar ambos paneles a la vez.
  const tabsFix=document.createElement('script');
  tabsFix.src='participants-tabs-fix.js';
  tabsFix.async=false;
  document.head.appendChild(tabsFix);
})();
