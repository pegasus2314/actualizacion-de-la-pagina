(()=>{
  'use strict';

  const apply=()=>{
    const grid=document.querySelector('#teamsGrid');
    if(!grid)return;

    const tabs=[...grid.querySelectorAll('[data-participants-tab]')];
    const panes=[...grid.querySelectorAll('[data-participants-pane]')];
    if(!tabs.length||!panes.length)return;

    const activeTab=tabs.find(t=>t.classList.contains('active'))||tabs[0];
    const target=activeTab?.dataset.participantsTab||'people';

    panes.forEach(pane=>{
      const active=pane.dataset.participantsPane===target;
      pane.hidden=!active;
      pane.setAttribute('aria-hidden',active?'false':'true');
      pane.style.setProperty('display',active?'block':'none','important');
      pane.classList.toggle('is-tab-active',active);
      pane.classList.toggle('is-tab-hidden',!active);
    });

    tabs.forEach(tab=>{
      const active=tab.dataset.participantsTab===target;
      tab.classList.toggle('active',active);
      tab.setAttribute('aria-selected',active?'true':'false');
    });
  };

  const install=()=>{
    const grid=document.querySelector('#teamsGrid');
    if(!grid)return;
    if(grid.dataset.tabsFixInstalled==='1'){apply();return}
    grid.dataset.tabsFixInstalled='1';

    grid.addEventListener('click',event=>{
      const tab=event.target.closest('[data-participants-tab]');
      if(!tab||!grid.contains(tab))return;
      event.preventDefault();
      const target=tab.dataset.participantsTab;
      grid.querySelectorAll('[data-participants-tab]').forEach(x=>{
        const active=x===tab;
        x.classList.toggle('active',active);
        x.setAttribute('aria-selected',active?'true':'false');
      });
      grid.querySelectorAll('[data-participants-pane]').forEach(pane=>{
        const active=pane.dataset.participantsPane===target;
        pane.hidden=!active;
        pane.setAttribute('aria-hidden',active?'false':'true');
        pane.style.setProperty('display',active?'block':'none','important');
        pane.classList.toggle('is-tab-active',active);
        pane.classList.toggle('is-tab-hidden',!active);
      });
    },true);

    apply();
  };

  const style=document.createElement('style');
  style.textContent=`
    #teamsGrid [data-participants-pane].is-tab-hidden{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
    #teamsGrid [data-participants-pane].is-tab-active{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
    #teamsGrid [data-participants-pane][hidden]{display:none!important}
  `;
  document.head.appendChild(style);

  const observer=new MutationObserver(()=>{install();apply()});
  observer.observe(document.body,{childList:true,subtree:true});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,250);
  setTimeout(install,1000);
  setTimeout(install,2000);
})();
