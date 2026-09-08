document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js"><\\/script>');

(function(){
  'use strict';
  var CENTROS_SRC='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/a9f1f24ad70bb41e4e2b5f1399519307dcede875/centros.js';
  var centrosLoading=false;

  function ensureCentrosButton(){
    var nav=document.querySelector('.nav');
    if(!nav || nav.querySelector('[data-view="centros"]')) return;
    var a=document.createElement('a');
    a.href='#centros';
    a.setAttribute('data-view','centros');
    a.innerHTML='<span aria-hidden="true">▦</span><span>Centros educativos</span>';
    nav.appendChild(a);
  }

  function loadCentros(){
    if(document.getElementById('centros')) return Promise.resolve();
    if(centrosLoading) return Promise.resolve();
    centrosLoading=true;
    return new Promise(function(resolve){
      var s=document.createElement('script');
      s.src=CENTROS_SRC;
      s.onload=function(){centrosLoading=false;resolve();};
      s.onerror=function(){centrosLoading=false;resolve();};
      document.head.appendChild(s);
    });
  }

  function show(id,push){
    var section=document.getElementById(id);
    if(!section) return false;
    document.querySelectorAll('.view-section').forEach(function(s){s.classList.toggle('view-hidden',s.id!==id);});
    document.querySelectorAll('.nav>a[data-view]').forEach(function(a){a.classList.toggle('active',a.dataset.view===id);});
    if(push&&location.hash!=='#'+id) history.pushState(null,'','#'+id);
    document.body.classList.add('viewing-section');
    window.scrollTo(0,0);
    return true;
  }

  function init(){
    ensureCentrosButton();

    document.addEventListener('click',function(e){
      var link=e.target.closest&&e.target.closest('.nav>a[data-view]');
      if(!link) return;
      var id=link.dataset.view;
      if(id==='centros'){
        e.preventDefault();
        e.stopImmediatePropagation();
        loadCentros().then(function(){
          var section=document.getElementById('centros');
          if(section){
            history.pushState(null,'','#centros');
            show('centros',false);
          }
        });
        return;
      }
      if(document.getElementById(id)){
        e.preventDefault();
        e.stopPropagation();
        show(id,true);
      }
    },true);

    var admin=document.getElementById('adminBtn');
    var dialog=document.getElementById('loginDialog');
    if(admin&&dialog) admin.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      if(dialog.showModal&&!dialog.open) dialog.showModal();
    },true);

    var id=location.hash.replace(/^#/,'')||'inicio';
    if(id==='centros'){
      loadCentros().then(function(){
        if(document.getElementById('centros')) show('centros',false);
      });
    }else if(id==='admin'){
      var sec=document.getElementById('admin');
      if(sec) sec.classList.remove('hidden');
    }else{
      show(document.getElementById(id)?id:'inicio',false);
    }

    var observer=new MutationObserver(function(){ensureCentrosButton();});
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
