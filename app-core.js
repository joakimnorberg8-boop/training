/* GAYM RC18 shared core. Data helpers initialize immediately; UI helpers initialize when DOM is ready. */
window.GAYMData = (() => {
  const REV_KEY='gaym-data-revision';
  function changed(type){
    const revision=Date.now();
    localStorage.setItem(REV_KEY,String(revision));
    window.dispatchEvent(new CustomEvent('gaym:data-changed',{detail:{type,revision}}));
  }
  function removeById(storageKey,id){
    let rows=[];
    try{rows=JSON.parse(localStorage.getItem(storageKey)||'[]')}catch{}
    const next=rows.filter(x=>String(x.id)!==String(id));
    localStorage.setItem(storageKey,JSON.stringify(next));
    changed(storageKey);
    return next;
  }
  return {changed,removeById};
})();

document.addEventListener("DOMContentLoaded", () => {
(() => {
  const authKey='gaym-login';
const gaymLoginSlogans=[
'Why take Imodium when you can shit glitter?',
'Glitter is not a macro, but spiritually it counts.',
'Progressive overload, but make it aggressively sparkly.',
'If the floor is clean, did you even bring enough glitter?',
'Calories in. Glitter everywhere. Evidence destroyed.',

'Get bigger. Daddy noticed.',
'Twink today. Twunk loading.',
'Built for the jockstrap. Approved by daddy.',
'Lift heavy. Make daddy nervous.',
'Your jockstrap deserves better quads.',
'Protein in. Twink out.',
'Another day closer to becoming somebody’s gym daddy.',
'Make the twinks stare and the daddies reconsider their standards.',
'Chest up. Ass out. Standards optional.',
'Today’s forecast: 100% chance of daddy issues.',
'Less twink. More twunk. Same questionable decisions.',
'Daddy can’t progressive-overload you. Do it yourself.',
'Train hard enough to become your own type.',
'Jockstrap capacity: under active investigation.',
'Twink.exe is installing shoulders. Do not unplug.',
'Build the thighs your jockstrap warned you about.',
'Come for the gains. Stay because daddy is watching.',
'No shirt sleeves are safe from this bulk.',
'The twink agenda has entered its heavy phase.',
'Be the reason daddy forgets his set count.',
'Leg day: because the jockstrap deserves structural support.',
'Bulk responsibly. Flirt irresponsibly.',
'Your gym crush deserves a plot twist.',
'Make the pump indecently convincing.',
'Welcome back. Your daddy issues have been converted into progressive overload.',
'Serving twunkification with a side of bad intentions.',
'The bear pipeline starts with one more rep.',
'This login is tighter than your post-leg-day trousers.',
'Enter PIN. Exit twinkier than planned.',
'Private club. Publicly suspicious gains.'
];
const gaymLoginSlogan=()=>gaymLoginSlogans[Math.floor(Math.random()*gaymLoginSlogans.length)];

  const savedAuth=JSON.parse(localStorage.getItem(authKey)||'null');
  const isUnlocked=sessionStorage.getItem('gaym-session')==='unlocked';
  const unlock=()=>{
    sessionStorage.setItem('gaym-session','unlocked');
    document.body.classList.remove('login-active');
    document.querySelector('.gaym-login-gate')?.remove();
    document.querySelector('.app-shell')?.style.removeProperty('display');
    const identity=JSON.parse(localStorage.getItem('gaym-profile')||'{}');
    const unlockedName=identity.name||'Jocke';
    document.querySelectorAll('.profile-button').forEach(el=>{el.textContent=unlockedName.slice(0,2).toUpperCase();});
    const welcome=document.querySelector('.welcome-copy h1');
    if(welcome&&document.body.classList.contains('home-menu-page')) welcome.innerHTML=`Welcome,<br><em>${unlockedName}.</em>`;
  };
  const showLogin=()=>{
    document.body.classList.add('login-active');
    document.querySelector('.app-shell')?.style.setProperty('display','none');
    const gate=document.createElement('main');
    gate.className='gaym-login-gate';
    gate.innerHTML=`<section class="gaym-login-panel"><p class="eyebrow">GAYM · PRIVATE CLUB</p><h1>Welcome to<br><em>the good gains.</em></h1><p class="gaym-login-slogan">${gaymLoginSlogan()}</p><form class="gaym-login-form"><label>YOUR NAME<input name="name" value="" autocomplete="username" required></label><label>4-DIGIT PIN<input name="pin" type="password" inputmode="numeric" minlength="4" maxlength="4" pattern="[0-9]{4}" autocomplete="current-password" required></label><button type="submit">${savedAuth?'UNLOCK GAYM':'CREATE LOGIN'}</button><p class="gaym-login-feedback" aria-live="polite"></p></form></section>`;
    document.body.appendChild(gate);
    gate.querySelector('form').addEventListener('submit',event=>{
      event.preventDefault();
      const form=event.currentTarget,name=form.elements.name.value.trim()||'Jocke',pin=form.elements.pin.value;
      const feedback=gate.querySelector('.gaym-login-feedback');
      if(!/^\d{4}$/.test(pin)){feedback.textContent='PIN must be exactly four digits.';return;}
      if(savedAuth&&pin!==savedAuth.pin){feedback.textContent='Wrong PIN. Try again.';return;}
      localStorage.setItem(authKey,JSON.stringify({name,pin:savedAuth?.pin||pin}));
      localStorage.setItem('gaym-profile',JSON.stringify({...JSON.parse(localStorage.getItem('gaym-profile')||'{}'),name}));
      unlock();
    });
  };
  if(isUnlocked) document.body.classList.add('auth-ready');
  else { showLogin(); document.body.classList.add('auth-ready'); }

  const profile = JSON.parse(localStorage.getItem('gaym-profile') || '{}');
  const name = profile.name || 'Jocke';
  document.body.classList.toggle('compact-mode', profile.compact !== false);

  // Profile button should always exist visually and always point to profile.
  document.querySelectorAll('.profile-button').forEach(el => {
    el.textContent = name.slice(0,2).toUpperCase();
    if (el.tagName === 'A') el.href = 'profile.html';
  });
  document.querySelectorAll('[data-logout]').forEach(button=>button.addEventListener('click',()=>{
    sessionStorage.removeItem('gaym-session');
    window.location.href='index.html?v=login-gate-2';
  }));

  const welcome = document.querySelector('.welcome-copy h1');
  if (welcome) {
    welcome.innerHTML = document.body.classList.contains('home-menu-page')
      ? `Welcome,<br><em>${name}.</em>`
      : `Good evening,<br><em>${name}.</em>`;
  }

  window.GAYMToast = msg => {
    let t=document.getElementById('global-toast');
    if(!t){
      t=document.createElement('div');
      t.id='global-toast';
      t.className='global-toast';
      document.body.appendChild(t);
    }
    t.textContent=msg;
    t.classList.add('show');
    clearTimeout(window.__gaymToast);
    window.__gaymToast=setTimeout(()=>t.classList.remove('show'),1800);
  };

  // A floating tab back to whichever session (strength/glute/cardio) is currently in progress, on every page.
  function renderActiveSessionTab(){
    const existing=document.getElementById('active-session-tab');
    let activeSession=null;
    try{ activeSession=JSON.parse(localStorage.getItem('gaym-active-session')||'null'); }catch{}
    const currentPath=(location.pathname.split('/').pop()||'index.html')+location.search;
    if(!activeSession || currentPath===activeSession.path){ existing?.remove(); return; }
    if(existing){ existing.href=activeSession.path; existing.querySelector('strong').textContent=`RESUME WORKOUT`; return; }
    const tab=document.createElement('a');
    tab.id='active-session-tab';
    tab.className='active-session-tab';
    tab.href=activeSession.path;
    tab.innerHTML=`<span>⏱</span><strong>RESUME WORKOUT</strong>`;
    document.body.appendChild(tab);
  }
  renderActiveSessionTab();
  window.addEventListener('storage',renderActiveSessionTab);

  // A tiny mobile back affordance for long detail pages, without adding another big button.
  document.querySelectorAll('button,a').forEach(el=>{
    if(!el.getAttribute('aria-label') && !el.textContent.trim()) el.setAttribute('aria-label','Knapp');
  });
})();(() => {
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const active = page==='index.html'?'home':
    ['workout.html','strength.html','workout-detail.html','cardio.html','cardio-session.html','glutes.html','glute-session.html','daniel.html'].includes(page)?'train':
    ['recipes.html','food.html','jocke.html','food-stats.html'].includes(page)?'food':
    ['daily.html','history.html','body-progress.html','session-history.html','exercise-history.html'].includes(page)?'diary':
    page==='profile.html'?'profile':'';
  const icons={
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.8 12 3.8l8.5 7v9.4h-6v-5.8h-5v5.8h-6z"/></svg>',
    train:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v6M8 7v10M16 7v10M19 9v6M8 12h8M3 10v4M21 10v4"/></svg>',
    food:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7M4.5 3v5.2A2.8 2.8 0 0 0 7.3 11H8M7 11v10M15 3v18M15 3c4 2 4 8 0 10"/></svg>',
    diary:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h11.5A1.5 1.5 0 0 1 19 5v15.5H7A2 2 0 0 1 5 18.5V5.5a2 2 0 0 1 2-2M8.5 8h7M8.5 12h7M8.5 16h5"/></svg>',
    profile:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.7-4 3.1-6 7-6s6.3 2 7 6"/></svg>'
  };
  const items=[
    ['home','index.html','Home'],
    ['train','workout.html','Training'],
    ['food','recipes.html?category=all','Food'],
    ['diary','daily.html','Diary'],
    ['profile','profile.html','Profile']
  ];
  document.querySelectorAll('.mobile-bottom-nav').forEach(el=>el.remove());
  const nav=document.createElement('nav');
  nav.className='mobile-bottom-nav';
  nav.setAttribute('aria-label','Main navigation');
  nav.innerHTML=items.map(([key,href,label])=>`<a href="${href}" class="${active===key?'active':''}" ${active===key?'aria-current="page"':''}><span class="nav-icon">${icons[key]}</span><small>${label}</small></a>`).join('');
  document.body.appendChild(nav);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const h=location.hostname;
    const localDev=h==='localhost'||h==='127.0.0.1'||h.startsWith('10.')||h.startsWith('192.168.')||/^172\.(1[6-9]|2\d|3[01])\./.test(h);
    if(localDev){
      navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
      if('caches' in window)caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('gaym-')).map(k=>caches.delete(k)))).catch(()=>{});
    }else{
      navigator.serviceWorker.register('sw.js').catch(()=>{});
    }
  }
  const activeSession=(()=>{try{return JSON.parse(localStorage.getItem('gaym-active-session')||'null')}catch{return null}})();
  document.body.classList.toggle('has-active-session',!!activeSession);
})();
(() => {
  const mobile = () => matchMedia('(max-width:760px)').matches;
  const activeWorkout = document.body.classList.contains('active-workout-page');

  // RC36: global mobile navigation must remain available on every page, including active workouts.
  // Do not hide or modify .mobile-bottom-nav here.

  // Native-app feeling mobile set editor. Existing workout logic remains source of truth.
  function ensureSetSheet(){
    let sheet=document.getElementById('mobile-set-sheet');
    if(sheet) return sheet;
    sheet=document.createElement('div');
    sheet.id='mobile-set-sheet';
    sheet.className='mobile-set-sheet';
    sheet.setAttribute('aria-hidden','true');
    sheet.innerHTML=`
      <div class="mobile-sheet-backdrop" data-sheet-close></div>
      <section class="mobile-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-set-title">
        <div class="mobile-sheet-grabber"></div>
        <div class="mobile-sheet-head"><div><small>REDIGERA SET</small><h2 id="mobile-set-title">Set</h2></div><button type="button" data-sheet-close aria-label="Stäng">×</button></div>
        <label>Vikt <span><input id="mobile-set-weight" inputmode="decimal" type="number" step="0.5"><b>kg</b></span></label>
        <label>Reps <span><input id="mobile-set-reps" inputmode="numeric" type="number" step="1"><b>reps</b></span></label>
        <button class="mobile-sheet-save" type="button">Spara</button>
      </section>`;
    document.body.appendChild(sheet);
    sheet.querySelectorAll('[data-sheet-close]').forEach(b=>b.addEventListener('click',closeSetSheet));
    sheet.addEventListener('keydown',e=>{if(e.key==='Escape')closeSetSheet()});
    return sheet;
  }

  let currentRow=null;
  function closeSetSheet(){
    const sheet=document.getElementById('mobile-set-sheet');
    if(!sheet)return;
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden','true');
    document.body.classList.remove('mobile-sheet-open');
    currentRow=null;
  }
  function openSetSheet(row){
    if(!mobile() || !activeWorkout) return;
    const inputs=[...row.querySelectorAll('input')].filter(i=>i.dataset.field || i.dataset.gfield);
    if(inputs.length<2)return;
    currentRow=row;
    const sheet=ensureSetSheet();
    const label=row.querySelector('label')?.textContent?.trim() || 'Set';
    const card=row.closest('.day-exercise-card');
    const exercise=card?.querySelector('.real-name')?.textContent?.trim() || card?.querySelector('h2')?.textContent?.trim() || '';
    sheet.querySelector('#mobile-set-title').textContent=`${label}${exercise?' · '+exercise:''}`;
    sheet.querySelector('#mobile-set-weight').value=inputs[0].value || '';
    sheet.querySelector('#mobile-set-reps').value=inputs[1].value || '';
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden','false');
    document.body.classList.add('mobile-sheet-open');
    setTimeout(()=>sheet.querySelector('#mobile-set-weight')?.focus(),120);
    sheet.querySelector('.mobile-sheet-save').onclick=()=>{
      if(!currentRow)return closeSetSheet();
      const actual=[...currentRow.querySelectorAll('input')].filter(i=>i.dataset.field || i.dataset.gfield);
      if(actual[0]){actual[0].value=sheet.querySelector('#mobile-set-weight').value;actual[0].dispatchEvent(new Event('input',{bubbles:true}));}
      if(actual[1]){actual[1].value=sheet.querySelector('#mobile-set-reps').value;actual[1].dispatchEvent(new Event('input',{bubbles:true}));}
      closeSetSheet();
    };
  }

  // Set fields are edited directly in the workout card on mobile.
  // Remove any editor sheet left behind by an older cached version.
  document.getElementById('mobile-set-sheet')?.remove();
  document.body.classList.remove('mobile-sheet-open');

  // Cleaner mobile labels, without altering the desktop personality.
  if(mobile()){
    const start=document.querySelector('.mobile-home-main .mobile-primary[href="workout.html"]');
    if(start) start.textContent='STARTA PASS';
  }
})();
(() => {
  const mobile = () => matchMedia('(max-width:760px)').matches;
  if (!mobile()) return;

  const safeJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  };
  const todayKey = () => new Date().toISOString().slice(0,10);
  const dateOnly = value => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0,10);
  };
  const profile = safeJSON('gaym-profile', {});
  const firstName = (profile.name || 'Jocke').trim().split(/\s+/)[0];

  function targets(){
    const weight = Number(profile.weight) || Number(localStorage.getItem('gaym-food-weight')) || 70;
    const height = Number(profile.height) || Number(localStorage.getItem('gaym-food-height')) || 183;
    const age = Number(profile.age) || Number(localStorage.getItem('gaym-food-age')) || 27;
    const activity = Number(profile.activity) || Number(localStorage.getItem('gaym-food-activity')) || 1.55;
    const goal = profile.goal || localStorage.getItem('gaym-food-goal') || 'muscle';
    const bmr = 10*weight + 6.25*height - 5*age + 5;
    const maintenance = bmr * activity;
    const kcal = Math.round((goal === 'muscle' ? maintenance + 250 : goal === 'loss' ? maintenance - 350 : maintenance) / 10) * 10;
    const protein = Math.round(weight * (goal === 'loss' ? 2.1 : 2));
    return {kcal, protein, weight};
  }

  function todayFood(){
    const rows=safeJSON('gaym-food-history',[]);
    const key=todayKey();
    const row=rows.find(r=>dateOnly(r.date)===key) || rows.find(r=>String(r.date||'').startsWith(key));
    return row || {calories:0,protein:0,meals:[]};
  }

  function latestWeight(){
    const rows=safeJSON('gaym-body-measurements',[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
    return Number(rows[0]?.weight) || Number(profile.weight) || 70;
  }

  function streak(){
    const workouts=safeJSON('gaym-workout-history',[]);
    const cardio=safeJSON('gaym-cardio-history',[]);
    const dates=new Set([...workouts,...cardio].map(x=>dateOnly(x.date)).filter(Boolean));
    let n=0, d=new Date();
    while(true){
      const key=d.toISOString().slice(0,10);
      if(dates.has(key)){n++;d.setDate(d.getDate()-1);continue;}
      if(n===0){d.setDate(d.getDate()-1);const yesterday=d.toISOString().slice(0,10);if(dates.has(yesterday)){n++;d.setDate(d.getDate()-1);continue;}}
      break;
    }
    return n;
  }

  function home(){
    const root=document.querySelector('.mobile-home-main');
    if(!root) return;
    const t=targets(), food=todayFood(), weight=latestWeight();
    const kcalPct=Math.min(100,Math.round((Number(food.calories)||0)/t.kcal*100));
    const proteinPct=Math.min(100,Math.round((Number(food.protein)||0)/t.protein*100));
    const active=safeJSON('gaym-active-session',null);
    const date=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
    root.innerHTML=`
      <div class="rc15-home-head">
        <div><h1>Hi ${firstName}! <span>👋</span></h1><p>${date.charAt(0).toUpperCase()+date.slice(1)}</p></div>
        <div class="rc15-streak">🔥 <b>${streak()}</b> day streak</div>
      </div>
      ${active?`<a class="rc15-resume" href="${active.path||'workout.html'}"><span>WORKOUT IN PROGRESS</span><strong>${active.label||'Workout'}</strong><b>Resume</b></a>`:''}
      <section class="rc15-today-workout">
        <div><span class="rc15-label">Today's workout</span><h2>Ready to train?</h2></div>
        <div class="rc15-workout-art" aria-hidden="true">🏋️</div>
        <a href="workout.html" class="rc15-pink-button">Start workout</a>
      </section>
      <a class="rc15-metric-card" href="recipes.html?category=all">
        <div class="rc15-metric-head"><span>Calories</span><strong>${Math.round(Number(food.calories)||0).toLocaleString('sv-SE')} <small>/ ${t.kcal.toLocaleString('sv-SE')} kcal</small></strong></div>
        <div class="rc15-bar"><i style="width:${kcalPct}%"></i></div>
      </a>
      <a class="rc15-metric-card" href="recipes.html?category=all">
        <div class="rc15-metric-head"><span>Protein</span><strong>${Math.round(Number(food.protein)||0)} <small>/ ${t.protein} g</small></strong></div>
        <div class="rc15-bar"><i style="width:${proteinPct}%"></i></div>
      </a>
      <div class="rc15-mini-grid">
        <a href="body-progress.html"><span>Weight</span><strong>${weight.toFixed(1).replace('.',',')} kg</strong><small>View progress</small></a>
        <a href="daily.html"><span>Week</span><strong>${safeJSON('gaym-workout-history',[]).filter(x=>(Date.now()-new Date(x.date))/86400000<7).length} workouts</strong><small>Last 7 days</small></a>
      </div>
      <div class="rc20-home-actions">
        <a class="rc15-add-meal" href="food.html"><span>＋</span><b>Add meal</b></a>
        <button class="rc20-log-measure" type="button" data-open-measures><span class="quick-line-icon" aria-hidden="true"></span><b>Log measurements</b></button>
      </div>`;
  }

  function foodHub(){
    const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    if(page!=='food.html') return;
    if(!document.body.querySelector('.food-main')) return;
    document.body.classList.add('rc15-food-page');
    const main=document.querySelector('.food-main');
    if(document.querySelector('.rc15-food-hub')) return;
    const food=todayFood(), t=targets();
    const hub=document.createElement('section');
    hub.className='rc15-food-hub';
    hub.innerHTML=`
      <div class="rc15-page-head"><div><h1>Food</h1><p>Log meals quickly and easily.</p></div><a href="food-stats.html"></a></div>`;
    main.prepend(hub);
  }

  function weeklyDiary(){
    const main=document.querySelector('.daily-main');
    if(!main) return;
    document.body.classList.add('rc15-diary-page');
    if(document.querySelector('.rc15-week-card')) return;
    const now=Date.now();
    const workouts=safeJSON('gaym-workout-history',[]).filter(x=>(now-new Date(x.date))/86400000<7);
    const foods=safeJSON('gaym-food-history',[]).filter(x=>(now-new Date(x.date))/86400000<7);
    const measures=safeJSON('gaym-body-measurements',[]).filter(x=>(now-new Date(x.date))/86400000<7).sort((a,b)=>new Date(a.date)-new Date(b.date));
    const avg=(arr,key)=>arr.length?Math.round(arr.reduce((s,x)=>s+(Number(x[key])||0),0)/arr.length):0;
    const w0=Number(measures[0]?.weight), w1=Number(measures.at(-1)?.weight);
    let pts='';
    if(measures.length>1){const vals=measures.map(x=>Number(x.weight)).filter(Boolean);const min=Math.min(...vals),max=Math.max(...vals);pts=vals.map((v,i)=>`${i*(100/(vals.length-1))},${36-((v-min)/(max-min||1))*24}`).join(' ')}
    const d=new Date(), end=d.getDate(), start=new Date(d);start.setDate(d.getDate()-6);
    const card=document.createElement('section');card.className='rc15-week-card';
    card.innerHTML=`
      <div class="rc15-page-head"><div><h1>Dagbok</h1><p>Din vecka i ett ögonkast.</p></div><a href="history.html"></a></div>
      <div class="rc15-week-overview"><div class="rc15-week-title"><h2>Den här veckan</h2><span>${start.getDate()}–${end} ${new Intl.DateTimeFormat('en-GB',{month:'long'}).format(d)}</span></div>
        <a href="history.html" class="rc15-week-row"><i>🏋️</i><div><span>Träning</span><strong>${workouts.length} / 5 pass</strong></div><div class="rc15-mini-bar"><b style="width:${Math.min(100,workouts.length/5*100)}%"></b></div></a>
        <a href="food-stats.html" class="rc15-week-row"><i>🍽️</i><div><span>Calories</span><strong>${avg(foods,'calories').toLocaleString('sv-SE')} kcal / dag</strong></div><div class="rc15-mini-bar"><b style="width:${Math.min(100,avg(foods,'calories')/(targets().kcal||1)*100)}%"></b></div></a>
        <a href="food-stats.html" class="rc15-week-row"><i>🥩</i><div><span>Protein</span><strong>${avg(foods,'protein')} g / dag</strong></div><div class="rc15-mini-bar"><b style="width:${Math.min(100,avg(foods,'protein')/(targets().protein||1)*100)}%"></b></div></a>
        <a href="body-progress.html" class="rc15-week-row weight"><i>⚖️</i><div><span>Weight</span><strong>${w0?`${w0.toFixed(1).replace('.',',')} ${(w1||w0).toFixed(1).replace('.',',')} kg`:'Ingen data ännu'}</strong></div>${pts?`<svg viewBox="0 0 100 40" preserveAspectRatio="none"><polyline points="${pts}"/></svg>`:''}</a>
      </div>`;
    main.prepend(card);
  }

  function profilePage(){
    if(!document.querySelector('.profile-main')) return;
    document.body.classList.add('rc15-profile-page');
    const hero=document.querySelector('.profile-hero');
    if(hero){hero.querySelector('.eyebrow')?.remove();const h=hero.querySelector('h1');if(h)h.textContent='Profil';const p=hero.querySelector('p');if(p)p.textContent='Dina mål och inställningar.';}
    document.querySelectorAll('.profile-section h2').forEach(h=>{
      const map={'Basic info':'Grundinfo','Goal':'Mål','Activity level':'Aktivitetsnivå','App':'App'};h.textContent=map[h.textContent.trim()]||h.textContent;
    });
  }

  function seriousSession(){
    if(!document.body.classList.contains('active-workout-page')) return;
    const replacements=[
      ['TWINK',''],['DADDY',''],['JOCKSTRAP',''],['SLAY',''],['GAY RECEIPTS',''],['RECEIPTS',''],['BABY','']
    ];
    document.querySelectorAll('p,span,small,h1,h2,h3,b,strong').forEach(el=>{
      if(el.children.length) return;
      let txt=el.textContent;
      replacements.forEach(([a,b])=>txt=txt.replace(new RegExp(a,'gi'),b));
      txt=txt.replace(/\s{2,}/g,' ').trim();
      if(txt!==el.textContent)el.textContent=txt;
    });
  }

  home(); foodHub(); weeklyDiary(); profilePage(); seriousSession();
})();

});
