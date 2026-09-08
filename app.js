document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js"><\\/script>');
document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/a9f1f24ad70bb41e4e2b5f1399519307dcede875/centros.js"><\\/script>');

(function(){
  'use strict';
  var icons={inicio:'⌂',inscripcion:'▤',participantes:'♙',torneo:'◉',logistica:'⌖',centros:'⌂'};
  function ensureCentros(){
    var nav=document.querySelector('.nav');
    var section=document.getElementById('centros');
    if(!nav||!section||nav.querySelector('[data-view="centros"]')) return;
    var a=document.createElement('a');
    a.href='#centros'; a.setAttribute('data-view','centros');
    a.innerHTML='<span aria-hidden="true">'+icons.centros+'</span><span>Centros educativos</span>';
    nav.appendChild(a);
  }
  function show(id,push){
    var section=document.getElementById(id);
    if(!section) return false;
    document.querySelectorAll('.view-section').forEach(function(s){s.classList.toggle('view-hidden',s.id!==id);});
    document.querySelectorAll('.nav>a[data-view]').forEach(function(a){a.classList.toggle('active',a.dataset.view===id);});
    if(push&&location.hash!=='#'+id) history.pushState(null,'','#'+id);
    window.scrollTo(0,0);
    return true;
  }
  function init(){
    ensureCentros();
    document.addEventListener('click',function(e){
      var link=e.target.closest&&e.target.closest('.nav>a[data-view]');
      if(link){
        var id=link.dataset.view;
        if(document.getElementById(id)){e.preventDefault();e.stopPropagation();show(id,true);}
      }
    },true);
    var admin=document.getElementById('adminBtn');
    var dialog=document.getElementById('loginDialog');
    if(admin&&dialog) admin.addEventListener('click',function(e){e.preventDefault();if(dialog.showModal&&!dialog.open)dialog.showModal();},true);
    var id=location.hash.replace(/^#/,'')||'inicio';
    if(id==='admin') { var sec=document.getElementById('admin'); if(sec) sec.classList.remove('hidden'); }
    else show(document.getElementById(id)?id:'inicio',false);
    setTimeout(ensureCentros,300);
    setTimeout(ensureCentros,1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();