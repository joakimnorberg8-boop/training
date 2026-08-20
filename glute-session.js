const glutePasses={"peach": {"title": "Peach Engineering", "kicker": "GLUTE STRENGTH", "subtitle": "Heavy glute training with hip thrusts, squats and hinges.", "exercises": [{"fun": "Thrust Issues", "name": "Hip thrust", "sets": 4, "reps": "6–10"}, {"fun": "Rear View Royalty", "name": "Bulgarian split squat", "sets": 3, "reps": "8–12 / leg"}, {"fun": "Legsd & Build", "name": "Romanian deadlift", "sets": 3, "reps": "8–10"}, {"fun": "Press the Peach", "name": "Leg press, high foot position", "sets": 3, "reps": "10–15"}, {"fun": "Kickback Confidential", "name": "Cable kickback", "sets": 3, "reps": "12–15 / leg"}, {"fun": "Open for Business", "name": "Hip abduction", "sets": 3, "reps": "15–25"}]}, "pump": {"title": "Glute Pump", "kicker": "SHORT & SPICY", "subtitle": "A compact workout when you want a pump without reading a novel.", "exercises": [{"fun": "Bridge Over Troubled Glutes", "name": "Glute bridge", "sets": 4, "reps": "10–15"}, {"fun": "Split Decision", "name": "Reverse lunge", "sets": 3, "reps": "10–12 / leg"}, {"fun": "Cable After Dark", "name": "Cable kickback", "sets": 3, "reps": "15–20 / leg"}, {"fun": "Side Piece", "name": "Hip abduction", "sets": 4, "reps": "15–25"}, {"fun": "Frog Position", "name": "Frog pumps", "sets": 3, "reps": "20–30"}]}, "upperglute": {"title": "Upper Glute Agenda", "kicker": "SHELF DEVELOPMENT", "subtitle": "Extra focus on upper glutes and hip abduction.", "exercises": [{"fun": "Step Up & Show Off", "name": "High step-ups", "sets": 3, "reps": "8–12 / leg"}, {"fun": "Diagonal Drama", "name": "Diagonal cable kickback", "sets": 3, "reps": "12–15 / leg"}, {"fun": "Abduction Addiction", "name": "Hip abduction", "sets": 4, "reps": "15–25"}, {"fun": "Wide Stance Energy", "name": "Sumo squat", "sets": 3, "reps": "8–12"}, {"fun": "Back Extension Era", "name": "45° back extension, glute focus", "sets": 3, "reps": "10–15"}]}};
glutePasses.custom={title:'Custom workout',kicker:'YOUR GLUTE AGENDA',subtitle:'Build your own workout and save it for next time.',exercises:[]};
const params=new URLSearchParams(location.search);const passKey=params.get('pass')||'peach';
if(localStorage.getItem('gaym-glute-default-reset-v6')!=='1'){
 ['peach','pump','upperglute'].forEach(key=>localStorage.removeItem('gaym-glute-removed-'+key));
 localStorage.setItem('gaym-glute-default-reset-v6','1');
}
const base=glutePasses[passKey]||glutePasses.peach;const $=id=>document.getElementById(id);
const strengthLibrary=[
 {fun:'Pound My Chest',name:'Legsch press',sets:4,reps:'6–8'}, {fun:'Tits Up, Daddy',name:'Incline dumbbell press',sets:3,reps:'8–10'}, {fun:'Hard & Overhead',name:'Shoulder press',sets:3,reps:'8–10'}, {fun:'Spread ’Em Sideways',name:'Dumbbell lateral raise',sets:4,reps:'12–15'}, {fun:'Push It Down My Throat',name:'Triceps pushdown',sets:3,reps:'10–12'}, {fun:'Hands Up, Pants Down',name:'Overhead triceps extension',sets:3,reps:'10–15'},
 {fun:'Pull Me Down, Daddy',name:'Chins / Lat pulldown',sets:4,reps:'6–10'}, {fun:'Sit Down & Pull It',name:'Seated cable row',sets:4,reps:'8–10'}, {fun:'Face Down, Ass Up',name:'Chest-supported row',sets:3,reps:'8–12'}, {fun:'Pull My Face Off',name:'Face pulls',sets:3,reps:'12–15'}, {fun:'Jerk It Till It Grows',name:'Biceps curl',sets:3,reps:'8–12'}, {fun:'Double Fisting',name:'Hammer curls',sets:3,reps:'10–12'},
 {fun:'Ass to Grass',name:'Squat',sets:4,reps:'6–8'}, {fun:'Legsd Over, Babe',name:'Romanian deadlift',sets:3,reps:'8–10'}, {fun:'Spread & Press',name:'Leg press',sets:3,reps:'10–12'}, {fun:'Legs Up',name:'Leg curl',sets:3,reps:'10–12'}, {fun:'Open Wide',name:'Leg extension',sets:3,reps:'12–15'}, {fun:'Just the Tiptoes',name:'Calf raise',sets:4,reps:'10–15'}, {fun:'Daddy’s Six-Pack',name:'Cable crunch',sets:3,reps:'10–15'},
 {fun:'Squeeze Those Tits',name:'Pec deck / cable fly',sets:2,reps:'10–15'}, {fun:'Forgive Me, Daddy',name:'Preacher curl',sets:3,reps:'8–12'}, {fun:'Bottom Training',name:'Hack squat / leg press',sets:3,reps:'8–12'}
];
const library=[...strengthLibrary,...glutePasses.peach.exercises,...glutePasses.pump.exercises,...glutePasses.upperglute.exercises].filter((x,i,a)=>a.findIndex(y=>y.name===x.name)===i);
function loadCustomExercises(){return JSON.parse(localStorage.getItem('gaym-custom-exercises')||'[]');}
function loadRemovedExercises(){return JSON.parse(localStorage.getItem('gaym-glute-removed-'+passKey)||'[]');}
function saveRemovedExercises(items){localStorage.setItem('gaym-glute-removed-'+passKey,JSON.stringify(items));}
const removedNames=loadRemovedExercises();
let added=JSON.parse(localStorage.getItem('gaym-glute-added-'+passKey)||'[]');let exercises=[...base.exercises.filter(e=>!removedNames.includes(e.name)),...added];
let log=JSON.parse(localStorage.getItem('gaym-glute-log-'+passKey)||'{}');
const sessionStartKey='gaym-glute-session-start-'+passKey;
let sessionStart=Number(localStorage.getItem(sessionStartKey))||null;
let sessionTimerInterval=null;
let activeGluteExerciseIndex=null;
let showGluteNextChooser=false;
const gluteSessionPrs=new Set();
function focusGluteExercise(index){
 activeGluteExerciseIndex=index;render();
 requestAnimationFrame(()=>document.querySelector(`.day-exercise-card[data-exercise-index="${index}"]`)?.scrollIntoView({behavior:'smooth',block:'start'}));
}

function formatElapsed(ms){const totalSec=Math.max(0,Math.floor(ms/1000));const h=Math.floor(totalSec/3600);const m=Math.floor((totalSec%3600)/60);const s=totalSec%60;return h>0?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`;}
function updateSessionTimer(){if(!sessionStart)return;const el=$('glute-session-timer');if(el)el.textContent=formatElapsed(Date.now()-sessionStart);}
function showSessionTimer(){const button=$('glute-session-start-button');if(button){button.hidden=false;button.textContent='FINISH WORKOUT';button.classList.add('session-finish-mode');}const display=$('glute-session-timer-display');if(display)display.hidden=false;updateSessionTimer();clearInterval(sessionTimerInterval);sessionTimerInterval=setInterval(updateSessionTimer,1000);}
function startSession(){sessionStart=Date.now();localStorage.setItem(sessionStartKey,String(sessionStart));localStorage.setItem('gaym-active-session',JSON.stringify({label:base.title,path:`glute-session.html?pass=${passKey}`}));showSessionTimer();}
function save(){localStorage.setItem('gaym-glute-log-'+passKey,JSON.stringify(log));localStorage.setItem('gaym-glute-added-'+passKey,JSON.stringify(added));}
function state(i,e){
 if(!log[i])log[i]={done:false,sets:Array.from({length:e.sets},()=>({weight:'',reps:'',done:false}))};
 if(!Array.isArray(log[i].sets))log[i].sets=[];
 while(log[i].sets.length<e.sets)log[i].sets.push({weight:'',reps:'',done:false});
 return log[i];
}
function gluteHistoricalBest(name){
 const hist=JSON.parse(localStorage.getItem('gaym-workout-history')||'[]');
 return hist.flatMap(s=>s.exercises||[]).filter(e=>e.name===name).reduce((best,e)=>Math.max(best,...(e.sets||[]).map(set=>Number(String(set.weight||0).replace(',','.'))||0)),0);
}
function gluteMaybePR(i,j){
 const e=exercises[i],set=state(i,e).sets[j];const weight=Number(String(set.weight||0).replace(',','.'))||0;if(!weight)return;
 const key=`${e.name}:${weight}`;if(weight>gluteHistoricalBest(e.name)&&!gluteSessionPrs.has(key)){gluteSessionPrs.add(key);window.GAYMToast?.(`NEW PR · ${weight} kg · The peach has become insufferable.`);if(navigator.vibrate)navigator.vibrate([35,35,70]);}
}
function gluteNextMarkup(){
 if(!showGluteNextChooser||activeGluteExerciseIndex!==null)return '';
 const remaining=exercises.map((e,i)=>({e,i})).filter(({i,e})=>!state(i,e).done);if(!remaining.length)return '';
 return `<section class="next-exercise-picker"><div><span>NÄSTA ÖVNING</span><strong>Välj nästa övning.</strong><small>Du kan ändra ordningen när du vill.</small></div><div class="next-exercise-options">${remaining.map(({e,i})=>`<button type="button" data-glute-next="${i}"><b>${String(i+1).padStart(2,'0')}</b><span>${e.fun}</span><small>${e.name}</small></button>`).join('')}</div></section>`;
}
function gluteConfirmIncomplete(done,total,proceed){
 const missing=total-done;if(missing<=0){proceed();return;}
 const modal=document.createElement('div');modal.className='incomplete-workout-modal show';
 modal.innerHTML=`<div class="incomplete-workout-backdrop"></div><section class="incomplete-workout-card"><p class="eyebrow">LEAVING THE ASS UNFINISHED?</p><h2>${missing} ${missing===1?'exercise is':'exercises are'} still waiting.</h2><p>Finish anyway, or return to the scene of the crime.</p><div><button data-keep-training>KEEP TRAINING</button><button data-finish-anyway>FINISH ANYWAY</button></div></section>`;
 document.body.appendChild(modal);document.body.classList.add('completion-open');
 modal.querySelector('[data-keep-training]').onclick=()=>{modal.remove();document.body.classList.remove('completion-open');};
 modal.querySelector('[data-finish-anyway]').onclick=()=>{modal.remove();document.body.classList.remove('completion-open');proceed();};
}
function render(){
 $('glute-kicker').textContent=base.kicker;$('glute-title').innerHTML=base.title+'<em>.</em>';$('glute-subtitle').textContent=base.subtitle;$('glute-total').textContent=exercises.length;
 const gluteCards=exercises.map((e,i)=>{const st=state(i,e);return `<article data-exercise-index="${i}" class="day-exercise-card ${st.done?'exercise-complete':''} ${activeGluteExerciseIndex===i?'exercise-focused':'exercise-collapsed'}"><div class="exercise-card-top"><span class="exercise-number">${String(i+1).padStart(2,'0')}</span><button class="remove-added-exercise" data-glute-remove="${i}">REMOVE</button><button class="exercise-complete-button ${st.done?'done':''}" data-glute-done="${i}">${st.done?(activeGluteExerciseIndex===i?'MARK NOT DONE':'DONE'):'DONE'}</button></div><p class="exercise-kicker">${e.sets} SET · ${e.reps}</p><h2>${e.fun}</h2><p class="real-name">${e.name}</p><button type="button" class="exercise-focus-launch" data-glute-focus="${i}">${st.done?(activeGluteExerciseIndex===i?'EDITING':'OPEN & EDIT'):activeGluteExerciseIndex===i?'IN FOCUS':'OPEN EXERCISE'}</button><div class="set-table">${st.sets.map((s,j)=>`<div class="set-row"><label>SET ${j+1}</label><input data-gfield="weight" data-gi="${i}" data-gs="${j}" inputmode="decimal" placeholder="kg" value="${s.weight}"><input data-gfield="reps" data-gi="${i}" data-gs="${j}" inputmode="numeric" placeholder="reps" value="${s.reps}"><button class="set-done ${s.done?'done':''}" data-gset="${i}:${j}">${s.done?'✓':'○'}</button>${j>=e.sets?`<button class="remove-extra-set" data-gremove-set="${i}:${j}" type="button" aria-label="Remove set ${j+1}">−</button>`:''}</div>`).join('')}</div><button type="button" class="add-another-set" data-gadd-set="${i}"><span>＋</span><strong>LÄGG TILL SET</strong><small>Extra set</small></button></article>`}).join(''); $('glute-exercises').innerHTML=gluteNextMarkup()+gluteCards;
 document.querySelectorAll('[data-gfield]').forEach(x=>x.oninput=()=>{state(+x.dataset.gi,exercises[+x.dataset.gi]).sets[+x.dataset.gs][x.dataset.gfield]=x.value;save();});
 document.querySelectorAll('[data-gset]').forEach(x=>x.onclick=()=>{const [i,j]=x.dataset.gset.split(':').map(Number);state(i,exercises[i]).sets[j].done=!state(i,exercises[i]).sets[j].done;if(state(i,exercises[i]).sets[j].done)gluteMaybePR(i,j);save();render();});
 document.querySelectorAll('[data-gadd-set]').forEach(x=>x.onclick=(event)=>{event.stopPropagation();const i=+x.dataset.gaddSet;state(i,exercises[i]).sets.push({weight:'',reps:'',done:false});activeGluteExerciseIndex=i;save();render();});
 document.querySelectorAll('[data-gremove-set]').forEach(x=>x.onclick=(event)=>{event.stopPropagation();const [i,j]=x.dataset.gremoveSet.split(':').map(Number);if(j<exercises[i].sets)return;state(i,exercises[i]).sets.splice(j,1);activeGluteExerciseIndex=i;save();render();});
 document.querySelectorAll('[data-glute-done]').forEach(x=>x.onclick=()=>{const i=+x.dataset.gluteDone;const wasDone=!!state(i,exercises[i]).done;state(i,exercises[i]).done=!wasDone;save();activeGluteExerciseIndex=null;showGluteNextChooser=!wasDone;if(navigator.vibrate)navigator.vibrate(wasDone?25:[35,35,35]);render();if(!wasDone)requestAnimationFrame(()=>document.querySelector('.next-exercise-picker')?.scrollIntoView({behavior:'smooth',block:'center'}));});
 document.querySelectorAll('[data-glute-remove]').forEach(x=>x.onclick=()=>{removeGluteExercise(+x.dataset.gluteRemove);});
 document.querySelectorAll('[data-glute-focus]').forEach(x=>x.onclick=(event)=>{event.stopPropagation();const i=+x.dataset.gluteFocus;focusGluteExercise(i);});
 document.querySelectorAll('.day-exercise-card').forEach(card=>card.onclick=(event)=>{if(event.target.closest('button,input,a,label'))return;const i=+card.dataset.exerciseIndex;focusGluteExercise(i);}); document.querySelectorAll('[data-glute-next]').forEach(x=>x.onclick=(event)=>{event.stopPropagation();showGluteNextChooser=false;focusGluteExercise(+x.dataset.gluteNext);});
 const done=exercises.filter((e,i)=>state(i,e).done).length;$('glute-done').textContent=done;$('glute-progress').style.width=`${exercises.length?done/exercises.length*100:0}%`;save();
}
function renderLibrary(){$('glute-library').innerHTML=library.map((e,i)=>`<button class="library-exercise" data-gadd="${i}"><div><strong>${e.fun}</strong><span>${e.name}</span></div><small>${e.sets} × ${e.reps}</small><b>＋</b></button>`).join('');document.querySelectorAll('[data-gadd]').forEach(b=>b.onclick=()=>{added.push(library[+b.dataset.gadd]);save();location.reload();});}
function removeGluteExercise(i){
 const ex=exercises[i];
 if(!ex)return;
 const addedIdx=added.findIndex(a=>a.name===ex.name);
 if(addedIdx>=0){added.splice(addedIdx,1);}
 else{if(!removedNames.includes(ex.name))removedNames.push(ex.name);saveRemovedExercises(removedNames);}
 const newLog={};let newIdx=0;
 exercises.forEach((item,idx)=>{if(item.name===ex.name)return;if(log[idx])newLog[newIdx]=log[idx];newIdx++;});
 log=newLog;
 save();
 location.reload();
}
function renderSavedCustomExercises(){
 const wrap=$('saved-custom-exercises');const toggle=$('saved-custom-toggle');const panel=$('saved-custom-panel');const list=$('saved-custom-list');const count=$('saved-custom-count');
 if(!wrap||!toggle||!panel||!list||!count)return;
 const custom=loadCustomExercises();
 wrap.hidden=custom.length===0;
 count.textContent=custom.length;
 list.innerHTML=custom.map((ex,i)=>`<div class="saved-custom-item"><div><strong>${ex.fun||ex.name}</strong><span>${ex.name}</span><small>${ex.sets} × ${ex.reps}</small></div><button type="button" data-add-saved-custom="${i}" aria-label="Add ${ex.name}">＋</button></div>`).join('');
 list.querySelectorAll('[data-add-saved-custom]').forEach(btn=>btn.addEventListener('click',()=>{
   const ex=custom[Number(btn.dataset.addSavedCustom)];
   if(!ex)return;
   if(exercises.some(item=>item.name===ex.name)){window.GAYMToast?.(`${ex.name} is already in this workout.`);return;}
   added.push(ex);save();location.reload();
 }));
 toggle.onclick=()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.classList.toggle('open',open);};
}
$('glute-add').onclick=()=>{$('glute-modal').classList.add('open');renderLibrary();};document.querySelectorAll('[data-glute-close]').forEach(x=>x.onclick=()=>$('glute-modal').classList.remove('open'));
document.querySelectorAll('[data-glute-tab]').forEach(t=>t.onclick=()=>{document.querySelectorAll('[data-glute-tab]').forEach(x=>x.classList.remove('active'));document.querySelectorAll('#glute-modal .modal-view').forEach(x=>x.classList.remove('active'));t.classList.add('active');$('glute-'+t.dataset.gluteTab+'-view').classList.add('active');});
$('glute-create').onclick=()=>{const name=$('glute-custom-name').value.trim();if(!name)return;const exercise={name,fun:$('glute-custom-fun').value.trim()||name,sets:Math.max(1,+$('glute-custom-sets').value||3),reps:$('glute-custom-reps').value.trim()||'10–15'};added.push(exercise);const custom=JSON.parse(localStorage.getItem('gaym-custom-exercises')||'[]');custom.push(exercise);localStorage.setItem('gaym-custom-exercises',JSON.stringify(custom));save();location.reload();};

function showGluteCompleteModal(session){
 const sets=(session.exercises||[]).flatMap(ex=>ex.sets||[]);
 const setsDone=sets.filter(set=>set.done||set.weight||set.reps).length;
 const ratio=session.total?session.completed/session.total:0;
 const mins=Math.round((session.elapsedSeconds||0)/60);
 let pool=ratio===1?[
   ["ASSIGNMENT: ASS",`${setsDone} sets logged. Rear view now subject to building regulations.`],
   ["GLUTES HAVE ENTERED THE GROUP CHAT",`${setsDone} sets later and subtlety has officially been evicted.`],
   ["SHELF ENGINEERING COMPLETE",`You finished ${session.title}. Jeans may require a formal risk assessment.`],
   ["BOTTOM LINE: PROFIT",`${session.completed}/${session.total} exercises done. The rear-view economy is booming.`]
 ]:[
   ["A LITTLE ASS IS STILL ASS",`${session.completed}/${session.total} exercises logged. The glutes received the memo, eventually.`],
   ["PARTIAL PEACH DELIVERY",`${setsDone} sets logged. Not the whole bakery, but enough to leave crumbs.`]
 ];
 if(sets.length>=18)pool.push(["GLUTE OVERDRAFT APPROVED",`${sets.length} sets. Your ass has exceeded its allocated budget.`]);
 const [headline,copy]=pool[Math.floor(Math.random()*pool.length)];
 const modal=document.getElementById('workout-complete-modal');if(!modal)return;
 document.getElementById('workout-complete-kicker').textContent=`${session.completed}/${session.total} EXERCISES · ${setsDone} SETS`;
 document.getElementById('workout-complete-title').textContent=headline;
 document.getElementById('workout-complete-copy').textContent=copy;
 const prCount=(session.prs||[]).length;document.getElementById('workout-complete-stats').innerHTML=`<span><strong>${setsDone}</strong><small>SETS</small></span><span><strong>${session.completed}/${session.total}</strong><small>EXERCISES</small></span><span><strong>${mins||'<1'}</strong><small>MIN</small></span><span><strong>${prCount||'—'}</strong><small>NEW PR</small></span>`;
 modal.classList.add('show');modal.setAttribute('aria-hidden','false');document.body.classList.add('completion-open');
}

function finalizeGluteWorkout(){
 const hist=JSON.parse(localStorage.getItem('gaym-workout-history')||'[]');
 const done=exercises.filter((e,i)=>state(i,e).done).length;
 const elapsedSeconds=sessionStart?Math.round((Date.now()-sessionStart)/1000):0;
 const session={id:Date.now(),date:new Date().toISOString(),dayKey:'glute-'+passKey,title:base.title,completed:done,total:exercises.length,elapsedSeconds,prs:[...gluteSessionPrs],exercises:exercises.map((e,i)=>({name:e.name,fun:e.fun,sets:state(i,e).sets}))};
 hist.push(session);localStorage.setItem('gaym-workout-history',JSON.stringify(hist));window.GAYMData?.changed('workout');
 localStorage.removeItem('gaym-glute-log-'+passKey);localStorage.removeItem('gaym-glute-removed-'+passKey);localStorage.removeItem(sessionStartKey);clearInterval(sessionTimerInterval);localStorage.removeItem('gaym-active-session');
 showGluteCompleteModal(session);
}
const legacyGluteFinish=$('glute-finish');if(legacyGluteFinish)legacyGluteFinish.hidden=true;
render();
renderSavedCustomExercises();
$('glute-session-start-button')?.addEventListener('click',()=>{if(!sessionStart){startSession();return;}const done=exercises.filter((e,i)=>state(i,e).done).length;gluteConfirmIncomplete(done,exercises.length,finalizeGluteWorkout);});
if(sessionStart){localStorage.setItem('gaym-active-session',JSON.stringify({label:base.title,path:`glute-session.html?pass=${passKey}`}));showSessionTimer();}