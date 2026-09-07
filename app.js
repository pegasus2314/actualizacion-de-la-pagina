document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/d452a602318416ad2e818078ff27592284f148df/app.js"><\/script>');
document.write('<script src="https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/a9f1f24ad70bb41e4e2b5f1399519307dcede875/centros.js"><\/script>');

// Restauración del acceso de Administración: utiliza el login original de Supabase.
// No sustituye ni intercepta adminLogin(); únicamente garantiza que el botón abra el diálogo.
(function(){
  function bindAdminButton(){
    var btn=document.getElementById('adminBtn');
    var dialog=document.getElementById('loginDialog');
    if(!btn||!dialog)return false;
    if(btn.dataset.trdAdminBound==='1')return true;
    btn.dataset.trdAdminBound='1';
    btn.type='button';
    btn.addEventListener('click',function(){
      if(typeof dialog.showModal==='function' && !dialog.open) dialog.showModal();
      else dialog.setAttribute('open','');
    });
    return true;
  }
  if(!bindAdminButton()){
    document.addEventListener('DOMContentLoaded',bindAdminButton,{once:true});
    var tries=0;
    var timer=setInterval(function(){
      if(bindAdminButton()||++tries>30)clearInterval(timer);
    },100);
  }
})();