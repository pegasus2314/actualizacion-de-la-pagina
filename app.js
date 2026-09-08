(function(){
  'use strict';

  var LEGACY_SRC='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js';
  var CENTROS_SRC='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/a9f1f24ad70bb41e4e2b5f1399519307dcede875/centros.js';
  var legacyLoaded=false;
  var centrosLoading=false;

  function loadScript(src,done){
    var existing=document.querySelector('script[src="'+src+'"]');
    if(existing){done&&done();return;}
    var s=document.createElement('script');
    s.src=src;
    s.onload=function(){done&&done();};
    s.onerror=function(){console.error('No se pudo cargar',src);done&&done();};
    document.head.appendChild(s);
  }

  function ensureCentrosButton(){
    var nav=document.querySelector('.nav');
    if(!nav || nav.querySelector('[data-view="centros"]')) return;
    var a=document.createElement('a');
    a.href='#centros';
    a.dataset.view='centros';
    a.innerHTML='<span aria-hidden="true">▦</span><span>Centros educativos</span>';
    nav.appendChild(a);
  }

  function loadCentros(done){
    if(document.getElementById('centros')){done&&done();return;}
    if(centrosLoading)return;
    centrosLoading=true;
    loadScript(CENTROS_SRC,function(){centrosLoading=false;done&&done();});
  }

  function showView(id,push){
    var section=document.getElementById(id);
    if(!section)return false;
    document.querySelectorAll('.view-section').forEach(function(s){
      s.classList.toggle('view-hidden',s.id!==id);
    });
    document.querySelectorAll('[data-view]').forEach(function(a){
      if(a.closest('.nav'))a.classList.toggle('active',a.dataset.view===id);
    });
    document.body.classList.add('viewing-section');
    if(push&&location.hash!=='#'+id)history.pushState(null,'','#'+id);
    window.scrollTo(0,0);
    return true;
  }

  function bindNavigation(){
    ensureCentrosButton();

    document.addEventListener('click',function(e){
      var link=e.target.closest&&e.target.closest('[data-view]');
      if(!link)return;
      var id=link.dataset.view;

      if(id==='centros'){
        e.preventDefault();
        e.stopImmediatePropagation();
        loadCentros(function(){
          ensureCentrosButton();
          if(document.getElementById('centros'))showView('centros',true);
        });
        return;
      }

      if(document.getElementById(id)){
        e.preventDefault();
        e.stopImmediatePropagation();
        showView(id,true);
      }
    },true);

    var admin=document.getElementById('adminBtn');
    var dialog=document.getElementById('loginDialog');
    if(admin&&dialog){
      admin.addEventListener('click',function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();
      },true);
    }

    window.addEventListener('hashchange',function(){
      var id=location.hash.slice(1)||'inicio';
      if(id==='centros'){
        loadCentros(function(){showView('centros',false);});
      }else if(id==='admin'){
        var adminSection=document.getElementById('admin');
        if(adminSection)adminSection.classList.remove('hidden');
      }else{
        showView(document.getElementById(id)?id:'inicio',false);
      }
    });

    var current=location.hash.slice(1)||'inicio';
    if(current==='centros')loadCentros(function(){showView('centros',false);});
    else if(current!=='admin')showView(document.getElementById(current)?current:'inicio',false);

    var observer=new MutationObserver(function(){ensureCentrosButton();});
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function start(){
    if(legacyLoaded){bindNavigation();return;}
    legacyLoaded=true;
    loadScript(LEGACY_SRC,function(){
      bindNavigation();
      ensureCentrosButton();
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();