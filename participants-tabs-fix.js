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
    #teamsGrid .participants-summary{display:grid!important;grid-template-columns:repeat(3,minmax(105px,1fr))!important;gap:10px!important;align-items:stretch!important}
    #teamsGrid .participants-summary>div{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;min-width:0!important;text-align:center!important}
    #teamsGrid .participants-summary>div>strong,#teamsGrid .participants-summary>div>span{display:block!important;margin:0!important}
    #teamsGrid .participants-tabs{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;width:100%!important}
    #teamsGrid .participants-tab{display:grid!important;grid-template-columns:46px minmax(0,1fr) auto!important;align-items:center!important;gap:12px!important;min-width:0!important}
    #teamsGrid .participants-tab>.tab-icon{display:grid!important;place-items:center!important;flex:0 0 44px!important}
    #teamsGrid .participants-tab>span:not(.tab-icon){display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:3px!important;min-width:0!important}
    #teamsGrid .participants-tab b,#teamsGrid .participants-tab small{display:block!important;margin:0!important;line-height:1.2!important}
    #teamsGrid .participants-tab em{display:block!important;margin:0!important;white-space:nowrap!important}
    #teamsGrid .participants-list-head{display:flex!important;justify-content:space-between!important;align-items:flex-end!important;gap:18px!important;width:100%!important}
    #teamsGrid .participants-list-head>div:first-child{min-width:0!important}
    #teamsGrid .participants-list-head h3,#teamsGrid .participants-list-head p{display:block!important}
    #teamsGrid .people-list{display:grid!important;gap:10px!important;margin-top:14px!important}
    #teamsGrid .person-card{display:grid!important;grid-template-columns:42px minmax(0,1fr) auto!important;align-items:center!important;gap:13px!important;width:100%!important;min-width:0!important}
    #teamsGrid .person-main{display:block!important;min-width:0!important}
    #teamsGrid .person-title-row{display:flex!important;justify-content:space-between!important;align-items:flex-start!important;gap:10px!important;min-width:0!important}
    #teamsGrid .person-title-row>div:first-child{min-width:0!important}
    #teamsGrid .person-title-row h3{display:block!important;margin:0!important;line-height:1.2!important}
    #teamsGrid .person-role{display:block!important;margin-top:4px!important}
    #teamsGrid .person-info{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;margin-top:11px!important;width:100%!important}
    #teamsGrid .person-info>span{display:flex!important;flex-direction:column!important;gap:4px!important;min-width:0!important;padding:7px 9px!important;border-radius:10px!important;background:rgba(182,231,255,.025)!important;overflow:hidden!important}
    #teamsGrid .person-info>span>b{display:block!important;margin:0!important;line-height:1!important}
    #teamsGrid .teams-list{display:grid!important;gap:14px!important;margin-top:14px!important}
    #teamsGrid .participant-team-card{display:block!important;width:100%!important;min-width:0!important}
    #teamsGrid .team-card-head{display:grid!important;grid-template-columns:44px minmax(0,1fr) auto!important;align-items:center!important;gap:12px!important;min-width:0!important}
    #teamsGrid .team-card-title{min-width:0!important}
    #teamsGrid .team-card-title .section-label,#teamsGrid .team-card-title h3,#teamsGrid .team-card-title p{display:block!important}
    #teamsGrid .team-card-title h3{margin:4px 0 3px!important}
    #teamsGrid .team-card-title p{margin:0!important}
    #teamsGrid .team-count{display:block!important;white-space:nowrap!important}
    #teamsGrid .team-members{display:grid!important;gap:8px!important;margin-top:13px!important}
    #teamsGrid .team-member{display:grid!important;grid-template-columns:32px minmax(0,1fr) auto auto!important;align-items:center!important;gap:10px!important;min-width:0!important}
    #teamsGrid .member-number{display:grid!important;place-items:center!important}
    #teamsGrid .member-data{display:flex!important;flex-direction:column!important;gap:3px!important;min-width:0!important}
    #teamsGrid .member-data strong,#teamsGrid .member-data span{display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
    #teamsGrid .member-data span{line-height:1.2!important}
    #teamsGrid .status-badge{display:inline-flex!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important}
    @media(max-width:760px){
      #teamsGrid .participants-hero{flex-direction:column!important;align-items:stretch!important}
      #teamsGrid .participants-summary{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      #teamsGrid .person-info{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      #teamsGrid .participants-list-head{align-items:stretch!important;flex-direction:column!important}
      #teamsGrid .search-wrap{width:100%!important}
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
      #teamsGrid .team-member .member-qr{grid-column:3!important;grid-row:1!important}
    }
  `;
  document.head.appendChild(style);

  let recoveryTimer=0;
  const recoverIfOverwritten=()=>{
    const grid=document.querySelector('#teamsGrid');
    if(!grid||!location.hash.includes('participantes'))return;
    if(grid.querySelector('[data-participants-tab]')){apply();return}
    if(recoveryTimer)return;
    recoveryTimer=setTimeout(()=>{
      recoveryTimer=0;
      if(!location.hash.includes('participantes'))return;
      const script=document.createElement('script');
      script.src='./participants-details.js?recovery='+Date.now();
      script.dataset.trdParticipantsRecovery='1';
      document.head.appendChild(script);
    },150);
  };

  const observer=new MutationObserver(()=>{install();apply();recoverIfOverwritten()});
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  setTimeout(install,250);
  setTimeout(install,1000);
  setTimeout(install,2000);
})();