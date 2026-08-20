const history=JSON.parse(localStorage.getItem('gaym-workout-history')||'[]').sort((a,b)=>new Date(b.date)-new Date(a.date));
const cardioHistory=JSON.parse(localStorage.getItem('gaym-cardio-history')||'[]');
const trainingHistory=[...history,...cardioHistory].sort((a,b)=>new Date(b.date)-new Date(a.date));
const $=id=>document.getElementById(id);
const num=v=>{
  const cleaned=String(v ?? '').trim().replace(',','.').replace(/[^\d.-]/g,'');
  const parsed=parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};
const fmtDate=d=>new Date(d).toLocaleDateString('sv-SE',{day:'numeric',month:'short',year:'numeric'});

const validSet = s => num(s.weight) > 0 && num(s.reps) > 0;

const allExercises=history.flatMap(s=>(s.exercises||[]).map(e=>({...e,date:s.date,title:s.title})));
const unique=[...new Set(allExercises.map(e=>e.name))];

function startOfWeek(date){
 const result=new Date(date);
 result.setHours(0,0,0,0);
 const day=(result.getDay()+6)%7;
 result.setDate(result.getDate()-day);
 return result;
}
function dateKey(date){
 const d=new Date(date);
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function isoWeekNumber(date){
 const target=new Date(date);
 target.setHours(0,0,0,0);
 target.setDate(target.getDate()+3-(target.getDay()+6)%7);
 const firstThursday=new Date(target.getFullYear(),0,4);
 return 1+Math.round(((target-firstThursday)/86400000-3+(firstThursday.getDay()+6)%7)/7);
}
function weekLabel(start){
 return `WEEK ${isoWeekNumber(start)}`;
}
function sessionsForWeek(start){
 const end=new Date(start);end.setDate(end.getDate()+7);
 const sessions=trainingHistory.filter(session=>{const date=new Date(session.date);return date>=start&&date<end;});
 return {sessions,days:new Set(sessions.map(session=>dateKey(session.date))).size};
}
function cardioForWeek(start){
 const end=new Date(start);end.setDate(end.getDate()+7);
 const sessions=cardioHistory.filter(session=>{const date=new Date(session.date);return date>=start&&date<end;});
 const seconds=sessions.reduce((sum,session)=>sum+(Number(session.elapsedSeconds)||0),0);
 return {sessions,seconds};
}
function formatCardioTime(seconds){
 const minutes=Math.round(seconds/60);
 if(minutes<60)return `${minutes} min`;
 return `${Math.floor(minutes/60)} h ${String(minutes%60).padStart(2,'0')} min`;
}

const currentWeek=startOfWeek(new Date());
const currentWeekData=sessionsForWeek(currentWeek);
$('history-stats').innerHTML=`<div><span>PASS DENNA WEEK</span><strong>${currentWeekData.sessions.length}</strong></div>`;
$('weekly-history').innerHTML=Array.from({length:8},(_,index)=>{
 const start=new Date(currentWeek);start.setDate(start.getDate()-index*7);
 const strengthSessions=history.filter(session=>{const date=new Date(session.date);const end=new Date(start);end.setDate(end.getDate()+7);return date>=start&&date<end;});
 const cardioData=cardioForWeek(start);
 return `<tr class="${index===0?'current-week':''}"><th scope="row">${weekLabel(start)}</th><td>${strengthSessions.length}</td><td>${cardioData.sessions.length}</td><td>${formatCardioTime(cardioData.seconds)}</td></tr>`;
}).join('');


// Strength overview graph
const strengthSelect=$('strength-chart-exercise');
const strengthChart=$('strength-overview-chart');

function strengthPointsFor(name){
  return allExercises
    .filter(e=>e.name===name)
    .sort((a,b)=>new Date(a.date)-new Date(b.date))
    .map(e=>{
      const valid=(e.sets||[]).map(s=>({weight:num(s.weight),reps:num(s.reps)})).filter(s=>s.weight>0);
      if(!valid.length)return null;
      const top=valid.sort((a,b)=>b.weight-a.weight || b.reps-a.reps)[0];
      return {date:e.date,value:top.weight,reps:top.reps,title:e.title};
    }).filter(Boolean);
}

function drawStrengthOverview(name){
  const points=strengthPointsFor(name);
  if(!points.length){
    strengthChart.innerHTML='<div class="empty-history"><strong>No strength data yet.</strong><p>Log weight in a workout and the chart will appear here.</p></div>';
    return;
  }

  const W=760,H=285,PX=48,PY=34;
  const min=Math.min(...points.map(p=>p.value)),max=Math.max(...points.map(p=>p.value)),range=Math.max(5,max-min);
  const low=Math.max(0,min-range*.2),high=max+range*.2;
  const x=i=>points.length===1?W/2:PX+i*(W-2*PX)/(points.length-1);
  const y=v=>H-PY-((v-low)/(high-low))*(H-2*PY);
  const full=d=>new Date(d).toLocaleDateString('sv-SE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const short=d=>new Date(d).toLocaleDateString('sv-SE',{day:'numeric',month:'short'});

  strengthChart.innerHTML=`
    <div class="interactive-chart-head"><span>Hover or tap a point</span></div>
    <div class="chart-canvas-wrap">
      <svg viewBox="0 0 ${W} ${H}" aria-label="${name} styrkeutveckling">
        <line class="chart-axis" x1="${PX}" y1="${H-PY}" x2="${W-PX}" y2="${H-PY}"></line>
        <polyline class="chart-line" points="${points.map((p,i)=>`${x(i)},${y(p.value)}`).join(' ')}"></polyline>
        ${points.map((p,i)=>`
          <g class="interactive-chart-point" tabindex="0" role="button"
             data-value="${p.value} kg"
             data-date="${full(p.date)}"
             data-note="${p.reps} reps · ${p.title||''}">
            <circle class="chart-hit-area" cx="${x(i)}" cy="${y(p.value)}" r="18"></circle>
            <circle class="chart-dot" cx="${x(i)}" cy="${y(p.value)}" r="6"></circle>
            <text class="chart-date-label" x="${x(i)}" y="${H-9}" text-anchor="middle">${short(p.date)}</text>
          </g>`).join('')}
      </svg>
      <div class="chart-tooltip" aria-live="polite"></div>
    </div>`;

  const tooltip=strengthChart.querySelector('.chart-tooltip');
  const dots=[...strengthChart.querySelectorAll('.interactive-chart-point')];
  const show=p=>{
    dots.forEach(x=>x.classList.toggle('active',x===p));
    tooltip.innerHTML=`<strong>${p.dataset.value}</strong><span>${p.dataset.date}</span><small>${p.dataset.note}</small>`;
    tooltip.classList.add('show');
  };
  dots.forEach(p=>{
    p.addEventListener('mouseenter',()=>show(p));
    p.addEventListener('focus',()=>show(p));
    p.addEventListener('click',()=>show(p));
    p.addEventListener('touchstart',()=>show(p),{passive:true});
  });
}

if(strengthSelect&&strengthChart){
  strengthSelect.innerHTML=unique.length?unique.map(n=>`<option value="${n.replace(/"/g,'&quot;')}">${n}</option>`).join(''):'<option>No data</option>';
  if(unique.length){
    drawStrengthOverview(unique[0]);
    strengthSelect.onchange=()=>drawStrengthOverview(strengthSelect.value);
  }else{
    strengthChart.innerHTML='<div class="empty-history"><strong>No strength data yet.</strong><p>Finish a strength workout and the chart will start building.</p></div>';
  }
}

let __historyRevision=localStorage.getItem('gaym-data-revision')||'';
function refreshStrengthIfChanged(){
 const next=localStorage.getItem('gaym-data-revision')||'';
 if(next!==__historyRevision) location.reload();
}
window.addEventListener('focus',refreshStrengthIfChanged);
window.addEventListener('gaym:data-changed',refreshStrengthIfChanged);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshStrengthIfChanged();});
