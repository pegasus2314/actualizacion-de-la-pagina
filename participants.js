(()=>{
  const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
  const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
  const publicDb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const role=r=>r==='alternate'?'Suplente':'Debatiente';
  const origin=location.href.split('#')[0].replace(/index\.html?$/,'');
  const qrUrl=id=>origin+'participant.html?id='+encodeURIComponent(id);
  let participantsCache=[];

  function qrCard(p){
    const box=document.createElement('dialog');box.className='qr-dialog';box.innerHTML=`<div class="qr-card"><button class="close" type="button">×</button><span class="eyebrow">CÓDIGO DEL PARTICIPANTE</span><h2>${esc(p.full_name)}</h2><p>${esc(p.team_name)} · ${esc(p.school_name)}</p><div class="qr-code"></div><small>Escanea este código para abrir la ficha del participante.</small><div class="qr-actions"><button class="btn primary" type="button" data-download-qr>Descargar QR</button></div></div>`;
    document.body.appendChild(box);box.querySelector('.close').onclick=()=>box.close();box.addEventListener('click',e=>{if(e.target===box)box.close()});box.showModal();
    const qr=box.querySelector('.qr-code');new QRCode(qr,{text:qrUrl(p.id),width:220,height:220,correctLevel:QRCode.CorrectLevel.H});
    box.querySelector('[data-download-qr]').onclick=()=>{const canvas=qr.querySelector('canvas'),img=qr.querySelector('img'),a=document.createElement('a');a.href=canvas?canvas.toDataURL('image/png'):img.src;a.download='QR-'+p.full_name.replace(/[^a-z0-9áéíóúñü]+/gi,'-')+'.png';a.click()};
  }

  async function renderParticipants(){
    const grid=document.querySelector('#teamsGrid');if(!grid)return;
    grid.innerHTML='<div class="empty">Cargando participantes…</div>';
    const {data:eventData,error:e}=await publicDb.from('esmeralda_events').select('id').eq('slug','trd-la-regional-esmeralda').maybeSingle();
    if(e||!eventData){grid.innerHTML='<div class="empty">No hay un evento disponible.</div>';return}
    const {data,error}=await publicDb.rpc('get_esmeralda_public_debaters',{p_event_id:eventData.id});
    if(error){console.error(error);grid.innerHTML='<div class="empty">No se pudieron cargar los participantes.</div>';return}
    participantsCache=data||[];
    const groups=new Map();participantsCache.forEach(p=>{if(!groups.has(p.team_id))groups.set(p.team_id,{team_name:p.team_name,school_name:p.school_name,district:p.district,members:[]});groups.get(p.team_id).members.push(p)});
    grid.classList.add('participants-grid');
    grid.innerHTML=groups.size?[...groups.values()].map(team=>`<article class="participant-team"><header><div><span class="eyebrow">EQUIPO APROBADO</span><h3>${esc(team.team_name)}</h3><p>${esc(team.school_name)}${team.district?' · '+esc(team.district):''}</p></div><span class="member-count">${team.members.length} ${team.members.length===1?'participante':'participantes'}</span></header><ol>${team.members.map((p,i)=>`<li><span class="participant-number">${i+1}</span><div class="participant-info"><strong>${esc(p.full_name)}</strong><small>${esc(role(p.role))}${p.grade?' · '+esc(p.grade):''}</small></div><button class="qr-btn" type="button" data-qr-id="${esc(p.id)}">QR</button></li>`).join('')}</ol></article>`).join(''):'<div class="empty">Aún no hay participantes de equipos aprobados.</div>';
  }

  async function renderPairing(){
    const panel=document.querySelector('#adminPanel');if(!panel)return;
    panel.innerHTML=`<div class="admin-toolbar"><div><h3>Generador de parejas</h3><p>Mezcla los participantes aprobados y crea parejas automáticamente.</p></div><button class="btn primary small" data-action="generate-pairs">↻ Generar parejas</button></div><div id="pairingOutput" class="pairing-output"><div class="empty">Pulsa «Generar parejas» para crear la primera combinación.</div></div>`;
    await generatePairs();
  }
  async function generatePairs(){
    const out=document.querySelector('#pairingOutput');if(!out)return;out.innerHTML='<div class="empty">Preparando participantes…</div>';
    const {data:eventData}=await publicDb.from('esmeralda_events').select('id').eq('slug','trd-la-regional-esmeralda').maybeSingle();
    if(!eventData){out.innerHTML='<div class="empty">No hay un evento disponible.</div>';return}
    const {data,error}=await publicDb.rpc('get_esmeralda_public_debaters',{p_event_id:eventData.id});
    if(error||!data?.length){out.innerHTML='<div class="empty">No hay suficientes participantes aprobados para generar parejas.</div>';return}
    let list=[...data];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}
    const pairs=[],leftovers=[];
    while(list.length){const a=list.shift();let index=list.findIndex(x=>x.team_id!==a.team_id);if(index<0)index=0;const b=list.splice(index,1)[0];if(b)pairs.push([a,b]);else leftovers.push(a)}
    out.innerHTML=`<div class="pairing-meta"><strong>${pairs.length} parejas generadas</strong><span>Participantes mezclados al azar</span></div><div class="pairing-grid">${pairs.map((pair,i)=>`<article class="pair-card"><span>PAREJA ${String(i+1).padStart(2,'0')}</span><div><b>${esc(pair[0].full_name)}</b><small>${esc(pair[0].team_name)}</small></div><em>VS</em><div><b>${esc(pair[1].full_name)}</b><small>${esc(pair[1].team_name)}</small></div></article>`).join('')}${leftovers.map(p=>`<article class="pair-card single"><span>PARTICIPANTE SIN PAREJA</span><div><b>${esc(p.full_name)}</b><small>${esc(p.team_name)}</small></div></article>`).join('')}</div>`;
  }

  document.addEventListener('click',e=>{
    const qr=e.target.closest('[data-qr-id]');if(qr){const p=participantsCache.find(x=>x.id===qr.dataset.qrId);if(p)qrCard(p);return}
    const participantView=e.target.closest('[data-view="participantes"]');if(participantView){setTimeout(renderParticipants,80)}
    const pairBtn=e.target.closest('[data-panel="pairing"]');if(pairBtn){setTimeout(renderPairing,0);return}
    if(e.target.closest('[data-action="generate-pairs"]'))generatePairs();
  });
  window.addEventListener('hashchange',()=>{if(location.hash==='#participantes')setTimeout(renderParticipants,60)});
  window.addEventListener('load',()=>{if(location.hash==='#participantes')setTimeout(renderParticipants,120)});
  setTimeout(()=>{if(location.hash==='#participantes')renderParticipants()},180);
})();