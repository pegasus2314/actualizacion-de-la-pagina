(()=>{
  'use strict';

  const apply=()=>{
    const grid=document.querySelector('#teamsGrid');
    if(!grid)return;
    const tabs=[...grid.querySelectorAll('[data-participants-tab]')];
    const panes=[...grid.querySelectorAll('[data-participants-pane]')];
    if(!tabs.length||!panes.length)return;
    const active=tabs.find(t=>t.classList.contains('active'))||tabs[0];
    const target=active.dataset.participantsTab||'people';
    tabs.forEach(tab=>{
      const on=tab.dataset.participantsTab===target;
      tab.classList.toggle('active',on);
      tab.setAttribute('aria-selected',on?'true':'false');
    });
    panes.forEach(pane=>{
      const on=pane.dataset.participantsPane===target;
      pane.hidden=!on;
      pane.setAttribute('aria-hidden',on?'false':'true');
      pane.classList.toggle('is-tab-active',on);
      pane.classList.toggle('is-tab-hidden',!on);
    });
  };

  const install=()=>{
    const grid=document.querySelector('#teamsGrid');
    if(!grid||grid.dataset.tabsFixInstalled==='1')return;
    grid.dataset.tabsFixInstalled='1';
    grid.addEventListener('click',event=>{
      const tab=event.target.closest('[data-participants-tab]');
      if(!tab||!grid.contains(tab))return;
      event.preventDefault();
      grid.querySelectorAll('[data-participants-tab]').forEach(x=>x.classList.toggle('active',x===tab));
      apply();
    });
    apply();
    // Solo observamos cambios de contenido. No observamos class/hidden,
    // porque apply() modifica esos atributos y provocaba un bucle infinito.
    new MutationObserver(()=>apply()).observe(grid,{childList:true,subtree:true});
  };

  const style=document.createElement('style');
  style.textContent=`
    #teamsGrid [data-participants-pane].is-tab-hidden{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
    #teamsGrid [data-participants-pane].is-tab-active{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
    #teamsGrid [data-participants-pane][hidden]{display:none!important}
    #teamsGrid .participants-summary{display:grid!important;grid-template-columns:repeat(3,minmax(105px,1fr))!important;gap:10px!important}
    #teamsGrid .participants-summary>div{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;min-width:0!important;text-align:center!important}
    #teamsGrid .participants-tabs{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;width:100%!important}
    #teamsGrid .participants-tab{display:grid!important;grid-template-columns:46px minmax(0,1fr) auto!important;align-items:center!important;gap:12px!important;min-width:0!important}
    #teamsGrid .participants-list-head{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;gap:18px!important;width:100%!important}
    #teamsGrid .people-list,#teamsGrid .teams-list{display:grid!important;gap:12px!important;margin-top:14px!important}
    #teamsGrid .person-card{display:grid!important;grid-template-columns:42px minmax(0,1fr) auto!important;align-items:center!important;gap:13px!important;width:100%!important;min-width:0!important}
    #teamsGrid .person-info{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;margin-top:11px!important}
    #teamsGrid .person-info>span{display:flex!important;flex-direction:column!important;gap:4px!important;min-width:0!important}
    #teamsGrid .participant-team-card{display:block!important;width:100%!important}
    #teamsGrid .team-card-head{display:grid!important;grid-template-columns:44px minmax(0,1fr) auto!important;align-items:center!important;gap:12px!important}
    #teamsGrid .team-members{display:grid!important;gap:8px!important;margin-top:13px!important}
    #teamsGrid .team-member{display:grid!important;grid-template-columns:32px minmax(0,1fr) auto auto!important;align-items:center!important;gap:10px!important;min-width:0!important}
    @media(max-width:760px){
      #teamsGrid .participants-hero{flex-direction:column!important;align-items:stretch!important}
      #teamsGrid .participants-list-head{align-items:stretch!important;flex-direction:column!important}
      #teamsGrid .search-wrap{width:100%!important}
      #teamsGrid .person-info{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    }
    @media(max-width:560px){
      #teamsGrid .participants-tabs{grid-template-columns:1fr!important}
      #teamsGrid .participants-summary{grid-template-columns:1fr!important}
      #teamsGrid .person-card{grid-template-columns:38px minmax(0,1fr)!important}
      #teamsGrid .person-card>.person-view-qr{grid-column:2!important;justify-self:start!important}
      #teamsGrid .person-info{grid-template-columns:1fr!important}
      #teamsGrid .team-card-head{grid-template-columns:38px minmax(0,1fr)!important}
      #teamsGrid .team-count{grid-column:2!important;justify-self:start!important}
      #teamsGrid .team-member{grid-template-columns:30px minmax(0,1fr) auto!important}
    }
  `;
  document.head.appendChild(style);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
