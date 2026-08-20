const cardioActivities = [
  { id:'running', name:'Running', subtitle:'Outdoor or treadmill', icon:'run', accent:'#ff2e7e' },
  { id:'cycling', name:'Cycling', subtitle:'Outdoor or stationary', icon:'bike', accent:'#13d8c7' },
  { id:'walking', name:'Walking', subtitle:'Outdoor walk', icon:'walk', accent:'#b251ff' },
  { id:'hiking', name:'Hiking', subtitle:'Outdoor hike', icon:'hike', accent:'#ffb000' },
  { id:'rowing', name:'Rowing', subtitle:'Indoor rower', icon:'row', accent:'#ff8a00' },
  { id:'elliptical', name:'Elliptical', subtitle:'Elliptical trainer', icon:'elliptical', accent:'#2e9cff' },
  { id:'stairmaster', name:'Stairmaster', subtitle:'Stair climber', icon:'stairs', accent:'#b251ff' },
  { id:'hiit', name:'HIIT', subtitle:'High intensity intervals', icon:'bolt', accent:'#ff2e7e' }
];

const activityPrograms = {
  running: [
    {fun:'Easy Run',name:'Easy Run',description:'Steady aerobic run · conversational effort',rounds:1,work:'30:00',rest:'00:00',intensity:'MODERATE'},
    {fun:'Run Intervals',name:'Run Intervals',description:'1 min hard · 2 min easy · 8 rounds',rounds:8,work:'01:00',rest:'02:00',intensity:'VIGOROUS'},
    {fun:'4 × 4',name:'4 × 4 Intervals',description:'4 min hard · 3 min active recovery · 4 rounds',rounds:4,work:'04:00',rest:'03:00',intensity:'VIGOROUS'}
  ],
  cycling: [
    {fun:'Easy Ride',name:'Easy Ride',description:'Steady ride on level terrain or stationary bike',rounds:1,work:'30:00',rest:'00:00',intensity:'MODERATE'},
    {fun:'Bike Intervals',name:'Bike Intervals',description:'2 min strong · 2 min easy · 6 rounds',rounds:6,work:'02:00',rest:'02:00',intensity:'MODERATE–HARD'},
    {fun:'Bike Sprints',name:'Bike Sprints',description:'30 sec fast · 90 sec easy · 8 rounds',rounds:8,work:'00:30',rest:'01:30',intensity:'VIGOROUS'}
  ],
  walking: [
    {fun:'Brisk Walk',name:'Brisk Walk',description:'30 min brisk walking · talk, but not sing',rounds:1,work:'30:00',rest:'00:00',intensity:'MODERATE'},
    {fun:'Walk Intervals',name:'Walk Intervals',description:'3 min brisk · 2 min easy · 6 rounds',rounds:6,work:'03:00',rest:'02:00',intensity:'MODERATE'},
    {fun:'Power Walk',name:'Power Walk',description:'5 min brisk · 1 min easy · 5 rounds',rounds:5,work:'05:00',rest:'01:00',intensity:'MODERATE'}
  ],
  hiking: [
    {fun:'Steady Hike',name:'Steady Hike',description:'Continuous outdoor hike · adjust pace to terrain',rounds:1,work:'45:00',rest:'00:00',intensity:'MODERATE–VIGOROUS'},
    {fun:'Uphill Repeats',name:'Uphill Repeats',description:'3 min uphill · 2 min easy/downhill · 6 rounds',rounds:6,work:'03:00',rest:'02:00',intensity:'VIGOROUS'},
    {fun:'Long Hike',name:'Long Hike',description:'Continuous hiking session',rounds:1,work:'60:00',rest:'00:00',intensity:'MODERATE'}
  ],
  rowing: [
    {fun:'Steady Row',name:'Steady Row',description:'Continuous indoor rowing at a sustainable pace',rounds:1,work:'20:00',rest:'00:00',intensity:'MODERATE'},
    {fun:'Row Intervals',name:'Row Intervals',description:'1 min hard · 1 min easy · 10 rounds',rounds:10,work:'01:00',rest:'01:00',intensity:'VIGOROUS'},
    {fun:'500m Feel',name:'2 / 2 Row',description:'2 min strong · 2 min easy · 6 rounds',rounds:6,work:'02:00',rest:'02:00',intensity:'MODERATE–HARD'}
  ],
  elliptical: [
    {fun:'Steady Elliptical',name:'Steady Elliptical',description:'Low-impact continuous aerobic session',rounds:1,work:'30:00',rest:'00:00',intensity:'MODERATE'},
    {fun:'Elliptical Intervals',name:'Elliptical Intervals',description:'2 min strong · 2 min easy · 6 rounds',rounds:6,work:'02:00',rest:'02:00',intensity:'MODERATE–HARD'}
  ],
  stairmaster: [
    {fun:'Steady Climb',name:'Steady Climb',description:'Continuous stair climbing at a sustainable pace',rounds:1,work:'20:00',rest:'00:00',intensity:'MODERATE–HARD'},
    {fun:'Stair Intervals',name:'Stair Intervals',description:'1 min hard · 1 min easy · 10 rounds',rounds:10,work:'01:00',rest:'01:00',intensity:'VIGOROUS'}
  ],
  hiit: [
    {fun:'30 / 60 HIIT',name:'30/60 HIIT',description:'30 sec hard · 60 sec easy · 8 rounds',rounds:8,work:'00:30',rest:'01:00',intensity:'VIGOROUS'},
    {fun:'20 / 40 HIIT',name:'20/40 HIIT',description:'20 sec hard · 40 sec easy · 10 rounds',rounds:10,work:'00:20',rest:'00:40',intensity:'VIGOROUS'},
    {fun:'Tabata',name:'Tabata 20/10',description:'20 sec very hard · 10 sec recovery · 8 rounds',rounds:8,work:'00:20',rest:'00:10',intensity:'VERY HARD'}
  ]
};

const iconSvg={
 run:'<svg viewBox="0 0 32 32"><circle cx="20" cy="6" r="3"/><path d="M15 13l5-3 4 4M15 13l-3 7-6 3M15 13l5 6 6 2M12 20l4 2-3 7M20 19l-2 10"/></svg>',
 bike:'<svg viewBox="0 0 32 32"><circle cx="8" cy="23" r="6"/><circle cx="25" cy="23" r="6"/><path d="M8 23l5-10h7l5 10M13 13l6 10M10 10h5M19 13l3-5h4"/></svg>',
 walk:'<svg viewBox="0 0 32 32"><circle cx="18" cy="6" r="3"/><path d="M15 12l4-2 3 6-4 4-1 9M15 12l-3 8-5 5M18 20l6 8"/></svg>',
 hike:'<svg viewBox="0 0 32 32"><circle cx="17" cy="6" r="3"/><path d="M14 12l5-2 3 7-5 4-2 8M14 12l-3 8-5 5M18 20l5 8M24 11l3 18"/></svg>',
 row:'<svg viewBox="0 0 32 32"><path d="M4 25h24M8 21h14l5 4M11 18h8M20 11l-5 7M21 10l6 9"/><circle cx="21" cy="6" r="3"/></svg>',
 elliptical:'<svg viewBox="0 0 32 32"><ellipse cx="15" cy="25" rx="10" ry="3"/><circle cx="19" cy="6" r="3"/><path d="M16 12l4-2 3 6-5 4-2 8M16 12l-4 8M23 16l4-7M18 20l6 8"/></svg>',
 stairs:'<svg viewBox="0 0 32 32"><path d="M3 27h6v-5h6v-5h6v-5h8"/><circle cx="18" cy="6" r="3"/><path d="M15 12l4-2 3 5-4 4-3 8M18 19l6 6"/></svg>',
 bolt:'<svg viewBox="0 0 32 32"><path d="M19 2L7 18h9l-3 12 12-17h-9z"/></svg>'
};

const $=id=>document.getElementById(id);
let selectedActivity=localStorage.getItem('gaym-cardio-activity')||'running';
let selectedProgramIndex=0;

function seconds(t){const [m=0,s=0]=String(t).split(':').map(Number);return m*60+s}
function totalLabel(p){const s=p.rounds*(seconds(p.work)+seconds(p.rest));return `${Math.round(s/60)} min`}
function activityById(id){return cardioActivities.find(a=>a.id===id)||cardioActivities[0]}
function programs(){return activityPrograms[selectedActivity]||activityPrograms.running}

function renderActivities(){
 const box=$('cardio-activity-list'); if(!box)return;
 box.innerHTML=cardioActivities.map(a=>`<button class="cardio-activity-row${selectedActivity===a.id?' active':''}" data-activity="${a.id}" style="--activity-accent:${a.accent}">
   <span class="cardio-activity-glyph">${iconSvg[a.icon]}</span>
   <span class="cardio-activity-copy"><strong>${a.name}</strong><small>${a.subtitle}</small></span>
   <span class="cardio-row-chevron" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span>
 </button>`).join('');
 box.querySelectorAll('[data-activity]').forEach(btn=>btn.addEventListener('click',()=>{
   selectedActivity=btn.dataset.activity; selectedProgramIndex=0;
   localStorage.setItem('gaym-cardio-activity',selectedActivity);
   renderActivities(); renderPrograms();
   $('cardio-programs')?.scrollIntoView({behavior:'smooth',block:'start'});
 }));
}

function renderPrograms(){
 const activity=activityById(selectedActivity); const list=programs();
 $('selected-activity-name').textContent=activity.name;
 $('selected-activity-subtitle').textContent=activity.subtitle;
 $('selected-activity-icon').innerHTML=iconSvg[activity.icon];
 $('selected-activity-icon').style.color=activity.accent;
 $('cardio-program-list').innerHTML=list.map((p,i)=>`<button class="cardio-program-row${i===selectedProgramIndex?' active':''}" data-program="${i}">
   <span><strong>${p.name}</strong><small>${p.description}</small></span>
   <span class="cardio-program-meta"><b>${totalLabel(p)}</b><small>${p.intensity}</small></span>
 </button>`).join('');
 $('cardio-program-list').querySelectorAll('[data-program]').forEach(btn=>btn.addEventListener('click',()=>{selectedProgramIndex=Number(btn.dataset.program);renderPrograms()}));
 const p=list[selectedProgramIndex]||list[0];
 const href=`cardio-session.html?id=${encodeURIComponent(p.name)}&activity=${encodeURIComponent(selectedActivity)}`;
 $('start-cardio').href=href;
 $('start-cardio').textContent=`START ${activity.name.toUpperCase()}`;
}

function renderHistory(){
 const history=JSON.parse(localStorage.getItem('gaym-cardio-history')||'[]');
 const summary=$('cardio-summary'); if(!summary)return;
 if(history[0]) summary.querySelector('strong').textContent=`${history[0].activity||'Cardio'} · ${history[0].name} · ${history[0].elapsedTime||''}`;
}

renderActivities();renderPrograms();renderHistory();
