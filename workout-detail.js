const workoutDays = {"push": {"label": "MONDAY", "title": "Push", "subtitle": "Chest · shoulders · triceps", "accent": "PUSH IT, BABY", "exercises": [{"fun": "Pound My Chest", "name": "Bench press", "sets": 4, "reps": "6–8"}, {"fun": "Tits Up, Daddy", "name": "Incline dumbbell press", "sets": 3, "reps": "8–10"}, {"fun": "Hard & Overhead", "name": "Shoulder press", "sets": 3, "reps": "8–10"}, {"fun": "Spread ’Em Sideways", "name": "Dumbbell lateral raise", "sets": 4, "reps": "12–15"}, {"fun": "Push It Down My Throat", "name": "Triceps pushdown", "sets": 3, "reps": "10–12"}, {"fun": "Hands Up, Pants Down", "name": "Overhead triceps extension", "sets": 2, "reps": "12–15"}]}, "pull": {"label": "TUESDAY", "title": "Pull", "subtitle": "Back · biceps", "accent": "PULL ME CLOSER", "exercises": [{"fun": "Pull Me Down, Daddy", "name": "Chins / Lat pulldown", "sets": 4, "reps": "6–10"}, {"fun": "Sit Down & Pull It", "name": "Seated cable row", "sets": 4, "reps": "8–10"}, {"fun": "Face Down, Ass Up", "name": "Chest-supported row", "sets": 3, "reps": "8–12"}, {"fun": "Pull My Face Off", "name": "Face pulls", "sets": 3, "reps": "12–15"}, {"fun": "Jerk It Till It Grows", "name": "Biceps curl", "sets": 3, "reps": "8–12"}, {"fun": "Double Fisting", "name": "Hammer curls", "sets": 3, "reps": "10–12"}]}, "legs": {"label": "WEDNESDAY", "title": "Legs", "subtitle": "Quads · hamstrings · calves · core", "accent": "LEGS FOR DAYS", "exercises": [{"fun": "Ass to Grass", "name": "Squat", "sets": 4, "reps": "6–8"}, {"fun": "Legsd Over, Babe", "name": "Romanian deadlift", "sets": 3, "reps": "8–10"}, {"fun": "Spread & Press", "name": "Leg press", "sets": 3, "reps": "10–12"}, {"fun": "Legs Up", "name": "Leg curl", "sets": 3, "reps": "10–12"}, {"fun": "Open Wide", "name": "Leg extension", "sets": 3, "reps": "12–15"}, {"fun": "Just the Tiptoes", "name": "Calf raise", "sets": 4, "reps": "10–15"}, {"fun": "Daddy’s Six-Pack", "name": "Cable crunch", "sets": 3, "reps": "10–15"}]}, "upper": {"label": "FRIDAY", "title": "Upper body", "subtitle": "Chest · back · shoulders · arms", "accent": "UPPER CLASS", "exercises": [{"fun": "Tits Up Again", "name": "Incline bench press", "sets": 3, "reps": "6–10"}, {"fun": "Pull Me Down Hard", "name": "Lat pulldown", "sets": 3, "reps": "8–12"}, {"fun": "Sit, Pull & Behave", "name": "Cable row", "sets": 3, "reps": "8–12"}, {"fun": "Spread ’Em Sideways", "name": "Lateral raise", "sets": 4, "reps": "12–20"}, {"fun": "Squeeze Those Tits", "name": "Pec deck / cable fly", "sets": 2, "reps": "10–15"}, {"fun": "Jerk It Till It Grows", "name": "Biceps curl", "sets": 3, "reps": "10–15"}, {"fun": "Push It Down My Throat", "name": "Triceps pushdown", "sets": 3, "reps": "10–15"}]}, "legs-arms": {"label": "SATURDAY", "title": "Legs + arms", "subtitle": "Legs · biceps · triceps · calves", "accent": "LEGS & LIP GLOSS", "exercises": [{"fun": "Bottom Training", "name": "Hack squat / leg press", "sets": 3, "reps": "8–12"}, {"fun": "Legsd Over After Dark", "name": "Romanian deadlift", "sets": 3, "reps": "8–10"}, {"fun": "Legs Up, Daddy", "name": "Leg curl", "sets": 3, "reps": "10–15"}, {"fun": "Open Wide", "name": "Leg extension", "sets": 3, "reps": "10–15"}, {"fun": "Forgive Me, Daddy", "name": "Preacher curl", "sets": 3, "reps": "8–12"}, {"fun": "Double Fisting", "name": "Hammer curl", "sets": 2, "reps": "10–15"}, {"fun": "Hands Up, Pants Down", "name": "Overhead triceps extension", "sets": 3, "reps": "10–15"}, {"fun": "Just the Tiptoes", "name": "Calf raise", "sets": 3, "reps": "12–20"}]}};

workoutDays.custom = {label:'CUSTOM',title:'Custom Workout',subtitle:'Bygg passet själv och logga set, vikt och reps.',accent:'EGET PASS',exercises:[]};

workoutDays['daniel-rygg'] = {label:'DAY 1', title:'Back & Biceps', subtitle:'Deadlift · rows · biceps', accent:"DANIEL'S ORDERS", exercises:[
  {fun:'Deadlift Daddy', name:'Deadlift', sets:5, reps:'5'},
  {fun:'Pull Me Down, Daddy', name:'Chin-ups or lat pulldown', sets:3, reps:'10'},
  {fun:'Legst Over & Bothered', name:'Legst-over row', sets:3, reps:'12'},
  {fun:'Z Marks the Spot', name:'EZ-bar curl', sets:3, reps:'10'},
  {fun:'Preacher, Forgive Me', name:'Preacher curl m/hantlar', sets:3, reps:'12'}
]};
workoutDays['daniel-brost'] = {label:'DAY 2', title:'Chest & Triceps', subtitle:'Legsch press · dips · nedpress', accent:"DANIEL'S ORDERS", exercises:[
  {fun:'Pound My Chest', name:'Legsch press', sets:5, reps:'5'},
  {fun:'Incline, Baby', name:'Incline dumbbell press', sets:3, reps:'12'},
  {fun:'Dip Into It', name:'Weighted dips', sets:3, reps:'8–10'},
  {fun:'Narrow Minded', name:'Close-grip bench press', sets:3, reps:'10'},
  {fun:'Push It Down My Throat', name:'Nedpress', sets:3, reps:'15'}
]};
workoutDays['daniel-ben'] = {label:'DAY 4', title:'Legs', subtitle:'Squat · leg press · lunges · leg curl', accent:"DANIEL'S ORDERS", exercises:[
  {fun:'Ass to Grass', name:'Squat', sets:5, reps:'5'},
  {fun:'Spread & Press', name:'Leg press', sets:2, reps:'10'},
  {fun:'Split Decision', name:'Lunges', sets:3, reps:'10'},
  {fun:'Legs Up', name:'Leg curl', sets:4, reps:'12'},
  {fun:'Open Wide', name:'Leg extensions', sets:2, reps:'15'}
]};
workoutDays['daniel-skuldror'] = {label:'DAY 5', title:'Shoulders & Calves', subtitle:'Press · lateral raise · calf raise', accent:"DANIEL'S ORDERS", exercises:[
  {fun:'Pound My Chest, Round 2', name:'Legsch press', sets:4, reps:'4'},
  {fun:'Hard & Overhead', name:'Military press', sets:5, reps:'5'},
  {fun:'Seated & Served', name:'Sittande skulderpress m/hantlar', sets:3, reps:'15'},
  {fun:'Just the Tiptoes', name:'Standing calf raise', sets:4, reps:'15–20'},
  {fun:'Sit & Rise', name:'Seated calf raise', sets:4, reps:'15–20'}
]};

const exerciseLibrary = [
  {fun:"Pound My Chest",name:"Legsch press",sets:4,reps:"6–8"},
  {fun:"Tits Up, Daddy",name:"Incline dumbbell press",sets:3,reps:"8–10"},
  {fun:"Hard & Overhead",name:"Shoulder press",sets:3,reps:"8–10"},
  {fun:"Spread ’Em Sideways",name:"Dumbbell lateral raise",sets:4,reps:"12–15"},
  {fun:"Push It Down My Throat",name:"Triceps pushdown",sets:3,reps:"10–12"},
  {fun:"Hands Up, Pants Down",name:"Overhead triceps extension",sets:3,reps:"10–15"},
  {fun:"Pull Me Down, Daddy",name:"Chins / Lat pulldown",sets:4,reps:"6–10"},
  {fun:"Sit Down & Pull It",name:"Seated cable row",sets:4,reps:"8–10"},
  {fun:"Face Down, Ass Up",name:"Chest-supported row",sets:3,reps:"8–12"},
  {fun:"Pull My Face Off",name:"Face pulls",sets:3,reps:"12–15"},
  {fun:"Jerk It Till It Grows",name:"Biceps curl",sets:3,reps:"8–12"},
  {fun:"Double Fisting",name:"Hammer curls",sets:3,reps:"10–12"},
  {fun:"Ass to Grass",name:"Squat",sets:4,reps:"6–8"},
  {fun:"Legsd Over, Babe",name:"Romanian deadlift",sets:3,reps:"8–10"},
  {fun:"Spread & Press",name:"Leg press",sets:3,reps:"10–12"},
  {fun:"Legs Up",name:"Leg curl",sets:3,reps:"10–12"},
  {fun:"Open Wide",name:"Leg extension",sets:3,reps:"12–15"},
  {fun:"Just the Tiptoes",name:"Calf raise",sets:4,reps:"10–15"},
  {fun:"Daddy’s Six-Pack",name:"Cable crunch",sets:3,reps:"10–15"},
  {fun:"Squeeze Those Tits",name:"Pec deck / cable fly",sets:2,reps:"10–15"},
  {fun:"Forgive Me, Daddy",name:"Preacher curl",sets:3,reps:"8–12"},
  {fun:"Bottom Training",name:"Hack squat / leg press",sets:3,reps:"8–12"}
];

const gluteExerciseLibrary = [
  {fun:'Thrust Issues',name:'Hip thrust',sets:4,reps:'6–10'},
  {fun:'Rear View Royalty',name:'Bulgarian split squat',sets:3,reps:'8–12 / leg'},
  {fun:'Press the Peach',name:'Leg press, high foot position',sets:3,reps:'10–15'},
  {fun:'Kickback Confidential',name:'Cable kickback',sets:3,reps:'12–15 / leg'},
  {fun:'Open for Business',name:'Hip abduction',sets:3,reps:'15–25'},
  {fun:'Bridge Over Troubled Glutes',name:'Glute bridge',sets:4,reps:'10–15'},
  {fun:'Split Decision',name:'Reverse lunge',sets:3,reps:'10–12 / leg'},
  {fun:'Frog Position',name:'Frog pumps',sets:3,reps:'20–30'},
  {fun:'Step Up & Show Off',name:'High step-ups',sets:3,reps:'8–12 / leg'},
  {fun:'Diagonal Drama',name:'Diagonal cable kickback',sets:3,reps:'12–15 / leg'},
  {fun:'Wide Stance Energy',name:'Sumo squat',sets:3,reps:'8–12'},
  {fun:'Back Extension Era',name:'45° back extension, glute focus',sets:3,reps:'10–15'}
];

function loadCustomExercises() {
  return JSON.parse(localStorage.getItem('gaym-custom-exercises') || '[]');
}
function loadAddedExercises() {
  return JSON.parse(localStorage.getItem(`gaym-added-${dayKey}`) || '[]');
}
function saveAddedExercises(items) {
  localStorage.setItem(`gaym-added-${dayKey}`, JSON.stringify(items));
}
function loadRemovedExercises() {
  return JSON.parse(localStorage.getItem(`gaym-removed-${dayKey}`) || '[]');
}
function saveRemovedExercises(items) {
  localStorage.setItem(`gaym-removed-${dayKey}`, JSON.stringify(items));
}

const params = new URLSearchParams(window.location.search);
const hashDay = window.location.hash.replace(/^#/, '').trim().toLowerCase();
const requestedDay = String(params.get('day') || '').trim().toLowerCase();
const storedDay = String(sessionStorage.getItem('gaym-selected-strength-day') || localStorage.getItem('gaym-last-strength-day') || '').trim().toLowerCase();
const validWorkoutDays = new Set(Object.keys(workoutDays));
// Custom Workout gets two independent route signals (?day=custom and #custom).
// This prevents Safari/PWA navigation quirks from ever falling back to Push.
const dayKey = (requestedDay === 'custom' || hashDay === 'custom')
  ? 'custom'
  : validWorkoutDays.has(requestedDay)
    ? requestedDay
    : validWorkoutDays.has(storedDay)
      ? storedDay
      : 'push';

// Keep the chosen strength day stable even if a browser/navigation layer drops the query string.
sessionStorage.setItem('gaym-selected-strength-day', dayKey);
localStorage.setItem('gaym-last-strength-day', dayKey);

const backLink = document.getElementById('workout-back-link');
if(backLink && dayKey==='custom'){
  backLink.href='workout.html';
  backLink.textContent='Alla träningspass';
}

// If the URL did lose its day parameter, restore it without reloading.
if (!validWorkoutDays.has(requestedDay)) {
  const corrected = new URL(window.location.href);
  corrected.searchParams.set('day', dayKey);
  history.replaceState({}, '', corrected);
}

// Mobile 6 migration: default exercises belong to the app.
// Older builds stored removed defaults permanently, so restore them once.
if(localStorage.getItem('gaym-default-exercise-reset-v6')!=='1'){
  ['push','pull','legs','upper','legs-arms','daniel-rygg','daniel-brost','daniel-ben','daniel-skuldror'].forEach(key=>{
    localStorage.removeItem(`gaym-removed-${key}`);
  });
  localStorage.setItem('gaym-default-exercise-reset-v6','1');
}

// Opening Custom Workout from the workout picker starts a clean, empty workout.
// Once inside, exercises added during that session remain until the user leaves and starts a new Custom Workout.
if(dayKey==='custom' && params.get('fresh')==='1'){
  localStorage.removeItem('gaym-added-custom');
  localStorage.removeItem('gaym-day-log-custom');
  localStorage.removeItem('gaym-session-start-custom');
  params.delete('fresh');
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete('fresh');
  cleanUrl.searchParams.set('day','custom');
  cleanUrl.hash='custom';
  history.replaceState({},'',cleanUrl);
}

const baseDay = workoutDays[dayKey] || workoutDays.push;
const removedNames = loadRemovedExercises();
const day = {...baseDay, exercises:[...baseDay.exercises.filter(ex=>!removedNames.includes(ex.name)), ...loadAddedExercises()]};
const storageKey = `gaym-day-log-${dayKey}`;
let log = JSON.parse(localStorage.getItem(storageKey) || '{}');
const sessionStartKey = `gaym-session-start-${dayKey}`;
let sessionStart = Number(localStorage.getItem(sessionStartKey)) || null;
let sessionTimerInterval = null;
let restInterval = null;
let activeRestButton = null;
let restUpdate = null;
const restStorageKey = 'gaym-rest-timer-until';
const $ = id => document.getElementById(id);
let activeExerciseIndex = null;
let showNextChooser = false;
const sessionPrs = new Set();

function setExerciseFocus(index){
  activeExerciseIndex = index;
  render();
  requestAnimationFrame(()=>{
    const card=document.querySelector(`.day-exercise-card[data-exercise-index="${index}"]`);
    card?.scrollIntoView({behavior:'smooth',block:'start'});
  });
}
function clearExerciseFocus(){
  activeExerciseIndex = null;
  render();
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(log));
}


function renderSavedCustomExercises(){
  const wrap=$('saved-custom-exercises');
  const toggle=$('saved-custom-toggle');
  const panel=$('saved-custom-panel');
  const list=$('saved-custom-list');
  const count=$('saved-custom-count');
  if(!wrap||!toggle||!panel||!list||!count)return;

  const custom=loadCustomExercises();
  wrap.hidden=custom.length===0;
  count.textContent=custom.length;

  list.innerHTML=custom.map((ex,i)=>`
    <div class="saved-custom-item">
      <div><strong>${ex.fun||ex.name}</strong><span>${ex.name}</span><small>${ex.sets} × ${ex.reps}</small></div>
      <button type="button" data-add-saved-custom="${i}" aria-label="Add ${ex.name}">＋</button>
    </div>`).join('');

  list.querySelectorAll('[data-add-saved-custom]').forEach(btn=>btn.addEventListener('click',()=>{
    const ex=custom[Number(btn.dataset.addSavedCustom)];
    if(!ex)return;
    addExercise(ex);
  }));

  toggle.onclick=()=>{
    const open=panel.hidden;
    panel.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.classList.toggle('open',open);
  };
}


function getHistory() {
  return JSON.parse(localStorage.getItem('gaym-workout-history') || '[]');
}
function exerciseHistory(name) {
  return getHistory()
    .flatMap(session => (session.exercises || []).map(ex => ({...ex, sessionDate: session.date, sessionTitle: session.title})))
    .filter(ex => ex.name === name)
    .sort((a,b) => new Date(b.sessionDate) - new Date(a.sessionDate));
}
function historicalBestWeight(name){
  return exerciseHistory(name).reduce((best,ex)=>{
    const exBest=Math.max(0,...(ex.sets||[]).map(set=>Number(String(set.weight||0).replace(',','.'))||0));
    return Math.max(best,exBest);
  },0);
}
function maybeCelebratePR(exIndex,setIndex){
  const ex=day.exercises[exIndex];
  const set=log[String(exIndex)]?.sets?.[setIndex];
  if(!ex||!set)return;
  const weight=Number(String(set.weight||0).replace(',','.'))||0;
  if(!weight)return;
  const previous=historicalBestWeight(ex.name);
  const key=`${ex.name}:${weight}`;
  if(weight>previous && !sessionPrs.has(key)){
    sessionPrs.add(key);
    window.GAYMToast?.(`Nytt personbästa · ${weight} kg`);
    if(navigator.vibrate)navigator.vibrate([35,35,70]);
  }
}
function remainingExerciseMarkup(){
  if(!showNextChooser || activeExerciseIndex!==null)return '';
  const remaining=day.exercises.map((ex,i)=>({ex,i})).filter(({i})=>!log[String(i)]?.completed);
  if(!remaining.length)return '';
  return `<section class="next-exercise-picker">
    <div><span>NÄSTA ÖVNING</span><strong>Välj vad du vill köra nu.</strong><small>Du kan ta övningarna i valfri ordning.</small></div>
    <div class="next-exercise-options">${remaining.map(({ex,i})=>`<button type="button" data-next-exercise="${i}"><b>${String(i+1).padStart(2,'0')}</b><span>${ex.fun}</span><small>${ex.name}</small></button>`).join('')}</div>
  </section>`;
}
function confirmIncompleteWorkout(done,total,proceed){
  const missing=total-done;
  if(missing<=0){proceed();return;}
  let modal=document.getElementById('incomplete-workout-modal');
  if(modal)modal.remove();
  modal=document.createElement('div');
  modal.id='incomplete-workout-modal';
  modal.className='incomplete-workout-modal show';
  modal.innerHTML=`<div class="incomplete-workout-backdrop"></div><section class="incomplete-workout-card">
    <p class="eyebrow">AVSLUTA PASS?</p>
    <h2>${missing} ${missing===1?'övning återstår':'övningar återstår'}.</h2>
    <p>Du kan fortsätta träna eller avsluta passet ändå.</p>
    <div><button type="button" data-keep-training>FORTSÄTT TRÄNA</button><button type="button" data-finish-anyway>AVSLUTA ÄNDÅ</button></div>
  </section>`;
  document.body.appendChild(modal);document.body.classList.add('completion-open');
  modal.querySelector('[data-keep-training]').onclick=()=>{modal.remove();document.body.classList.remove('completion-open');};
  modal.querySelector('[data-finish-anyway]').onclick=()=>{modal.remove();document.body.classList.remove('completion-open');proceed();};
}
function lastTimeMarkup(name) {
  const last = exerciseHistory(name)[0];
  if (!last) return `<div class="last-time empty"><span>LAST TIME</span><strong>Ingen tidigare logg</strong></div>`;
  const sets = (last.sets || []).filter(s => s.weight || s.reps).map(s => `${s.weight || '—'} kg × ${s.reps || '—'}`).join(' · ');
  const d = new Date(last.sessionDate).toLocaleDateString('sv-SE',{day:'numeric',month:'short'});
  return `<div class="last-time"><span>LAST TIME · ${d}</span><strong>${sets || 'No sets logged'}</strong></div>`;
}

function render() {
  document.title = `${day.title} — GAYM`;
  $('day-label').textContent = `${day.label} · ${day.accent}`;
  $('day-title').innerHTML = `${day.title}<em>.</em>`;
  $('day-subtitle').textContent = day.subtitle;
  $('page-status').textContent = day.title.toUpperCase();
  $('exercise-count').textContent = day.exercises.length;

  const exerciseCards = day.exercises.map((ex, exIndex) => {
    const key = String(exIndex);
    const state = log[key] || {
      completed:false,
      sets:Array.from({length:ex.sets},()=>({weight:'',reps:'',done:false}))
    };
    if (!Array.isArray(state.sets)) state.sets = [];
    while (state.sets.length < ex.sets) state.sets.push({weight:'',reps:'',done:false});
    log[key] = state;

    const setRows = state.sets.map((s,setIndex)=>`
      <div class="set-row">
        <label>SET ${setIndex+1}</label>
        <div class="weight-stepper"><button type="button" data-adjust="${exIndex}:${setIndex}:-2.5" aria-label="Decrease weight">−</button><input inputmode="decimal" data-ex="${exIndex}" data-set="${setIndex}" data-field="weight" placeholder="kg" value="${s.weight}"><button type="button" data-adjust="${exIndex}:${setIndex}:2.5" aria-label="Increase weight">＋</button></div>
        <input inputmode="numeric" data-ex="${exIndex}" data-set="${setIndex}" data-field="reps" placeholder="reps" value="${s.reps}">
        <button class="set-done ${s.done?'done':''}" data-setdone="${exIndex}:${setIndex}" type="button">${s.done?'✓':'○'}</button>
        ${setIndex >= ex.sets ? `<button class="remove-extra-set" data-remove-set="${exIndex}:${setIndex}" type="button" aria-label="Remove set ${setIndex+1}">−</button>` : ''}
      </div>`).join('');

    return `
      <article data-exercise-index="${exIndex}" class="day-exercise-card ${state.completed?'exercise-complete':''} ${activeExerciseIndex===exIndex?'exercise-focused':'exercise-collapsed'}">
        <div class="exercise-card-top">
          <span class="exercise-number">${String(exIndex+1).padStart(2,'0')}</span>
          <button class="remove-added-exercise" data-remove="${exIndex}" type="button" aria-label="Remove ${ex.name}">REMOVE</button>
          <button class="exercise-complete-button ${state.completed?'done':''}" data-exdone="${exIndex}" type="button">${state.completed ? (activeExerciseIndex===exIndex ? 'MARK NOT DONE' : 'DONE') : 'DONE'}</button>
        </div>
        <p class="exercise-kicker">${day.title} · ${ex.sets} set</p>
        <h2>${ex.fun}</h2>
        <p class="real-name">${ex.name}</p>
        <div class="prescription"><span>${ex.sets} SET × ${ex.reps} REPS</span></div>
        <button class="rest-exercise-button" data-rest-exercise type="button">REST 90 SEC</button>
        ${lastTimeMarkup(ex.name)}
        <button type="button" class="exercise-focus-launch" data-focus-exercise="${exIndex}">
      ${state.completed ? (activeExerciseIndex===exIndex ? 'EDITING' : 'OPEN & EDIT') : activeExerciseIndex===exIndex ? 'IN FOCUS' : 'OPEN EXERCISE'}
    </button>
    <div class="set-table">${setRows}</div>
    <button type="button" class="add-another-set" data-add-set="${exIndex}">
      <span>＋</span><strong>LÄGG TILL SET</strong><small>Extra set</small>
    </button>
      </article>`;
  }).join('');
  const emptyCustom = dayKey==='custom' && day.exercises.length===0
    ? `<div class="custom-workout-empty"><span>＋</span><strong>Custom Workout</strong><p>Det här passet är tomt. Lägg till övningar för att bygga ditt eget pass.</p></div>`
    : '';
  $('all-exercises').innerHTML = remainingExerciseMarkup() + emptyCustom + exerciseCards;

  bind();
  updateProgress();
  save();
}

function bind() {
  document.querySelectorAll('[data-field]').forEach(input => input.addEventListener('input', e => {
    const ex = e.target.dataset.ex, set = Number(e.target.dataset.set), field = e.target.dataset.field;
    log[ex].sets[set][field] = e.target.value; save();
  }));
  document.querySelectorAll('[data-adjust]').forEach(btn => btn.addEventListener('click', e => {
    const [ex,set,delta] = e.currentTarget.dataset.adjust.split(':').map(Number);
    const row = log[String(ex)].sets[set];
    const current = Number(String(row.weight || '0').replace(',', '.')) || 0;
    row.weight = String(Math.max(0, Math.round((current + delta) * 10) / 10));
    save(); render();
  }));
  document.querySelectorAll('[data-setdone]').forEach(btn => btn.addEventListener('click', e => {
    const [ex,set] = e.currentTarget.dataset.setdone.split(':').map(Number);
    log[String(ex)].sets[set].done = !log[String(ex)].sets[set].done;
    if (log[String(ex)].sets[set].done){
      maybeCelebratePR(ex,set);
      if(navigator.vibrate) navigator.vibrate(35);
    }
    save(); render();
  }));
  document.querySelectorAll('[data-add-set]').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    const ex=Number(e.currentTarget.dataset.addSet);
    log[String(ex)].sets.push({weight:'',reps:'',done:false});
    activeExerciseIndex=ex;
    save(); render();
  }));
  document.querySelectorAll('[data-remove-set]').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    const [ex,set]=e.currentTarget.dataset.removeSet.split(':').map(Number);
    if(set < day.exercises[ex].sets) return;
    log[String(ex)].sets.splice(set,1);
    activeExerciseIndex=ex;
    save(); render();
  }));
  document.querySelectorAll('[data-exdone]').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    const ex = e.currentTarget.dataset.exdone;
    const wasDone=!!log[ex].completed;
    log[ex].completed = !wasDone;
    activeExerciseIndex = null;
    showNextChooser = !wasDone;
    if(navigator.vibrate) navigator.vibrate(wasDone ? 25 : [35,35,35]);
    save(); render();
    if(!wasDone) requestAnimationFrame(()=>document.querySelector('.next-exercise-picker')?.scrollIntoView({behavior:'smooth',block:'center'}));
  }));
  document.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', e => {
    removeExercise(Number(e.currentTarget.dataset.remove));
  }));
  document.querySelectorAll('[data-rest-exercise]').forEach(btn => btn.addEventListener('click', () => {
    if (btn.classList.contains('running')) cancelRestTimer();
    else startRestTimer(btn);
  }));
  document.querySelectorAll('[data-focus-exercise]').forEach(btn=>btn.addEventListener('click', e=>{
    e.stopPropagation();
    const index=Number(e.currentTarget.dataset.focusExercise);
    showNextChooser=false;
    setExerciseFocus(index);
  }));
  document.querySelectorAll('.day-exercise-card').forEach(card=>card.addEventListener('click', e=>{
    if(e.target.closest('button,input,a,label')) return;
    const index=Number(card.dataset.exerciseIndex);
    showNextChooser=false;
    setExerciseFocus(index);
  }));
  document.querySelectorAll('[data-next-exercise]').forEach(btn=>btn.addEventListener('click',e=>{
    e.stopPropagation();showNextChooser=false;setExerciseFocus(Number(e.currentTarget.dataset.nextExercise));
  }));
}

function updateProgress() {
  const done = day.exercises.filter((_,i)=>log[String(i)]?.completed).length;
  $('completed-count').textContent = done;
  $('detail-progress-bar').style.width = `${day.exercises.length ? (done/day.exercises.length)*100 : 0}%`;
}

function removeExercise(idx) {
  const ex = day.exercises[idx];
  if (!ex) return;
  const added = loadAddedExercises();
  const addedIdx = added.findIndex(a => a.name === ex.name);
  if (addedIdx >= 0) {
    added.splice(addedIdx, 1);
    saveAddedExercises(added);
  } else {
    const removed = loadRemovedExercises();
    if (!removed.includes(ex.name)) removed.push(ex.name);
    saveRemovedExercises(removed);
    window.GAYMToast?.('Removed for this workout only. It returns next session.');
  }
  const newLog = {};
  let newIdx = 0;
  day.exercises.forEach((item, i) => {
    if (item.name === ex.name) return;
    if (log[String(i)]) newLog[String(newIdx)] = log[String(i)];
    newIdx++;
  });
  localStorage.setItem(storageKey, JSON.stringify(newLog));
  location.reload();
}

function formatElapsed(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`;
}
function updateSessionTimer() {
  if (!sessionStart) return;
  const el = $('session-timer');
  if (el) el.textContent = formatElapsed(Date.now() - sessionStart);
}
function showSessionTimer() {
  const button = $('session-start-button');
  if (button) {
    button.hidden = false;
    button.textContent = 'FINISH WORKOUT';
    button.classList.add('session-finish-mode');
  }
  const display = $('session-timer-display');
  if (display) display.hidden = false;
  updateSessionTimer();
  clearInterval(sessionTimerInterval);
  sessionTimerInterval = setInterval(updateSessionTimer, 1000);
}
function startSession() {
  if (sessionStart) return;
  sessionStart = Date.now();
  localStorage.setItem(sessionStartKey, String(sessionStart));
  localStorage.setItem('gaym-active-session', JSON.stringify({label: day.title, path: `workout-detail.html?day=${dayKey}`}));
  showSessionTimer();
}

function cancelRestTimer() {
  clearInterval(restInterval);
  localStorage.removeItem(restStorageKey);
  if (activeRestButton) {
    activeRestButton.classList.remove('running');
    activeRestButton.textContent = 'VILA 90 SEC ⏱';
  }
  activeRestButton = null;
  restUpdate = null;
}

function startRestTimer(button, savedDeadline = 0) {
  clearInterval(restInterval);
  if (activeRestButton && activeRestButton !== button) {
    activeRestButton.classList.remove('running');
    activeRestButton.textContent = 'VILA 90 SEC ⏱';
  }
  activeRestButton = button;
  const deadline = savedDeadline > Date.now() ? savedDeadline : Date.now() + 90000;
  localStorage.setItem(restStorageKey, String(deadline));
  button.classList.add('running');
  const update = () => {
    const seconds = Math.ceil((deadline - Date.now()) / 1000);
    button.textContent = `CANCEL REST · ${Math.max(0, seconds)} SEC ✕`;
    if (seconds <= 0) {
      clearInterval(restInterval);
      localStorage.removeItem(restStorageKey);
      button.classList.remove('running');
      button.textContent = 'Rest complete';
    }
  };
  restUpdate = update;
  update();
  restInterval = setInterval(update, 250);
}

$('rest-button')?.addEventListener('click', () => {
  const btn=$('rest-button');
  if(btn.classList.contains('running')) cancelRestTimer();
  else startRestTimer(btn);
});
const savedRestDeadline = Number(localStorage.getItem(restStorageKey));
if (savedRestDeadline > Date.now()) {
  const firstRestButton = document.querySelector('[data-rest-exercise]');
  if (firstRestButton) startRestTimer(firstRestButton, savedRestDeadline);
}
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && restUpdate) restUpdate();
});


function completionMessage({title, dayKey, done, total, setsDone, totalSets, elapsedSeconds}){
  const ratio=total ? done/total : 0;
  const mins=Math.round((elapsedSeconds||0)/60);
  const key=(dayKey||'').toLowerCase();
  const name=(title||'workout').toUpperCase();

  let pool;
  if(key.includes('legs')){
    pool=[
      ["LEGS HAVE LEFT THE CHAT",`You finished ${name}. Stairs are now a hate crime.`],
      ["WALKING IS CANCELLED",`${setsDone} sets logged. Tomorrow's movement will be mostly decorative.`],
      ["LEG DAY: SUCCESSFULLY HOSTILE",`You trained legs hard enough to make sitting down a trust exercise.`]
    ];
  }else if(key.includes('pull') || key.includes('back')){
    pool=[
      ["BACK SHOTS, BUT MAKE THEM LAT PULLDOWNS",`${setsDone} sets later and your back has officially entered its wide era.`],
      ["WINGS INSTALLED",`That ${name} session gave your T-shirt new structural problems.`],
      ["PULL GAME: SUSPICIOUSLY STRONG",`${done}/${total} exercises done. Grindr posture upgraded.`]
    ];
  }else if(key.includes('push') || key.includes('chest') || key.includes('upper')){
    pool=[
      ["CHEST OUT. BAD DECISIONS LATER.",`${setsDone} sets logged. The pump is temporary. The audacity is permanent.`],
      ["PUSHED HARDER THAN YOUR LAST SITUATIONSHIP",`${done}/${total} exercises complete. Emotional growth remains optional.`],
      ["TITS: TEMPORARILY EXPENSIVE",`You finished ${name}. Please allow 3–5 business days for the sleeves to recover.`]
    ];
  }else{
    pool=[
      ["HOT PEOPLE FINISH THEIR WORKOUTS",`${setsDone} sets logged. The people with “hey” in their bio could never.`],
      ["SWEATY, ACCOMPLISHED, QUESTIONABLE",`${done}/${total} exercises complete. Exactly the brand.`],
      ["THE GAY AGENDA ADVANCES",`${name} complete. Another deeply unnecessary level of confidence unlocked.`]
    ];
  }
  if(ratio < .5) pool=[
    ["PARTIAL CREDIT, FULL ATTITUDE",`${done}/${total} exercises logged. You showed up, caused a scene, and left.`],
    ["A SHORT APPEARANCE",`${setsDone} sets logged. More cameo than feature film, but it counts.`]
  ];
  else if(ratio===1 && totalSets>=15) pool.push(
    ["ABSOLUTE FILTH",`${totalSets} sets completed${mins?` in ${mins} minutes`:''}. Your gym membership has become a personality disorder.`],
    ["OVERACHIEVING HOMOSEXUAL DETECTED",`${totalSets} sets. Somewhere, a tank top just became nervous.`]
  );
  return pool[Math.floor(Math.random()*pool.length)];
}

function showWorkoutCompleteModal(session){
  const sets=(session.exercises||[]).flatMap(ex=>ex.sets||[]);
  const setsDone=sets.filter(set=>set.done || set.weight || set.reps).length;
  const [headline,copy]=completionMessage({
    title:session.title,dayKey:session.dayKey,done:session.completed,total:session.total,
    setsDone,totalSets:sets.length,elapsedSeconds:session.elapsedSeconds
  });
  const modal=document.getElementById('workout-complete-modal');
  if(!modal)return;
  document.getElementById('workout-complete-kicker').textContent=`${session.completed}/${session.total} EXERCISES · ${setsDone} SETS`;
  document.getElementById('workout-complete-title').textContent=headline;
  document.getElementById('workout-complete-copy').textContent=copy;
  const mins=Math.round((session.elapsedSeconds||0)/60);
  const prCount=(session.prs||[]).length;
  document.getElementById('workout-complete-stats').innerHTML=
    `<span><strong>${setsDone}</strong><small>SETS</small></span>`+
    `<span><strong>${session.completed}/${session.total}</strong><small>EXERCISES</small></span>`+
    `<span><strong>${mins||'<1'}</strong><small>MIN</small></span>`+
    `<span><strong>${prCount||'—'}</strong><small>NEW PR</small></span>`;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('completion-open');
}

function finalizeWorkout(){
  const done = day.exercises.filter((_,i)=>log[String(i)]?.completed).length;
  const history = getHistory();
  const session = {
    id: Date.now(),
    date: new Date().toISOString(),
    dayKey,
    title: day.title,
    completed: done,
    total: day.exercises.length,
    elapsedSeconds: sessionStart ? Math.round((Date.now() - sessionStart) / 1000) : 0,
    prs:[...sessionPrs],
    exercises: day.exercises.map((ex,i)=>({
      name: ex.name,
      fun: ex.fun,
      sets: (log[String(i)]?.sets || []).map(s=>({weight:s.weight||'', reps:s.reps||'', done:!!s.done}))
    }))
  };
  history.push(session);
  localStorage.setItem('gaym-workout-history', JSON.stringify(history));window.GAYMData?.changed('workout');
  localStorage.removeItem(storageKey);
  localStorage.removeItem(`gaym-removed-${dayKey}`);
  localStorage.removeItem(sessionStartKey);
  clearInterval(sessionTimerInterval);
  localStorage.removeItem('gaym-active-session');
  showWorkoutCompleteModal(session);
}

function openExerciseModal() {
  document.getElementById('exercise-modal').classList.add('open');
  document.getElementById('exercise-modal').setAttribute('aria-hidden','false');
  renderLibrary('');
}
function closeExerciseModal() {
  document.getElementById('exercise-modal').classList.remove('open');
  document.getElementById('exercise-modal').setAttribute('aria-hidden','true');
}
function addExercise(ex) {
  const added = loadAddedExercises();
  const alreadyInDay = day.exercises.some(item => item.name===ex.name);
  if(alreadyInDay){
    window.GAYMToast?.(`${ex.name} is already in this workout.`);
    return;
  }
  added.push(ex);
  saveAddedExercises(added);
  location.reload();
}
function renderLibrary(query='') {
  const all = [...exerciseLibrary, ...gluteExerciseLibrary]
    .filter((exercise,index,items)=>items.findIndex(item=>item.name===exercise.name)===index);
  const q = query.trim().toLowerCase();
  const filtered = all.filter(ex => !q || ex.name.toLowerCase().includes(q) || ex.fun.toLowerCase().includes(q));
  document.getElementById('library-list').innerHTML = filtered.map((ex,i)=>`
    <button class="library-exercise" type="button" data-library-index="${i}">
      <div><strong>${ex.fun}</strong><span>${ex.name}</span></div>
      <small>${ex.sets} × ${ex.reps}</small><b>＋</b>
    </button>`).join('') || '<p class="library-empty">No exercise found. Create your own instead</p>';
  document.querySelectorAll('[data-library-index]').forEach((btn,i)=>btn.addEventListener('click',()=>addExercise(filtered[i])));
}

document.getElementById('add-exercise-main').addEventListener('click', openExerciseModal);
document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeExerciseModal));
document.getElementById('exercise-search').addEventListener('input', e=>renderLibrary(e.target.value));
document.querySelectorAll('.modal-tab').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.modal-view').forEach(v=>v.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(`${tab.dataset.tab}-view`).classList.add('active');
}));
document.getElementById('create-exercise-button').addEventListener('click',()=>{
  const name=document.getElementById('custom-name').value.trim();
  const fun=document.getElementById('custom-fun').value.trim() || name;
  const sets=Math.max(1,Number(document.getElementById('custom-sets').value)||3);
  const reps=document.getElementById('custom-reps').value.trim() || '8–12';
  if(!name){document.getElementById('custom-name').focus();return;}
  const ex={name,fun,sets,reps};
  const custom=loadCustomExercises(); custom.push(ex);
  localStorage.setItem('gaym-custom-exercises',JSON.stringify(custom));
  renderSavedCustomExercises();
  addExercise(ex);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeExerciseModal();});

render();
renderSavedCustomExercises();
$('session-start-button')?.addEventListener('click', () => {
  if (!sessionStart) {
    startSession();
    return;
  }
  const done=day.exercises.filter((_,i)=>log[String(i)]?.completed).length;
  confirmIncompleteWorkout(done,day.exercises.length,finalizeWorkout);
});
if (sessionStart) {
  localStorage.setItem('gaym-active-session', JSON.stringify({label: day.title, path: `workout-detail.html?day=${dayKey}`}));
  showSessionTimer();
}
