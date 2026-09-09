(()=>{
  'use strict';
  const SUPABASE_CDN='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  const SUPABASE_URL='https://bstdgcpakqmltifzaqso.supabase.co';
  const SUPABASE_KEY='sb_publishable_-39OPIl11i5GSPBbF3q0ew_puLiVK7N';
  const EVENT_ID='0f2469a3-e670-4fb9-a183-d0db60526372';

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
