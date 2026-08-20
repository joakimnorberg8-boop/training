const activityPrograms={
 running:[{fun:'Easy Run',name:'Easy Run',description:'Steady aerobic run · conversational effort',rounds:1,work:'30:00',rest:'00:00'},{fun:'Run Intervals',name:'Run Intervals',description:'1 min hard · 2 min easy · 8 rounds',rounds:8,work:'01:00',rest:'02:00'},{fun:'4 × 4',name:'4 × 4 Intervals',description:'4 min hard · 3 min active recovery · 4 rounds',rounds:4,work:'04:00',rest:'03:00'}],
 cycling:[{fun:'Easy Ride',name:'Easy Ride',description:'Steady ride on level terrain or stationary bike',rounds:1,work:'30:00',rest:'00:00'},{fun:'Bike Intervals',name:'Bike Intervals',description:'2 min strong · 2 min easy · 6 rounds',rounds:6,work:'02:00',rest:'02:00'},{fun:'Bike Sprints',name:'Bike Sprints',description:'30 sec fast · 90 sec easy · 8 rounds',rounds:8,work:'00:30',rest:'01:30'}],
 walking:[{fun:'Brisk Walk',name:'Brisk Walk',description:'30 min brisk walking · talk, but not sing',rounds:1,work:'30:00',rest:'00:00'},{fun:'Walk Intervals',name:'Walk Intervals',description:'3 min brisk · 2 min easy · 6 rounds',rounds:6,work:'03:00',rest:'02:00'},{fun:'Power Walk',name:'Power Walk',description:'5 min brisk · 1 min easy · 5 rounds',rounds:5,work:'05:00',rest:'01:00'}],
 hiking:[{fun:'Steady Hike',name:'Steady Hike',description:'Continuous outdoor hike · adjust pace to terrain',rounds:1,work:'45:00',rest:'00:00'},{fun:'Uphill Repeats',name:'Uphill Repeats',description:'3 min uphill · 2 min easy/downhill · 6 rounds',rounds:6,work:'03:00',rest:'02:00'},{fun:'Long Hike',name:'Long Hike',description:'Continuous hiking session',rounds:1,work:'60:00',rest:'00:00'}],
 rowing:[{fun:'Steady Row',name:'Steady Row',description:'Continuous indoor rowing at a sustainable pace',rounds:1,work:'20:00',rest:'00:00'},{fun:'Row Intervals',name:'Row Intervals',description:'1 min hard · 1 min easy · 10 rounds',rounds:10,work:'01:00',rest:'01:00'},{fun:'500m Feel',name:'2 / 2 Row',description:'2 min strong · 2 min easy · 6 rounds',rounds:6,work:'02:00',rest:'02:00'}],
 elliptical:[{fun:'Steady Elliptical',name:'Steady Elliptical',description:'Low-impact continuous aerobic session',rounds:1,work:'30:00',rest:'00:00'},{fun:'Elliptical Intervals',name:'Elliptical Intervals',description:'2 min strong · 2 min easy · 6 rounds',rounds:6,work:'02:00',rest:'02:00'}],
 stairmaster:[{fun:'Steady Climb',name:'Steady Climb',description:'Continuous stair climbing at a sustainable pace',rounds:1,work:'20:00',rest:'00:00'},{fun:'Stair Intervals',name:'Stair Intervals',description:'1 min hard · 1 min easy · 10 rounds',rounds:10,work:'01:00',rest:'01:00'}],
 hiit:[{fun:'30 / 60 HIIT',name:'30/60 HIIT',description:'30 sec hard · 60 sec easy · 8 rounds',rounds:8,work:'00:30',rest:'01:00'},{fun:'20 / 40 HIIT',name:'20/40 HIIT',description:'20 sec hard · 40 sec easy · 10 rounds',rounds:10,work:'00:20',rest:'00:40'},{fun:'Tabata',name:'Tabata 20/10',description:'20 sec very hard · 10 sec recovery · 8 rounds',rounds:8,work:'00:20',rest:'00:10'}]
};

const activities={
 running:{name:'Running',icon:'run'}, cycling:{name:'Cycling',icon:'bike'}, walking:{name:'Walking',icon:'walk'},
 'incline-walk':{name:'Incline Walk',icon:'incline'}, hiking:{name:'Hiking',icon:'hike'}, rowing:{name:'Rowing',icon:'row'},
 elliptical:{name:'Elliptical',icon:'elliptical'}, stairmaster:{name:'Stairmaster',icon:'stairs'}, hiit:{name:'HIIT',icon:'bolt'}
};

const iconSvg={
 run:'<svg viewBox="0 0 32 32"><circle cx="20" cy="6" r="3"/><path d="M15 13l5-3 4 4M15 13l-3 7-6 3M15 13l5 6 6 2M12 20l4 2-3 7M20 19l-2 10"/></svg>',
 bike:'<svg viewBox="0 0 32 32"><circle cx="8" cy="23" r="6"/><circle cx="25" cy="23" r="6"/><path d="M8 23l5-10h7l5 10M13 13l6 10M10 10h5M19 13l3-5h4"/></svg>',
 walk:'<svg viewBox="0 0 32 32"><circle cx="18" cy="6" r="3"/><path d="M15 12l4-2 3 6-4 4-1 9M15 12l-3 8-5 5M18 20l6 8"/></svg>',
 incline:'<svg viewBox="0 0 32 32"><path d="M3 27h26M5 25L27 12"/><circle cx="17" cy="6" r="3"/><path d="M14 12l4-2 3 5-4 4-3 8M14 12l-3 7-4 3M17 19l5 6"/></svg>',
 hike:'<svg viewBox="0 0 32 32"><circle cx="17" cy="6" r="3"/><path d="M14 12l5-2 3 7-5 4-2 8M14 12l-3 8-5 5M18 20l5 8M24 11l3 18"/></svg>',
 row:'<svg viewBox="0 0 32 32"><path d="M4 25h24M8 21h14l5 4M11 18h8M20 11l-5 7M21 10l6 9"/><circle cx="21" cy="6" r="3"/></svg>',
 elliptical:'<svg viewBox="0 0 32 32"><ellipse cx="15" cy="25" rx="10" ry="3"/><circle cx="19" cy="6" r="3"/><path d="M16 12l4-2 3 6-5 4-2 8M16 12l-4 8M23 16l4-7M18 20l6 8"/></svg>',
 stairs:'<svg viewBox="0 0 32 32"><path d="M3 27h6v-5h6v-5h6v-5h8"/><circle cx="18" cy="6" r="3"/><path d="M15 12l4-2 3 5-4 4-3 8M18 19l6 6"/></svg>',
 bolt:'<svg viewBox="0 0 32 32"><path d="M19 2L7 18h9l-3 12 12-17h-9z"/></svg>'
};

const params=new URLSearchParams(location.search);
const workoutName=params.get('id');
const isCustom=params.get('custom')==='1';
const activityId=params.get('activity')||localStorage.getItem('gaym-cardio-activity')||'running';
const activity=activities[activityId]||activities.running;
const customWorkouts=safeJson('gaym-added-cardio',[]);
const selectedPrograms=activityPrograms[activityId]||activityPrograms.running;
const plan=(isCustom?customWorkouts:selectedPrograms).find(x=>x.name===workoutName)||selectedPrograms[0];
const $=id=>document.getElementById(id);
const secs=value=>{const [m=0,s=0]=String(value||'0:00').split(':').map(Number);return Math.max(0,m*60+s);};
const fmt=value=>{const total=Math.max(0,Math.ceil(Number(value)||0));return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;};
function safeJson(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback}catch{return fallback}}

let round=1;
let phase='work';
let remaining=secs(plan.work);
let running=false;
let timer=null;
let phaseEndsAt=0;
let lastTickAt=0;
let totalActiveSeconds=0;
let phaseElapsedSeconds=0;
let completedWorkRounds=0;
let segments=[];
let logged=false;
let hasStarted=false;
const timerStorageKey=`gaym-cardio-timer-${activityId}-${plan.name}`;

function renderActivityIcon(target){ if(target) target.innerHTML=iconSvg[activity.icon]||iconSvg.run; }
function phaseDuration(){return phase==='work'?secs(plan.work):secs(plan.rest)}
function phaseRatio(){const d=phaseDuration();return d?Math.min(1,Math.max(0,remaining/d)):0}
function totalPlannedSeconds(){return plan.rounds*(secs(plan.work)+secs(plan.rest))}

function paint(){
  $('round-current').textContent=round;
  $('round-total').textContent=plan.rounds;
  $('round-total-mirror').textContent=plan.rounds;
  $('mega-timer').textContent=fmt(remaining);
  $('interval-type').textContent=phase==='work'?'WORK':'REST';
  $('next-phase-name').textContent=phase==='work'?'REST':'WORK';
  $('next-phase-time').textContent=phase==='work'?plan.rest:plan.work;
  $('planned-total').textContent=fmt(totalPlannedSeconds());
  $('timer-start').textContent=running?'PAUSE':(hasStarted?'RESUME':'START');
  $('timer-ring').style.setProperty('--ring-progress',`${Math.round(phaseRatio()*360)}deg`);
  document.body.classList.toggle('cardio-rest-phase',phase==='rest');
}

function saveTimerState(){
  const state={round,phase,remaining,totalActiveSeconds,phaseElapsedSeconds,completedWorkRounds,segments,phaseEndsAt,lastTickAt:Date.now(),running,hasStarted};
  localStorage.setItem(timerStorageKey,JSON.stringify(state));
}

function setActiveSession(){
  if(hasStarted&&!logged)localStorage.setItem('gaym-active-session',JSON.stringify({label:`${activity.name} · ${plan.name}`,path:location.pathname.split('/').pop()+location.search}));
  else localStorage.removeItem('gaym-active-session');
}

function restoreTimerState(){
  const saved=safeJson(timerStorageKey,null);
  if(!saved)return;
  round=Math.min(plan.rounds,Math.max(1,Number(saved.round)||1));
  phase=saved.phase==='rest'?'rest':'work';
  remaining=Math.max(0,Number(saved.remaining)||phaseDuration());
  totalActiveSeconds=Math.max(0,Number(saved.totalActiveSeconds)||0);
  phaseElapsedSeconds=Math.max(0,Number(saved.phaseElapsedSeconds)||0);
  completedWorkRounds=Math.max(0,Number(saved.completedWorkRounds)||0);
  segments=Array.isArray(saved.segments)?saved.segments:[];
  hasStarted=!!saved.hasStarted||!!saved.running||totalActiveSeconds>0;
  if(saved.running&&saved.phaseEndsAt){
    running=true;
    phaseEndsAt=Number(saved.phaseEndsAt);
    lastTickAt=Date.now();
    timer=setInterval(tick,250);
    tick();
  }
  paint();setActiveSession();
}

function recordCurrentSegment(reason){
  const planned=phaseDuration();
  const completed=Math.min(Math.max(0,phaseElapsedSeconds),planned);
  if(completed<=0&&reason!=='auto')return;
  segments.push({round,phase,plannedSeconds:planned,completedSeconds:completed,skipped:reason==='skip'});
  if(phase==='work'&&reason==='auto'&&completed>=planned-.5)completedWorkRounds=Math.max(completedWorkRounds,round);
}

function moveNext(reason='auto',transitionAt=Date.now()){
  recordCurrentSegment(reason);
  phaseElapsedSeconds=0;
  if(phase==='work'){
    if(secs(plan.rest)<=0){
      if(round>=plan.rounds){finish(true);return}
      round+=1;phase='work';remaining=secs(plan.work);
    }else{
      phase='rest';remaining=secs(plan.rest);
    }
  }else{
    if(round>=plan.rounds){finish(true);return}
    round+=1;phase='work';remaining=secs(plan.work);
  }
  if(running)phaseEndsAt=transitionAt+remaining*1000;
  saveTimerState();paint();
}

function tick(){
  if(!running)return;
  const now=Date.now();
  const elapsed=Math.max(0,(now-lastTickAt)/1000);
  lastTickAt=now;
  totalActiveSeconds+=elapsed;
  phaseElapsedSeconds+=elapsed;
  remaining=Math.max(0,(phaseEndsAt-now)/1000);
  while(remaining<=0&&running){
    const transitionAt=phaseEndsAt;
    moveNext('auto',transitionAt);
    if(running){
      phaseElapsedSeconds=Math.max(0,(now-transitionAt)/1000);
      remaining=Math.max(0,(phaseEndsAt-now)/1000);
    }
  }
  saveTimerState();paint();
}

function changeRemaining(delta){
  remaining=Math.max(1,remaining+delta);
  if(running)phaseEndsAt=Date.now()+remaining*1000;
  saveTimerState();paint();
}

function logCardio(completed){
  if(logged)return null;
  logged=true;
  if(phaseElapsedSeconds>0)recordCurrentSegment('stop');
  const history=safeJson('gaym-cardio-history',[]);
  const row={
    id:'cardio-'+Date.now(),date:new Date().toISOString(),activity:activity.name,activityId,
    name:plan.name,fun:plan.fun,rounds:plan.rounds,completedRounds:completed?plan.rounds:completedWorkRounds,
    currentRound:round,work:plan.work,rest:plan.rest,plannedSeconds:totalPlannedSeconds(),
    elapsedSeconds:Math.round(totalActiveSeconds),elapsedTime:fmt(totalActiveSeconds),completed,segments
  };
  (Array.isArray(history)?history:[]).unshift(row);
  localStorage.setItem('gaym-cardio-history',JSON.stringify(Array.isArray(history)?history:[row]));
  window.GAYMData?.changed('cardio');
  return row;
}

function showCompleteModal(row){
  const modal=$('workout-complete-modal');
  if(!modal)return;
  const roundsDone=Math.min(plan.rounds,row?.completedRounds??completedWorkRounds);
  const mins=Math.max(0,Math.round((row?.elapsedSeconds??totalActiveSeconds)/60));
  $('workout-complete-kicker').textContent=`${roundsDone}/${plan.rounds} INTERVALS · ${activity.name.toUpperCase()}`;
  $('workout-complete-title').textContent='You survived.';
  $('workout-complete-copy').textContent=`${plan.name} is saved to your Diary. Cardio did not win today.`;
  $('workout-complete-stats').innerHTML=
    `<span><strong>${roundsDone}/${plan.rounds}</strong><small>INTERVALS</small></span>`+
    `<span><strong>${mins||'<1'}</strong><small>MIN</small></span>`+
    `<span><strong>${fmt(plan.work)}</strong><small>WORK</small></span>`+
    `<span><strong>${fmt(plan.rest)}</strong><small>REST</small></span>`;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('completion-open');
}

function finish(completed=false){
  if(logged)return;
  if(running)tick();
  clearInterval(timer);timer=null;running=false;
  localStorage.removeItem(timerStorageKey);
  localStorage.removeItem('gaym-active-session');
  const row=logCardio(completed);
  showCompleteModal(row);
}

function restartTimer(){
  clearInterval(timer);timer=null;
  round=1;phase='work';remaining=secs(plan.work);running=false;phaseEndsAt=0;lastTickAt=0;
  totalActiveSeconds=0;phaseElapsedSeconds=0;completedWorkRounds=0;segments=[];logged=false;hasStarted=false;
  localStorage.removeItem(timerStorageKey);localStorage.removeItem('gaym-active-session');
  closeMenu();paint();
}

function openMenu(){const menu=$('cardio-overflow-menu');menu.hidden=false;$('cardio-menu-button').setAttribute('aria-expanded','true')}
function closeMenu(){const menu=$('cardio-overflow-menu');menu.hidden=true;$('cardio-menu-button').setAttribute('aria-expanded','false')}

$('session-fun').textContent=activity.name;
$('session-name').textContent=plan.name;
renderActivityIcon($('activity-icon'));
renderActivityIcon($('ring-activity-icon'));

$('timer-start').addEventListener('click',()=>{
  if(running){tick();clearInterval(timer);timer=null;running=false;phaseEndsAt=0;saveTimerState();setActiveSession();paint();return}
  running=true;hasStarted=true;lastTickAt=Date.now();phaseEndsAt=lastTickAt+remaining*1000;timer=setInterval(tick,250);saveTimerState();setActiveSession();paint();
});
$('timer-minus').addEventListener('click',()=>changeRemaining(-15));
$('timer-plus').addEventListener('click',()=>changeRemaining(15));
$('log-cardio-now').addEventListener('click',()=>finish(false));
$('restart-cardio').addEventListener('click',restartTimer);
$('cardio-menu-button').addEventListener('click',e=>{e.stopPropagation();$('cardio-overflow-menu').hidden?openMenu():closeMenu()});
document.addEventListener('click',e=>{if(!e.target.closest('.cardio-native-top'))closeMenu()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&running)tick()});
window.addEventListener('beforeunload',()=>{if(running)saveTimerState()});

paint();restoreTimerState();
