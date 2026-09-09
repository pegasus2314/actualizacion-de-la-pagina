(()=>{
  'use strict';
  const SUPABASE_CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
  const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
  const EVENT_ID='0f2469a3-e670-4fb9-a183-d0db60526372';

  const icon=(name)=>{
    const paths={
      home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
      clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8 9h8M8 13h8M8 17h5"/>',
      users:'<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M17 11a4 4 0 0 0 0-8M21 21v-2a4 4 0 0 0-3-3.87"/>',
      trophy:'<path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 12v5M8 21h8M9 17h6"/>',
      pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2v-.48a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7v-2h.84A1.7 1.7 0 0 0 9.4 10a1.7 1.7 0 0 0-.34-1.88L9 8.06l1.42-1.42.06.06A1.7 1.7 0 0 0 12.36 7.04 1.7 1.7 0 0 0 13.4 5.48V5h2v.48A1.7 1.7 0 0 0 16.43 7.04a1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06A1.7 1.7 0 0 0 19.4 10c.2.62.77 1.03 1.42 1.03H21v2h-.18A1.7 1.7 0 0 0 19.4 15Z"/>'
    };
    return `<svg class="trd-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]||''}</svg>`;
  };

  const replaceLeadingIcon=(el,name)=>{
    if(!el)return;
    const existing=el.querySelector(':scope > .trd-icon');
    if(existing)return;
    const text=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
    const symbols=/^[⌂▤♙◉⌖♟⚙]+(?:\s|&nbsp;| )*$/;
    [...el.childNodes].forEach(n=>{
      if(n.nodeType===3&&symbols.test(n.textContent.trim()))n.remove();
    });
    el.insertAdjacentHTML('afterbegin',icon(name));
  };

  const restoreIcons=()=>{
    if(document.documentElement.dataset.trdIcons==='1')return;
    document.documentElement.dataset.trdIcons='1';
    const css=document.createElement('style');
    css.textContent='.trd-icon{width:18px;height:18px;display:inline-block;vertical-align:-4px;flex:0 0 auto}.nav a{display:inline-flex;align-items:center;gap:7px}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px}.competition-card>span,.logistics-icon,.logistics-item>span{font-size:0}.competition-card>span .trd-icon{width:22px;height:22px}.logistics-icon .trd-icon{width:21px;height:21px}.logistics-item>span .trd-icon{width:16px;height:16px}.hero-actions .trd-icon{width:17px;height:17px}.top-actions .trd-icon{width:16px;height:16px}';
    document.head.appendChild(css);

    const navIcons={Inicio:'home',Inscripción:'clipboard',Participantes:'users','El torneo':'trophy',Logística:'pin'};
    document.querySelectorAll('.nav a[data-view]').forEach(a=>{
      const label=a.querySelector('span')?.textContent.trim();
      if(navIcons[label])replaceLeadingIcon(a,navIcons[label]);
    });

    replaceLeadingIcon(document.querySelector('#adminBtn'),'settings');

    document.querySelectorAll('.hero-actions a.btn').forEach(a=>{
      const name=a.textContent.includes('Inscribir')?'trophy':'users';
      replaceLeadingIcon(a,name);
    });

    const cardIcons=['clipboard','users','trophy','pin'];
    document.querySelectorAll('.competition-card').forEach((card,index)=>{
      const span=card.querySelector(':scope>span');
      if(span)span.innerHTML=icon(cardIcons[index]||'trophy');
    });
  };

  const bindAdminButton=()=>{
    const admin=document.querySelector('#adminBtn');
    const dialog=document.querySelector('#loginDialog');
    if(admin&&dialog&&!admin.dataset.trdAdminBound){
      admin.dataset.trdAdminBound='1';
      admin.addEventListener('click',e=>{e.preventDefault();dialog.showModal?.();dialog.classList.remove('hidden');});
    }
  };

  const loadSupabase=()=>new Promise((resolve,reject)=>{
    if(window.supabase&&typeof window.supabase.createClient==='function')return resolve();
    const existing=document.querySelector(`script[src="${SUPABASE_CDN}"]`);
    if(existing){
      existing.addEventListener('load',resolve,{once:true});
      existing.addEventListener('error',()=>reject(new Error('No se pudo cargar Supabase JS')),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src=SUPABASE_CDN;
    script.async=false;
    script.onload=resolve;
    script.onerror=()=>reject(new Error('No se pudo cargar Supabase JS'));
    document.head.appendChild(script);
  });

  const ensureClient=async()=>{
    if(window.__TRD_DB&&typeof window.__TRD_DB.channel==='function')return window.__TRD_DB;
    await loadSupabase();
    if(!window.supabase||typeof window.supabase.createClient!=='function')throw new Error('La librería de Supabase no está disponible');
    return window.__TRD_DB||(window.__TRD_DB=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY));
  };

  const refreshPublic=()=>{
    try{
      if(typeof window.loadStats==='function')window.loadStats();
      if(typeof window.loadPublicTeams==='function')window.loadPublicTeams();
    }catch(error){console.error('TRD realtime refresh público',error)}
    window.dispatchEvent(new CustomEvent('trd:data-changed'));
    const grid=document.querySelector('#teamsGrid');
    if(grid)grid.dispatchEvent(new CustomEvent('trd:reload-participants'));
  };

  const refreshAdmin=()=>{
    try{
      if(typeof window.loadAdmin==='function'&&window.location.hash==='#admin')window.loadAdmin();
    }catch(error){console.error('TRD realtime refresh admin',error)}
    window.dispatchEvent(new CustomEvent('trd:admin-data-changed'));
  };

  const setupRealtime=(client)=>{
    if(!client||typeof client.channel!=='function')return;
    if(window.__TRD_REALTIME_CHANNEL)return;
    const channel=client.channel('trd-esmeralda-live')
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_teams',filter:`event_id=eq.${EVENT_ID}`},()=>{refreshPublic();refreshAdmin()})
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_debaters'},()=>{refreshPublic();refreshAdmin()})
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_registrations',filter:`event_id=eq.${EVENT_ID}`},()=>{refreshPublic();refreshAdmin()})
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_rounds',filter:`event_id=eq.${EVENT_ID}`},()=>{refreshPublic();refreshAdmin()})
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_matches'},()=>{refreshPublic();refreshAdmin()})
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_announcements',filter:`event_id=eq.${EVENT_ID}`},()=>{refreshPublic();refreshAdmin()})
      .subscribe(status=>{
        console.log('TRD realtime:',status);
        if(status==='SUBSCRIBED')window.dispatchEvent(new CustomEvent('trd:realtime-ready'));
      });
    window.__TRD_REALTIME_CHANNEL=channel;
  };

  const decorateNavigation=()=>{
    document.querySelectorAll('.nav a[data-view]').forEach(link=>link.addEventListener('click',()=>setTimeout(refreshPublic,0),{passive:true}));
  };

  const start=async()=>{
    restoreIcons();
    bindAdminButton();
    try{
      const client=await ensureClient();
      console.log('TRD Supabase local cargado correctamente');
      setupRealtime(client);
      decorateNavigation();
    }catch(error){
      console.error('TRD Supabase/realtime:',error);
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
