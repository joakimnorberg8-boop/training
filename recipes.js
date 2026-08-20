const recipes=[{"id":"proteinrik-kottgryta","meal":"Lunch","name":"Proteinrik köttgryta med ris","fun":"Svensk vardagsklassiker","tags":["all","jocke","bottom"],"baseWeight":70,"image":"proteinrik-kottgryta.webp","ingredients":[["Mager nötfärs",180,"g"],["Jasminris, okokt",90,"g"],["Krossade tomater",200,"g"],["Paprika",100,"g"],["Gul lök",60,"g"],["Kidneybönor",100,"g"],["Grekisk yoghurt",60,"g"]],"steps":["Koka riset enligt paketet.","Stek lök och nötfärs tills färsen fått färg.","Tillsätt paprika, tomater och kidneybönor och låt sjuda i 10 minuter.","Servera med ris och grekisk yoghurt."],"protein":45,"kcal":650},{"id":"kottfarssas-keso","meal":"Lunch","name":"Köttfärssås med spaghetti & keso","fun":"Klassikern med extra protein","tags":["all","jocke"],"baseWeight":70,"image":"kottfarssas-keso.webp","ingredients":[["Mager nötfärs",200,"g"],["Spaghetti, okokt",100,"g"],["Krossade tomater",200,"g"],["Gul lök",60,"g"],["Keso",100,"g"],["Vitlök",1,"klyfta"]],"steps":["Koka spaghettin.","Stek lök, vitlök och nötfärs.","Tillsätt krossade tomater och låt puttra i 10–15 minuter.","Servera med spaghetti och keso."],"protein":52,"kcal":720},{"id":"lax-rostade-gronsaker","meal":"Dinner","name":"Lax med ugnsrostade grönsaker","fun":"Enkel laxmiddag","tags":["all","bottom"],"baseWeight":70,"image":"lax-rostade-gronsaker.webp","ingredients":[["Laxfilé",180,"g"],["Potatis",300,"g"],["Morot",120,"g"],["Broccoli",150,"g"],["Olivolja",10,"g"],["Grekisk yoghurt",80,"g"],["Citron",0.5,"st"]],"steps":["Sätt ugnen på 200°C.","Rosta potatis och morot med olja i cirka 30 minuter.","Lägg in lax och broccoli när 15 minuter återstår.","Servera med yoghurt och citron."],"protein":44,"kcal":640},{"id":"proteinrik-pasta-pesto","meal":"Dinner","name":"Proteinrik pasta pesto med mozzarella","fun":"Pesto, fast starkare","tags":["all","jocke"],"baseWeight":70,"image":"proteinrik-pasta-pesto.webp","ingredients":[["Proteinrik pasta, okokt",100,"g"],["Mozzarella light",100,"g"],["Pesto",25,"g"],["Spenat",80,"g"],["Körsbärstomater",150,"g"],["Parmesan",15,"g"]],"steps":["Koka pastan.","Vänd ner spenat och tomater i den varma pastan.","Blanda med pesto och mozzarella.","Toppa med parmesan."],"protein":43,"kcal":620},{"id":"aggmuffins-skinka-spenat","meal":"Breakfast","name":"Äggmuffins med skinka & spenat","fun":"Frukost att ta med","tags":["all","bottom"],"baseWeight":70,"image":"aggmuffins-skinka-spenat.webp","ingredients":[["Ägg",4,"st"],["Äggvita",150,"g"],["Kokt skinka",100,"g"],["Spenat",70,"g"],["Riven ost light",40,"g"],["Paprika",80,"g"]],"steps":["Sätt ugnen på 190°C.","Vispa ägg och äggvita.","Blanda ner skinka, spenat, paprika och ost.","Fördela i muffinsformar och grädda 18–20 minuter."],"protein":42,"kcal":430},{"id":"biff-sotpotatis","meal":"Dinner","name":"Biff med sötpotatis & lätt bearnaise","fun":"Helgmat med muskler","tags":["all","jocke"],"baseWeight":70,"image":"biff-sotpotatis.webp","ingredients":[["Ryggbiff",200,"g"],["Sötpotatis",300,"g"],["Haricots verts",150,"g"],["Lätt bearnaisesås",60,"g"],["Olivolja",5,"g"]],"steps":["Rosta sötpotatis i 210°C i cirka 25 minuter.","Stek biffen till önskad stekgrad och låt vila.","Koka haricots verts.","Servera med lätt bearnaise."],"protein":50,"kcal":690}];
const weeklyPlan=[["power-oats", "beef-pasta", "skyr-bowl", "salmon-potato"], ["egg-toast", "beef-burrito", "skyr-bowl", "pork-noodles"], ["protein-pancakes", "lentil-beef", "skyr-bowl", "beef-chili"], ["overnight-oats", "pork-rice", "skyr-bowl", "steak-potatoes"], ["power-oats", "beef-pasta", "skyr-bowl", "cod-mash"], ["egg-toast", "beef-burrito", "skyr-bowl", "pork-noodles"], ["protein-pancakes", "lentil-beef", "skyr-bowl", "beef-chili"]];

const savedCustomFoods=JSON.parse(localStorage.getItem('gaym-custom-foods')||'[]');
savedCustomFoods.forEach(f=>{
 f.tags=[...new Set(['all','user',...(f.tags||[]).filter(tag=>tag==='bottom')])];
 if(!recipes.some(r=>r.id===f.id)) recipes.push(f);
});

const params=new URLSearchParams(location.search);
let category=params.get('category')||'all';
let foodView='all';
const $=id=>document.getElementById(id);
const savedProfile=JSON.parse(localStorage.getItem('gaym-profile')||'{}');
let goal=savedProfile.goal||localStorage.getItem('gaym-food-goal')||'muscle';
let mealFilter='all';

let recipeSearch='';
let favoriteRecipeIds=JSON.parse(localStorage.getItem('gaym-favorite-recipes')||'[]');
if(!Array.isArray(favoriteRecipeIds)) favoriteRecipeIds=[];
let selectedMeals=JSON.parse(localStorage.getItem('gaym-selected-meals')||'[]');
selectedMeals=selectedMeals.map(x=>typeof x==='string'?{instanceId:'legacy-'+x+'-'+Math.random().toString(36).slice(2),recipeId:x}:x);
let customFoods=JSON.parse(localStorage.getItem('gaym-custom-foods')||'[]');
if(Array.isArray(customFoods)) recipes.push(...customFoods);

function getProfile(){
 const profile=JSON.parse(localStorage.getItem('gaym-profile')||'{}');
 const weight=Math.max(45,Math.min(160,Number(profile.weight)||Number(localStorage.getItem('gaym-food-weight'))||70));
 const height=Math.max(145,Math.min(215,Number(profile.height)||Number(localStorage.getItem('gaym-food-height'))||183));
 const age=Math.max(16,Math.min(90,Number(profile.age)||Number(localStorage.getItem('gaym-food-age'))||27));
 const activity=Number(profile.activity)||Number(localStorage.getItem('gaym-food-activity'))||1.55;
 return {weight,height,age,activity};
}
function calcTargets(){
 const {weight,height,age,activity}=getProfile();
 // Mifflin-St Jeor, male constant. This app uses this as an estimate for the current profile.
 const bmr=10*weight+6.25*height-5*age+5;
 const maintenance=bmr*activity;
 let calories=maintenance;
 let proteinPerKg=1.6;
 let label='Maintain weight';
 let adjustment=0;
 if(goal==='loss'){adjustment=-500;calories=maintenance+adjustment;proteinPerKg=1.8;label='Weight loss';}
 if(goal==='muscle'){adjustment=Math.max(200,maintenance*0.08);calories=maintenance+adjustment;proteinPerKg=2.0;label='Muscle gain';}
 const protein=Math.round(weight*proteinPerKg);
 return {weight,height,age,activity,bmr,maintenance,calories,protein,label,adjustment};
}
function targetScale(){
 const t=calcTargets();
 // The original Jocke menu is around 2800 kcal/day at the 70 kg baseline.
 const baselineDayCalories=2800;
 return Math.max(.68,Math.min(1.55,t.calories/baselineDayCalories));
}
function fmt(n,unit){
 if(unit==='st'||unit==='klyfta') return (Math.round(n*2)/2).toLocaleString('sv-SE');
 if(unit==='ml'||unit==='g') return Math.max(5,Math.round(n/5)*5);
 return Math.round(n*10)/10;
}
function isFavorite(id){return favoriteRecipeIds.includes(id);}
function showFavoriteToast(added){
 let toast=document.getElementById('rc32-favorite-toast');
 if(!toast){
  toast=document.createElement('div');
  toast.id='rc32-favorite-toast';
  toast.className='rc32-favorite-toast';
  toast.innerHTML='<span class="rc32-favorite-toast-icon" aria-hidden="true">✓</span><strong></strong>';
  document.body.appendChild(toast);
 }
 toast.querySelector('strong').textContent=added?'Tillagd i favoriter':'Borttagen från favoriter';
 toast.classList.toggle('removed',!added);
 toast.classList.add('show');
 clearTimeout(window.__rc32FavoriteToast);
 window.__rc32FavoriteToast=setTimeout(()=>toast.classList.remove('show'),2200);
}
function toggleFavorite(id){
 const adding=!isFavorite(id);
 if(!adding) favoriteRecipeIds=favoriteRecipeIds.filter(x=>x!==id);
 else favoriteRecipeIds=[...favoriteRecipeIds,id];
 localStorage.setItem('gaym-favorite-recipes',JSON.stringify(favoriteRecipeIds));
 render();
 showFavoriteToast(adding);
}
function rc27ThumbFor(r){ return r.image || 'proteinrik-kottgryta.webp'; }
function card(r){
 const f=targetScale();
 const protein=Math.round(r.protein*f), kcal=Math.round(r.kcal*f/10)*10;
 const fav=isFavorite(r.id);
 const badge=r.custom?'CUSTOM':r.tags.includes('bottom')?'BOTTOM-FRIENDLY':'';
 return `<article class="rc27-meal-card" id="${r.id}">
   <button class="rc27-card-main" type="button" data-open-recipe="${r.id}" aria-label="View ${r.name}">
     <img class="rc27-card-thumb" src="${rc27ThumbFor(r)}" alt="" loading="lazy">
     <div class="rc27-card-copy">
       <h3>${r.name}</h3>
       <p>${kcal} kcal <span>·</span> ${protein} g protein</p>
       ${badge?`<small>${badge}</small>`:''}
     </div>
   </button>
   <div class="rc27-card-actions">
     <button class="rc27-favorite ${fav?'active':''}" type="button" data-favorite-recipe="${r.id}" aria-label="${fav?'Remove from favorites':'Add to favorites'}" aria-pressed="${fav}">
       <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.4 5.4 0 0 0-7.6 0L12 5.9l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.6Z"/></svg>
     </button>
     <button class="rc27-quick-add" type="button" data-select-meal="${r.id}" aria-label="Add ${r.name} to today">＋</button>
   </div>
 </article>`;
}
function renderPlan(){ return; }
function renderTargets(){
 document.querySelectorAll('[data-goal]').forEach(b=>b.classList.toggle('active',b.dataset.goal===goal));
 const target=$('nutrition-targets');
 if(!target)return;
 const t=calcTargets();
 const adj=t.adjustment===0?'±0':`${t.adjustment>0?'+':''}${Math.round(t.adjustment)}`;
 $('nutrition-targets').innerHTML=`
 <div><span>GOAL</span><strong>${t.label}</strong></div>
 <div><span>KCAL / DAY</span><strong>${Math.round(t.calories/10)*10}</strong><small>maintenance approx. ${Math.round(t.maintenance/10)*10}</small></div>
 <div><span>PROTEIN / DAG</span><strong>${t.protein} g</strong><small>${goal==='muscle'?'2,0':goal==='loss'?'1,8':'1,6'} g/kg</small></div>
 <div><span>ENERGY ADJUSTMENT</span><strong>${adj} kcal</strong><small>${goal==='loss'?'deficit':goal==='muscle'?'surplus':'maintenance'}</small></div>`;
}

function recipeMacros(r){
 const f=targetScale();
 return {kcal:Math.round(r.kcal*f/10)*10,protein:Math.round(r.protein*f)};
}
function addMeal(id){
 if(selectedMeals.length+selectedTopups.length>=5){
   alert('You can choose up to 5 meals/snacks per day.');
   return;
 }
 selectedMeals.push({instanceId:'meal-'+Date.now()+'-'+Math.random().toString(36).slice(2),recipeId:id});
 localStorage.setItem('gaym-selected-meals',JSON.stringify(selectedMeals));
 render();
}
function removeMealInstance(instanceId){
 selectedMeals=selectedMeals.filter(x=>x.instanceId!==instanceId);
 localStorage.setItem('gaym-selected-meals',JSON.stringify(selectedMeals));
 render();
}
function renderSelectedMeals(){
 const selected=selectedMeals.map(x=>({instanceId:x.instanceId,recipe:recipes.find(r=>r.id===x.recipeId)})).filter(x=>x.recipe);
 const selectedExtras=selectedTopups.map(x=>({instanceId:x.instanceId,extra:topupOptions.find(o=>o.id===x.topupId)})).filter(x=>x.extra);
 const totals=getCurrentMealTotals();
 const t=calcTargets();
 const itemCount=selectedMeals.length+selectedTopups.length;
 const kcalPct=Math.min(100,Math.round((totals.kcal/t.calories)*100));
 const proteinPct=Math.min(100,Math.round((totals.protein/t.protein)*100));
 $('summary-numbers').innerHTML=`
   <div><span>KCAL</span><strong>${totals.kcal} / ${Math.round(t.calories/10)*10}</strong><small>${kcalPct}% of target</small><div class="goal-bar"><i style="width:${kcalPct}%"></i></div></div>
   <div><span>PROTEIN</span><strong>${totals.protein} / ${t.protein} g</strong><small>${proteinPct}% of target</small><div class="goal-bar"><i style="width:${proteinPct}%"></i></div></div>`;
 const mealHtml=selected.map(({instanceId,recipe:r})=>{const m=recipeMacros(r);return `<button type="button" data-remove-selected="${instanceId}"><span>${r.meal}</span><strong>${r.name}</strong><small>${m.kcal} kcal · ${m.protein} g protein</small><b>×</b></button>`}).join('');
 const extraHtml=selectedExtras.map(({instanceId,extra:o})=>`<button type="button" data-remove-topup="${instanceId}" class="selected-topup"><span>EXTRA / SNACK</span><strong>${o.name}</strong><small>${o.kcal} kcal · ${o.protein} g protein</small><b>×</b></button>`).join('');
 $('selected-meals').innerHTML=(mealHtml+extraHtml)||`<p class="no-meals">No meal selected yet.</p>`;
 document.querySelectorAll('[data-remove-selected]').forEach(b=>b.onclick=()=>removeMealInstance(b.dataset.removeSelected));
 document.querySelectorAll('[data-remove-topup]').forEach(b=>b.onclick=()=>removeTopupInstance(b.dataset.removeTopup));
}


const topupOptions=[
 {id:'topup-water-shake',name:'Proteinshake med vatten',kcal:120,protein:22,kind:'protein'},
 {id:'topup-milk-shake',name:'Proteinshake med 3 dl mjölk',kcal:270,protein:26,kind:'both'},
 {id:'topup-eggs',name:'2 ägg',kcal:150,protein:12,kind:'protein'},
 {id:'topup-skyr',name:'Skyr 300 g',kcal:190,protein:27,kind:'protein'},
 {id:'topup-cottage',name:'Cottage cheese 250 g',kcal:230,protein:26,kind:'protein'},
 {id:'topup-banana-pb',name:'Banan + 20 g jordnötssmör',kcal:230,protein:6,kind:'calories'},
 {id:'topup-oats-milk',name:'50 g havregryn + mjölk',kcal:280,protein:10,kind:'calories'},
 {id:'topup-bread-cheese',name:'2 skivor fullkornsbröd + ost',kcal:330,protein:16,kind:'both'},
 {id:'topup-nuts',name:'30 g nötter',kcal:190,protein:6,kind:'calories'},
 {id:'topup-skyr-banana',name:'Skyr + banan',kcal:300,protein:27,kind:'both'}
];
let selectedTopups=JSON.parse(localStorage.getItem('gaym-selected-topups')||'[]');
selectedTopups=selectedTopups.map(x=>typeof x==='string'?{instanceId:'legacy-topup-'+x+'-'+Math.random().toString(36).slice(2),topupId:x}:x);

function addTopup(id){
 if(selectedMeals.length+selectedTopups.length>=5){
   alert('You can choose up to 5 meals/snacks per day.');
   return;
 }
 selectedTopups.push({instanceId:'topup-'+Date.now()+'-'+Math.random().toString(36).slice(2),topupId:id});
 localStorage.setItem('gaym-selected-topups',JSON.stringify(selectedTopups));
 render();
}
function removeTopupInstance(instanceId){
 selectedTopups=selectedTopups.filter(x=>x.instanceId!==instanceId);
 localStorage.setItem('gaym-selected-topups',JSON.stringify(selectedTopups));
 render();
}
function getCurrentMealTotals(){
 const selected=selectedMeals.map(x=>recipes.find(r=>r.id===x.recipeId)).filter(Boolean);
 const totals=selected.reduce((a,r)=>{const m=recipeMacros(r);a.kcal+=m.kcal;a.protein+=m.protein;return a;},{kcal:0,protein:0});
 selectedTopups.map(x=>topupOptions.find(o=>o.id===x.topupId)).filter(Boolean).forEach(o=>{totals.kcal+=o.kcal;totals.protein+=o.protein;});
 return totals;
}
function suggestTopups(){
 const t=calcTargets();
 const totals=getCurrentMealTotals();
 const kcalGap=Math.max(0,Math.round(t.calories-totals.kcal));
 const proteinGap=Math.max(0,Math.round(t.protein-totals.protein));
 const box=$('topup-suggestions');
 if(!box)return;
 if(selectedMeals.length===0){box.innerHTML='';return;}
 if(kcalGap<=80 && proteinGap<=5){
   box.innerHTML=`<div class="goal-hit"><strong>Fuel secured. Glitter budget untouched.</strong><span>You're close to both calorie and protein targets.</span></div>`;
   return;
 }
 const scored=topupOptions.map(o=>{
   const kcalScore=kcalGap?Math.abs(kcalGap-o.kcal)/Math.max(100,kcalGap):0;
   const proteinScore=proteinGap?Math.abs(proteinGap-o.protein)/Math.max(10,proteinGap):0;
   return {...o,score:kcalScore+proteinScore};
 }).sort((a,b)=>a.score-b.score).slice(0,4);
 box.innerHTML=`<div class="topup-header"><div><p class="eyebrow">FEED THE GAP</p><h3>Komplettera dagens mål.</h3></div><div class="gap-copy">${kcalGap>0?`${kcalGap} kcal left`:''}${kcalGap>0&&proteinGap>0?' · ':''}${proteinGap>0?`${proteinGap} g protein kvar`:''}</div></div>
 <div class="topup-grid">${scored.map(o=>`<button type="button" data-add-topup="${o.id}" class="topup-card "><span>${o.name}</span><strong>${'+'+o.kcal+' kcal · +'+o.protein+' g protein'}</strong></button>`).join('')}</div>`;
 document.querySelectorAll('[data-add-topup]').forEach(b=>b.onclick=()=>addTopup(b.dataset.addTopup));
}


function saveFoodDay(){
 const selected=selectedMeals.map(x=>({instanceId:x.instanceId,recipe:recipes.find(r=>r.id===x.recipeId)})).filter(x=>x.recipe);
 const extras=selectedTopups.map(x=>({instanceId:x.instanceId,extra:topupOptions.find(o=>o.id===x.topupId)})).filter(x=>x.extra);
 if(selected.length+extras.length===0){alert('Choose at least one meal or snack first.');return;}
 const totals=getCurrentMealTotals();
 const target=calcTargets();
 const log=JSON.parse(localStorage.getItem('gaym-food-history')||'[]');
 const entry={
   id:'food-'+Date.now(),
   date:new Date().toISOString(),
   goal:goal,
   goalLabel:target.label,
   calorieTarget:Math.round(target.calories/10)*10,
   proteinTarget:target.protein,
   calories:totals.kcal,
   protein:totals.protein,
   meals:[
     ...selected.map(({recipe:r})=>{const m=recipeMacros(r);return {type:r.meal,name:r.name,kcal:m.kcal,protein:m.protein};}),
     ...extras.map(({extra:o})=>({type:'Extra / snack',name:o.name,kcal:o.kcal,protein:o.protein}))
   ]
 };
 const entryDay=new Date(entry.date).toLocaleDateString('sv-SE');
 const sameDay=log.find(item=>new Date(item.date).toLocaleDateString('sv-SE')===entryDay);
 if(sameDay){
   sameDay.calories=(Number(sameDay.calories)||0)+(Number(entry.calories)||0);
   sameDay.protein=(Number(sameDay.protein)||0)+(Number(entry.protein)||0);
   sameDay.meals=[...(sameDay.meals||[]),...(entry.meals||[])];
   sameDay.goal=entry.goal;
   sameDay.goalLabel=entry.goalLabel;
   sameDay.calorieTarget=entry.calorieTarget;
   sameDay.proteinTarget=entry.proteinTarget;
   sameDay.updatedAt=entry.date;
 }else{
   log.unshift(entry);
 }
 localStorage.setItem('gaym-food-history',JSON.stringify(log));window.GAYMData?.changed('food');
 selectedMeals=[]; selectedTopups=[];
 localStorage.setItem('gaym-selected-meals','[]');
 localStorage.setItem('gaym-selected-topups','[]');
 render();
 const btn=$('save-food-day');
 btn.textContent='DAY LOGGED';
 btn.classList.add('saved');
 setTimeout(()=>{btn.textContent='SAVE & LOG DAY';btn.classList.remove('saved');},1800);
}


function openCustomFood(){
 const modal=$('custom-food-modal');
 if(!modal)return;
 modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
}
function closeCustomFood(){
 const modal=$('custom-food-modal');
 if(!modal)return;
 modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
}
function saveCustomFood(e){
 e.preventDefault();
 if(selectedMeals.length+selectedTopups.length>=5){
   alert('The day already has 5 meals/snacks. Remove one before adding custom food.');
   return;
 }
 const name=$('custom-food-name').value.trim();
 const meal=$('custom-food-meal').value;
 const kcal=Math.max(0,Number($('custom-food-kcal').value)||0);
 const protein=Math.max(0,Number($('custom-food-protein').value)||0);
 const ingredients=$('custom-food-ingredients').value.split('\n').map(x=>x.trim()).filter(Boolean);
 const steps=$('custom-food-steps').value.split('\n').map(x=>x.trim()).filter(Boolean);
 const bottom=$('custom-food-bottom').checked;
 if(!name)return;
 const id='custom-food-'+Date.now();
 const food={
   id,meal,name,fun:'Homemade Twunk Fuel',
  tags:['all','user',...(bottom?['bottom']:[])],
   baseWeight:70,
  ingredients:ingredients.length?ingredients:['1 portion'],
  steps:steps.length?steps:['Nutrition values entered by you.'],
   protein,kcal,
   custom:true
 };
 customFoods.push(food);
 localStorage.setItem('gaym-custom-foods',JSON.stringify(customFoods));
 recipes.push(food);
 selectedMeals.push({instanceId:'meal-'+Date.now()+'-'+Math.random().toString(36).slice(2),recipeId:id});
 localStorage.setItem('gaym-selected-meals',JSON.stringify(selectedMeals));
 $('custom-food-form').reset();
 closeCustomFood();
 render();
}

function renderMealFilters(){ return; }

function syncRc27Navigation(){
 document.querySelectorAll('[data-bank]').forEach(btn=>btn.classList.toggle('active',btn.dataset.bank===category));
}

let rc27DetailRecipeId=null;
function rc27OpenRecipe(id){
 const rec=recipes.find(x=>x.id===id); if(!rec)return;
 rc27DetailRecipeId=id;
 const f=targetScale();
 const modal=document.getElementById('rc27-recipe-modal'); if(!modal)return;
 document.getElementById('rc27-recipe-meal').textContent=rec.meal||'RECIPE';
 document.getElementById('rc27-recipe-name').textContent=rec.name||'Recipe';
 const di=document.getElementById('rc27-detail-image'); if(di)di.src=rc27ThumbFor(rec);
 document.getElementById('rc27-recipe-macros').textContent=`${Math.round(rec.kcal*f/10)*10} kcal · ${Math.round(rec.protein*f)} g protein`;
 const tag=document.getElementById('rc27-detail-tag');
 tag.textContent=rec.custom?'Custom recipe':rec.tags.includes('bottom')?'Bottom-friendly':'';
 tag.hidden=!tag.textContent;
 const ingredients=document.getElementById('rc27-recipe-ingredients');
 ingredients.innerHTML=(rec.ingredients||[]).map(x=>{
   if(rec.custom || !Array.isArray(x)) return `<li><span>${Array.isArray(x)?x[0]:x}</span></li>`;
   return `<li><span>${x[0]}</span><strong>${fmt(x[1]*f,x[2])} ${x[2]||''}</strong></li>`;
 }).join('');
 document.getElementById('rc27-recipe-steps').innerHTML=(rec.steps||[]).map(x=>`<li>${x}</li>`).join('');
 modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('rc27-modal-open');
}
function rc27CloseRecipe(){
 const modal=document.getElementById('rc27-recipe-modal'); if(!modal)return;
 modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('rc27-modal-open'); rc27DetailRecipeId=null;
}
function rc27BindRecipeUI(){
 document.querySelectorAll('[data-open-recipe]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();rc27OpenRecipe(b.dataset.openRecipe);});
 document.querySelectorAll('[data-select-meal]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();addMeal(b.dataset.selectMeal);window.GAYMToast?.('Meal added to today.');});
 document.querySelectorAll('[data-favorite-recipe]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();toggleFavorite(b.dataset.favoriteRecipe);});
}
function setRc27Greeting(){
 const profile=JSON.parse(localStorage.getItem('gaym-profile')||'{}');
 const name=(profile.name||'Kai').trim().split(/\\s+/)[0]||'Kai';
 const g=document.getElementById('rc27-greeting-name'); if(g)g.textContent=`Hi ${name}! 👋`;
 const d=document.getElementById('rc27-greeting-date'); if(d)d.textContent=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
 const hist=JSON.parse(localStorage.getItem('gaym-workout-history')||'[]');
 const dates=new Set(hist.map(x=>String(x.date||'').slice(0,10)));
 let streak=0, day=new Date();
 for(let i=0;i<365;i++){ const key=day.toISOString().slice(0,10); if(dates.has(key)){streak++;day.setDate(day.getDate()-1);} else if(i===0){day.setDate(day.getDate()-1);} else break; }
 const out=document.getElementById('rc27-streak-value'); if(out)out.textContent=streak;
}
function render(){
 syncRc27Navigation();
 let list=recipes.slice();
 if(category==='bottom') list=list.filter(r=>r.tags.includes('bottom'));
 if(category==='jocke') list=list.filter(r=>r.tags.includes('jocke'));
 if(category==='user') list=list.filter(r=>r.custom===true||r.tags.includes('user'));
 if(category==='favorites') list=list.filter(r=>isFavorite(r.id));
 const query=recipeSearch.trim().toLocaleLowerCase('sv-SE');
 if(query) list=list.filter(r=>[r.name,r.fun,r.meal,...(r.tags||[]),...(r.ingredients||[]).map(x=>Array.isArray(x)?x[0]:x),...(r.steps||[])].join(' ').toLocaleLowerCase('sv-SE').includes(query));
 const grid=$('recipe-grid'); if(grid){
   grid.innerHTML=list.length?list.map(card).join(''):`<div class="rc27-empty"><strong>No recipes found</strong><p>Try another collection or search.</p></div>`;
 }
 renderSelectedMeals(); suggestTopups(); rc27BindRecipeUI();
}
function saveProfile(){
 const profile=JSON.parse(localStorage.getItem('gaym-profile')||'{}');
 localStorage.setItem('gaym-food-goal',goal);
 profile.goal=goal;
 localStorage.setItem('gaym-profile',JSON.stringify(profile));
}
document.addEventListener('input',e=>{
 if(e.target.matches('#user-weight,#user-height,#user-age,#user-activity')){saveProfile();render();}
});
document.querySelectorAll('[data-goal]').forEach(btn=>btn.addEventListener('click',()=>{goal=btn.dataset.goal;saveProfile();render();}));
window.addEventListener('DOMContentLoaded',()=>{
 goal=JSON.parse(localStorage.getItem('gaym-profile')||'{}').goal||localStorage.getItem('gaym-food-goal')||'muscle';
 setRc27Greeting();
 document.querySelectorAll('[data-bank]').forEach(btn=>btn.addEventListener('click',()=>{
   category=btn.dataset.bank||'all'; recipeSearch='';
   const url=new URL(location.href); url.search=''; url.searchParams.set('category',category); history.replaceState({},'',url);
   const search=$('recipe-search'); if(search)search.value=''; render();
 }));
 const search=$('recipe-search'); if(search)search.addEventListener('input',e=>{recipeSearch=e.target.value;render();});
 const saveBtn=$('save-food-day'); if(saveBtn)saveBtn.onclick=saveFoodDay;
 const openCustom=$('open-custom-food'); if(openCustom)openCustom.onclick=openCustomFood;
 document.querySelectorAll('[data-close-custom-food]').forEach(x=>x.onclick=closeCustomFood);
 const customForm=$('custom-food-form'); if(customForm)customForm.onsubmit=saveCustomFood;
 document.querySelectorAll('[data-close-recipe-detail]').forEach(x=>x.onclick=rc27CloseRecipe);
 const detailAdd=$('rc27-add-from-detail'); if(detailAdd)detailAdd.onclick=()=>{ if(rc27DetailRecipeId){addMeal(rc27DetailRecipeId);window.GAYMToast?.('Meal added to today.');rc27CloseRecipe();} };
 render();
});
