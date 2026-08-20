(() => {
  const $=id=>document.getElementById(id);
  const profile=(()=>{try{return JSON.parse(localStorage.getItem('gaym-profile')||'{}')}catch{return {}}})();
  const name=(profile.name||'Jocke').split(/\s+/)[0];
  const greeting=$('home-greeting'); if(greeting) greeting.textContent=`Hej ${name}! 👋`;
  const date=$('home-date'); if(date) date.textContent=new Intl.DateTimeFormat('sv-SE',{weekday:'long',day:'numeric',month:'short'}).format(new Date()).toUpperCase();

  let active=null; try{active=JSON.parse(localStorage.getItem('gaym-active-session')||'null')}catch{}
  const resume=$('resume-card');
  if(resume){
    if(active?.path){
      resume.hidden=false;
      $('resume-label').textContent=active.label||'Workout in progress';
      $('resume-link').href=active.path;
    } else resume.hidden=true;
  }

  const food=(()=>{try{return JSON.parse(localStorage.getItem('gaym-food-history')||'[]')}catch{return []}})();
  const today=new Date().toISOString().slice(0,10);
  const todays=food.filter(x=>String(x.date||'').slice(0,10)===today);
  const latest=todays[todays.length-1];
  const foodResume=$('food-resume-card');
  if(foodResume && latest){
    foodResume.hidden=false;
    const meals=latest.meals||[];
    $('food-resume-copy').textContent=`${meals.length} måltider loggade · ${Math.round(latest.calories||0)} kcal`;
  }
})();

// Mirror the existing nutrition engine into the compact mobile dashboard.
(() => {
  const sync=()=>{
    const calories=document.getElementById('fuel-calories')?.textContent||'0 / 2 400 kcal';
    const detail=document.getElementById('fuel-detail')?.textContent||'0 / 140 g protein';
    const percent=document.getElementById('fuel-percent')?.textContent||'0%';
    const source=document.getElementById('fuel-progress');
    const mc=document.getElementById('mobile-fuel-calories'); if(mc) mc.textContent=calories;
    const mp=document.getElementById('mobile-fuel-protein'); if(mp) mp.textContent=(detail.split('·')[0]||detail).trim();
    const pct=document.getElementById('mobile-fuel-percent'); if(pct) pct.textContent=percent;
    const bar=document.getElementById('mobile-fuel-progress'); if(bar) bar.style.width=source?.style.width||percent;
    const nums=(calories.match(/[\d\s]+/g)||[]).map(x=>Number(x.replace(/\s/g,''))).filter(Number.isFinite);
    if(nums.length>=2){const left=Math.max(0,nums[1]-nums[0]);const el=document.getElementById('mobile-fuel-left');if(el)el.textContent=left?`+${left} kcal kvar`:'Mål uppnått ✓'}
  };
  requestAnimationFrame(()=>setTimeout(sync,0));
  window.addEventListener('storage',sync);
})();
