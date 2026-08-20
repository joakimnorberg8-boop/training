const params = new URLSearchParams(location.search);
const name = params.get('name') || '';
const history = JSON.parse(localStorage.getItem('gaym-workout-history') || '[]');
const num = v => Number(String(v ?? '').replace(',','.')) || 0;
const fmtDate = d => new Date(d).toLocaleDateString('sv-SE',{day:'numeric',month:'short',year:'numeric'});
const $ = id => document.getElementById(id);

const entries = history
  .flatMap(session => (session.exercises || []).map(ex => ({...ex, sessionDate:session.date, sessionTitle:session.title})))
  .filter(ex => ex.name === name)
  .sort((a,b) => new Date(a.sessionDate) - new Date(b.sessionDate));

const latest = entries[entries.length - 1];
$('exercise-name').textContent = name || 'Unknown exercise';
$('exercise-fun').textContent = latest?.fun || 'PROGRESSION';
document.title = `${name || 'Exercise'} — GAYM`;

const setRows = entries.flatMap(e => (e.sets || []).map(s => ({
  date:e.sessionDate,
  weight:num(s.weight),
  reps:num(s.reps),
  rawWeight:s.weight || '',
  rawReps:s.reps || ''
}))).filter(s => s.weight > 0 && s.reps > 0);

const bestWeight = Math.max(0, ...setRows.map(s => s.weight));
const bestReps = Math.max(0, ...setRows.map(s => s.reps));
const sessions = entries.length;

$('exercise-metrics').innerHTML = `
  <div><span>PASS</span><strong>${sessions}</strong></div>
  <div><span>PB WEIGHT</span><strong>${bestWeight ? bestWeight+' kg' : '—'}</strong></div>
  <div><span>MAX REPS</span><strong>${bestReps || '—'}</strong></div>
`;

const sessionPoints = entries.map(e => {
  const valid=(e.sets||[]).map(s=>({weight:num(s.weight),reps:num(s.reps)})).filter(s=>s.weight>0);
  if(!valid.length) return {date:e.sessionDate,value:0,reps:0,title:e.sessionTitle};
  const top=valid.sort((a,b)=>b.weight-a.weight || b.reps-a.reps)[0];
  return {date:e.sessionDate,value:top.weight,reps:top.reps,title:e.sessionTitle};
}).filter(p => p.value > 0);

function renderChart(points) {
  const el = $('weight-chart');
  if (points.length === 0) {
    el.innerHTML = `<div class="empty-history"><strong>No strength data yet.</strong><p>Log weight on this exercise and the chart will appear here.</p></div>`;
    return;
  }

  const W=760,H=285,padX=48,padY=34;
  const minV=Math.min(...points.map(p=>p.value)),maxV=Math.max(...points.map(p=>p.value)),range=Math.max(5,maxV-minV);
  const low=Math.max(0,minV-range*.2),high=maxV+range*.2;
  const x=i=>points.length===1?W/2:padX+i*(W-padX*2)/(points.length-1);
  const y=v=>H-padY-((v-low)/(high-low))*(H-padY*2);
  const fmtFull=d=>new Date(d).toLocaleDateString('sv-SE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  el.innerHTML = `
    <div class="interactive-chart-head"><span>Hover or tap a point</span></div>
    <div class="chart-canvas-wrap">
      <svg viewBox="0 0 ${W} ${H}" aria-label="Heaviest weight over time">
        <line class="chart-axis" x1="${padX}" y1="${H-padY}" x2="${W-padX}" y2="${H-padY}"></line>
        <polyline class="chart-line" points="${points.map((p,i)=>`${x(i)},${y(p.value)}`).join(' ')}"></polyline>
        ${points.map((p,i)=>`
          <g class="interactive-chart-point" tabindex="0" role="button"
             data-value="${p.value} kg"
             data-date="${fmtFull(p.date)}"
             data-note="${p.reps?`${p.reps} reps · ${p.title||''}`:(p.title||'')}">
            <circle class="chart-hit-area" cx="${x(i)}" cy="${y(p.value)}" r="18"></circle>
            <circle class="chart-dot" cx="${x(i)}" cy="${y(p.value)}" r="6"></circle>
            <text class="chart-date-label" x="${x(i)}" y="${H-9}" text-anchor="middle">${fmtDate(p.date).replace(/ 2026/,'')}</text>
          </g>`).join('')}
      </svg>
      <div class="chart-tooltip" aria-live="polite"></div>
    </div>`;

  const tooltip=el.querySelector('.chart-tooltip');
  const dots=[...el.querySelectorAll('.interactive-chart-point')];
  const show=p=>{
    dots.forEach(x=>x.classList.toggle('active',x===p));
    tooltip.innerHTML=`<strong>${p.dataset.value}</strong><span>${p.dataset.date}</span>${p.dataset.note?`<small>${p.dataset.note}</small>`:''}`;
    tooltip.classList.add('show');
  };
  dots.forEach(p=>{
    p.addEventListener('mouseenter',()=>show(p));
    p.addEventListener('focus',()=>show(p));
    p.addEventListener('click',()=>show(p));
    p.addEventListener('touchstart',()=>show(p),{passive:true});
  });
}

renderChart(sessionPoints);

$('exercise-session-list').innerHTML = entries.length ? [...entries].reverse().map(e => {
  const valid = (e.sets || []).filter(s => s.weight || s.reps);
  const sets = valid.map((s,i)=>`<span><b>SET ${i+1}</b>${s.weight || '—'} kg × ${s.reps || '—'}</span>`).join('');
  return `<article class="exercise-history-entry">
    <div class="exercise-history-entry-head"><div><small>${fmtDate(e.sessionDate)}</small><strong>${e.sessionTitle}</strong></div></div>
    <div class="history-set-chips">${sets || '<span>Inga set loggade</span>'}</div>
  </article>`;
}).join('') : `<div class="empty-history"><p>No history found for this exercise.</p></div>`;

let bestSet = null;
setRows.forEach(s => {
  if (!bestSet || s.weight > bestSet.weight || (s.weight === bestSet.weight && s.reps > bestSet.reps)) bestSet = s;
});
const firstPoint = sessionPoints[0];
const lastPoint = sessionPoints[sessionPoints.length-1];
const change = firstPoint && lastPoint ? lastPoint.value-firstPoint.value : 0;

$('pb-panel').innerHTML = `
  <div class="pb-big"><span>HEAVIEST</span><strong>${bestSet?.weight ? bestSet.weight+' kg' : '—'}</strong><small>${bestSet?.reps ? bestSet.reps+' reps' : ''}</small></div>
  <div class="pb-row"><span>First logged top weight</span><strong>${firstPoint ? firstPoint.value+' kg' : '—'}</strong></div>
  <div class="pb-row"><span>Senaste toppvikt</span><strong>${lastPoint ? lastPoint.value+' kg' : '—'}</strong></div>
  <div class="pb-row accent"><span>Utveckling</span><strong>${change>0?'+':''}${change.toFixed(1).replace('.0','')} kg</strong></div>
`;

let __exerciseRevision=localStorage.getItem('gaym-data-revision')||'';
function refreshExerciseIfChanged(){
 const next=localStorage.getItem('gaym-data-revision')||'';
 if(next!==__exerciseRevision) location.reload();
}
window.addEventListener('focus',refreshExerciseIfChanged);
window.addEventListener('gaym:data-changed',refreshExerciseIfChanged);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshExerciseIfChanged();});
