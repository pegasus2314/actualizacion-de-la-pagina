(()=>{
  const load=(src)=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });
  const base='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/';
  const current=location.hostname==='localhost'||location.hostname==='127.0.0.1'?'./':'';
  load(base+'app.js').then(()=>load(current+'centros.js')).catch(err=>console.error('TRD bootstrap',err));
})();