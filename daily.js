const $=id=>document.getElementById(id);
let workouts=JSON.parse(localStorage.getItem('gaym-workout-history')||'[]');
let foods=JSON.parse(localStorage.getItem('gaym-food-history')||'[]');
let measurements=JSON.parse(localStorage.getItem('gaym-body-measurements')||'[]');
let cardio=JSON.parse(localStorage.getItem('gaym-cardio-history')||'[]');
let filter='all', currentEdit=null;
const num=v=>{const n=parseFloat(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};
const formatDuration=sec=>{sec=Math.max(0,Math.round(num(sec)));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;};
const key=d=>new Date(d).toLocaleDateString('sv-SE');
const pretty=d=>new Date(d).toLocaleDateString('sv-SE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

function workoutCard(w){
 const sets=(w.exercises||[]).reduce((n,e)=>n+(e.sets||[]).filter(s=>num(s.weight)>0&&num(s.reps)>0).length,0);
 const duration=w.elapsedSeconds?` · ${formatDuration(w.elapsedSeconds)} min`:'';
 return `<article class="timeline-card workout-entry"><div class="timeline-kind">TRAINING</div><div><h3>${w.title||'Workout'}</h3><p>${w.completed??0}/${w.total??0} exercises · ${sets} logged sets${duration}</p></div><div class="timeline-card-actions"><a href="session-history.html?id=${encodeURIComponent(w.id)}">OPEN</a><button data-edit-type="workout" data-edit-id="${w.id}">EDIT</button></div></article>`;
}
function foodCard(f){
 return `<article class="timeline-card food-entry"><div class="timeline-kind">FOOD</div><div><h3>${f.goalLabel||'Food day'}</h3><p>${f.calories||0} / ${f.calorieTarget||'—'} kcal · ${f.protein||0} / ${f.proteinTarget||'—'} g protein</p><div class="timeline-meals">${(f.meals||[]).map(m=>`<span>${m.name}</span>`).join('')}</div></div><div class="timeline-card-actions"><button data-edit-type="food" data-edit-id="${f.id}">EDIT</button></div></article>`;
}
function cardioCard(c){
 const elapsed=c.elapsedSeconds!=null?formatDuration(c.elapsedSeconds):(c.elapsedTime||'—');
 const detail=c.completed?`${c.completedRounds??0}/${c.rounds??0} full rounds`:`Stopped in round ${c.currentRound||c.completedRounds||1}`;
 return `<article class="timeline-card cardio-entry">
   <div class="timeline-kind">KONDITION</div>
   <div><h3>${c.name||'Cardio'}</h3><p>${elapsed} completed time · ${detail}</p></div>
   <div class="timeline-card-actions"><button type="button" data-edit-type="cardio" data-edit-id="${c.id}">EDIT</button></div>
 </article>`;
}
function measureCard(m){
 const fields=[['Weight',m.weight,'kg'],['Waist',m.waist,'cm'],['Chest',m.chest,'cm'],['Hips',m.hips,'cm'],['Left biceps',m.bicepsLeft,'cm'],['Right biceps',m.bicepsRight,'cm'],['Left thigh',m.thighLeft,'cm'],['Right thigh',m.thighRight,'cm'],['Left calf',m.calfLeft,'cm'],['Right calf',m.calfRight,'cm'],['Neck',m.neck,'cm']].filter(x=>x[1]!=null);
 return `<article class="timeline-card measure-entry expanded-measure-entry"><div class="timeline-kind">MEASUREMENTS</div><div><h3>Body measurements</h3><div class="measurement-receipts">${fields.map(([l,v,u])=>`<div><span>${l}</span><strong>${Number(v).toFixed(1)} ${u}</strong></div>`).join('')}</div>${m.note?`<div class="measure-timeline-note">${m.note}</div>`:''}</div><div class="timeline-card-actions"><button data-edit-type="measure" data-edit-id="${m.id}">EDIT</button></div></article>`;
}
function mergeFoodEntries(entries){
 const byDay=new Map();
 entries.forEach(entry=>{
   const day=key(entry.date);
   const current=byDay.get(day);
   if(!current){
     byDay.set(day,{...entry,sourceIds:[entry.data.id],data:{...entry.data,meals:[...(entry.data.meals||[])]}});
     return;
   }
   current.sourceIds.push(entry.data.id);
   current.data.calories=(Number(current.data.calories)||0)+(Number(entry.data.calories)||0);
   current.data.protein=(Number(current.data.protein)||0)+(Number(entry.data.protein)||0);
   current.data.meals=[...(current.data.meals||[]),...(entry.data.meals||[])];
   current.data.goalLabel=entry.data.goalLabel||current.data.goalLabel;
   current.data.calorieTarget=entry.data.calorieTarget||current.data.calorieTarget;
   current.data.proteinTarget=entry.data.proteinTarget||current.data.proteinTarget;
 });
 return [...byDay.values()];
}

function daySummary(group){
 const w=group.filter(x=>x.type==='workout').length;
 const c=group.filter(x=>x.type==='cardio').length;
 const f=group.filter(x=>x.type==='food');
 const m=group.filter(x=>x.type==='measure');
 const calories=f.reduce((a,x)=>a+num(x.data.calories),0);
 const protein=f.reduce((a,x)=>a+num(x.data.protein),0);
 const latestWeight=[...m].reverse().find(x=>x.data.weight!=null)?.data.weight;
 const bits=[];
 if(w)bits.push(`${w} styrkepass`);
 if(c)bits.push(`${c} konditionspass`);
 if(f.length)bits.push(`${Math.round(calories)} kcal · ${Math.round(protein)} g protein`);
 if(latestWeight!=null)bits.push(`${Number(latestWeight).toFixed(1)} kg`);
 return bits.join(' · ')||'Logged day';
}

function renderTimeline(){
 const groupedFood=mergeFoodEntries(foods.map(data=>({type:'food',date:data.date,data})));
 const entries=[
   ...workouts.map(data=>({type:'workout',date:data.date,data})),
   ...groupedFood,
   ...cardio.map(data=>({type:'cardio',date:data.date,data})),
   ...measurements.map(data=>({type:'measure',date:data.date,data}))
 ].filter(x=>filter==='all'||x.type===filter).sort((a,b)=>new Date(b.date)-new Date(a.date));

 const box=$('daily-timeline');
 if(!entries.length){
   box.innerHTML='<div class="empty-history"><strong>Nothing logged yet.</strong><p>Training, food and measurements appear here when you start logging.</p></div>';
   return;
 }
 const groups={};
 entries.forEach(e=>{const k=key(e.date);(groups[k]??=[]).push(e);});
 box.innerHTML=Object.values(groups).map(group=>`
   <details class="diary-day-tab">
     <summary>
       <div><strong>${pretty(group[0].date)}</strong><small>${daySummary(group)}</small></div>
       <span>＋</span>
     </summary>
     <div class="diary-day-content">
       ${group.map(e=>e.type==='workout'?workoutCard(e.data):e.type==='food'?foodCard(e.data):e.type==='cardio'?cardioCard(e.data):measureCard(e.data)).join('')}
     </div>
   </details>`).join('');
 bindEditButtons();
}

function bindEditButtons(){
 document.querySelectorAll('[data-edit-type]').forEach(b=>b.onclick=()=>openEditor(b.dataset.editType,b.dataset.editId));
}
function openEditor(type,id){
 currentEdit={type,id};
 const modal=$('history-edit-modal'),body=$('history-edit-body'),title=$('history-edit-title');
 if(!modal)return;
 if(type==='measure'){
   const item=measurements.find(x=>String(x.id)===String(id));if(!item)return;
   title.textContent='Edit body measurements';
   const fields=[['weight','Weight','kg'],['waist','Waist','cm'],['chest','Chest','cm'],['hips','Hips','cm'],['bicepsLeft','Left biceps','cm'],['bicepsRight','Right biceps','cm'],['thighLeft','Left thigh','cm'],['thighRight','Right thigh','cm'],['calfLeft','Left calf','cm'],['calfRight','Right calf','cm'],['neck','Neck','cm']];
   body.innerHTML=`<div class="edit-measure-grid">${fields.map(([k,l,u])=>`<label>${l} <span>${u}</span><input data-measure-field="${k}" type="number" step="0.1" value="${item[k]??''}"></label>`).join('')}</div><label>ANTECKNING<textarea id="edit-measure-note">${item.note||''}</textarea></label>`;
 } else if(type==='food'){
   const item=foods.find(x=>String(x.id)===String(id));if(!item)return;
   title.textContent='Edit food day';
   body.innerHTML=`<div class="edit-food-grid"><label>KCAL<input id="edit-food-kcal" type="number" value="${item.calories||0}"></label><label>PROTEIN g<input id="edit-food-protein" type="number" value="${item.protein||0}"></label></div><div class="edit-meal-list">${(item.meals||[]).map((m,i)=>`<div><input data-food-name="${i}" value="${m.name||''}"><input data-food-kcal="${i}" type="number" value="${m.kcal||0}"><input data-food-protein="${i}" type="number" value="${m.protein||0}"></div>`).join('')}</div><button type="button" class="add-more-dishes-button" id="edit-food-add-more">＋ ADD MORE DISHES</button>`;
   $('edit-food-add-more').onclick=()=>{location.href='recipes.html?category=all';};
 } else if(type==='cardio'){
   const item=cardio.find(x=>String(x.id)===String(id));if(!item)return;
   title.textContent='Edit cardio workout';
   body.innerHTML=`<div class="edit-food-grid">
     <label>WORKOUT NAME<input id="edit-cardio-name" value="${item.name||''}"></label>
     <label>COMPLETED TIME <span>sek</span><input id="edit-cardio-elapsed" type="number" min="0" value="${item.elapsedSeconds??0}"></label>
     <label>FULL ROUNDS<input id="edit-cardio-rounds" type="number" min="0" max="${item.rounds||99}" value="${item.completedRounds??0}"></label>
     <label>PLANNED ROUNDS<input id="edit-cardio-total" type="number" min="1" value="${item.rounds||1}"></label>
   </div>`;
 } else {
   const item=workouts.find(x=>String(x.id)===String(id));if(!item)return;
   title.textContent='Edit workout';
   body.innerHTML=`<label>WORKOUT NAME<input id="edit-workout-title" value="${item.title||''}"></label><label>COMPLETED TIME <span>sek</span><input id="edit-workout-elapsed" type="number" min="0" value="${item.elapsedSeconds??0}"></label><div class="edit-exercise-list">${(item.exercises||[]).map((e,i)=>`<div class="edit-exercise-row"><strong>${e.name}</strong><div>${(e.sets||[]).map((s,j)=>`<span>Set ${j+1}: <input data-w-set="${i}:${j}:weight" value="${s.weight||''}" placeholder="kg"> × <input data-w-set="${i}:${j}:reps" value="${s.reps||''}" placeholder="reps"></span>`).join('')}</div></div>`).join('')}</div>`;
 }
 modal.classList.add('open');modal.setAttribute('aria-hidden','false');
}
function closeEditor(){const m=$('history-edit-modal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}currentEdit=null;}
function saveEdit(){
 if(!currentEdit)return;const {type,id}=currentEdit;
 if(type==='measure'){const item=measurements.find(x=>String(x.id)===String(id));document.querySelectorAll('[data-measure-field]').forEach(i=>item[i.dataset.measureField]=i.value.trim()===''?null:num(i.value));item.note=$('edit-measure-note').value.trim();localStorage.setItem('gaym-body-measurements',JSON.stringify(measurements));}
 if(type==='food'){const item=foods.find(x=>String(x.id)===String(id));item.calories=num($('edit-food-kcal').value);item.protein=num($('edit-food-protein').value);(item.meals||[]).forEach((m,i)=>{m.name=document.querySelector(`[data-food-name="${i}"]`)?.value||m.name;m.kcal=num(document.querySelector(`[data-food-kcal="${i}"]`)?.value);m.protein=num(document.querySelector(`[data-food-protein="${i}"]`)?.value)});localStorage.setItem('gaym-food-history',JSON.stringify(foods));}
 if(type==='workout'){const item=workouts.find(x=>String(x.id)===String(id));item.title=$('edit-workout-title').value.trim()||item.title;item.elapsedSeconds=Math.max(0,num($('edit-workout-elapsed').value));document.querySelectorAll('[data-w-set]').forEach(i=>{const [e,s,f]=i.dataset.wSet.split(':');item.exercises[+e].sets[+s][f]=i.value});localStorage.setItem('gaym-workout-history',JSON.stringify(workouts));}
 if(type==='cardio'){const item=cardio.find(x=>String(x.id)===String(id));if(item){item.name=$('edit-cardio-name').value.trim()||item.name;item.elapsedSeconds=Math.max(0,num($('edit-cardio-elapsed').value));item.elapsedTime=formatDuration(item.elapsedSeconds);item.completedRounds=Math.max(0,num($('edit-cardio-rounds').value));item.rounds=Math.max(1,num($('edit-cardio-total').value));localStorage.setItem('gaym-cardio-history',JSON.stringify(cardio));}}
 window.GAYMData?.changed(type);
 closeEditor();renderTimeline();window.GAYMToast?.('Changes saved.');
}
function deleteEdit(){
 if(!currentEdit||!confirm('Delete this log?'))return;const {type,id}=currentEdit;
 if(type==='measure'){measurements=measurements.filter(x=>String(x.id)!==String(id));localStorage.setItem('gaym-body-measurements',JSON.stringify(measurements))}
 if(type==='food'){foods=foods.filter(x=>String(x.id)!==String(id));localStorage.setItem('gaym-food-history',JSON.stringify(foods))}
 if(type==='workout'){workouts=workouts.filter(x=>String(x.id)!==String(id));localStorage.setItem('gaym-workout-history',JSON.stringify(workouts))}
 if(type==='cardio'){cardio=cardio.filter(x=>String(x.id)!==String(id));localStorage.setItem('gaym-cardio-history',JSON.stringify(cardio))}
 window.GAYMData?.changed(type);
 closeEditor();renderTimeline();window.GAYMToast?.('Log deleted everywhere.');
}

document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{filter=b.dataset.type;document.querySelectorAll('[data-type]').forEach(x=>x.classList.toggle('active',x===b));renderTimeline();});
document.querySelectorAll('[data-history-close]').forEach(x=>x.onclick=closeEditor);
$('history-save') && ($('history-save').onclick=saveEdit);
$('history-delete') && ($('history-delete').onclick=deleteEdit);
renderTimeline();

window.addEventListener('gaym:measurements-saved',()=>{
  try{const next=JSON.parse(localStorage.getItem('gaym-body-measurements')||'[]');measurements=Array.isArray(next)?next:[];}catch{measurements=[];}
  renderTimeline();
});
window.addEventListener('gaym:data-changed',event=>{
  if(event.detail?.type==='gaym-body-measurements'){
    try{const next=JSON.parse(localStorage.getItem('gaym-body-measurements')||'[]');measurements=Array.isArray(next)?next:[];}catch{measurements=[];}
    renderTimeline();
  }
});
