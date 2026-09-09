(()=>{
  'use strict';
  const source='https://raw.githubusercontent.com/pegasus2314/actualizacion-de-la-pagina/ebfc21630d70ec6b419b838899735206a51fa5bc/participants.js';
  fetch(source,{cache:'no-store'})
    .then(response=>{
      if(!response.ok)throw new Error('No se pudo cargar el módulo de participantes.');
      return response.text();
    })
    .then(code=>Function(code)())
    .catch(error=>console.error('TRD participantes:',error));
})();
