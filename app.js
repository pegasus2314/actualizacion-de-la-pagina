(()=>{
  const load=(src)=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });
  const legacy='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js';
  const centers='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/main/centros.js';
  load(legacy).then(()=>load(centers)).catch(err=>console.error('TRD bootstrap',err));
})();