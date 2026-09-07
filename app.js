document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js"><\/script>');
document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/a9f1f24ad70bb41e4e2b5f1399519307dcede875/centros.js"><\/script>');

// Restauración del acceso de Administración: utiliza el login original de Supabase.
// No crea un sistema nuevo ni reemplaza adminLogin(); solo conecta el formulario al handler existente.
(function(){
  function bindAdmin(){
    var btn=document.getElementById('adminBtn');
    var dialog=document.getElementById('loginDialog');
    var form=document.getElementById('loginForm');
    if(!btn||!dialog||!form)return false;

    if(btn.dataset.trdAdminBound!=='1'){
      btn.dataset.trdAdminBound='1';
      btn.type='button';
      btn.addEventListener('click',function(){
        if(typeof dialog.showModal==='function' && !dialog.open) dialog.showModal();
        else dialog.setAttribute('open','');
      });
    }

    if(form.dataset.trdLoginBound!=='1' && typeof window.adminLogin==='function'){
      form.dataset.trdLoginBound='1';
      form.addEventListener('submit',function(e){
        window.adminLogin(e);
      });
    }
    return true;
  }

  if(!bindAdmin()){
    document.addEventListener('DOMContentLoaded',bindAdmin,{once:true});
    var tries=0;
    var timer=setInterval(function(){
      if(bindAdmin()||++tries>50)clearInterval(timer);
    },100);
  }
})();