const params=new URLSearchParams(location.search);
const id=params.get('id');
const history=JSON.parse(localStorage.getItem('gaym-workout-history')||'[]');
const session=history.find(s=>String(s.id)===String(id));
const $=id=>document.getElementById(id);
const num=v=>{
  const cleaned=String(v ?? '').trim().replace(',','.').replace(/[^\d.-]/g,'');
  const parsed=parseFloat(cleaned);
  return Number.isFinite(parsed)?parsed:0;
};
const validSet=s=>num(s.weight)>0&&num(s.reps)>0;
const setVolume=s=>validSet(s)?num(s.weight)*num(s.reps):0;
const exerciseVolume=e=>(e.sets||[]).reduce((sum,s)=>sum+setVolume(s),0);
const fmtDate=d=>new Date(d).toLocaleDateString('sv-SE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const formatDuration=sec=>{sec=Math.max(0,Math.round(Number(sec)||0));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;};

if(!session){
  $('session-title').textContent='Workout not found';
  $('session-summary').textContent='This workout no longer exists in local history.';
}else{
  document.title=`${session.title} · ${fmtDate(session.date)} — GAYM`;
  $('session-date').textContent=fmtDate(session.date);
  $('session-title').textContent=session.title;  const loggedSets=(session.exercises||[]).reduce((n,e)=>n+(e.sets||[]).filter(validSet).length,0);
  $('session-summary').textContent=`${session.completed} of ${session.total} exercises were marked done. Here is exactly what you logged.`;
  $('session-detail-stats').innerHTML=`
    <div><span>EXERCISES</span><strong>${session.completed}/${session.total}</strong></div>
    <div><span>LOGGADE SET</span><strong>${loggedSets}</strong></div>
    ${session.elapsedSeconds?`<div><span>COMPLETED TIME</span><strong>${formatDuration(session.elapsedSeconds)} min</strong></div>`:''}
`;
  $('session-exercises').innerHTML=(session.exercises||[]).map((e,i)=>{
    const rows=(e.sets||[]).map((s,j)=>{
      const complete=validSet(s);
      return `<div class="past-set-row ${complete?'':'incomplete'}">
        <span>SET ${j+1}</span>
        <strong>${s.weight || '—'} kg</strong>
        <b>×</b>
        <strong>${s.reps || '—'} reps</strong>
        <small>${complete ? 'loggat' : 'ej komplett'}</small>
      </div>`;
    }).join('');
    return `<article class="past-exercise-card">
      <div class="past-exercise-head"><div><span>${String(i+1).padStart(2,'0')}</span><p>${e.fun||''}</p><h2>${e.name}</h2></div></div>
      <div class="past-set-list">${rows || '<p>Inga set loggade.</p>'}</div>
    </article>`;
  }).join('');
}