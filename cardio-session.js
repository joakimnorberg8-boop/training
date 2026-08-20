const presets=[
 {"fun":"Norwegian Wood","name":"4 × 4 intervals","description":"4 min hard · 3 min active rest · 4 rounds","rounds":4,"work":"04:00","rest":"03:00"},
 {"fun":"Thirty Seconds to Serve","name":"30/30 intervals","description":"30 sec hard · 30 sec easy · 10 rounds","rounds":10,"work":"00:30","rest":"00:30"},
 {"fun":"One Minute Stand","name":"60/60 intervals","description":"60 sec hard · 60 sec easy · 8 rounds","rounds":8,"work":"01:00","rest":"01:00"},
 {"fun":"HIIT Me Baby","name":"40/20 intervals","description":"40 sec work · 20 sec rest · 10 rounds","rounds":10,"work":"00:40","rest":"00:20"},
 {"fun":"Tabata-ta-ta","name":"Tabata 20/10","description":"20 sec max · 10 sec rest · 8 rounds","rounds":8,"work":"00:20","rest":"00:10"},
 {"fun":"Sprint Me Like You Mean It","name":"Sprint intervals","description":"30 sec sprint · 90 sec easy · 8 rounds","rounds":8,"work":"00:30","rest":"01:30"},
 {"fun":"Hill Me Softly","name":"Hill intervals","description":"60 sec uphill · 90 sec recovery · 8 rounds","rounds":8,"work":"01:00","rest":"01:30"},
 {"fun":"Tempo? I Barely Know Her","name":"Threshold intervals","description":"8 min controlled hard · 2 min easy · 3 rounds","rounds":3,"work":"08:00","rest":"02:00"}
];

const params=new URLSearchParams(location.search);
const name=params.get('id');
const isCustom=params.get('custom')==='1';
const allCustom=JSON.parse(localStorage.getItem('gaym-added-cardio')||'[]');
const p=(isCustom?allCustom:presets).find(x=>x.name===name)||presets[0];
const $=id=>document.getElementById(id);
const secs=t=>{const a=String(t).split(':').map(Number);return (a[0]||0)*60+(a[1]||0);};
const wholeSeconds=s=>Math.max(0,Math.round(Number(s)||0));
const countdownSeconds=s=>Math.max(0,Math.ceil(Number(s)||0));
const fmt=(s,mode='round')=>{const total=mode==='countdown'?countdownSeconds(s):wholeSeconds(s);return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;};

let round=1;
let phase='work';
let remaining=secs(p.work);
let timer=null;
let running=false;
let phaseEndsAt=0;
let lastTickAt=0;
let totalActiveSeconds=0;
let phaseElapsedSeconds=0;
let completedWorkRounds=0;
let segments=[];
let logged=false;
const timerStorageKey=`gaym-cardio-timer-${p.name}`;

function saveTimerState(){
 if(running)localStorage.setItem(timerStorageKey,JSON.stringify({round,phase,remaining,totalActiveSeconds,phaseElapsedSeconds,completedWorkRounds,segments,phaseEndsAt,lastTickAt:Date.now()}));
}

function restoreTimerState(){
 try{
  const saved=JSON.parse(localStorage.getItem(timerStorageKey)||'null');
  if(!saved?.phaseEndsAt)return;
  ({round,phase,remaining,totalActiveSeconds,phaseElapsedSeconds,completedWorkRounds,segments,phaseEndsAt}=saved);
  running=true;lastTickAt=saved.lastTickAt||Date.now();timer=setInterval(tick,250);paint();
  window.GAYMActiveSession?.set(p.fun||p.name,location.pathname.split('/').pop()+location.search);
 }catch{}
}

$('session-fun').textContent=p.fun;
$('session-name').textContent=p.name;
$('round-total').textContent=p.rounds;

function paint(){
 $('round-current').textContent=round;
 $('interval-type').textContent=phase==='work'?'WORK MODE':'RECOVER';
 $('mega-timer').textContent=fmt(remaining,'countdown');
 $('interval-next').textContent=phase==='work'?`Next: ${p.rest} rest`:`Next: ${p.work} work`;
 $('interval-progress-bar').style.width=`${Math.min(100,((round-1+(phase==='rest'?.5:0))/p.rounds)*100)}%`;
 const elapsed=$('elapsed-session-time');
 if(elapsed) elapsed.textContent=fmt(Math.floor(totalActiveSeconds));
}

function recordCurrentSegment(reason){
 const planned=phase==='work'?secs(p.work):secs(p.rest);
 segments.push({
   round,
   phase,
   plannedSeconds:planned,
   completedSeconds:Math.min(phaseElapsedSeconds,planned),
   skipped:reason==='skip'
 });
 if(phase==='work' && reason==='auto' && phaseElapsedSeconds>=planned){
   completedWorkRounds++;
 }
}

function moveNext(reason='auto',transitionAt=Date.now()){
 recordCurrentSegment(reason);
 phaseElapsedSeconds=0;

 if(phase==='work'){
   phase='rest';
   remaining=secs(p.rest);
 }else{
   if(round>=p.rounds){
     finish(true);
     return;
   }
   round++;
   phase='work';
   remaining=secs(p.work);
 }
 if(running)phaseEndsAt=transitionAt+remaining*1000;
 paint();
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
   const previousEnd=phaseEndsAt;
   moveNext('auto',previousEnd);
   if(running){
    phaseElapsedSeconds=Math.max(0,(now-previousEnd)/1000);
    remaining=Math.max(0,(phaseEndsAt-now)/1000);
   }
 }
 saveTimerState();
 paint();
}

function logCardio(completed){
 if(logged) return;
 logged=true;

 // If the user manually ends while part-way through a phase, preserve that exact partial segment.
 if(phaseElapsedSeconds>0 && !segments.some((s,i)=>i===segments.length-1 && s.round===round && s.phase===phase)){
   recordCurrentSegment('stop');
 }

 const hist=JSON.parse(localStorage.getItem('gaym-cardio-history')||'[]');
 const plannedSeconds=p.rounds*(secs(p.work)+secs(p.rest));
 const entry={
   id:'cardio-'+Date.now(),
   date:new Date().toISOString(),
   name:p.name,
   fun:p.fun,
   rounds:p.rounds,
   completedRounds:completedWorkRounds,
   currentRound:round,
   work:p.work,
   rest:p.rest,
   plannedSeconds,
   elapsedSeconds:Math.round(totalActiveSeconds),
   elapsedTime:fmt(totalActiveSeconds),
   completed,
   segments
 };
 hist.unshift(entry);
 localStorage.setItem('gaym-cardio-history',JSON.stringify(hist));
 window.GAYMData?.changed('cardio');
}

function finish(completed=false){
 clearInterval(timer);
 timer=null;
 running=false;
 localStorage.removeItem(timerStorageKey);
 localStorage.removeItem('gaym-active-session');
 logCardio(completed);
 const player=document.querySelector('.interval-player');
 if(player) player.style.display='none';
 $('cardio-finish')?.classList.add('show');
 const summary=$('cardio-finish-summary');
 if(summary) summary.textContent=`Loggat: ${fmt(totalActiveSeconds)} faktisk intervalltid`;
}

$('timer-start').onclick=()=>{
 if(running){
   tick();
   clearInterval(timer);
   timer=null;
   running=false;
   phaseEndsAt=0;
  localStorage.removeItem(timerStorageKey);
   $('timer-start').textContent='CONTINUE';
   return;
 }
 running=true;
 $('timer-start').textContent='PAUSE';
 lastTickAt=Date.now();
 phaseEndsAt=lastTickAt+remaining*1000;
 timer=setInterval(tick,1000);
 saveTimerState();
 localStorage.setItem('gaym-active-session',JSON.stringify({label:p.fun||p.name,path:location.pathname.split('/').pop()+location.search}));
};

$('timer-skip').onclick=()=>{
 // "Skip" records only what was actually completed in this phase.
 moveNext('skip');
};

const logNow=$('log-cardio-now');
if(logNow) logNow.onclick=()=>finish(false);

paint();
restoreTimerState();
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&running)tick();});
