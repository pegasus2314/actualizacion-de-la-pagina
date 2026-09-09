(()=>{
  'use strict';

  const CORE='./app-core.js';
  const EVENT_ID='0f2469a3-e670-4fb9-a183-d0db60526372';

  const loadScript=(src)=>new Promise((resolve,reject)=>{
    const existing=document.querySelector(`script[src="${src}"]`);
    if(existing){resolve();return;}
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.onload=resolve;
    script.onerror=()=>reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });

  const refreshPublic=()=>{
    try{
      if(typeof window.loadStats==='function') window.loadStats();
      if(typeof window.loadPublicTeams==='function') window.loadPublicTeams();
    }catch(error){
      console.error('TRD realtime refresh público',error);
    }
    window.dispatchEvent(new CustomEvent('trd:data-changed'));
    const grid=document.querySelector('#teamsGrid');
    if(grid) grid.dispatchEvent(new CustomEvent('trd:reload-participants'));
  };

  const refreshAdmin=()=>{
    try{
      if(typeof window.loadAdmin==='function' && window.location.hash==='#admin') window.loadAdmin();
    }catch(error){
      console.error('TRD realtime refresh admin',error);
    }
    window.dispatchEvent(new CustomEvent('trd:admin-data-changed'));
  };

  const setupRealtime=()=>{
    const client=window.__TRD_DB;
    if(!client || typeof client.channel!=='function'){
      console.warn('TRD realtime: cliente Supabase no disponible todavía');
      return;
    }
    if(window.__TRD_REALTIME_CHANNEL) return;

    const channel=client.channel('trd-esmeralda-live')
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_teams',filter:`event_id=eq.${EVENT_ID}`},()=>{refreshPublic();refreshAdmin();})
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_debaters'},()=>{refreshPublic();refreshAdmin();})
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_registrations',filter:`event_id=eq.${EVENT_ID}`},()=>{refreshPublic();refreshAdmin();})
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_rounds',filter:`event_id=eq.${EVENT_ID}`},()=>{refreshPublic();refreshAdmin();})
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_matches'},()=>{refreshPublic();refreshAdmin();})
      .on('postgres_changes',{event:'*',schema:'public',table:'esmeralda_announcements',filter:`event_id=eq.${EVENT_ID}`},()=>{refreshPublic();refreshAdmin();})
      .subscribe((status)=>{
        console.log('TRD realtime:',status);
        if(status==='SUBSCRIBED') window.dispatchEvent(new CustomEvent('trd:realtime-ready'));
      });

    window.__TRD_REALTIME_CHANNEL=channel;
  };

  const decorateNavigation=()=>{
    document.querySelectorAll('.nav a[data-view]').forEach((link)=>{
      link.addEventListener('click',()=>setTimeout(refreshPublic,0),{passive:true});
    });
  };

  const start=async()=>{
    try{
      if(!window.__TRD_DB && typeof window.supabase!=='undefined') await loadScript(CORE);
      console.log('TRD core local cargado correctamente');
      setupRealtime();
      decorateNavigation();
    }catch(error){
      console.error('TRD core/realtime:',error);
    }
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
