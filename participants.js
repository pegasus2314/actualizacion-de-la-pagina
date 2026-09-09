(()=>{
  'use strict';
  const loadLocal=(src)=>new Promise((resolve,reject)=>{
    if(document.querySelector(`script[src="${src}"]`)){resolve();return}
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });
  const start=async()=>{
    try{
      await loadLocal('./participants-details.js');
      await loadLocal('./admin-fix.js');
      window.__TRDReloadParticipants=()=>{
        const grid=document.querySelector('#teamsGrid');
        if(grid)grid.dispatchEvent(new CustomEvent('trd:reload-participants'));
        window.location.reload();
      };
    }catch(error){
      console.error('TRD módulos:',error);
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
