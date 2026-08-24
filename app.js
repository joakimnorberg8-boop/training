(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const icons={home:'<svg viewBox="0 0 24 24"><path d="M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',plan:'<svg viewBox="0 0 24 24"><path d="M6 3v3M18 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1z"/><path d="M8 12h3M8 16h3M14 12h2M14 16h2"/></svg>',workout:'<svg viewBox="0 0 24 24"><path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/></svg>',progress:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',profile:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"/></svg>',bell:'<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',back:'<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',dots:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></svg>'};
const defaults={
 profile:{name:'Jocke',weight:70.4,height:183,age:28,sex:'male',activity:'active',goal:'gain',calorieTarget:2910,proteinTarget:140,carbTarget:300,fatTarget:80,autoTargets:true},
 customWorkouts:[],customPrograms:[],sessions:[],measurements:[],nutrition:[],recipeFavorites:[],customRecipes:[],
 planned:[], activeSession:null, profileCreated:false, sassSeed:null, dailySass:{date:null,text:''},
 notificationSettings:{workout:true,nutrition:true,progress:true,dailySass:true,unhinged:true,dailyTime:'09:00',nutritionTime:'19:00'},
 notifications:[], notificationMeta:{dailySassDate:null,nutritionDate:null,absenceDate:null,streakMilestone:null}, unicornEvent:null
};

const sass={
 welcome:["Hot people train. Everyone else writes 'hey' on Grindr.","Go become a workplace distraction.","Another day, another chance to become offensively hot.","Your body called. It wants heavier weights and worse decisions.","Clocked in, caffeinated, and dangerously close to a pump.","The homosexual agenda for today: lift something heavy.","You're back. Vanity remains a powerful renewable energy source.","Train hard. Be unbearable about it later."],
 active:["You already started. Finish what you began, slut.","Workout in progress. Stop flirting with the home screen.","The weights are waiting. Unlike your situationship, they are consistent."],
 gain:["Hey gorgeous. Let’s make today iconic.","Welcome back, babe. Stronger, hotter, happier. Pick three.","Hello, gorgeous. Your muscles have appointments.","Back again? Very gay. Very disciplined."],
 lose:["Keep the muscle. Lose the fluff. Keep the attitude.","Cutting season. Hunger is not a personality, so eat properly.","Deficit, not disappearance. We are keeping the ass."],
 maintain:["Maintenance mode: annoyingly stable and still hot.","Hold the line. Apparently perfection has admin work."],
 strength:["Workout done. You may now return to being insufferably hot.","Another lifting session complete. The homosexual agenda advances.","Fed, trained, dangerous. Go admire the pump.","Weights moved. Ego nourished. Excellent work."],
 cardio:["Running from commitment still counts as cardio.","Cardio survived. Your lungs have filed a complaint.","Sweaty, breathless, and somehow still serving.","Cardio complete. Horrible experience. Great ass investment."],
 rehab:["Rehab complete. Responsible behavior looks disturbingly good on you.","You fixed your shit instead of pretending pain is a personality. Growth.","Rehab done. Sexy joints are stable joints."],
 quick:["A quickie. Questionable commitment, but technically it counts.","Under twenty minutes? Fine. We love efficiency and plausible deniability.","Short, sweaty and over quickly. Familiar format."],
 long:["Over an hour? Babe, who exactly are we trying to impress?","That was a long session. Your gym crush better have noticed.","You stayed that long voluntarily? Deeply unwell. Excellent work."],
 partial:["You finished the workout. The workout is less sure about that. Still counts.","Half the sets, full confidence. Gay mathematics.","Not every set survived. Neither does every situationship. Log it and move on."],
 streak:["Seven-day energy. At this point the gym should start charging you rent.","That streak is getting obscene. Keep going.","Consistency? In this community? Historic."],
 first:["First workout logged. Your ass is now officially a long-term infrastructure project.","One workout down. The transformation montage has legally begun."],
 back:["Look who crawled back to the gym. Character development.","The weights missed you. I told them not to get attached."],
 rest:["Rest. Even icons need recovery.","Recovery day. Grow in peace and judge people quietly."],
 missed:["You ghosted the gym. Very on brand.","The weights noticed you were missing. Awkward."]
};
const RECIPES=[
{id:'beef-lentil-power',name:'Beef & Lentil Power Bowl',cuisine:'Other',meal:'Lunch',image:'assets/lentil_power_bowl.jpg',kcal:720,protein:55,carbs:82,fat:18,fiber:16,time:30,tags:['High protein'],ingredients:['200 g lean ground beef (5% fat)','150 g cooked green lentils','150 g cooked brown rice','100 g crushed tomatoes','80 g spinach','1/2 red bell pepper','1/2 yellow onion','1 tsp olive oil','Cumin, smoked paprika, salt and pepper'],steps:['Cook the rice if needed.','Heat the oil and brown the beef with onion and spices.','Add tomatoes, lentils and bell pepper; simmer for 5–7 minutes.','Fold in spinach until wilted.','Serve over rice and season to taste.']},
{id:'beef-burrito',name:'High Protein Beef Burrito Bowl',cuisine:'Mexican',meal:'Dinner',image:'assets/beef_burrito_bowl.jpg',kcal:860,protein:61,carbs:88,fat:24,fiber:16,time:25,tags:['Mexican','High protein'],ingredients:['200 g lean ground beef (5% fat)','150 g cooked brown rice','120 g black beans, rinsed','100 g corn','1/2 avocado','1 red bell pepper','1/2 onion','80 g salsa','Lime, cumin, chili and coriander'],steps:['Cook or reheat the rice.','Brown the beef with onion, cumin and chili.','Warm the beans and corn.','Build the bowl with rice, beef, beans, vegetables, salsa and avocado.','Finish with lime and coriander.']},
{id:'creamy-beef-pasta',name:'Creamy Beef Pasta',cuisine:'Swedish',meal:'Dinner',image:'assets/creamy_beef_pasta.jpg',kcal:810,protein:58,carbs:78,fat:22,fiber:10,time:25,tags:['High protein','Swedish'],ingredients:['200 g lean ground beef (5% fat)','90 g whole-wheat pasta, dry','120 g cottage cheese','100 g crushed tomatoes','1/2 onion','1 garlic clove','50 g spinach','1 tsp olive oil','Italian herbs, salt and black pepper'],steps:['Boil the pasta until al dente.','Brown beef, onion and garlic in olive oil.','Add tomatoes and herbs; simmer for 5 minutes.','Stir in cottage cheese for a creamy sauce.','Add spinach and pasta, toss and serve.']},
{id:'korean-beef',name:'Korean Beef Rice Bowl',cuisine:'Asian',meal:'Dinner',image:'assets/korean_beef_bowl.jpg',kcal:740,protein:54,carbs:91,fat:17,fiber:9,time:25,tags:['Asian','High protein'],ingredients:['200 g lean ground beef','170 g cooked jasmine rice','100 g edamame','100 g broccoli','1 carrot','1 tbsp low-sodium soy sauce','1 tsp sesame oil','1 tsp honey','Garlic, ginger and chili flakes'],steps:['Cook or reheat the rice.','Brown the beef with garlic and ginger.','Add soy sauce, honey and chili; cook until glossy.','Steam broccoli and edamame and shred the carrot.','Serve everything over rice and finish with sesame oil.']},
{id:'thai-tofu-noodles',name:'Thai Peanut Tofu Noodles',cuisine:'Asian',meal:'Dinner',image:'assets/thai_noodles.jpg',kcal:690,protein:42,carbs:82,fat:22,fiber:12,time:25,tags:['Asian','Vegetarian'],ingredients:['200 g firm tofu','80 g whole-wheat noodles, dry','100 g edamame','1 carrot','1/2 red pepper','15 g peanut butter','1 tbsp soy sauce','1 lime','Garlic, ginger and chili'],steps:['Cook the noodles and drain.','Sear cubed tofu until golden.','Add pepper, carrot and edamame and stir-fry briefly.','Whisk peanut butter, soy, lime, garlic and a splash of water.','Toss noodles with tofu, vegetables and sauce.']},
{id:'mexican-chili',name:'Beef & Black Bean Chili',cuisine:'Mexican',meal:'Dinner',image:'assets/beef_chili.jpg',kcal:710,protein:57,carbs:70,fat:19,fiber:18,time:35,tags:['Mexican','High protein'],ingredients:['200 g lean ground beef','150 g black beans, rinsed','200 g crushed tomatoes','100 g corn','1/2 onion','1 red bell pepper','100 g cooked brown rice','Cumin, smoked paprika, chili and salt'],steps:['Brown the beef and onion.','Add pepper, spices, tomatoes, beans and corn.','Simmer for 15–20 minutes.','Taste and adjust chili and salt.','Serve with brown rice.']},
{id:'protein-oats',name:'Protein Oats with Berries',cuisine:'Other',meal:'Breakfast',image:'assets/protein_oats.jpg',kcal:650,protein:43,carbs:89,fat:14,fiber:15,time:10,tags:['High protein','Breakfast'],ingredients:['80 g rolled oats','300 ml low-fat milk','30 g whey protein','150 g mixed berries','15 g chia seeds','1 banana','Cinnamon and a pinch of salt'],steps:['Cook oats with milk and a pinch of salt.','Remove from heat and stir in protein powder.','Top with berries, banana and chia seeds.','Add cinnamon and a splash of milk if needed.']},
{id:'skyr-berry-bowl',name:'Norwegian Skyr Berry Bowl',cuisine:'Norwegian',meal:'Breakfast',image:'assets/skyr_berry_bowl.jpg',kcal:520,protein:44,carbs:62,fat:10,fiber:13,time:5,tags:['Norwegian','High protein'],ingredients:['300 g plain skyr','50 g rolled oats','150 g raspberries and blueberries','1 apple, diced','15 g chia seeds','10 g almonds','Cinnamon'],steps:['Add skyr to a bowl.','Top with oats, berries, apple and chia seeds.','Finish with almonds and cinnamon.']},
{id:'stuffed-peppers',name:'Beef, Quinoa & Bean Stuffed Peppers',cuisine:'Mexican',meal:'Lunch',image:'assets/stuffed_peppers.jpg',kcal:670,protein:50,carbs:68,fat:20,fiber:15,time:40,tags:['Mexican','High protein'],ingredients:['180 g lean ground beef','2 bell peppers','120 g cooked quinoa','100 g kidney beans','100 g crushed tomatoes','30 g grated cheese','1/2 onion','Cumin, paprika, chili and salt'],steps:['Heat oven to 200°C.','Brown beef and onion with spices.','Mix in quinoa, beans and tomatoes.','Fill halved peppers and top with cheese.','Bake for 20–25 minutes.']}
];
const RECIPE_CATEGORIES=['All','Bottom-friendly','High protein','Asian','Mexican','Swedish','Norwegian'];
function fiberTarget(){return Math.max(25,Math.round((data.profile.calorieTarget||2000)/1000*14))}
// Bottom-friendly is a computed nutrition label, not a cuisine or a free-text tag.
// We use the established 14 g fiber / 1,000 kcal density target plus a meaningful
// minimum of 10 g fiber per serving. This is aimed at everyday bowel regularity,
// not as a promise about immediate sexual preparation; individual tolerance matters.
function isBottomFriendlyRecipe(r){
 const kcal=Math.max(1,Number(r?.kcal)||0),fiber=Math.max(0,Number(r?.fiber)||0);
 const fiberDensity=fiber/kcal*1000;
 return fiber>=10&&fiberDensity>=14;
}
function recipeTags(r){
 const clean=(r?.tags||[]).filter(t=>t!=='Bottom-friendly'&&t!==r?.cuisine);
 const tags=[];
 if(r?.cuisine&&r.cuisine!=='Other')tags.push(r.cuisine);
 if(isBottomFriendlyRecipe(r))tags.push('Bottom-friendly');
 tags.push(...clean);
 return [...new Set(tags)];
}
function recipeFit(r){const today=data.nutrition.filter(n=>n.date===isoToday());const usedK=today.reduce((a,n)=>a+(+n.kcal||0),0),usedP=today.reduce((a,n)=>a+(+n.protein||0),0);const leftK=Math.max(250,(data.profile.calorieTarget||2000)-usedK),leftP=Math.max(15,(data.profile.proteinTarget||100)-usedP);const kScore=Math.abs(r.kcal-Math.min(leftK,900))/900,pScore=Math.max(0,leftP-r.protein)/Math.max(leftP,1);return kScore+pScore*.9-(isBottomFriendlyRecipe(r)?.08:0)}
function sortedRecipes(list){return [...list].sort((a,b)=>recipeFit(a)-recipeFit(b))}
function pickSass(group='welcome'){const a=sass[group]||sass.welcome;let last=data.sassSeed;let i=Math.floor(Math.random()*a.length);if(a.length>1&&i===last)i=(i+1)%a.length;data.sassSeed=i;save();return a[i]}
function daysSinceLastSession(){if(!data.sessions.length)return null;const latest=Math.max(...data.sessions.map(s=>new Date(`${s.date}T12:00:00`).getTime()));return Math.max(0,Math.floor((new Date(`${isoToday()}T12:00:00`).getTime()-latest)/86400000))}
function homeSass(){
 const today=isoToday();
 if(data.dailySass?.date===today&&data.dailySass.text)return data.dailySass.text;
 let group=data.profile.goal||'welcome';
 if(data.activeSession)group='active';
 else{const gap=daysSinceLastSession();if(gap!==null&&gap>=5)group='back';else if(calcStreak()>=7)group='streak';else if(data.sessions.some(s=>s.date===today))group='strength'}
 const text=pickSass(group);
 data.dailySass={date:today,text};
 save();
 return text;
}
function completionSass(session,durationMin,doneSets,totalSets){const previousCount=data.sessions.length;const completion=totalSets?doneSets/totalSets:1;const nextStreak=calcStreakWithDate(session.date);if(previousCount===0)return pickSass('first');if(nextStreak>=7)return pickSass('streak');if(session.type!=='cardio'&&totalSets&&completion<0.5)return pickSass('partial');if(durationMin<20)return pickSass('quick');if(durationMin>=75)return pickSass('long');if(session.type==='cardio')return pickSass('cardio');if(session.type==='rehab')return pickSass('rehab');return pickSass('strength')}
function streakDateSet(extraDate){
 const set=new Set((data.sessions||[]).filter(s=>s.completed!==false).map(s=>s.date));
 (data.planned||[]).forEach(p=>{if(p&&(p.type==='rest'||/rest|recovery/i.test(p.name||'')))set.add(p.date)});
 if(extraDate)set.add(extraDate);
 return set;
}
function calcStreakFromDates(extraDate){
 const set=streakDateSet(extraDate);let d=new Date(),n=0;
 for(let i=0;i<365;i++){const key=isoToday(d);if(set.has(key))n++;else if(i>0)break;d.setDate(d.getDate()-1)}
 return n;
}
function calcStreakWithDate(extraDate){return calcStreakFromDates(extraDate)}

function uid(){return (globalThis.crypto&&typeof crypto.randomUUID==='function')?crypto.randomUUID():`gaym-${Date.now()}-${Math.random().toString(16).slice(2)}`}
function isoToday(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
function load(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem('gaymV2')||'{}'))}catch{return structuredClone(defaults)}}
let data=load(), route='home', routeArgs={}, entryUnlocked=false;if(data.activeSession){const now=Date.now();if(!Number.isFinite(Number(data.activeSession.startedAt))||Number(data.activeSession.startedAt)<=0)data.activeSession.startedAt=now;data.activeSession.startedAt=Number(data.activeSession.startedAt);data.activeSession.totalPause=Math.max(0,Number(data.activeSession.totalPause)||0);if(data.activeSession.pausedAt!=null)data.activeSession.pausedAt=Number(data.activeSession.pausedAt)||null;}if(/You said BUILD MUSCLE|Eat the fucking food/i.test(data.dailySass?.text||''))data.dailySass={date:null,text:''};data.planned=(data.planned||[]).filter(x=>x&&(x.type==='rest'||x.workoutId));data.dailySass=data.dailySass&&typeof data.dailySass==='object'?data.dailySass:{date:null,text:''};data.customRecipes=Array.isArray(data.customRecipes)?data.customRecipes:[];data.recipeFavorites=Array.isArray(data.recipeFavorites)?data.recipeFavorites:[];data.notifications=Array.isArray(data.notifications)?data.notifications:[];data.notificationMeta=Object.assign({dailySassDate:null,nutritionDate:null,absenceDate:null,streakMilestone:null},data.notificationMeta||{});recomputePRHistory({notifyNew:false});
function activityFactor(sex,level){const table={sedentary:1.20,low:1.375,active:1.55,very:1.725};return table[level]||1.55}
function goalLabel(goal){return goal==='lose'?'Lose weight':goal==='maintain'?'Maintain weight':'Build muscle'}
function calcTargets(profile){const weight=Math.max(35,+profile.weight||70),height=Math.max(130,+profile.height||175),age=Math.max(18,+profile.age||30),sex=profile.sex==='female'?'female':'male';const rmr=10*weight+6.25*height-5*age+(sex==='male'?5:-161);const maintenance=Math.round(rmr*activityFactor(sex,profile.activity));const goal=profile.goal||'maintain';let calories=maintenance;if(goal==='lose')calories=maintenance-Math.max(300,Math.min(500,Math.round(maintenance*0.15)));if(goal==='gain')calories=maintenance+Math.max(250,Math.min(400,Math.round(maintenance*0.12)));calories=Math.round(calories/10)*10;const proteinPerKg=goal==='gain'?2.0:goal==='lose'?2.0:1.8;const protein=Math.round(weight*proteinPerKg);const fatPerKg=goal==='gain'?1.0:goal==='lose'?0.8:0.9;const fat=Math.max(45,Math.round(weight*fatPerKg));const carbs=Math.max(0,Math.round((calories-protein*4-fat*9)/4));return {rmr:Math.round(rmr),maintenance,calories,protein,fat,carbs,proteinPerKg,surplus:goal==='gain'?calories-maintenance:0,deficit:goal==='lose'?maintenance-calories:0}}
function applyAutoTargets(){data.profile.autoTargets=data.profile.autoTargets!==false;if(!data.profile.autoTargets)return;const t=calcTargets(data.profile);data.profile.calorieTarget=t.calories;data.profile.proteinTarget=t.protein;data.profile.carbTarget=t.carbs;data.profile.fatTarget=t.fat}
function migrateProfile(){const hadAuto=typeof data.profile?.autoTargets==='boolean';data.profile={height:183,age:28,sex:'male',activity:'active',goal:'gain',autoTargets:hadAuto?data.profile.autoTargets:false,...data.profile};if(data.profile.autoTargets)applyAutoTargets()}
function save(){localStorage.setItem('gaymV2',JSON.stringify(data))}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2200)}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function fmtDate(d){return new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'}).format(d)}
function entry(){
 const app=$('#app');
 const name=(data.profile?.name||'').trim();
 if(data.profileCreated){
  app.innerHTML=`<main class="entry-screen"><section class="entry-card"><div class="entry-brand">GA<i>Y</i>M</div><p class="entry-kicker">WELCOME BACK</p><h1>${escapeHtml(name||'Gorgeous')}.</h1><p class="entry-copy">Your weights have been gossiping. Time to give them something worth talking about.</p><button class="primary entry-primary" id="enter-gaym">ENTER GAYM</button><p class="entry-note">Your training data stays saved on this device.</p></section></main>`;
  $('#enter-gaym').onclick=()=>{entryUnlocked=true;render()};
 }else{
  app.innerHTML=`<main class="entry-screen"><section class="entry-card"><div class="entry-brand">GA<i>Y</i>M</div><p class="entry-kicker">WELCOME TO GAYM</p><h1>Hot starts here.</h1><p class="entry-copy">Tell me what to call you. We can discuss the weights, calories and questionable decisions next.</p><div class="field entry-field"><label>Your name</label><input id="entry-name" autocomplete="name" placeholder="Name" value="${escapeHtml(name==='Jocke'?'':name)}"></div><button class="primary entry-primary" id="create-profile">CREATE PROFILE</button><p class="entry-note">No cloud account yet. This welcome screen uses your locally saved profile.</p></section></main>`;
  const input=$('#entry-name');
  $('#create-profile').onclick=()=>{const entered=input.value.trim();if(!entered){input.focus();return toast('Give me a name first, babe.')}data.profile.name=entered;data.profileCreated=true;save();entryUnlocked=true;render();setTimeout(openProfileSheet,0)};
  input.addEventListener('keydown',e=>{if(e.key==='Enter')$('#create-profile').click()});
 }
}
function nav(){return `<nav class="bottom-nav">${[['home','Home'],['plan','Plan'],['workout','Workout'],['progress','Progress'],['profile','Profile']].map(([r,l],i)=>`<button class="nav-item ${route===r?'active':''} ${r==='workout'?'center':''}" data-route="${r}">${r==='workout'?`<span class="nav-bubble">${icons.workout}</span>`:icons[r]}<span>${l}</span></button>`).join('')}</nav>`}
function shell(content){$('#app').innerHTML=`<main class="screen">${content}</main>${nav()}`; bindGlobal()}
function bindGlobal(){$$('[data-route]').forEach(b=>b.onclick=()=>go(b.dataset.route));$$('[data-action="notify"]').forEach(b=>b.onclick=openNotifications);$$('[data-session-id]').forEach(b=>b.onclick=()=>openSessionDetail(b.dataset.sessionId));}
function go(r,args={}){route=r;routeArgs=args;render();requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}))}
function header(title='',back=false){return `<header class="topbar">${back?`<button class="icon-btn" data-back>${icons.back}</button>`:`<div class="brand">GA<i>Y</i>M</div>`}<strong>${escapeHtml(title)}</strong>${back?`<span style="width:42px"></span>`:`<button class="icon-btn" data-action="notify">${icons.bell}</button>`}</header>`}

function notificationSettings(){return Object.assign({workout:true,nutrition:true,progress:true,dailySass:true,unhinged:true,dailyTime:'09:00',nutritionTime:'19:00'},data.notificationSettings||{})}
function notificationText(clean,sassy){return notificationSettings().unhinged?sassy:clean}
function queueNotification({kind='general',title='GAYM',body='',route='home',args={},dedupeKey=null}){
 data.notifications=data.notifications||[];
 if(dedupeKey&&data.notifications.some(n=>n.dedupeKey===dedupeKey))return null;
 const n={id:uid(),kind,title,body,route,args,createdAt:Date.now(),read:false,dedupeKey};
 data.notifications.unshift(n);data.notifications=data.notifications.slice(0,50);save();return n;
}
function navigateNotification(n){
 n.read=true;save();closeSheet();
 if(n.route==='progress-exercise'){go('progress');requestAnimationFrame(()=>setTimeout(()=>openExerciseProgress(n.args?.name),80));return}
 if(n.route==='nutrition'){go('nutrition');return}
 if(n.route==='plan'){go('plan');return}
 if(n.route==='workout'){go('workout');return}
 go(n.route||'home',n.args||{});
}
function openNotifications(){
 evaluateNotifications();
 const list=(data.notifications||[]);
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Notifications</p><h2>GAYM has opinions</h2></div><button class="sheet-close" data-close>×</button></div>${list.length?`<div class="notification-list">${list.map(n=>`<button class="notification-card ${n.read?'':'unread'}" data-notification="${n.id}"><span class="notification-dot"></span><span class="grow"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body)}</p><small>${new Date(n.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small></span><span class="chev">›</span></button>`).join('')}</div><button class="text-btn notification-clear" id="notification-clear">CLEAR ALL</button>`:`<div class="empty"><strong>No notifications</strong>Your unicorn is currently minding its own business. Suspicious.</div>`}`);
 $$('[data-notification]').forEach(b=>b.onclick=()=>{const n=(data.notifications||[]).find(x=>x.id===b.dataset.notification);if(n)navigateNotification(n)});
 const clear=$('#notification-clear');if(clear)clear.onclick=()=>{data.notifications=[];save();openNotifications()};
}
function notificationTimeReached(hhmm){const [h,m]=(hhmm||'00:00').split(':').map(Number),now=new Date();return now.getHours()>h||(now.getHours()===h&&now.getMinutes()>=m)}
function evaluateNotifications(){
 const s=notificationSettings(),today=isoToday();data.notificationMeta=data.notificationMeta||{};
 if(s.dailySass&&notificationTimeReached(s.dailyTime)&&data.notificationMeta.dailySassDate!==today){
  queueNotification({kind:'daily',title:'Daily GAYM',body:homeSass(),route:'home',dedupeKey:`daily-${today}`});data.notificationMeta.dailySassDate=today;
 }
 const foods=data.nutrition.filter(n=>n.date===today),kcal=foods.reduce((a,n)=>a+(+n.kcal||0),0),protein=foods.reduce((a,n)=>a+(+n.protein||0),0);
 if(s.nutrition&&notificationTimeReached(s.nutritionTime)&&data.notificationMeta.nutritionDate!==today&&(kcal<data.profile.calorieTarget*.78||protein<data.profile.proteinTarget*.78)){
  const proteinLeft=Math.max(0,Math.round(data.profile.proteinTarget-protein)),calLeft=Math.max(0,Math.round(data.profile.calorieTarget-kcal)),kr=data.profile.calorieTarget?kcal/data.profile.calorieTarget:0,pr=data.profile.proteinTarget?protein/data.profile.proteinTarget:0;
  const savage=kr<.70&&pr<.70?`You call this eating? ${proteinLeft} g protein and ${calLeft} kcal left. Go fix it.`:kr<.70?`Where are your calories? ${calLeft} kcal left. This is neglect with a macro tracker.`:`That protein number is laughable. ${proteinLeft} g left. Fix it.`;
  queueNotification({kind:'nutrition',title:'Nutrition check',body:notificationText(`${proteinLeft} g protein and ${calLeft} kcal left today.`,savage),route:'nutrition',dedupeKey:`nutrition-${today}`});data.notificationMeta.nutritionDate=today;
 }
 const gap=daysSinceLastSession();
 if(s.workout&&gap!==null&&gap>=4&&data.notificationMeta.absenceDate!==today){
  queueNotification({kind:'workout',title:'The gym remembers you',body:notificationText(`${gap} days since your last workout.`,`${gap} days without training. The dumbbells have more dedication than you.`),route:'plan',dedupeKey:`absence-${today}`});data.notificationMeta.absenceDate=today;
 }
 const streak=calcStreak(),milestone=[30,15,10,7,5,3].find(x=>streak>=x);
 if(s.progress&&milestone&&data.notificationMeta.streakMilestone!==milestone){
  queueNotification({kind:'streak',title:`${milestone} day streak`,body:notificationText(`You reached a ${milestone}-day training streak.`,`Discipline looks good on you. Don’t ruin it now.`),route:'progress',dedupeKey:`streak-${milestone}`});data.notificationMeta.streakMilestone=milestone;
 }
 save();
}

function sessionSortValue(s){
 const date=String(s.date||'1970-01-01'),time=Number(s.finishedAt||s.startedAt||0);
 return `${date}|${String(time).padStart(16,'0')}`
}
function sessionExerciseBest(item){
 return (item.sets||[]).filter(z=>z.done!==false&&Number(z.weight)>0&&Number(z.reps)>0).reduce((best,z)=>{
  const score=estimated1RM(Number(z.weight),Number(z.reps));
  return !best||score>best.score?{name:item.name,weight:Number(z.weight),reps:Number(z.reps),score}:best
 },null)
}
function recomputePRHistory({notifyNew=false}={}){
 const before=new Set();
 (data.sessions||[]).forEach(s=>(s.prs||[]).forEach(pr=>before.add(`${s.id}|${String(pr.name).toLowerCase()}`)));
 const bestByExercise=new Map(),ordered=(data.sessions||[]).filter(s=>s.completed!==false&&s.type!=='cardio').slice().sort((a,b)=>sessionSortValue(a).localeCompare(sessionSortValue(b)));
 ordered.forEach(session=>{
  const prs=[];
  (session.items||[]).forEach(item=>{
   const current=sessionExerciseBest(item);if(!current)return;
   const key=String(item.name||'').trim().toLowerCase(),previous=bestByExercise.get(key);
   if(previous&&current.score>previous.score+0.05)prs.push({...current,previous:previous.score});
   if(!previous||current.score>previous.score)bestByExercise.set(key,current);
  });
  session.prs=prs;
 });
 const validPrKeys=new Set();
 ordered.forEach(session=>(session.prs||[]).forEach(pr=>validPrKeys.add(`pr-${session.id}-${pr.name}`)));
 data.notifications=(data.notifications||[]).filter(n=>n.kind!=='pr'||validPrKeys.has(n.dedupeKey));
 if(data.unicornEvent?.type==='pr'){
  const ev=data.sessions.find(s=>s.id===data.unicornEvent.sessionId);
  if(!ev||(ev.prs||[]).every(pr=>pr.name!==data.unicornEvent.exercise))data.unicornEvent=null;
 }
 if(notifyNew&&notificationSettings().progress){
  ordered.forEach(session=>(session.prs||[]).forEach(pr=>{
   const key=`${session.id}|${String(pr.name).toLowerCase()}`;
   if(before.has(key))return;
   queueNotification({kind:'pr',title:`New ${pr.name} PR`,body:notificationText(`${pr.weight} kg × ${pr.reps}. New personal best detected.`,`NEW ${pr.name.toUpperCase()} PB. Screenshot it. Send it. Humiliate your old self. 🏆`),route:'progress-exercise',args:{name:pr.name},dedupeKey:`pr-${session.id}-${pr.name}`});
   data.unicornEvent={type:'pr',discoveredDate:isoToday(),sessionId:session.id,sessionDate:session.date,exercise:pr.name,weight:pr.weight,reps:pr.reps};
  }))
 }
 save();
}
function todaysNutritionStatus(){
 const foods=(data.nutrition||[]).filter(n=>n.date===isoToday()),kcal=foods.reduce((a,n)=>a+(+n.kcal||0),0),protein=foods.reduce((a,n)=>a+(+n.protein||0),0);
 return {kcal,protein,kcalRatio:data.profile.calorieTarget?kcal/data.profile.calorieTarget:0,proteinRatio:data.profile.proteinTarget?protein/data.profile.proteinTarget:0}
}
const UNICORN_STATES={
 default:{key:'default',label:'GLITTER READY',image:'assets/unicorns_v34/unicorn_default.webp'},
 newWorkout:{key:'new-workout',label:'READY TO TRAIN',image:'assets/unicorns_v34/unicorn_new_workout.webp'},
 pump:{key:'pump',label:'PUMP MODE',image:'assets/unicorns_v34/unicorn_pump.webp'},
 fed:{key:'fed',label:'FED & TRAINED',image:'assets/unicorns_v34/unicorn_fed.webp'},
 pr:{key:'pr',label:'NEW PB / PR',image:'assets/unicorns_v34/unicorn_pr.webp'},
 judging:{key:'judging',label:'JUDGING YOU',image:'assets/unicorns_v34/unicorn_judging.webp'},
 hungry:{key:'hungry',label:'LOW NUTRITION',image:'assets/unicorns_v34/unicorn_low_nutrition.webp'},
 calories:{key:'calories',label:'CALORIE DISASTER',image:'assets/unicorns_v34/unicorn_low_nutrition.webp'},
 protein:{key:'protein',label:'PROTEIN DISASTER',image:'assets/unicorns_v34/unicorn_low_nutrition.webp'},
 streak:{key:'streak',label:'STREAK MODE',image:'assets/unicorns_v34/unicorn_streak.webp'},
 rest:{key:'rest',label:'REST DAY',image:'assets/unicorns_v34/unicorn_rest.webp'},
 morning:{key:'morning',label:'MORNING MODE',image:'assets/unicorns_v34/unicorn_morning.webp'},
 afternoon:{key:'afternoon',label:'AFTERNOON MODE',image:'assets/unicorns_v34/unicorn_afternoon.webp'},
 evening:{key:'evening',label:'EVENING MODE',image:'assets/unicorns_v34/unicorn_evening.webp'},
 late:{key:'late',label:'LATE NIGHT SASS',image:'assets/unicorns_v34/unicorn_late.webp'}
};
function unicornWithSass(base,sass){return {...base,sass}}
function unicornState(){
 const today=isoToday();
 const hour=new Date().getHours();
 const nut=todaysNutritionStatus();
 const streak=calcStreak();
 const gap=daysSinceLastSession();
 const todaysPlan=(data.planned||[]).find(p=>p.date===today)||null;
 const plannedRest=!!todaysPlan&&(todaysPlan.type==='rest'||/rest|recovery/i.test(todaysPlan.name||''));
 const plannedWorkout=!!todaysPlan&&!plannedRest;
 const trainedToday=(data.sessions||[]).some(s=>s.date===today&&s.completed!==false);

 if(data.activeSession){
  return unicornWithSass(UNICORN_STATES.pump,'Good. You showed up. Don’t get comfortable.');
 }
 if(data.unicornEvent?.type==='pr'&&data.unicornEvent.discoveredDate===today){
  const exercise=data.unicornEvent.exercise?` ${data.unicornEvent.exercise}`:'';
  const result=data.unicornEvent.weight?` ${data.unicornEvent.weight} kg${data.unicornEvent.reps?` × ${data.unicornEvent.reps}`:''}.`:'';
  return unicornWithSass(UNICORN_STATES.pr,`NEW PB${exercise}!${result} You absolute freak.`);
 }
 if(plannedRest){
  return unicornWithSass(UNICORN_STATES.rest,'Rest is part of the plan. Recover today, cause problems tomorrow.');
 }
 if(gap!==null&&gap>=4){
  return unicornWithSass(UNICORN_STATES.judging,`${gap} days without training. The dumbbells have filed a missing person report.`);
 }

 const nutritionCheck=notificationTimeReached(notificationSettings().nutritionTime||'19:00');
 if(nutritionCheck){
  const kcalLeft=Math.max(0,Math.round((data.profile.calorieTarget||0)-nut.kcal));
  const proteinLeft=Math.max(0,Math.round((data.profile.proteinTarget||0)-nut.protein));
  if(nut.kcalRatio<.70&&nut.proteinRatio<.70){
   return unicornWithSass(UNICORN_STATES.hungry,`${kcalLeft} kcal and ${proteinLeft} g protein left. Go eat.`);
  }
  if(nut.kcalRatio<.70&&nut.proteinRatio>=.70){
   return unicornWithSass(UNICORN_STATES.calories,`${kcalLeft} kcal left. Protein survived. Your calories did not.`);
  }
  if(nut.proteinRatio<.70&&nut.kcalRatio>=.70){
   return unicornWithSass(UNICORN_STATES.protein,`${proteinLeft} g protein left. That number is looking tragic.`);
  }
 }

 if(streak>=3){
  return unicornWithSass(UNICORN_STATES.streak,`${streak} day streak. Discipline looks good on you.`);
 }
 if(trainedToday&&nut.kcalRatio>=.72&&nut.proteinRatio>=.72){
  return unicornWithSass(UNICORN_STATES.fed,'Trained and fed. Annoyingly responsible.');
 }
 if(trainedToday){
  return unicornWithSass(UNICORN_STATES.pump,'Workout done. Smashed it. Now go recover.');
 }
 if(plannedWorkout){
  return unicornWithSass(UNICORN_STATES.newWorkout,`${todaysPlan.name||'Workout'} is waiting. You know what to do.`);
 }
 if(hour>=22||hour<5){
  return unicornWithSass(UNICORN_STATES.late,'Still awake? Legends recover too. Go to bed.');
 }
 if(hour<12){
  return unicornWithSass(UNICORN_STATES.morning,'Morning, babe. Discipline looks good on you.');
 }
 if(hour<18){
  return unicornWithSass(UNICORN_STATES.afternoon,'Afternoon check. Plenty of day left to get it done.');
 }
 return unicornWithSass(UNICORN_STATES.evening,'Finish strong. Close the day like a beast.');
}
function unicornMood(){const u=unicornState();return {mood:u.key,label:u.label,image:u.image,sass:u.sass}}
function renderHomeUnicorn(){
 const u=unicornState();
 return `<div class="hero-art ${u.key}" aria-hidden="true"><div class="hero-mascot-row"><div class="hero-mascot-ring"><img class="hero-mascot" src="${u.image}" alt=""><span class="mascot-sparkle mascot-sparkle-a">✦</span><span class="mascot-sparkle mascot-sparkle-b">✧</span></div><div class="unicorn-speech">${escapeHtml(u.sass)}</div></div><span class="mascot-state-label">${escapeHtml(u.label)}</span></div>`;
}
function weekDays(offset=0){let start=new Date();start.setHours(12,0,0,0);start.setDate(start.getDate()-((start.getDay()+6)%7)+(offset*7));return Array.from({length:7},(_,i)=>{let d=new Date(start);d.setDate(start.getDate()+i);return d})}
let planWeekOffset=0;
function thisWeekSessions(){const days=weekDays().map(isoToday);return data.sessions.filter(s=>days.includes(s.date))}
function homeWorkoutState(){
 if(data.activeSession){
  return {name:data.activeSession.name,type:data.activeSession.type||'strength',active:true,items:data.activeSession.items||[],startedAt:data.activeSession.startedAt,workoutId:data.activeSession.workoutId||''};
 }
 const planned=(data.planned||[]).find(x=>x.date===isoToday())||null;
 if(!planned)return null;
 if(planned.type==='rest')return {...planned,planned:true};
 if(!planned.workoutId)return null;
 const workout=(data.customWorkouts||[]).find(w=>w.id===planned.workoutId);
 return workout?{...planned,name:planned.name||workout.name,type:planned.type||workout.type||'strength',planned:true}:null;
}
function home(){const today=homeWorkoutState();const week=thisWeekSessions();const min=week.reduce((a,s)=>a+(s.durationMin||0),0);const foods=data.nutrition.filter(n=>n.date===isoToday());const kcal=foods.reduce((a,n)=>a+(+n.kcal||0),0),prot=foods.reduce((a,n)=>a+(+n.protein||0),0);const latest=data.measurements.at(-1)?.weight??data.profile.weight;const first=data.measurements[0]?.weight??latest;const diff=(latest-first).toFixed(1);const days=weekDays();
 shell(`${header()}<section class="home-intro"><p class="eyebrow">${fmtDate(new Date())}</p><h1 class="greeting">${escapeHtml(homeSass())}</h1><p class="daily-sass-note">Today's GAYM energy · changes tomorrow</p></section><section class="section"><p class="eyebrow">Today's workout</p><article class="card hero-card">${renderHomeUnicorn()}<div class="hero-content">${today?`<span class="eyebrow" style="color:var(--cyan)">${today.active?'Workout in progress':today.type||'Training'}</span><h2 class="hero-title">${escapeHtml(today.name)}</h2><div class="meta">${today.active?`${today.items?.length||0} exercises · started ${new Date(today.startedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`:'Ready when you are.'}</div><div class="stats-row"><span class="stat-pill">${today.type||'strength'}</span>${today.active?'<span class="stat-pill">Autosaved</span>':''}</div><button class="primary" id="home-start">${today.active?'CONTINUE WORKOUT':today.type==='rest'?'VIEW REST DAY':'START WORKOUT'}</button>`:`<span class="eyebrow" style="color:var(--cyan)">TODAY</span><h2 class="hero-title">No plans today</h2><div class="meta">Your calendar is clear. Train if you want to, gorgeous.</div><div class="stats-row"><span class="stat-pill">Choose your workout</span></div><button class="primary" id="home-start">START WORKOUT</button>`}</div></article></section>
 <section class="section"><div class="section-head"><h2>This week</h2><button class="text-btn" data-home-plan>VIEW PLAN</button></div><article class="card week-card"><div class="week-summary"><span>${week.length} workouts · ${Math.floor(min/60)}h ${min%60}m</span><span>${week.reduce((a,s)=>a+(s.durationMin||0),0)} min</span></div><div class="week-days">${days.map(d=>{const done=data.sessions.some(s=>s.date===isoToday(d));return `<div class="day ${done?'done':''} ${isoToday(d)===isoToday()?'today':''}"><span>${d.toLocaleDateString('en',{weekday:'short'}).slice(0,2)}</span><span class="day-dot">${done?'✓':d.getDate()}</span></div>`}).join('')}</div></article></section>
 <section class="section"><div class="quick-grid"><button class="card quick-card" data-home-nutrition style="text-align:left"><div style="display:flex;justify-content:space-between"><span class="quick-label">NUTRITION</span><span class="ring" style="--p:${Math.min(100,kcal/data.profile.calorieTarget*100)}"></span></div><div><div class="quick-value">${kcal.toLocaleString()} <small style="font-size:11px;color:var(--muted)">kcal</small></div><div class="quick-sub">${Math.round(prot)} / ${data.profile.proteinTarget} g protein</div></div></button><button class="card quick-card" data-home-progress style="text-align:left"><span class="quick-label">PROGRESS</span><div><div class="quick-value">${latest.toFixed?latest.toFixed(1):latest} <small style="font-size:11px;color:var(--muted)">kg</small></div><div class="quick-sub">${+diff>=0?'+':''}${diff} kg logged change</div><svg class="spark" viewBox="0 0 120 26"><polyline points="0,21 18,18 34,20 51,13 67,15 83,8 100,11 120,4"/></svg></div></button></div></section>`);
 $('#home-start').onclick=()=>{if(data.activeSession)go('active');else if(today?.type==='rest')go('plan');else if(today?.workoutId)startWorkout(today.workoutId);else go('workout')};$('[data-home-plan]').onclick=()=>go('plan');$('[data-home-nutrition]').onclick=()=>go('nutrition');$('[data-home-progress]').onclick=()=>go('progress');}
function sortedSessionsDesc(){return [...data.sessions].sort((a,b)=>String(b.date).localeCompare(String(a.date))||(Number(b.finishedAt||0)-Number(a.finishedAt||0)))}
function plan(){const days=weekDays(planWeekOffset);const sessions=sortedSessionsDesc().slice(0,8);shell(`${header()}<h1 class="page-title">My Plan</h1><p class="subtle">Your week at a glance. Finished sessions and anything you plan yourself live here.</p><div class="calendar-head"><button class="icon-btn" id="prev-week">‹</button><strong>${days[0].toLocaleDateString('en',{month:'short',day:'numeric'}).toUpperCase()} – ${days[6].toLocaleDateString('en',{month:'short',day:'numeric'}).toUpperCase()}</strong><button class="icon-btn" id="next-week">›</button></div><div class="calendar">${['M','T','W','T','F','S','S'].map(x=>`<div class="cal-label">${x}</div>`).join('')}${days.map(d=>{const dateKey=isoToday(d),planned=data.planned.find(p=>p.date===dateKey),has=data.sessions.some(s=>s.date===dateKey)||!!planned,isRest=planned?.type==='rest';return `<button class="cal-day ${dateKey===isoToday()?'today':''} ${has?'has':''} ${isRest?'rest-planned':''}" data-date="${dateKey}"><span>${d.getDate()}</span>${has?`<span class="cal-dot">${isRest?'R':''}</span>`:''}</button>`}).join('')}</div><section class="section"><div class="section-head"><h2>Recent activity</h2><button class="text-btn" id="plan-add">+ PLAN</button></div><div class="list">${sessions.length?sessions.map(sessionCard).join(''):`<div class="empty"><strong>No finished sessions yet</strong>Your completed workouts will appear here.</div>`}</div></section>`);$('#plan-add').onclick=()=>openPlanSheet();$$('[data-date]').forEach(b=>b.onclick=()=>openDaySheet(b.dataset.date));$('#prev-week').onclick=()=>{planWeekOffset--;plan()};$('#next-week').onclick=()=>{planWeekOffset++;plan()};}
function sessionCard(s){const cls=s.type==='cardio'?'cardio':s.type==='rehab'?'rehab':'';return `<button class="list-card" style="width:100%;color:inherit;text-align:left" data-session-id="${s.id}"><span class="badge-icon ${cls}">${s.type==='cardio'?'↗':s.type==='rehab'?'R':'S'}</span><span class="grow"><h3>${escapeHtml(s.name)}</h3><p>${s.date} · ${s.durationMin||0} min</p></span><span class="chev">›</span></button>`}
function openPlanSheet(date=isoToday()){
 const existing=data.planned.find(p=>p.date===date),initialType=existing?.type==='rest'?'rest':'workout';
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Plan</p><h2>${date}</h2></div><button class="sheet-close" data-close>×</button></div>
 <div class="tabs plan-kind-tabs"><button class="tab ${initialType==='workout'?'active':''}" data-plan-kind="workout">Workout</button><button class="tab ${initialType==='rest'?'active':''}" data-plan-kind="rest">Rest Day</button></div>
 <div id="plan-kind-fields"></div>
 <div class="sheet-actions"><button class="primary" id="save-plan">SAVE TO PLAN</button>${existing?'<button class="danger-btn" id="remove-plan">REMOVE FROM PLAN</button>':''}<button class="secondary" id="build-new">CREATE NEW WORKOUT</button></div>`);
 let kind=initialType;
 function paint(){
  $('#plan-kind-fields').innerHTML=kind==='rest'
   ?`<article class="card rest-plan-card"><p class="eyebrow">Recovery</p><h3>Rest Day</h3><p class="subtle">No workout. No guilt. The unicorn has been informed.</p></article>`
   :`<div class="field"><label>Workout</label><select id="plan-workout"><option value="">Choose...</option>${data.customWorkouts.map(w=>`<option value="${w.id}" ${existing?.workoutId===w.id?'selected':''}>${escapeHtml(w.name)} · ${w.type}</option>`).join('')}</select></div>`;
 }
 paint();
 $$('[data-plan-kind]').forEach(b=>b.onclick=()=>{kind=b.dataset.planKind;$$('[data-plan-kind]').forEach(x=>x.classList.toggle('active',x===b));paint()});
 $('#save-plan').onclick=()=>{
  data.planned=data.planned.filter(p=>p.date!==date);
  if(kind==='rest'){
   data.planned.push({id:uid(),date,name:'Rest Day',type:'rest',workoutId:''});
   save();closeSheet();render();toast('Rest Day added to plan');return
  }
  const id=$('#plan-workout')?.value;if(!id)return toast('Choose a workout first');
  const w=data.customWorkouts.find(w=>w.id===id);if(!w)return toast('Workout not found');
  data.planned.push({id:uid(),date,name:w.name,type:w.type,workoutId:w.id});
  save();closeSheet();render();toast('Workout added to plan')
 };
 if($('#remove-plan'))$('#remove-plan').onclick=()=>{data.planned=data.planned.filter(p=>p.date!==date);save();closeSheet();render();toast('Plan removed')};
 $('#build-new').onclick=()=>{closeSheet();go('workout')};
}
function openDaySheet(date){
 const ses=data.sessions.filter(s=>s.date===date),plan=data.planned.find(p=>p.date===date),today=isoToday(),isToday=date===today,isFuture=date>today,canLog=!isFuture,isRest=plan?.type==='rest';
 const heading=isRest?'Rest Day':plan?escapeHtml(plan.name):ses.length?(isToday?'Today’s training':'Completed training'):(isFuture?'Nothing planned':isToday?'Today':'No workout logged');
 const logLabel=isToday?'LOG WORKOUT':'LOG PAST WORKOUT',actions=[];
 if(plan&&!isRest&&isToday)actions.push(`<button class="primary" id="day-start">START WORKOUT</button>`);
 if(canLog)actions.push(`<button class="${plan&&!isRest&&isToday?'secondary':'primary'}" id="day-log-workout">+ ${logLabel}</button>`);
 actions.push(`<button class="secondary" id="day-plan">${plan?'CHANGE PLAN':'PLAN / REST DAY'}</button>`);
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">${date}</p><h2>${heading}</h2></div><button class="sheet-close" data-close>×</button></div>${isRest?`<article class="card rest-day-detail"><p class="eyebrow">RECOVERY</p><h3>Rest is the assignment.</h3><p class="subtle">This day is deliberately marked for recovery.</p></article>`:''}${ses.length?`<div class="list day-session-list">${ses.map(sessionCard).join('')}</div>`:''}${canLog&&!ses.length&&!isRest?`<p class="subtle">${isToday?'Already trained without GAYM? Add it here.':'Forgot to start GAYM that day? Log the workout now.'}</p>`:''}<div class="sheet-actions">${actions.join('')}</div>`);
 if($('#day-start'))$('#day-start').onclick=()=>{closeSheet();startWorkout(plan.workoutId)};
 if($('#day-log-workout'))$('#day-log-workout').onclick=()=>{closeSheet();openPastWorkoutSheet(date)};
 $('#day-plan').onclick=()=>{closeSheet();openPlanSheet(date)};
 $$('[data-session-id]').forEach(b=>b.onclick=()=>openSessionDetail(b.dataset.sessionId));
}
const KAI_PROGRAM={
 name:'Kai',
 description:'A 5-day strength split with two recovery days. Pick any training day and GAYM loads the full session for you.',
 days:[
  {id:1,label:'Day 1',name:'Back & Biceps',type:'workout',items:[
   {name:'Deadlift',muscle:'Back / hamstrings / glutes',equipment:'Barbell',sets:5,reps:'5'},
   {name:'__PULL_VARIATION__',muscle:'Back',equipment:'Bodyweight / cable',sets:3,reps:'10'},
   {name:'Bent-Over Barbell Row',muscle:'Back',equipment:'Barbell',sets:3,reps:'12'},
   {name:'EZ-Bar Curl',muscle:'Biceps',equipment:'EZ-bar',sets:3,reps:'10'},
   {name:'Preacher Curl',muscle:'Biceps',equipment:'Dumbbell / EZ-bar',sets:3,reps:'12'}
  ]},
  {id:2,label:'Day 2',name:'Chest & Triceps',type:'workout',items:[
   {name:'Bench Press',muscle:'Chest',equipment:'Barbell',sets:5,reps:'5'},
   {name:'Incline Dumbbell Press',muscle:'Chest',equipment:'Dumbbells',sets:3,reps:'12'},
   {name:'Weighted Dips',muscle:'Chest / triceps',equipment:'Bodyweight / added weight',sets:3,reps:'8-10'},
   {name:'Close-Grip Bench Press',muscle:'Triceps / chest',equipment:'Barbell',sets:3,reps:'10'},
   {name:'Triceps Pushdown',muscle:'Triceps',equipment:'Cable',sets:3,reps:'15'}
  ]},
  {id:3,label:'Day 3',name:'Rest',type:'rest'},
  {id:4,label:'Day 4',name:'Legs',type:'workout',items:[
   {name:'Back Squat',muscle:'Quads / glutes',equipment:'Barbell',sets:5,reps:'5'},
   {name:'Leg Press',muscle:'Quads / glutes',equipment:'Machine',sets:2,reps:'10'},
   {name:'Walking Lunge',muscle:'Quads / glutes',equipment:'Dumbbells / bodyweight',sets:3,reps:'10'},
   {name:'Leg Curl',muscle:'Hamstrings',equipment:'Machine',sets:4,reps:'12'},
   {name:'Leg Extension',muscle:'Quads',equipment:'Machine',sets:2,reps:'15'}
  ]},
  {id:5,label:'Day 5',name:'Shoulders & Calves',type:'workout',items:[
   {name:'Bench Press',muscle:'Chest',equipment:'Barbell',sets:4,reps:'4'},
   {name:'Military Press',muscle:'Shoulders',equipment:'Barbell',sets:5,reps:'5'},
   {name:'Seated Dumbbell Shoulder Press',muscle:'Shoulders',equipment:'Dumbbells',sets:3,reps:'15'},
   {name:'Standing Calf Raise',muscle:'Calves',equipment:'Machine / bodyweight',sets:3,reps:'15-20',note:'Kai prescription: 3-5 sets. Add sets if you want 4 or 5.'},
   {name:'Seated Calf Raise',muscle:'Calves',equipment:'Machine',sets:3,reps:'15-20',note:'Kai prescription: 3-5 sets. Add sets if you want 4 or 5.'}
  ]},
  {id:6,label:'Day 6',name:'Rest / Restart',type:'restart'}
 ]
};
const RAYMOND_PROGRAM={
 name:"Raymond’s Big Gay Arms",
 description:"Six exercises. Biceps, triceps and absolutely no interest in sleeves fitting by summer.",
 days:[{id:1,label:"Arm Day",name:"Raymond’s Big Gay Arms",type:"workout",items:[
  {name:"EZ-Bar Curl",muscle:"Biceps",equipment:"EZ-bar",sets:3,reps:"8-10"},
  {name:"Preacher Curl",muscle:"Biceps",equipment:"Dumbbell / EZ-bar",sets:3,reps:"10-12"},
  {name:"Hammer Curl",muscle:"Biceps / forearms",equipment:"Dumbbells",sets:3,reps:"10-12"},
  {name:"Close-Grip Bench Press",muscle:"Triceps / chest",equipment:"Barbell",sets:3,reps:"6-10"},
  {name:"Overhead Triceps Extension",muscle:"Triceps",equipment:"Cable / dumbbell",sets:3,reps:"10-12"},
  {name:"Triceps Pushdown",muscle:"Triceps",equipment:"Cable",sets:3,reps:"12-15"}
 ]}]
};

const JOCKE_PROGRAM={
 name:"Jocke",
 description:"Push, Pull, Legs, Upper and Lower + Arms. Five focused days, no filler, plenty of chest and enough ass work to justify the branding.",
 days:[
  {id:1,label:"Day 1",name:"Push",type:"workout",workoutType:"strength",items:[
   {name:"Bench Press",muscle:"Chest",equipment:"Barbell",sets:3,reps:"6-10"},
   {name:"Incline Dumbbell Press",muscle:"Chest",equipment:"Dumbbells",sets:3,reps:"8-12"},
   {name:"Cable Fly",muscle:"Chest",equipment:"Cable",sets:3,reps:"10-15",note:"Prescription is 2-3 sets. Start with 3 and remove one if needed."},
   {name:"Lateral Raise",muscle:"Shoulders",equipment:"Dumbbells / cable",sets:3,reps:"12-20"},
   {name:"Triceps Pushdown",muscle:"Triceps",equipment:"Cable",sets:3,reps:"10-15"}
  ]},
  {id:2,label:"Day 2",name:"Pull",type:"workout",workoutType:"strength",items:[
   {name:"Lat Pulldown",muscle:"Back",equipment:"Cable",sets:3,reps:"8-12"},
   {name:"Chest-Supported Row",muscle:"Back",equipment:"Dumbbell / machine",sets:3,reps:"8-12"},
   {name:"Seated Cable Row",muscle:"Back",equipment:"Cable",sets:3,reps:"8-12"},
   {name:"Reverse Pec Deck / Rear Delt Fly",muscle:"Rear delts",equipment:"Machine / cable",sets:3,reps:"12-20"},
   {name:"Biceps Curl",muscle:"Biceps",equipment:"Dumbbells / cable",sets:3,reps:"8-12"}
  ]},
  {id:3,label:"Day 3",name:"Legs",type:"workout",workoutType:"strength",items:[
   {name:"Hack Squat",muscle:"Quads / glutes",equipment:"Machine",sets:3,reps:"6-10"},
   {name:"Romanian Deadlift",muscle:"Hamstrings / glutes",equipment:"Barbell / dumbbells",sets:3,reps:"8-12"},
   {name:"Hip Thrust",muscle:"Glutes",equipment:"Barbell / machine",sets:3,reps:"8-12"},
   {name:"Leg Curl",muscle:"Hamstrings",equipment:"Machine",sets:3,reps:"10-15"},
   {name:"Calf Raise",muscle:"Calves",equipment:"Machine",sets:3,reps:"10-15"}
  ]},
  {id:4,label:"Day 4",name:"Upper",type:"workout",workoutType:"strength",items:[
   {name:"Bench Press",muscle:"Chest",equipment:"Barbell",sets:3,reps:"6-10"},
   {name:"__UPPER_PULL_VARIATION__",muscle:"Back",equipment:"Cable / bodyweight",sets:3,reps:"8-12"},
   {name:"Chest-Supported Row",muscle:"Back",equipment:"Dumbbell / machine",sets:3,reps:"8-12"},
   {name:"Incline Dumbbell Press",muscle:"Chest",equipment:"Dumbbells",sets:3,reps:"8-12",note:"Prescription is 2-3 sets. Start with 3 and remove one if needed."},
   {name:"Lateral Raise",muscle:"Shoulders",equipment:"Dumbbells / cable",sets:3,reps:"12-20"}
  ]},
  {id:5,label:"Day 5",name:"Lower + Arms",type:"workout",workoutType:"strength",items:[
   {name:"Leg Press",muscle:"Quads / glutes",equipment:"Machine",sets:3,reps:"8-12"},
   {name:"Hip Thrust",muscle:"Glutes",equipment:"Barbell / machine",sets:3,reps:"8-12"},
   {name:"Leg Curl",muscle:"Hamstrings",equipment:"Machine",sets:3,reps:"10-15"},
   {name:"Biceps Curl",muscle:"Biceps",equipment:"Dumbbells / cable",sets:3,reps:"8-12"},
   {name:"Overhead Cable Triceps Extension",muscle:"Triceps",equipment:"Cable",sets:3,reps:"10-15"}
  ]}
 ]
};

const READY_PROGRAMS={kai:{...KAI_PROGRAM,key:"kai"},raymond:{...RAYMOND_PROGRAM,key:"raymond"},jocke:{...JOCKE_PROGRAM,key:"jocke"}};
function programByKey(key){
 if(READY_PROGRAMS[key])return READY_PROGRAMS[key];
 if(String(key).startsWith('custom:')){
  const id=String(key).slice(7),p=(data.customPrograms||[]).find(x=>x.id===id);
  return p?{...p,key:`custom:${p.id}`,custom:true}:null;
 }
 return null;
}
function programLastCompleted(programName,dayId){const matches=data.sessions.filter(x=>x.program===programName&&(dayId==null||x.programDay===dayId));if(!matches.length)return '';return matches.sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0].date}
function openReadyProgram(key){
 const program=programByKey(key);if(!program)return;
 if(program.days.length===1&&program.days[0].type==='workout')return openReadyProgramDay(key,program.days[0].id);
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">${program.custom?'Your training plan':'Training plan'}</p><h2>${escapeHtml(program.name)}</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">${escapeHtml(program.description||'')}</p><div class="kai-program-list">${program.days.map((d,i)=>{const last=programLastCompleted(program.name,d.id);const workoutType=d.workoutType||'strength';const meta=d.type==='workout'?(workoutType==='cardio'?`${d.duration||30} min · ${escapeHtml(d.mode||'Cardio')}${last?` · Last ${last}`:''}`:`${(d.items||[]).length} exercises · ${escapeHtml(workoutType)}${last?` · Last ${last}`:''}`):d.type==='rest'?'Recovery day':'Recover or restart';return `<button class="list-card kai-day-card" data-program-day="${escapeHtml(String(d.id))}" style="width:100%;color:inherit;text-align:left"><span class="badge-icon ${d.type==='rest'||d.type==='restart'||workoutType==='rehab'?'rehab':workoutType==='cardio'?'cardio':''}">${i+1}</span><span class="grow"><p class="eyebrow">${escapeHtml(d.label||`Day ${i+1}`)}</p><h3>${escapeHtml(d.name)}</h3><p>${meta}</p></span><span class="chev">›</span></button>`}).join('')}</div>${program.custom?`<div class="sheet-actions"><button class="secondary" id="program-edit-from-view">EDIT PROGRAM</button></div>`:''}`);
 $$('[data-program-day]').forEach(b=>b.onclick=()=>openReadyProgramDay(key,b.dataset.programDay));
 if(program.custom)$('#program-edit-from-view').onclick=()=>openProgramBuilder(program.id);
}
function openReadyProgramDay(key,dayId){
 const program=programByKey(key),d=program?.days.find(x=>String(x.id)===String(dayId));if(!d)return;
 if(d.type==='rest'){
  openSheet(`<div class="sheet-head"><div><p class="eyebrow">${escapeHtml(program.name)} · ${escapeHtml(d.label)}</p><h2>Rest day</h2></div><button class="sheet-close" data-close>×</button></div><article class="card"><h3>Recover, hydrate, become annoyingly strong.</h3><p class="subtle">No workout is loaded today. Recovery is part of the program.</p></article><div class="sheet-actions"><button class="secondary" id="program-back">BACK</button></div>`);
  $('#program-back').onclick=()=>openReadyProgram(key);return
 }
 if(d.type==='restart'){
  openSheet(`<div class="sheet-head"><div><p class="eyebrow">${escapeHtml(program.name)} · ${escapeHtml(d.label)}</p><h2>Rest or restart</h2></div><button class="sheet-close" data-close>×</button></div><article class="card"><h3>Listen to the body, diva.</h3><p class="subtle">Take another recovery day, or restart Day 1 if you feel ready.</p></article><div class="sheet-actions"><button class="secondary" id="program-rest">REST TODAY</button><button class="primary" id="program-restart">START DAY 1</button></div>`);
  $('#program-rest').onclick=()=>{closeSheet();toast('Rest day secured. Grow in peace.')};$('#program-restart').onclick=()=>openReadyProgramDay(key,program.days[0].id);return
 }
 const workoutType=d.workoutType||'strength',hasVariation=(d.items||[]).some(x=>x.name==='__PULL_VARIATION__'),hasUpperPullVariation=(d.items||[]).some(x=>x.name==='__UPPER_PULL_VARIATION__');
 const preview=workoutType==='cardio'
  ?`<article class="card"><div class="metric-grid"><div class="metric"><span>Mode</span><strong>${escapeHtml(d.mode||'Cardio')}</strong></div><div class="metric"><span>Time</span><strong>${d.duration||30} min</strong></div>${d.distance?`<div class="metric"><span>Distance goal</span><strong>${d.distance} km</strong></div>`:''}</div></article>`
  :`<div class="list">${(d.items||[]).map((x,i)=>`<div class="list-card"><span class="badge-icon">${i+1}</span><span class="grow"><h3>${escapeHtml(x.name==='__PULL_VARIATION__'?'Chin-Ups / Lat Pulldown':x.name==='__UPPER_PULL_VARIATION__'?'Lat Pulldown / Pull-Ups':x.name)}</h3><p>${x.sets} sets · ${escapeHtml(x.reps)} ${workoutType==='rehab'?'reps / time':'reps'}${x.note?' · adjustable':''}</p></span></div>`).join('')}</div>`;
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">${escapeHtml(program.name)} · ${escapeHtml(d.label)}</p><h2>${escapeHtml(d.name)}</h2></div><button class="sheet-close" data-close>×</button></div>${key==='raymond'?'<p class="subtle">Biceps. Triceps. Sleeves entering their unemployment era.</p>':''}${preview}${hasVariation?`<div class="field"><label>Back exercise variation</label><select id="program-pull-choice"><option value="Chin-Ups">Chin-Ups</option><option value="Lat Pulldown">Lat Pulldown</option></select></div>`:''}${hasUpperPullVariation?`<div class="field"><label>Upper pull variation</label><select id="program-upper-pull-choice"><option value="Lat Pulldown">Lat Pulldown</option><option value="Pull-Ups">Pull-Ups</option></select></div>`:''}<div class="sheet-actions"><button class="primary" id="program-start">START ${workoutType==='cardio'?'CARDIO':'WORKOUT'}</button>${program.days.length>1?'<button class="secondary" id="program-back">BACK</button>':''}</div>`);
 if($('#program-back'))$('#program-back').onclick=()=>openReadyProgram(key);
 $('#program-start').onclick=()=>{const choice=hasVariation?$('#program-pull-choice').value:null,upperChoice=hasUpperPullVariation?$('#program-upper-pull-choice').value:null;closeSheet();startReadyProgramWorkout(program,d,choice,upperChoice)}
}
function startReadyProgramWorkout(program,day,pullChoice=null,upperPullChoice=null){
 const workoutType=day.workoutType||'strength';
 if(workoutType==='cardio'){
  activeExerciseOpen=0;
  startWorkoutTemplate({id:`${program.key}-day-${day.id}`,name:`${program.name} · ${day.label}`,type:'cardio',program:program.name,programDay:day.id,notes:`${program.name} program`,duration:day.duration||30,distance:day.distance||0,mode:day.mode||'Cardio',items:[]});
  return;
 }
 activeExerciseOpen=0;
 const items=(day.items||[]).map(x=>{
  if(x.name==='__PULL_VARIATION__')return pullChoice==='Lat Pulldown'?{name:'Lat Pulldown',muscle:'Back',equipment:'Cable',sets:3,reps:'10'}:{name:'Chin-Ups',muscle:'Back / biceps',equipment:'Bodyweight',sets:3,reps:'10'};
  if(x.name==='__UPPER_PULL_VARIATION__')return upperPullChoice==='Pull-Ups'?{name:'Pull-Ups',muscle:'Back / biceps',equipment:'Bodyweight',sets:3,reps:'8-12'}:{name:'Lat Pulldown',muscle:'Back',equipment:'Cable',sets:3,reps:'8-12'};
  return {...x}
 });
 startWorkoutTemplate({id:`${program.key}-day-${day.id}`,name:`${program.name} · ${day.label}`,type:workoutType,program:program.name,programDay:day.id,notes:`${program.name} program`,items})
}
let programDraftState=null;
function newProgramDraft(editId=null){
 const old=editId?(data.customPrograms||[]).find(p=>p.id===editId):null;
 return old?structuredClone(old):{id:uid(),name:'',description:'',days:[],createdAt:Date.now()};
}
function renumberProgramDays(draft){
 draft.days.forEach((d,i)=>{d.label=`Day ${i+1}`;if(!d.id)d.id=uid()});
}
function openProgramBuilder(editId=null,draft=null){
 programDraftState=draft||newProgramDraft(editId);
 const d=programDraftState,editing=(data.customPrograms||[]).some(p=>p.id===d.id);renumberProgramDays(d);
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">${editing?'Edit':'Create'} program</p><h2>${editing?escapeHtml(d.name||'Your program'):'Build your own era'}</h2></div><button class="sheet-close" data-close>×</button></div>
 <div class="field"><label>Program name</label><input id="program-builder-name" maxlength="45" placeholder="e.g. Summer Damage Control" value="${escapeHtml(d.name||'')}"></div>
 <div class="field"><label>Description</label><textarea id="program-builder-description" rows="3" maxlength="180" placeholder="What is this program for?">${escapeHtml(d.description||'')}</textarea></div>
 <section class="section"><div class="section-head"><h2>Days</h2><button class="text-btn" id="program-add-day">+ ADD DAY</button></div><div class="list" id="program-builder-days"></div></section>
 <div class="builder-actions"><button class="secondary" id="program-builder-cancel">CANCEL</button><button class="primary" id="program-builder-save">SAVE PROGRAM</button></div>`);
 function syncHead(){d.name=$('#program-builder-name')?.value||d.name;d.description=$('#program-builder-description')?.value||d.description}
 function paint(){
  $('#program-builder-days').innerHTML=d.days.length?d.days.map((day,i)=>`<div class="program-builder-day"><button class="list-card program-day-main" data-edit-program-day="${i}" style="width:100%;color:inherit;text-align:left"><span class="badge-icon ${day.type==='rest'?'rehab':day.workoutType==='cardio'?'cardio':day.workoutType==='rehab'?'rehab':''}">${i+1}</span><span class="grow"><p class="eyebrow">${escapeHtml(day.label)}</p><h3>${escapeHtml(day.name||(day.type==='rest'?'Rest':'Workout'))}</h3><p>${day.type==='rest'?'Recovery day':day.workoutType==='cardio'?`${day.duration||30} min · ${escapeHtml(day.mode||'Cardio')}`:`${(day.items||[]).length} exercises · ${escapeHtml(day.workoutType||'strength')}`}</p></span><span class="chev">›</span></button><div class="program-day-actions"><button class="small-btn" data-program-day-up="${i}" ${i===0?'disabled':''}>↑</button><button class="small-btn" data-program-day-down="${i}" ${i===d.days.length-1?'disabled':''}>↓</button><button class="small-btn danger" data-program-day-delete="${i}">REMOVE</button></div></div>`).join(''):`<div class="empty"><strong>No days yet</strong>Add Day 1 and decide whether it is strength, cardio, rehab or rest.</div>`;
  $$('[data-edit-program-day]').forEach(b=>b.onclick=()=>{syncHead();openProgramDayBuilder(+b.dataset.editProgramDay)});
  $$('[data-program-day-up]').forEach(b=>b.onclick=()=>{syncHead();const i=+b.dataset.programDayUp;if(i>0){[d.days[i-1],d.days[i]]=[d.days[i],d.days[i-1]];renumberProgramDays(d);openProgramBuilder(editId,d)}});
  $$('[data-program-day-down]').forEach(b=>b.onclick=()=>{syncHead();const i=+b.dataset.programDayDown;if(i<d.days.length-1){[d.days[i+1],d.days[i]]=[d.days[i],d.days[i+1]];renumberProgramDays(d);openProgramBuilder(editId,d)}});
  $$('[data-program-day-delete]').forEach(b=>b.onclick=()=>{syncHead();d.days.splice(+b.dataset.programDayDelete,1);renumberProgramDays(d);openProgramBuilder(editId,d)});
 }
 paint();
 $('#program-add-day').onclick=()=>{syncHead();d.days.push({id:uid(),label:`Day ${d.days.length+1}`,name:'',type:'workout',workoutType:'strength',items:[]});openProgramDayBuilder(d.days.length-1)};
 $('#program-builder-cancel').onclick=()=>{programDraftState=null;closeSheet()};
 $('#program-builder-save').onclick=()=>{syncHead();const name=d.name.trim();if(!name)return toast('Give the program a name');if(!d.days.length)return toast('Add at least one day');if(d.days.some(day=>day.type!=='rest'&&day.workoutType!=='cardio'&&!(day.items||[]).length))return toast('Every training day needs at least one exercise');d.name=name;renumberProgramDays(d);data.customPrograms=data.customPrograms||[];const exists=data.customPrograms.some(x=>x.id===d.id);data.customPrograms=exists?data.customPrograms.map(x=>x.id===d.id?structuredClone(d):x):[...data.customPrograms,structuredClone(d)];save();programDraftState=null;closeSheet();workout();toast(exists?'Program updated':'Program saved')};
}
function openProgramDayBuilder(index,seedItems=null){
 const draft=programDraftState;if(!draft)return;
 const day=draft.days[index];if(!day)return;
 if(seedItems)day.items=seedItems.map(x=>({...x}));
 const kind=day.type==='rest'?'rest':day.workoutType||'strength';
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">${escapeHtml(day.label)}</p><h2>Plan this day</h2></div><button class="sheet-close" data-close>×</button></div>
 <div class="field"><label>Day type</label><select id="program-day-kind"><option value="strength" ${kind==='strength'?'selected':''}>Strength</option><option value="cardio" ${kind==='cardio'?'selected':''}>Cardio</option><option value="rehab" ${kind==='rehab'?'selected':''}>Rehab</option><option value="rest" ${kind==='rest'?'selected':''}>Rest</option></select></div>
 <div class="field"><label>Day name</label><input id="program-day-name" maxlength="40" placeholder="e.g. Push, Long Run or Rest" value="${escapeHtml(day.name||'')}"></div>
 <div id="program-day-fields"></div>
 <div class="builder-actions"><button class="secondary" id="program-day-back">BACK</button><button class="primary" id="program-day-save">SAVE DAY</button></div>`);
 function cacheBase(){day.name=$('#program-day-name')?.value.trim()||day.name;const selected=$('#program-day-kind')?.value||kind;day.type=selected==='rest'?'rest':'workout';day.workoutType=selected==='rest'?'':selected}
 function paintFields(){
  const selected=$('#program-day-kind').value;
  if(selected==='rest'){$('#program-day-fields').innerHTML=`<article class="card"><h3>Recovery day</h3><p class="subtle">No workout is loaded. Rest days still count as part of the plan.</p></article>`;return}
  if(selected==='cardio'){$('#program-day-fields').innerHTML=`<div class="inline-fields"><div class="field"><label>Duration (min)</label><input id="program-day-duration" type="number" min="1" value="${day.duration||30}"></div><div class="field"><label>Distance goal (km)</label><input id="program-day-distance" type="number" min="0" step="0.1" value="${day.distance||''}"></div></div><div class="field"><label>Cardio mode</label><select id="program-day-mode">${['Running','Cycling','Walking','Hiking','Rowing','Elliptical','Other'].map(m=>`<option ${m===(day.mode||'Running')?'selected':''}>${m}</option>`).join('')}</select></div>`;return}
  const items=day.items||[];
  $('#program-day-fields').innerHTML=`<section class="section"><div class="section-head"><h2>Exercises</h2><button class="text-btn" id="program-day-add-exercise">+ ADD</button></div><div class="list" id="program-day-items">${items.length?items.map((x,i)=>`<div class="exercise-row"><div class="exercise-row-head"><span class="drag">${i+1}</span><strong>${escapeHtml(x.name)}</strong><button class="small-btn" data-program-ex-up="${i}" ${i===0?'disabled':''}>↑</button><button class="small-btn" data-program-ex-down="${i}" ${i===items.length-1?'disabled':''}>↓</button><button class="small-btn danger" data-program-ex-remove="${i}">REMOVE</button></div><div class="inline-fields"><div class="field"><label>Sets</label><input type="number" min="1" max="20" value="${x.sets||3}" data-program-ex-sets="${i}"></div><div class="field"><label>${selected==='rehab'?'Reps / time':'Reps'}</label><input value="${escapeHtml(x.reps||'8-12')}" data-program-ex-reps="${i}"></div></div></div>`).join(''):`<div class="empty"><strong>No exercises added</strong>Build the day from the same Exercise Library as your workouts.</div>`}</div></section>`;
  $$('[data-program-ex-remove]').forEach(b=>b.onclick=()=>{items.splice(+b.dataset.programExRemove,1);day.items=items;paintFields()});
  $$('[data-program-ex-up]').forEach(b=>b.onclick=()=>{const i=+b.dataset.programExUp;if(i>0){[items[i-1],items[i]]=[items[i],items[i-1]];day.items=items;paintFields()}});
  $$('[data-program-ex-down]').forEach(b=>b.onclick=()=>{const i=+b.dataset.programExDown;if(i<items.length-1){[items[i+1],items[i]]=[items[i],items[i+1]];day.items=items;paintFields()}});
  $$('[data-program-ex-sets]').forEach(inp=>inp.onchange=()=>items[+inp.dataset.programExSets].sets=Math.max(1,+inp.value||1));
  $$('[data-program-ex-reps]').forEach(inp=>inp.onchange=()=>items[+inp.dataset.programExReps].reps=inp.value);
  $('#program-day-add-exercise').onclick=()=>{cacheBase();const currentType=$('#program-day-kind').value;openExercisePicker(currentType,ex=>{day.items=day.items||[];day.items.push(ex);openProgramDayBuilder(index,day.items)})};
 }
 paintFields();
 $('#program-day-kind').onchange=()=>{cacheBase();paintFields()};
 $('#program-day-back').onclick=()=>{cacheBase();openProgramBuilder(draft.id,draft)};
 $('#program-day-save').onclick=()=>{const selected=$('#program-day-kind').value;day.name=$('#program-day-name').value.trim()||(selected==='rest'?'Rest':selected[0].toUpperCase()+selected.slice(1));day.type=selected==='rest'?'rest':'workout';day.workoutType=selected==='rest'?'':selected;if(selected==='cardio'){day.duration=Math.max(1,+$('#program-day-duration').value||30);day.distance=Math.max(0,+$('#program-day-distance').value||0);day.mode=$('#program-day-mode').value;day.items=[]}else if(selected==='rest'){day.items=[]}else if(!(day.items||[]).length)return toast('Add at least one exercise');openProgramBuilder(draft.id,draft)};
}
function openCustomProgramMenu(id){
 const program=(data.customPrograms||[]).find(p=>p.id===id);if(!program)return;
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Your program</p><h2>${escapeHtml(program.name)}</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">${escapeHtml(program.description||`${program.days.length}-day custom program`)}</p><div class="sheet-actions"><button class="primary" id="custom-program-open">OPEN PROGRAM</button><button class="secondary" id="custom-program-edit">EDIT PROGRAM</button><button class="danger-btn" id="custom-program-delete">DELETE PROGRAM</button></div>`);
 $('#custom-program-open').onclick=()=>openReadyProgram(`custom:${id}`);
 $('#custom-program-edit').onclick=()=>openProgramBuilder(id);
 $('#custom-program-delete').onclick=()=>{data.customPrograms=(data.customPrograms||[]).filter(x=>x.id!==id);save();closeSheet();workout();toast('Program deleted')};
}
function workout(){
 const customPrograms=data.customPrograms||[];
 shell(`${header()}<h1 class="page-title">Workout</h1><p class="subtle">Create a one-off workout, jump into a GAYM program, or build your own day-by-day training plan.</p>
 <section class="section"><p class="eyebrow">Choose workout type</p><div class="builder-type-grid"><button class="type-card active" data-type="strength">${icons.workout}<strong>Strength</strong><small>Sets, reps & weight</small></button><button class="type-card" data-type="cardio"><span style="font-size:23px;color:var(--cyan)">↗</span><strong>Cardio</strong><small>Time, distance & intervals</small></button><button class="type-card" data-type="rehab"><span style="font-size:21px;color:var(--lime);font-weight:900">R</span><strong>Rehab</strong><small>Controlled sets & notes</small></button></div></section>
 <section class="section"><p class="eyebrow">Ready-made programs</p><div class="builder-type-grid program-type-grid"><button class="type-card kai-type-card" data-program="kai"><span class="kai-mark">K</span><strong>Kai</strong><small>Ready-made 5-day split</small></button><button class="type-card raymond-type-card" data-program="raymond"><span class="raymond-mark">R</span><strong>Raymond’s Big Gay Arms</strong><small>Biceps, triceps & sleeve problems</small></button><button class="type-card jocke-type-card" data-program="jocke"><span class="jocke-mark">J</span><strong>Jocke</strong><small>Push · Pull · Legs · Upper · Lower + Arms</small></button></div></section>
 <section class="section"><div class="section-head"><div><p class="eyebrow">Your programs</p><h2>Custom Programs</h2></div><button class="text-btn" id="new-program">+ CREATE</button></div><div class="custom-program-grid">${customPrograms.length?customPrograms.map(p=>`<button class="type-card custom-program-card" data-custom-program="${p.id}"><span class="custom-program-mark">P</span><strong>${escapeHtml(p.name)}</strong><small>${p.days?.length||0} days · Your plan</small></button>`).join(''):`<button class="type-card create-program-card" id="empty-program-create"><span class="custom-program-mark">+</span><strong>Create your program</strong><small>Plan strength, cardio, rehab & rest day by day</small></button>`}</div></section>
 <section class="section"><div class="section-head"><h2>Your workouts</h2><button class="text-btn" id="new-workout">+ NEW</button></div><div class="tabs" id="workout-tabs"><button class="tab active" data-filter="all">All</button><button class="tab" data-filter="strength">Strength</button><button class="tab" data-filter="cardio">Cardio</button><button class="tab" data-filter="rehab">Rehab</button></div><div class="list" id="workout-list" style="margin-top:11px"></div></section>`);
 let chosen='strength',filter='all';
 function paint(){
  const arr=data.customWorkouts.filter(w=>filter==='all'||w.type===filter);
  $('#workout-list').innerHTML=arr.length?arr.map(w=>`<button class="list-card" style="width:100%;color:inherit;text-align:left" data-workout-id="${w.id}"><span class="badge-icon ${w.type==='cardio'?'cardio':w.type==='rehab'?'rehab':''}">${w.type==='cardio'?'↗':w.type==='rehab'?'R':'S'}</span><span class="grow"><h3>${escapeHtml(w.name)}</h3><p>${w.type==='cardio'?(w.duration||30)+' min':(w.items?.length||0)+' exercises'} · Custom workout</p></span><span class="chev">›</span></button>`).join(''):`<div class="empty"><strong>No ${filter==='all'?'custom':filter} workouts yet</strong>Tap “New” to build one from scratch.</div>`;
  $$('[data-workout-id]').forEach(b=>b.onclick=()=>openWorkoutSheet(b.dataset.workoutId))
 }
 paint();
 $$('[data-type]').forEach(b=>b.onclick=()=>{chosen=b.dataset.type;$$('[data-type]').forEach(x=>x.classList.toggle('active',x===b));openBuilder(chosen)});
 $$('[data-program]').forEach(b=>b.onclick=()=>openReadyProgram(b.dataset.program));
 $$('[data-custom-program]').forEach(b=>b.onclick=()=>openCustomProgramMenu(b.dataset.customProgram));
 $('#new-program').onclick=()=>openProgramBuilder();
 if($('#empty-program-create'))$('#empty-program-create').onclick=()=>openProgramBuilder();
 $('#new-workout').onclick=()=>openBuilder(chosen);
 $$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;$$('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));paint()});
}
function openWorkoutSheet(id){const w=data.customWorkouts.find(w=>w.id===id);if(!w)return;openSheet(`<div class="sheet-head"><div><p class="eyebrow">${w.type}</p><h2>${escapeHtml(w.name)}</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">${w.type==='cardio'?`${w.duration||30} min${w.distance?` · ${w.distance} km`:''}`:`${w.items?.length||0} exercises`}</p><div class="list">${(w.items||[]).map((x,i)=>`<div class="list-card"><span class="badge-icon">${i+1}</span><span class="grow"><h3>${escapeHtml(x.name)}</h3><p>${x.sets||3} sets${x.reps?` · ${x.reps} reps`:''}</p></span></div>`).join('')}</div><div class="sheet-actions"><button class="primary" id="sheet-start">START WORKOUT</button><button class="secondary" id="sheet-edit">EDIT</button><button class="danger-btn" id="sheet-delete">DELETE</button></div>`);$('#sheet-start').onclick=()=>{closeSheet();startWorkout(id)};$('#sheet-edit').onclick=()=>{closeSheet();openBuilder(w.type,id)};$('#sheet-delete').onclick=()=>{data.customWorkouts=data.customWorkouts.filter(x=>x.id!==id);data.planned=data.planned.filter(x=>x.workoutId!==id);save();closeSheet();render();toast('Workout deleted')}}
function openBuilder(type='strength',editId=null,seedItems=null,seedDraft=null){const old=editId?data.customWorkouts.find(w=>w.id===editId):null;let items=seedItems?seedItems.map(x=>({...x})):(old?.items?.map(x=>({...x}))||[]);const draft=seedDraft||{};openSheet(`<div class="sheet-head"><div><p class="eyebrow">${old?'Edit':'Create'} ${type}</p><h2>${old?escapeHtml(old.name):'New workout'}</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><label>Workout name</label><input id="builder-name" maxlength="40" placeholder="e.g. Upper body" value="${escapeHtml(draft.name??(old?.name||''))}"></div>${type==='cardio'?`<div class="inline-fields"><div class="field"><label>Duration (min)</label><input id="builder-duration" type="number" min="1" value="${draft.duration??old?.duration??30}"></div><div class="field"><label>Distance (km)</label><input id="builder-distance" type="number" min="0" step="0.1" value="${draft.distance??old?.distance??''}"></div></div><div class="field"><label>Cardio mode</label><select id="builder-mode">${['Running','Cycling','Walking','Hiking','Rowing','Elliptical','Other'].map(m=>`<option ${m===(draft.mode??old?.mode??'Running')?'selected':''}>${m}</option>`).join('')}</select></div>`:`<section class="section"><div class="section-head"><h2>Exercises</h2><button class="text-btn" id="builder-add">+ ADD</button></div><div class="list" id="builder-items"></div></section>`}<div class="field"><label>Notes</label><textarea id="builder-notes" rows="4" maxlength="500" placeholder="Optional workout notes">${escapeHtml(draft.notes??old?.notes??'')}</textarea></div><div class="builder-actions"><button class="secondary" id="builder-cancel">CANCEL</button><button class="primary" id="builder-save">SAVE WORKOUT</button></div>`);
 if(type!=='cardio'){const paint=()=>{$('#builder-items').innerHTML=items.length?items.map((x,i)=>`<div class="exercise-row"><div class="exercise-row-head"><span class="drag">${i+1}</span><strong>${escapeHtml(x.name)}</strong><button class="small-btn" data-up="${i}" ${i===0?'disabled':''}>↑</button><button class="small-btn" data-down="${i}" ${i===items.length-1?'disabled':''}>↓</button><button class="small-btn danger" data-remove="${i}">REMOVE</button></div><div class="inline-fields"><div class="field"><label>Sets</label><input type="number" min="1" max="20" value="${x.sets||3}" data-item-set="${i}"></div><div class="field"><label>${type==='rehab'?'Reps / time':'Reps'}</label><input value="${escapeHtml(x.reps||'8-12')}" data-item-reps="${i}"></div></div></div>`).join(''):`<div class="empty"><strong>No exercises added</strong>Add exercises to build this session.</div>`;$$('[data-remove]').forEach(b=>b.onclick=()=>{items.splice(+b.dataset.remove,1);paint()});$$('[data-up]').forEach(b=>b.onclick=()=>{const i=+b.dataset.up;if(i>0){[items[i-1],items[i]]=[items[i],items[i-1]];paint()}});$$('[data-down]').forEach(b=>b.onclick=()=>{const i=+b.dataset.down;if(i<items.length-1){[items[i+1],items[i]]=[items[i],items[i+1]];paint()}});$$('[data-item-set]').forEach(inp=>inp.onchange=()=>items[+inp.dataset.itemSet].sets=Math.max(1,+inp.value||1));$$('[data-item-reps]').forEach(inp=>inp.onchange=()=>items[+inp.dataset.itemReps].reps=inp.value)};paint();$('#builder-add').onclick=()=>{const currentDraft={name:$('#builder-name').value,notes:$('#builder-notes').value};openExercisePicker(type,x=>{items.push(x);openBuilder(type,editId,items,currentDraft)})}}
 $('#builder-cancel').onclick=closeSheet;$('#builder-save').onclick=()=>{const name=$('#builder-name').value.trim();if(!name)return toast('Give the workout a name');if(type!=='cardio'&&!items.length)return toast('Add at least one exercise');const obj={id:old?.id||uid(),name,type,items,notes:$('#builder-notes').value.trim(),createdAt:old?.createdAt||Date.now()};if(type==='cardio'){obj.duration=Math.max(1,+$('#builder-duration').value||30);obj.distance=Math.max(0,+$('#builder-distance').value||0);obj.mode=$('#builder-mode').value}if(old){data.customWorkouts=data.customWorkouts.map(w=>w.id===old.id?obj:w)}else data.customWorkouts.push(obj);save();closeSheet();render();toast(old?'Workout updated':'Workout saved')};}
const exerciseLibrary={
 strength:[
  {name:'Bench Press',muscle:'Chest',equipment:'Barbell',sets:3,reps:'6-10'},
  {name:'Incline Dumbbell Press',muscle:'Chest',equipment:'Dumbbells',sets:3,reps:'8-12'},
  {name:'Machine Chest Press',muscle:'Chest',equipment:'Machine',sets:3,reps:'8-12'},
  {name:'Cable Fly',muscle:'Chest',equipment:'Cable',sets:3,reps:'10-15'},
  {name:'Push-Up',muscle:'Chest',equipment:'Bodyweight',sets:3,reps:'8-20'},
  {name:'Lat Pulldown',muscle:'Back',equipment:'Cable',sets:3,reps:'8-12'},
  {name:'Pull-Up',muscle:'Back',equipment:'Bodyweight',sets:3,reps:'5-10'},
  {name:'Chin-Ups',muscle:'Back / biceps',equipment:'Bodyweight',sets:3,reps:'5-10'},
  {name:'Seated Cable Row',muscle:'Back',equipment:'Cable',sets:3,reps:'8-12'},
  {name:'Chest-Supported Row',muscle:'Back',equipment:'Dumbbells / machine',sets:3,reps:'8-12'},
  {name:'One-Arm Dumbbell Row',muscle:'Back',equipment:'Dumbbell',sets:3,reps:'8-12'},
  {name:'Back Squat',muscle:'Quads / glutes',equipment:'Barbell',sets:3,reps:'6-10'},
  {name:'Hack Squat',muscle:'Quads / glutes',equipment:'Machine',sets:3,reps:'8-12'},
  {name:'Leg Press',muscle:'Quads / glutes',equipment:'Machine',sets:3,reps:'8-15'},
  {name:'Bulgarian Split Squat',muscle:'Quads / glutes',equipment:'Dumbbells',sets:3,reps:'8-12 / leg'},
  {name:'Romanian Deadlift',muscle:'Hamstrings / glutes',equipment:'Barbell / dumbbells',sets:3,reps:'6-10'},
  {name:'Leg Curl',muscle:'Hamstrings',equipment:'Machine',sets:3,reps:'10-15'},
  {name:'Leg Extension',muscle:'Quads',equipment:'Machine',sets:3,reps:'10-15'},
  {name:'Hip Thrust',muscle:'Glutes',equipment:'Barbell / machine',sets:3,reps:'8-12'},
  {name:'Cable Kickback',muscle:'Glutes',equipment:'Cable',sets:3,reps:'10-15'},
  {name:'Hip Abduction',muscle:'Glutes',equipment:'Machine',sets:3,reps:'12-20'},
  {name:'Shoulder Press',muscle:'Shoulders',equipment:'Dumbbells / machine',sets:3,reps:'6-10'},
  {name:'Cable Lateral Raise',muscle:'Shoulders',equipment:'Cable',sets:3,reps:'10-20'},
  {name:'Dumbbell Lateral Raise',muscle:'Shoulders',equipment:'Dumbbells',sets:3,reps:'10-20'},
  {name:'Reverse Pec Deck',muscle:'Rear delts',equipment:'Machine',sets:3,reps:'10-15'},
  {name:'Face Pull',muscle:'Rear delts / upper back',equipment:'Cable',sets:3,reps:'10-15'},
  {name:'Biceps Curl',muscle:'Biceps',equipment:'Dumbbells',sets:3,reps:'8-15'},
  {name:'Hammer Curl',muscle:'Biceps / forearms',equipment:'Dumbbells',sets:3,reps:'8-15'},
  {name:'Triceps Pushdown',muscle:'Triceps',equipment:'Cable',sets:3,reps:'8-15'},
  {name:'Overhead Triceps Extension',muscle:'Triceps',equipment:'Cable / dumbbell',sets:3,reps:'8-15'},
  {name:'Standing Calf Raise',muscle:'Calves',equipment:'Machine / bodyweight',sets:3,reps:'10-20'},
  {name:'Seated Calf Raise',muscle:'Calves',equipment:'Machine',sets:3,reps:'10-20'},
  {name:'Deadlift',muscle:'Back / hamstrings / glutes',equipment:'Barbell',sets:3,reps:'3-6'},
  {name:'Bent-Over Barbell Row',muscle:'Back',equipment:'Barbell',sets:3,reps:'8-12'},
  {name:'EZ-Bar Curl',muscle:'Biceps',equipment:'EZ-bar',sets:3,reps:'8-12'},
  {name:'Preacher Curl',muscle:'Biceps',equipment:'Dumbbell / EZ-bar',sets:3,reps:'8-12'},
  {name:'Weighted Dips',muscle:'Chest / triceps',equipment:'Bodyweight / added weight',sets:3,reps:'6-10'},
  {name:'Close-Grip Bench Press',muscle:'Triceps / chest',equipment:'Barbell',sets:3,reps:'8-12'},
  {name:'Walking Lunge',muscle:'Quads / glutes',equipment:'Dumbbells / bodyweight',sets:3,reps:'8-12 / leg'},
  {name:'Military Press',muscle:'Shoulders',equipment:'Barbell',sets:3,reps:'5-10'},
  {name:'Seated Dumbbell Shoulder Press',muscle:'Shoulders',equipment:'Dumbbells',sets:3,reps:'8-15'},
  {name:'Plank',muscle:'Core',equipment:'Bodyweight',sets:3,reps:'30-60 sec'},
  {name:'Cable Crunch',muscle:'Core',equipment:'Cable',sets:3,reps:'10-15'}
 ],
 rehab:[
  {name:'Band External Rotation',muscle:'Rotator cuff',equipment:'Band',sets:2,reps:'12-15 controlled'},
  {name:'Wall Slide',muscle:'Shoulder / scapula',equipment:'Wall',sets:2,reps:'8-12 controlled'},
  {name:'Scapular Retraction',muscle:'Upper back / scapula',equipment:'Band / cable',sets:2,reps:'10-15 controlled'},
  {name:'Face Pull - Light',muscle:'Rear shoulder / scapula',equipment:'Cable / band',sets:2,reps:'12-15 controlled'},
  {name:'Isometric Hold',muscle:'Custom',equipment:'Bodyweight / band',sets:3,reps:'20-45 sec'},
  {name:'Single-Leg Balance',muscle:'Ankle / hip stability',equipment:'Bodyweight',sets:3,reps:'30-60 sec / side'},
  {name:'Tempo Bodyweight Squat',muscle:'Knee / hip control',equipment:'Bodyweight',sets:2,reps:'8-12 slow'},
  {name:'Glute Bridge',muscle:'Glutes / hip',equipment:'Bodyweight',sets:2,reps:'10-15 controlled'},
  {name:'Dead Bug',muscle:'Core stability',equipment:'Bodyweight',sets:2,reps:'6-10 / side'},
  {name:'Bird Dog',muscle:'Core / spine control',equipment:'Bodyweight',sets:2,reps:'6-10 / side'},
  {name:'Calf Isometric',muscle:'Calf / ankle',equipment:'Bodyweight',sets:3,reps:'20-45 sec'},
  {name:'Hip Mobility Flow',muscle:'Hip mobility',equipment:'Bodyweight',sets:2,reps:'30-60 sec / side'}
 ]
};
function defaultExercisePrescription(ex,type){if(type==='rehab')return {sets:ex.sets||2,reps:ex.reps||'10 controlled'};const goal=data.profile.goal||'maintain';if(goal==='gain')return {sets:Math.max(3,ex.sets||3),reps:ex.reps||'8-12'};if(goal==='lose')return {sets:ex.sets||3,reps:ex.reps||'8-12'};return {sets:ex.sets||3,reps:ex.reps||'8-12'}}
function openExercisePicker(type,onPick){const source=exerciseLibrary[type]||exerciseLibrary.strength;let muscle='All';openSheet(`<div class="sheet-head"><div><p class="eyebrow">Exercise library</p><h2>Add exercise</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><input id="exercise-search" placeholder="Search exercise, muscle or equipment..."></div><div class="tabs exercise-filter" id="exercise-muscles"></div><div class="list" id="exercise-picks" style="margin-top:12px"></div><div class="sheet-actions"><button class="secondary" id="custom-exercise">+ CUSTOM EXERCISE</button></div>`);const muscles=['All',...new Set(source.map(x=>x.muscle.split(' / ')[0]))];$('#exercise-muscles').innerHTML=muscles.map(x=>`<button class="tab ${x==='All'?'active':''}" data-muscle="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join('');function paint(q=''){const query=q.toLowerCase();const arr=source.filter(x=>(muscle==='All'||x.muscle.startsWith(muscle))&&(`${x.name} ${x.muscle} ${x.equipment}`).toLowerCase().includes(query));$('#exercise-picks').innerHTML=arr.length?arr.map((x,i)=>`<button class="list-card exercise-pick" style="width:100%;color:inherit;text-align:left" data-pick-index="${source.indexOf(x)}"><span class="badge-icon">+</span><span class="grow"><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.muscle)} · ${escapeHtml(x.equipment)}</p></span><span class="exercise-rx">${x.sets} × ${escapeHtml(x.reps)}</span></button>`).join(''):`<div class="empty"><strong>No exercises found</strong>Try another search or add a custom exercise.</div>`;$$('[data-pick-index]').forEach(b=>b.onclick=()=>{const ex=source[+b.dataset.pickIndex],rx=defaultExercisePrescription(ex,type);closeSheet();onPick({name:ex.name,muscle:ex.muscle,equipment:ex.equipment,sets:rx.sets,reps:rx.reps})})}paint();$('#exercise-search').oninput=e=>paint(e.target.value);$$('[data-muscle]').forEach(b=>b.onclick=()=>{muscle=b.dataset.muscle;$$('[data-muscle]').forEach(x=>x.classList.toggle('active',x===b));paint($('#exercise-search').value)});$('#custom-exercise').onclick=()=>{const n=prompt('Exercise name');if(n?.trim()){closeSheet();onPick({name:n.trim(),muscle:'Custom',equipment:'Custom',sets:type==='rehab'?2:3,reps:type==='rehab'?'10 controlled':'8-12'})}}}
let workoutClockTimer=null;
function sessionElapsedMs(session,now=Date.now()){
 const start=Number(session?.startedAt)||now;
 const end=session?.pausedAt?Number(session.pausedAt):now;
 const paused=Math.max(0,Number(session?.totalPause)||0);
 return Math.max(0,end-start-paused);
}
function sessionElapsedMinutes(session){return Math.floor(sessionElapsedMs(session)/60000)}
function sessionDurationMinutes(session){return Math.max(1,Math.round(sessionElapsedMs(session)/60000))}
function stopWorkoutClock(){if(workoutClockTimer){clearInterval(workoutClockTimer);workoutClockTimer=null}}
function startStrengthClock(session){
 stopWorkoutClock();
 const update=()=>{const el=$('#workout-elapsed-min');if(el)el.textContent=String(sessionElapsedMinutes(session))};
 update();workoutClockTimer=setInterval(update,10000);
}
function persistActiveSession(){if(data.activeSession)save()}
function startWorkoutTemplate(w){activeExerciseOpen=0;data.activeSession={id:uid(),workoutId:w.id||'',name:w.name,type:w.type||'strength',program:w.program||'',programDay:w.programDay||null,startedAt:Date.now(),date:isoToday(),notes:w.notes||'',duration:w.duration||0,distance:w.distance||0,mode:w.mode||'',items:(w.items||[]).map(x=>({name:x.name,muscle:x.muscle||'',equipment:x.equipment||'',targetReps:x.reps||'',note:x.note||'',sets:Array.from({length:x.sets||3},()=>({weight:'',reps:'',done:false}))}))};save();go('active')}
function startWorkout(id){const w=data.customWorkouts.find(w=>w.id===id);if(!w)return go('workout');startWorkoutTemplate(w)}
let activeExerciseOpen=0;
function muscleMap(muscle=''){
 const m=muscle.toLowerCase();
 const on=(keys)=>keys.some(k=>m.includes(k));
 const cls=(keys)=>on(keys)?'muscle-hot':'muscle-base';
 return `<div class="muscle-map" aria-label="Muscles trained: ${escapeHtml(muscle||'Custom')}">
 <svg viewBox="0 0 180 150" role="img" aria-hidden="true">
  <circle cx="90" cy="17" r="10" class="muscle-outline"/>
  <path d="M78 29 Q90 24 102 29 L109 57 Q104 77 100 92 L80 92 Q76 77 71 57 Z" class="muscle-outline"/>
  <path d="M71 35 L55 48 L47 79" class="muscle-outline limb"/><path d="M109 35 L125 48 L133 79" class="muscle-outline limb"/>
  <path d="M82 92 L75 118 L70 143" class="muscle-outline limb"/><path d="M98 92 L105 118 L110 143" class="muscle-outline limb"/>
  <ellipse cx="82" cy="43" rx="10" ry="7" class="${cls(['chest'])}"/><ellipse cx="98" cy="43" rx="10" ry="7" class="${cls(['chest'])}"/>
  <ellipse cx="68" cy="42" rx="6" ry="8" class="${cls(['shoulder','delt','rotator'])}"/><ellipse cx="112" cy="42" rx="6" ry="8" class="${cls(['shoulder','delt','rotator'])}"/>
  <ellipse cx="60" cy="58" rx="5" ry="11" class="${cls(['biceps','triceps','forearm'])}"/><ellipse cx="120" cy="58" rx="5" ry="11" class="${cls(['biceps','triceps','forearm'])}"/>
  <path d="M78 51 Q90 59 102 51 L100 76 Q90 82 80 76 Z" class="${cls(['core','ab','spine'])}"/>
  <path d="M76 35 Q90 30 104 35 L102 63 Q90 69 78 63 Z" class="${cls(['back','scapula'])}" opacity="${on(['back','scapula'])?'1':'0'}"/>
  <ellipse cx="82" cy="91" rx="10" ry="8" class="${cls(['glute','hip'])}"/><ellipse cx="98" cy="91" rx="10" ry="8" class="${cls(['glute','hip'])}"/>
  <path d="M77 98 L87 98 L84 122 L74 122 Z" class="${cls(['quad','hamstring','knee'])}"/><path d="M93 98 L103 98 L106 122 L96 122 Z" class="${cls(['quad','hamstring','knee'])}"/>
  <path d="M73 124 L83 124 L79 143 L70 143 Z" class="${cls(['calf','ankle'])}"/><path d="M97 124 L107 124 L110 143 L101 143 Z" class="${cls(['calf','ankle'])}"/>
 </svg><div><span>Primary area</span><strong>${escapeHtml(muscle||'Custom exercise')}</strong></div></div>`
}
function active(){
 const s=data.activeSession;
 if(!s){go('workout');return}
 const mins=sessionElapsedMinutes(s);
 if(s.type==='cardio'){activeCardio(s,mins);return}
 const total=s.items.reduce((sum,item)=>sum+(item.sets?.length||0),0);
 const done=s.items.reduce((sum,item)=>sum+(item.sets||[]).filter(set=>set.done).length,0);
 shell(`${header('Workout',true)}
  <div class="workout-header">
   <p class="eyebrow">${escapeHtml(s.type)} · <span id="workout-elapsed-min">${mins}</span> min</p>
   <h1 class="page-title">${escapeHtml(s.name)}</h1>
   <p class="subtle">${done} of ${total} sets completed · changes save automatically</p>
   <div class="progress-line"><span style="width:${total?done/total*100:0}%"></span></div>
  </div>
  <div id="active-session-list">${s.items.map((x,i)=>`<details class="session-exercise" data-exercise-index="${i}" ${i===activeExerciseOpen?'open':''}>
   <summary><span class="exercise-num">${i+1}</span><strong>${escapeHtml(x.name)}</strong><span class="chev">⌄</span></summary>
   <div class="sets">${muscleMap(x.muscle)}
    <div class="set-head"><span>Set</span><span>kg</span><span>reps</span><span>done</span></div>
    ${(x.sets||[]).map((z,j)=>`<div class="set-row"><span>${j+1}</span><input inputmode="decimal" value="${escapeHtml(z.weight)}" data-weight="${i}:${j}" placeholder="0"><input inputmode="numeric" value="${escapeHtml(z.reps)}" data-reps="${i}:${j}" placeholder="0"><button type="button" class="set-check ${z.done?'done':''}" data-check="${i}:${j}">${z.done?'✓':'○'}</button></div>`).join('')}
    <div class="set-actions"><button type="button" class="small-btn pink" data-addset="${i}">+ ADD SET</button><button type="button" class="small-btn danger" data-removeset="${i}" ${(x.sets||[]).length<=1?'disabled':''}>− REMOVE SET</button></div>
    <div class="session-note"><textarea data-note="${i}" rows="2" placeholder="Exercise note...">${escapeHtml(x.note||'')}</textarea></div>
    <button type="button" class="text-btn danger-text" data-removeexercise="${i}">REMOVE EXERCISE</button>
   </div>
  </details>`).join('')}</div>
  <section class="section active-workout-actions">
   <button type="button" class="secondary" data-active-action="add-exercise">+ ADD EXERCISE</button>
   <button type="button" class="primary" data-active-action="finish">FINISH WORKOUT</button>
   <button type="button" class="danger-btn" data-active-action="cancel">CANCEL WORKOUT</button>
  </section>`);
 const screen=$('.screen');
 if(!screen)return;
 startStrengthClock(s);
 const back=$('[data-back]');
 if(back)back.onclick=()=>go('home');
 screen.oninput=e=>{
  const target=e.target;
  if(target.matches('[data-weight]')){const[i,j]=target.dataset.weight.split(':').map(Number);if(s.items[i]?.sets?.[j]){s.items[i].sets[j].weight=target.value;save()}}
  else if(target.matches('[data-reps]')){const[i,j]=target.dataset.reps.split(':').map(Number);if(s.items[i]?.sets?.[j]){s.items[i].sets[j].reps=target.value;save()}}
  else if(target.matches('[data-note]')){const i=+target.dataset.note;if(s.items[i]){s.items[i].note=target.value;save()}}
 };
 screen.onclick=e=>{
  const button=e.target.closest('button');
  if(!button)return;
  if(button.dataset.activeAction==='finish'){
   button.disabled=true;
   button.textContent='FINISHING…';
   finishSession();
   return;
  }
  if(button.dataset.activeAction==='cancel'){confirmCancel();return}
  if(button.dataset.activeAction==='add-exercise'){
   openExercisePicker(s.type,ex=>{const rx=defaultExercisePrescription(ex,s.type);s.items.push({name:ex.name,muscle:ex.muscle||'',equipment:ex.equipment||'',targetReps:rx.reps,note:'',sets:Array.from({length:rx.sets},()=>({weight:'',reps:'',done:false}))});save();active()});
   return;
  }
  if(button.dataset.check){const[i,j]=button.dataset.check.split(':').map(Number);if(s.items[i]?.sets?.[j]){activeExerciseOpen=i;s.items[i].sets[j].done=!s.items[i].sets[j].done;save();active()}return}
  if(button.dataset.addset!==undefined){const i=+button.dataset.addset;if(s.items[i]){activeExerciseOpen=i;s.items[i].sets.push({weight:'',reps:'',done:false});save();active()}return}
  if(button.dataset.removeset!==undefined){const i=+button.dataset.removeset,x=s.items[i];if(x&&x.sets.length>1){activeExerciseOpen=i;x.sets.pop();save();active()}return}
  if(button.dataset.removeexercise!==undefined){const i=+button.dataset.removeexercise;if(s.items.length<=1){toast('Keep at least one exercise');return}s.items.splice(i,1);activeExerciseOpen=Math.max(0,Math.min(activeExerciseOpen,s.items.length-1));save();active()}
 };
 $$('.session-exercise').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)activeExerciseOpen=+details.dataset.exerciseIndex}));
}
let cardioTimer=null;
function activeCardio(s,mins){
 const targetSec=Math.max(60,Number(s.duration||30)*60);
 function remainingSec(){return Math.max(0,targetSec-Math.floor(sessionElapsedMs(s)/1000))}
 shell(`${header('Cardio',true)}<div class="workout-header"><p class="eyebrow">${escapeHtml(s.mode||'Cardio')}</p><h1 class="page-title">${escapeHtml(s.name)}</h1></div><article class="card timer-card"><p class="eyebrow">Time remaining</p><div class="timer" id="timer">${formatClock(remainingSec())}</div><p class="timer-hint" id="timer-hint">${remainingSec()===0?'Target reached. Finish when you are ready.':`Counting down from ${s.duration||30} min`}</p><div class="timer-controls"><button class="secondary" id="timer-pause">${s.pausedAt?'RESUME':'PAUSE'}</button><button class="primary" id="timer-lap">ADD LAP</button></div></article><section class="section"><div class="metric-grid"><div class="metric"><span>Target time</span><strong>${s.duration||30} min</strong></div><div class="metric"><span>Distance</span><strong>${s.distance||'Add after'}${s.distance?' km':''}</strong></div><div class="metric"><span>Laps</span><strong>${s.laps?.length||0}</strong></div><div class="metric"><span>Status</span><strong id="timer-status">${s.pausedAt?'Paused':remainingSec()===0?'Target reached':'Active'}</strong></div></div></section><section class="section"><button class="primary lime" id="finish-workout">FINISH CARDIO</button><button class="danger-btn" id="cancel-workout" style="margin-top:8px">CANCEL WORKOUT</button></section>`);
 $('[data-back]').onclick=()=>go('home');
 function tick(){const left=remainingSec(),timer=$('#timer');if(timer)timer.textContent=formatClock(left);const status=$('#timer-status'),hint=$('#timer-hint');if(left===0){if(status)status.textContent='Target reached';if(hint)hint.textContent='Target reached. Finish when you are ready.'}}
 tick();clearInterval(cardioTimer);cardioTimer=setInterval(tick,1000);
 $('#timer-pause').onclick=()=>{if(s.pausedAt){s.totalPause=(s.totalPause||0)+(Date.now()-s.pausedAt);s.pausedAt=null}else{s.pausedAt=Date.now()}save();activeCardio(s,mins)};
 $('#timer-lap').onclick=()=>{s.laps=s.laps||[];s.laps.push({at:Date.now(),elapsedMs:sessionElapsedMs(s)});save();activeCardio(s,mins);toast(`Lap ${s.laps.length} added`)};
 $('#finish-workout').onclick=()=>openCardioFinishSheet(s);
 $('#cancel-workout').onclick=confirmCancel;
}
function formatClock(sec){sec=Math.max(0,Math.floor(Number(sec)||0));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
function openCardioFinishSheet(s){
 const durationMin=sessionDurationMinutes(s);
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Finish cardio</p><h2>${escapeHtml(s.name)}</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">Nice. Add the distance now if you tracked it elsewhere. You can leave it blank.</p><div class="inline-fields"><div class="field"><label>Actual time (min)</label><input id="cardio-finish-duration" type="number" min="1" step="1" value="${durationMin}"></div><div class="field"><label>Distance (km, optional)</label><input id="cardio-finish-distance" type="number" min="0" step="0.01" inputmode="decimal" value="${s.distance||''}" placeholder="e.g. 12.4"></div></div><div class="sheet-actions two"><button class="secondary" data-close>KEEP TRAINING</button><button class="primary lime" id="cardio-save-finish">SAVE CARDIO</button></div>`);
 $('#cardio-save-finish').onclick=()=>{const mins=Math.max(1,Math.round(Number($('#cardio-finish-duration').value)||durationMin));const distance=Math.max(0,Number($('#cardio-finish-distance').value)||0);closeSheet();finalizeSession({durationMin:mins,distance:distance||0})};
}
function finishSession(){const s=data.activeSession;if(!s)return;if(s.type==='cardio')return openCardioFinishSheet(s);finalizeSession()}
function finalizeSession(overrides={}){const s=data.activeSession;if(!s)return;const durationMin=overrides.durationMin||sessionDurationMinutes(s);let doneSets=0,totalSets=0;if(s.type!=='cardio')s.items.forEach(x=>x.sets.forEach(z=>{totalSets++;if(z.done)doneSets++}));const comment=completionSass(s,durationMin,doneSets,totalSets);const finished={...s,...overrides,durationMin,doneSets,totalSets,finishedAt:Date.now(),completed:true};data.sessions.push(finished);data.activeSession=null;recomputePRHistory({notifyNew:true});save();clearInterval(cardioTimer);stopWorkoutClock();const completionText=totalSets?` · ${doneSets}/${totalSets} sets`:finished.distance?` · ${finished.distance} km`:'';openSheet(`<div style="text-align:center;padding:8px 0"><p class="eyebrow">Workout complete</p><h2 style="font-size:30px;margin:4px 0">${escapeHtml(comment)}</h2><p class="subtle">${durationMin} min${completionText}</p><div class="sheet-actions"><button class="primary" id="finish-home">BACK TO HOME</button><button class="secondary" id="finish-progress">VIEW PROGRESS</button></div></div>`);$('#finish-home').onclick=()=>{closeSheet();go('home')};$('#finish-progress').onclick=()=>{closeSheet();go('progress')}}
function confirmCancel(){openSheet(`<div class="sheet-head"><div><p class="eyebrow">Cancel workout?</p><h2>Your current log will be removed.</h2></div><button class="sheet-close" data-close>×</button></div><div class="sheet-actions"><button class="danger-btn" id="really-cancel">DELETE ACTIVE WORKOUT</button><button class="secondary" data-close>KEEP TRAINING</button></div>`);$('#really-cancel').onclick=()=>{data.activeSession=null;save();clearInterval(cardioTimer);stopWorkoutClock();closeSheet();go('home')}}
function exerciseLog(){
 const map=new Map();
 data.sessions.filter(s=>s.type!=='cardio'&&s.completed!==false).forEach(session=>{
  (session.items||[]).forEach(item=>{
   const done=(item.sets||[]).filter(z=>z.done&&Number(z.weight)>0&&Number(z.reps)>0).map(z=>({weight:Number(z.weight),reps:Number(z.reps)}));
   if(!done.length)return;
   const key=item.name.trim().toLowerCase();
   if(!map.has(key))map.set(key,{name:item.name,muscle:item.muscle||'Custom',equipment:item.equipment||'Custom',sessions:[]});
   map.get(key).sessions.push({date:session.date,finishedAt:session.finishedAt||0,sets:done});
  });
 });
 map.forEach(x=>x.sessions.sort((a,b)=>(new Date(a.date)-new Date(b.date))||(a.finishedAt-b.finishedAt)));
 return [...map.values()].sort((a,b)=>new Date(b.sessions.at(-1).date)-new Date(a.sessions.at(-1).date));
}
function estimated1RM(weight,reps){const w=Number(weight)||0,r=Math.max(1,Number(reps)||1);return w*(1+r/30)}
function bestSetFromSession(session){return (session?.sets||[]).reduce((best,set)=>{const score=estimated1RM(set.weight,set.reps);return !best||score>best.score?{...set,score}:best},null)}
function bestSetEver(ex){return ex.sessions.flatMap(s=>s.sets.map(set=>({...set,date:s.date,score:estimated1RM(set.weight,set.reps)}))).reduce((best,set)=>!best||set.score>best.score?set:best,null)}
function exerciseTrendPoints(ex){const values=ex.sessions.slice(-10).map(s=>bestSetFromSession(s)?.score||0).filter(Boolean);if(!values.length)return '';const min=Math.min(...values),max=Math.max(...values),range=Math.max(1,max-min);return values.map((v,i)=>`${values.length===1?60:i*(120/(values.length-1))},${108-((v-min)/range)*88}`).join(' ')}
function progress(){
 const exercises=exerciseLog(),total=data.sessions.length,streak=calcStreak(),latest=data.measurements.at(-1)?.weight??data.profile.weight;
 shell(`${header()}<h1 class="page-title">Progress</h1><p class="subtle">Progress belongs to the exercise. Track what actually got stronger, rep by rep.</p><div class="tabs" style="margin-top:15px"><button class="tab active">Exercises</button><button class="tab" data-progress-history>History</button><button class="tab" data-progress-body>Body</button></div><section class="section"><div class="metric-grid"><div class="metric"><span>Workouts</span><strong>${total}</strong></div><div class="metric"><span>Streak</span><strong>${streak}</strong></div><div class="metric"><span>Exercises tracked</span><strong>${exercises.length}</strong></div><div class="metric"><span>Body weight</span><strong>${Number(latest).toFixed(1)} kg</strong></div></div></section><section class="section"><div class="section-head"><h2>Exercise progress</h2><span class="eyebrow">BEST SET / SESSION</span></div><div class="field exercise-progress-search"><input id="progress-search" placeholder="Search exercise or muscle..."></div><div class="list" id="exercise-progress-list"></div></section>`);
 function paint(q=''){
  const query=q.trim().toLowerCase();
  const filtered=exercises.filter(ex=>`${ex.name} ${ex.muscle} ${ex.equipment}`.toLowerCase().includes(query));
  $('#exercise-progress-list').innerHTML=filtered.length?filtered.map(ex=>{const current=bestSetFromSession(ex.sessions.at(-1)),previous=bestSetFromSession(ex.sessions.at(-2)),delta=current&&previous?current.score-previous.score:0;return `<button class="card exercise-progress-card" data-exercise-progress="${escapeHtml(ex.name)}"><div class="exercise-progress-top"><div><span class="eyebrow">${escapeHtml(ex.muscle)}</span><h3>${escapeHtml(ex.name)}</h3><p>${escapeHtml(ex.equipment)}</p></div><span class="chev">›</span></div><div class="exercise-progress-stats"><span><small>Latest best</small><strong>${current?`${current.weight} kg × ${current.reps}`:'–'}</strong></span><span><small>Est. 1RM</small><strong>${current?`${current.score.toFixed(1)} kg`:'–'}</strong></span><span><small>Change</small><strong class="${delta>0?'positive':delta<0?'negative':''}">${previous?(delta>=0?'+':'')+delta.toFixed(1)+' kg':'New'}</strong></span></div></button>`}).join(''):`<div class="empty"><strong>No matching exercise</strong>${exercises.length?'Try another search.':'Finish a strength workout with logged weight and reps to start tracking progress.'}</div>`;
  $$('[data-exercise-progress]').forEach(b=>b.onclick=()=>openExerciseProgress(b.dataset.exerciseProgress));
 }
 paint();$('#progress-search').oninput=e=>paint(e.target.value);$$('[data-progress-history]').forEach(b=>b.onclick=openHistorySheet);$('[data-progress-body]').onclick=openMeasureSheet;
}
function openExerciseProgress(name){
 const ex=exerciseLog().find(x=>x.name===name);if(!ex)return toast('No exercise history yet');const current=bestSetFromSession(ex.sessions.at(-1)),previous=bestSetFromSession(ex.sessions.at(-2)),best=bestSetEver(ex),pts=exerciseTrendPoints(ex),delta=current&&previous?current.score-previous.score:null;
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Exercise progress</p><h2>${escapeHtml(ex.name)}</h2></div><button class="sheet-close" data-close>×</button></div>${muscleMap(ex.muscle)}<div class="exercise-detail-meta"><span>${escapeHtml(ex.muscle)}</span><span>${escapeHtml(ex.equipment)}</span></div><div class="metric-grid exercise-detail-metrics"><div class="metric"><span>Current</span><strong>${current?`${current.weight} kg × ${current.reps}`:'–'}</strong></div><div class="metric"><span>Previous</span><strong>${previous?`${previous.weight} kg × ${previous.reps}`:'–'}</strong></div><div class="metric"><span>Best ever</span><strong>${best?`${best.weight} kg × ${best.reps}`:'–'}</strong></div><div class="metric"><span>Est. 1RM</span><strong>${current?`${current.score.toFixed(1)} kg`:'–'}</strong></div></div>${delta!==null?`<div class="exercise-delta ${delta>=0?'up':'down'}"><strong>${delta>=0?'↑':'↓'} ${Math.abs(delta).toFixed(1)} kg estimated strength</strong><span>vs previous session</span></div>`:''}<article class="card exercise-chart"><div class="section-head"><h3>Strength trend</h3><span class="eyebrow">EST. 1RM</span></div>${pts?`<svg viewBox="0 0 120 120" preserveAspectRatio="none"><line class="grid" x1="0" y1="25" x2="120" y2="25"/><line class="grid" x1="0" y1="65" x2="120" y2="65"/><line class="grid" x1="0" y1="105" x2="120" y2="105"/><polyline class="line" points="${pts}"/></svg>`:'<div class="empty">Log another session to build the trend.</div>'}</article><section class="exercise-history-section"><div class="section-head"><h3>Recent sessions</h3><span class="eyebrow">WEIGHT × REPS</span></div><div class="exercise-history-list">${[...ex.sessions].reverse().slice(0,8).map(s=>{const b=bestSetFromSession(s);return `<div class="exercise-history-row"><span>${s.date}</span><strong>${b.weight} kg × ${b.reps}</strong><small>${b.score.toFixed(1)} kg est. 1RM</small></div>`}).join('')}</div></section>`);
}
function calcStreak(){return calcStreakFromDates(null)}
function openSessionDetail(id){
 const s=data.sessions.find(x=>x.id===id);if(!s)return;
 const cardioItems=s.type==='cardio'&&s.items?.length?`<div class="list history-work-list" style="margin-top:14px">${s.items.map((x,i)=>`<div class="list-card"><span class="badge-icon cardio">${i+1}</span><span class="grow"><h3>${escapeHtml(x.name||x.mode||'Cardio')}</h3><p>${x.durationMin?`${x.durationMin} min`:''}${x.durationMin&&x.distance?' · ':''}${x.distance?`${x.distance} km`:''}</p></span></div>`).join('')}</div>`:'';
 const strengthItems=s.type!=='cardio'&&s.items?.length?`<div class="list history-work-list" style="margin-top:14px">${s.items.map((x,i)=>{const done=(x.sets||[]).filter(z=>z.done);const setText=done.map(z=>`${z.weight?`${z.weight} kg × `:''}${z.reps||'—'}`).join(' · ');return `<div class="list-card history-exercise-card"><span class="badge-icon">${i+1}</span><span class="grow"><h3>${escapeHtml(x.name)}</h3><p>${done.length}/${(x.sets||[]).length} sets${setText?` · ${escapeHtml(setText)}`:''}</p></span></div>`}).join('')}</div>`:'';
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">${s.date} · ${s.type}${s.manualEntry?' · manually logged':''}</p><h2>${escapeHtml(s.name)}</h2></div><button class="sheet-close" data-close>×</button></div><div class="metric-grid" style="margin-top:14px"><div class="metric"><span>Duration</span><strong>${s.durationMin||0} min</strong></div><div class="metric"><span>${s.type==='cardio'?'Distance':'Sets completed'}</span><strong>${s.type==='cardio'?(s.distance?`${s.distance} km`:'–'):(s.doneSets||0)+' / '+(s.totalSets||0)}</strong></div></div>${cardioItems}${strengthItems}${s.notes?`<article class="card history-notes"><span class="eyebrow">Notes</span><p>${escapeHtml(s.notes)}</p></article>`:''}<div class="sheet-actions"><button class="danger-btn" id="delete-history-workout">DELETE WORKOUT</button></div>`);
 $('#delete-history-workout').onclick=()=>confirmDeleteSession(s.id);
}
function confirmDeleteSession(id){const s=data.sessions.find(x=>x.id===id);if(!s)return;openSheet(`<div class="sheet-head"><div><p class="eyebrow">Delete workout?</p><h2>${escapeHtml(s.name)}</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">This removes the workout from History, your calendar and exercise progress. This cannot be undone.</p><div class="sheet-actions two"><button class="secondary" data-close>KEEP IT</button><button class="danger-btn" id="confirm-delete-session">DELETE WORKOUT</button></div>`);$('#confirm-delete-session').onclick=()=>{data.sessions=data.sessions.filter(x=>x.id!==id);recomputePRHistory({notifyNew:false});save();closeSheet();render();toast('Workout deleted · progress recalculated')}}
function openHistorySheet(){
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Activity</p><h2>Workout history</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">To add a forgotten workout, open My Plan and tap today or any earlier date.</p><div class="list" style="margin-top:14px">${data.sessions.length?sortedSessionsDesc().map(sessionCard).join(''):`<div class="empty">No workouts yet.</div>`}</div>`);
 $$('[data-session-id]').forEach(b=>b.onclick=()=>openSessionDetail(b.dataset.sessionId));
}
function pastWorkoutTemplates(type){return data.customWorkouts.filter(w=>w.type===type)}
function pastTemplateItems(w,type){return (w?.items||[]).map(x=>({name:x.name,muscle:x.muscle||'',equipment:x.equipment||'',targetReps:x.reps||'',note:'',sets:Array.from({length:Math.max(1,x.sets||3)},()=>({weight:'',reps:'',done:true}))}))}
function pastEmptyCardioActivity(mode='Running'){return {mode,durationMin:'',distance:''}}
function openPastWorkoutSheet(initialDate=isoToday(),draft=null){
 const chosenDate=initialDate<=isoToday()?initialDate:isoToday();
 const state=draft||{type:'strength',date:chosenDate,durationMin:'45',name:'Strength workout',notes:'',templateId:'',items:[],cardioActivities:[pastEmptyCardioActivity('Running')]};
 state.type=state.type||'strength';state.date=state.date||chosenDate;state.items=state.items||[];state.cardioActivities=state.cardioActivities?.length?state.cardioActivities:[pastEmptyCardioActivity('Running')];
 function capture(){
  state.date=$('#past-date')?.value||state.date;state.durationMin=$('#past-duration')?.value||state.durationMin;state.name=$('#past-name')?.value?.trim()||state.name;state.notes=$('#past-notes')?.value||'';
  if(state.type==='cardio'){
   state.cardioActivities=$$('[data-past-cardio-row]').map(row=>({mode:$('[data-past-cardio-mode]',row)?.value||'Other cardio',durationMin:$('[data-past-cardio-min]',row)?.value||'',distance:$('[data-past-cardio-km]',row)?.value||''}));
  }else{
   $$('[data-past-exercise]').forEach(card=>{const i=+card.dataset.pastExercise;if(!state.items[i])return;state.items[i].note=$('[data-past-ex-note]',card)?.value||'';$$('[data-past-set]',card).forEach(row=>{const j=+row.dataset.pastSet;if(!state.items[i].sets[j])return;state.items[i].sets[j].weight=$('[data-past-weight]',row)?.value||'';state.items[i].sets[j].reps=$('[data-past-reps]',row)?.value||'';state.items[i].sets[j].done=true})});
  }
 }
 function exerciseEditor(){
  if(!state.items.length)return `<div class="empty retro-empty"><strong>No exercises added yet</strong>Add what you actually did at the gym. Sets entered here are saved as completed.</div>`;
  return `<div class="retro-exercise-list">${state.items.map((x,i)=>`<article class="retro-exercise" data-past-exercise="${i}"><div class="retro-exercise-head"><span class="exercise-num">${i+1}</span><span class="grow"><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.muscle||'Custom')}${x.equipment?` · ${escapeHtml(x.equipment)}`:''}</small></span><button class="small-btn danger" data-past-remove-ex="${i}">REMOVE</button></div><div class="retro-set-head"><span>Set</span><span>${state.type==='rehab'?'load':'kg'}</span><span>${state.type==='rehab'?'reps / time':'reps'}</span><span></span></div>${x.sets.map((z,j)=>`<div class="retro-set-row" data-past-set="${j}"><span>${j+1}</span><input data-past-weight inputmode="decimal" value="${escapeHtml(z.weight||'')}" placeholder="${state.type==='rehab'?'optional':'0'}"><input data-past-reps value="${escapeHtml(z.reps||'')}" inputmode="${state.type==='rehab'?'text':'numeric'}" placeholder="${escapeHtml(x.targetReps||'reps')}"><button class="small-btn danger" data-past-remove-set="${i}:${j}" ${x.sets.length<=1?'disabled':''}>−</button></div>`).join('')}<div class="retro-exercise-actions"><button class="small-btn pink" data-past-add-set="${i}">+ ADD SET</button></div><div class="field retro-note"><label>Exercise note</label><input data-past-ex-note value="${escapeHtml(x.note||'')}" placeholder="Optional"></div></article>`).join('')}</div>`;
 }
 function cardioEditor(){return `<div class="retro-cardio-list">${state.cardioActivities.map((a,i)=>`<article class="retro-cardio-row" data-past-cardio-row="${i}"><div class="retro-cardio-head"><strong>Activity ${i+1}</strong>${state.cardioActivities.length>1?`<button class="small-btn danger" data-past-remove-cardio="${i}">REMOVE</button>`:''}</div><div class="field"><label>Activity</label><select data-past-cardio-mode>${['Running','Cycling','Walking','Hiking','Rowing','Stair machine','Elliptical','Swimming','Other cardio'].map(m=>`<option ${a.mode===m?'selected':''}>${m}</option>`).join('')}</select></div><div class="retro-cardio-metrics"><div class="field"><label>Time (min)</label><input data-past-cardio-min type="number" min="0" step="1" inputmode="numeric" value="${escapeHtml(a.durationMin||'')}" placeholder="e.g. 35"></div><div class="field"><label>Distance (km)</label><input data-past-cardio-km type="number" min="0" step="0.01" inputmode="decimal" value="${escapeHtml(a.distance||'')}" placeholder="optional"></div></div></article>`).join('')}</div><button class="secondary retro-add" id="past-add-cardio">+ ADD ACTIVITY</button>`}
 const templates=pastWorkoutTemplates(state.type);
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">History</p><h2>${state.date===isoToday()?'Log workout':'Log past workout'}</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">Log what you actually did. Retro sessions feed the same History and exercise Progress as live workouts.</p><div class="tabs past-type-tabs"><button class="tab ${state.type==='strength'?'active':''}" data-past-type="strength">Strength</button><button class="tab ${state.type==='cardio'?'active':''}" data-past-type="cardio">Cardio</button><button class="tab ${state.type==='rehab'?'active':''}" data-past-type="rehab">Rehab</button></div><div class="past-log-fields"><div class="field"><label>Date</label><input id="past-date" type="date" max="${isoToday()}" value="${state.date}"></div><div class="field"><label>Total duration (min)</label><input id="past-duration" type="number" min="1" step="1" inputmode="numeric" value="${escapeHtml(String(state.durationMin||45))}"></div></div><div class="field"><label>Workout name</label><input id="past-name" value="${escapeHtml(state.name||'Workout')}" maxlength="60"></div>${state.type!=='cardio'&&templates.length?`<div class="field"><label>Load saved workout (optional)</label><select id="past-template"><option value="">Choose template...</option>${templates.map(w=>`<option value="${w.id}" ${state.templateId===w.id?'selected':''}>${escapeHtml(w.name)}</option>`).join('')}</select><small class="field-help">Loads the exercise list. Enter the weights and reps you actually performed.</small></div>`:''}<section class="retro-work-section"><div class="section-head"><h3>${state.type==='cardio'?'Activities':'Exercises performed'}</h3><span class="eyebrow">ACTUAL WORK</span></div>${state.type==='cardio'?cardioEditor():`${exerciseEditor()}<button class="secondary retro-add" id="past-add-exercise">+ ADD EXERCISE</button>`}</section><div class="field"><label>Workout notes (optional)</label><textarea id="past-notes" rows="3" placeholder="Anything worth remembering?">${escapeHtml(state.notes||'')}</textarea></div><div class="sheet-actions"><button class="primary" id="save-past-workout">SAVE TO HISTORY</button></div>`);
 $$('[data-past-type]').forEach(b=>b.onclick=()=>{capture();state.type=b.dataset.pastType;state.templateId='';if(state.type==='strength'){state.name='Strength workout';state.items=[]}else if(state.type==='rehab'){state.name='Rehab workout';state.items=[]}else{state.name='Cardio workout';state.cardioActivities=state.cardioActivities?.length?state.cardioActivities:[pastEmptyCardioActivity('Running')]};openPastWorkoutSheet(state.date,state)});
 if($('#past-template'))$('#past-template').onchange=e=>{capture();state.templateId=e.target.value;const w=data.customWorkouts.find(x=>x.id===state.templateId);if(w){state.name=w.name;state.items=pastTemplateItems(w,state.type)}openPastWorkoutSheet(state.date,state)};
 if($('#past-add-exercise'))$('#past-add-exercise').onclick=()=>{capture();openExercisePicker(state.type,ex=>{const rx=defaultExercisePrescription(ex,state.type);state.items.push({name:ex.name,muscle:ex.muscle||'',equipment:ex.equipment||'',targetReps:rx.reps,note:'',sets:Array.from({length:Math.max(1,rx.sets||3)},()=>({weight:'',reps:'',done:true}))});openPastWorkoutSheet(state.date,state)})};
 $$('[data-past-add-set]').forEach(b=>b.onclick=()=>{capture();const i=+b.dataset.pastAddSet;state.items[i].sets.push({weight:'',reps:'',done:true});openPastWorkoutSheet(state.date,state)});
 $$('[data-past-remove-set]').forEach(b=>b.onclick=()=>{capture();const[i,j]=b.dataset.pastRemoveSet.split(':').map(Number);if(state.items[i].sets.length>1)state.items[i].sets.splice(j,1);openPastWorkoutSheet(state.date,state)});
 $$('[data-past-remove-ex]').forEach(b=>b.onclick=()=>{capture();state.items.splice(+b.dataset.pastRemoveEx,1);openPastWorkoutSheet(state.date,state)});
 if($('#past-add-cardio'))$('#past-add-cardio').onclick=()=>{capture();state.cardioActivities.push(pastEmptyCardioActivity('Cycling'));openPastWorkoutSheet(state.date,state)};
 $$('[data-past-remove-cardio]').forEach(b=>b.onclick=()=>{capture();state.cardioActivities.splice(+b.dataset.pastRemoveCardio,1);if(!state.cardioActivities.length)state.cardioActivities=[pastEmptyCardioActivity('Running')];openPastWorkoutSheet(state.date,state)});
 $('#save-past-workout').onclick=()=>{capture();const date=state.date,name=state.name.trim();if(!date||date>isoToday())return toast('Choose a valid date');if(!name)return toast('Give the workout a name');let items=[],doneSets=0,totalSets=0,distance=0,mode='',durationMin=Math.max(1,Math.round(Number(state.durationMin)||0));if(state.type==='cardio'){const acts=state.cardioActivities.filter(a=>a.mode);if(!acts.length)return toast('Add at least one cardio activity');const activityMinutes=acts.reduce((n,a)=>n+(Number(a.durationMin)||0),0);if(activityMinutes>0)durationMin=Math.round(activityMinutes);distance=Math.round(acts.reduce((n,a)=>n+(Number(a.distance)||0),0)*100)/100;mode=acts.length===1?acts[0].mode:'Mixed cardio';items=acts.map(a=>({name:a.mode,muscle:'Cardio',equipment:'',durationMin:Number(a.durationMin)||0,distance:Number(a.distance)||0,sets:[]}))}else{if(!state.items.length)return toast('Add at least one exercise');items=state.items.map(x=>({...x,sets:x.sets.map(z=>({...z,done:true}))}));totalSets=items.reduce((n,x)=>n+x.sets.length,0);doneSets=totalSets}const startedAt=new Date(`${date}T12:00:00`).getTime(),manualSession={id:uid(),workoutId:state.templateId||'',name,type:state.type,date,durationMin,distance,mode,notes:state.notes.trim(),items,doneSets,totalSets,startedAt,finishedAt:startedAt+durationMin*60000,completed:true,manualEntry:true};data.sessions.push(manualSession);recomputePRHistory({notifyNew:true});save();closeSheet();render();toast((manualSession.prs||[]).length?'Workout added · PB history updated':'Workout added to history')};
}
function openMeasureSheet(){openSheet(`<div class="sheet-head"><div><p class="eyebrow">Body progress</p><h2>Log measurements</h2></div><button class="sheet-close" data-close>×</button></div><div class="inline-fields"><div class="field"><label>Weight (kg)</label><input id="m-weight" type="number" step="0.1" value="${data.measurements.at(-1)?.weight||data.profile.weight}"></div><div class="field"><label>Waist (cm)</label><input id="m-waist" type="number" step="0.1"></div></div><div class="inline-fields"><div class="field"><label>Chest (cm)</label><input id="m-chest" type="number" step="0.1"></div><div class="field"><label>Hips (cm)</label><input id="m-hips" type="number" step="0.1"></div></div><div class="field"><label>Note</label><textarea id="m-note" rows="2"></textarea></div><div class="sheet-actions"><button class="primary" id="m-save">SAVE MEASUREMENTS</button></div>`);$('#m-save').onclick=()=>{const weight=+$('#m-weight').value;if(!weight)return toast('Enter your weight');data.measurements.push({date:isoToday(),weight,waist:+$('#m-waist').value||null,chest:+$('#m-chest').value||null,hips:+$('#m-hips').value||null,note:$('#m-note').value.trim()});data.profile.weight=weight;if(data.profile.autoTargets)applyAutoTargets();save();closeSheet();render();toast('Measurements saved')}}
let nutritionTab='today',recipeCategory='All',recipeQuery='',recipeLibraryView='all';
const RECIPE_DB='gaymRecipeImages',RECIPE_STORE='images';
const recipeImageUrls=new Map();
const RECIPE_FALLBACK=`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#10161d"/><stop offset="1" stop-color="#181018"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="600" cy="330" r="110" fill="none" stroke="#ff3f9f" stroke-width="18"/><path d="M545 330h110M600 275v110" stroke="#bfff00" stroke-width="18" stroke-linecap="round"/><text x="600" y="555" text-anchor="middle" font-family="Arial,sans-serif" font-size="70" font-weight="900" fill="#fff">GAYM RECIPE</text></svg>`)}`;
function allRecipes(){return [...RECIPES,...(data.customRecipes||[])]}
function findRecipe(id){return allRecipes().find(r=>r.id===id)}
function recipeImageSrc(r){if(!r)return RECIPE_FALLBACK;if(!r.custom)return r.image||RECIPE_FALLBACK;return recipeImageUrls.get(r.id)||RECIPE_FALLBACK}
function openRecipeDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(RECIPE_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(RECIPE_STORE))db.createObjectStore(RECIPE_STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function putRecipeImage(id,blob){const db=await openRecipeDb();await new Promise((resolve,reject)=>{const tx=db.transaction(RECIPE_STORE,'readwrite');tx.objectStore(RECIPE_STORE).put(blob,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();if(recipeImageUrls.has(id))URL.revokeObjectURL(recipeImageUrls.get(id));recipeImageUrls.delete(id)}
async function getRecipeImage(id){if(recipeImageUrls.has(id))return recipeImageUrls.get(id);try{const db=await openRecipeDb();const blob=await new Promise((resolve,reject)=>{const req=db.transaction(RECIPE_STORE,'readonly').objectStore(RECIPE_STORE).get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});db.close();if(!blob)return null;const url=URL.createObjectURL(blob);recipeImageUrls.set(id,url);return url}catch{return null}}
async function deleteRecipeImage(id){try{const db=await openRecipeDb();await new Promise((resolve,reject)=>{const tx=db.transaction(RECIPE_STORE,'readwrite');tx.objectStore(RECIPE_STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()}catch{}if(recipeImageUrls.has(id))URL.revokeObjectURL(recipeImageUrls.get(id));recipeImageUrls.delete(id)}
async function compressRecipeImage(file){if(!file)return null;const max=2400,canvas=document.createElement('canvas');let source,w0,h0,cleanup=()=>{};if('createImageBitmap'in window){source=await createImageBitmap(file,{imageOrientation:'from-image'});w0=source.width;h0=source.height;cleanup=()=>source.close?.()}else{const url=URL.createObjectURL(file);source=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url});w0=source.naturalWidth;h0=source.naturalHeight;cleanup=()=>URL.revokeObjectURL(url)}const scale=Math.min(1,max/Math.max(w0,h0)),w=Math.max(1,Math.round(w0*scale)),h=Math.max(1,Math.round(h0*scale));canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(source,0,0,w,h);cleanup();const preferred=file.type==='image/png'?'image/png':'image/jpeg',quality=preferred==='image/jpeg'?0.94:undefined;return await new Promise(resolve=>canvas.toBlob(resolve,preferred,quality))}
async function hydrateRecipeImages(root=document){const imgs=$$('img[data-custom-image]',root);await Promise.all(imgs.map(async img=>{const url=await getRecipeImage(img.dataset.customImage);if(url&&img.isConnected)img.src=url}))}
function nutrition(){
 const f=data.nutrition.filter(n=>n.date===isoToday()),k=f.reduce((a,n)=>a+(+n.kcal||0),0),p=f.reduce((a,n)=>a+(+n.protein||0),0),c=f.reduce((a,n)=>a+(+n.carbs||0),0),fat=f.reduce((a,n)=>a+(+n.fat||0),0),fiber=f.reduce((a,n)=>a+(+n.fiber||0),0),ft=fiberTarget(),perc=Math.min(100,k/data.profile.calorieTarget*100),leftK=Math.max(0,data.profile.calorieTarget-k),leftP=Math.max(0,data.profile.proteinTarget-p);
 const tabs=`<div class="nutrition-tabs"><button data-ntab="today" class="${nutritionTab==='today'?'active':''}">TODAY</button><button data-ntab="recipes" class="${nutritionTab==='recipes'?'active':''}">RECIPES</button></div>`;
 if(nutritionTab==='recipes'){
  const source=recipeLibraryView==='mine'?(data.customRecipes||[]):recipeLibraryView==='favorites'?allRecipes().filter(r=>(data.recipeFavorites||[]).includes(r.id)):allRecipes();
  const matches=sortedRecipes(source.filter(r=>(recipeCategory==='All'||r.cuisine===recipeCategory||recipeTags(r).includes(recipeCategory))&&(!recipeQuery||(`${r.name} ${r.cuisine} ${recipeTags(r).join(' ')}`).toLowerCase().includes(recipeQuery.toLowerCase()))));
  shell(`${header()}<h1 class="page-title">Nutrition</h1>${tabs}<section class="section"><p class="eyebrow">Smart picks for today</p><article class="card recipe-need-card"><div><span>You have left</span><strong>${Math.round(leftK).toLocaleString()} kcal</strong></div><div><span>Protein left</span><strong>${Math.round(leftP)} g</strong></div><div><span>Fiber</span><strong>${Math.round(fiber)} / ${ft} g</strong></div></article></section><section class="section"><div class="recipe-library-head"><div class="recipe-library-tabs"><button data-rview="all" class="${recipeLibraryView==='all'?'active':''}">ALL</button><button data-rview="favorites" class="${recipeLibraryView==='favorites'?'active':''}">FAVORITES</button><button data-rview="mine" class="${recipeLibraryView==='mine'?'active':''}">MY RECIPES</button></div><button class="primary compact" id="create-recipe">+ CREATE</button></div><div class="recipe-search"><input id="recipe-search" value="${escapeHtml(recipeQuery)}" placeholder="Search recipes or cuisines..."></div><div class="recipe-cats">${RECIPE_CATEGORIES.map(x=>`<button data-rcat="${escapeHtml(x)}" class="${recipeCategory===x?'active':''}">${escapeHtml(x)}</button>`).join('')}</div><p class="bottom-note"><strong>Bottom-friendly</strong> is only shown on recipes that provide at least 10 g fiber per serving and meet the 14 g fiber / 1,000 kcal benchmark. It is meant to support regularity over time, not guarantee same-day prep. Increase fiber gradually and use what your gut tolerates.</p>${!matches.length?`<div class="empty"><strong>${recipeLibraryView==='mine'?'No custom recipes yet':recipeLibraryView==='favorites'?'No favorites yet':'No recipes found'}</strong>${recipeLibraryView==='mine'?'Create your own recipe with a photo, ingredients, instructions and macros.':recipeLibraryView==='favorites'?'Tap the heart on any recipe to save it here.':'Try another search or category.'}</div>`:`<div class="recipe-grid">${matches.map(recipeCard).join('')}</div>`}</section>`);
  bindNutritionTabs();$('#recipe-search').oninput=e=>{recipeQuery=e.target.value;nutrition()};$$('[data-rcat]').forEach(b=>b.onclick=()=>{recipeCategory=b.dataset.rcat;nutrition()});$$('[data-rview]').forEach(b=>b.onclick=()=>{recipeLibraryView=b.dataset.rview;recipeCategory='All';recipeQuery='';nutrition()});$('#create-recipe').onclick=()=>openRecipeBuilder();bindRecipeCards();hydrateRecipeImages();return;
 }
 shell(`${header()}<h1 class="page-title">Nutrition</h1>${tabs}<p class="subtle">Daily targets adapt to your goal: <strong style="color:var(--text)">${goalLabel(data.profile.goal)}</strong>.</p><section class="section"><article class="card" style="padding:18px"><div class="food-ring" style="--p:${perc}"><div><strong>${Math.round(k).toLocaleString()}</strong><small>/ ${data.profile.calorieTarget.toLocaleString()} kcal</small></div></div>${macro('Protein',p,data.profile.proteinTarget,'g','cyan')}${macro('Carbs',c,data.profile.carbTarget,'g','yellow')}${macro('Fat',fat,data.profile.fatTarget,'g','orange')}${macro('Fiber',fiber,ft,'g','lime')}</article></section><section class="section"><div class="section-head"><h2>Today's meals</h2><button class="text-btn" id="add-food">+ ADD</button></div><div class="list">${f.length?f.map(n=>`<div class="list-card"><span class="badge-icon cardio">F</span><span class="grow"><h3>${escapeHtml(n.name)}</h3><p>${n.kcal} kcal · ${n.protein||0} g protein${n.fiber?` · ${n.fiber} g fiber`:''}</p></span><button class="small-btn danger" data-food-remove="${n.id}">REMOVE</button></div>`).join(''):`<div class="empty"><strong>No food logged today</strong>Add a meal or pick a recipe.</div>`}</div></section><section class="section"><div class="section-head"><h2>Recipes for your goal</h2><button class="text-btn" id="see-recipes">SEE ALL</button></div><div class="quick-recipe-row">${sortedRecipes(allRecipes()).slice(0,3).map(recipeCard).join('')}</div></section>`);
 bindNutritionTabs();$('#add-food').onclick=openFoodSheet;$('#see-recipes').onclick=()=>{nutritionTab='recipes';nutrition()};$$('[data-food-remove]').forEach(b=>b.onclick=()=>{data.nutrition=data.nutrition.filter(n=>n.id!==b.dataset.foodRemove);save();nutrition()});bindRecipeCards();hydrateRecipeImages();
}
function bindNutritionTabs(){$$('[data-ntab]').forEach(b=>b.onclick=()=>{nutritionTab=b.dataset.ntab;nutrition()})}
function bindRecipeCards(){$$('[data-recipe]').forEach(b=>b.onclick=()=>openRecipe(b.dataset.recipe));$$('[data-recipe-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleRecipeFavorite(b.dataset.recipeFav);nutrition()})}
function recipeCard(r){const fav=(data.recipeFavorites||[]).includes(r.id),src=recipeImageSrc(r),customAttr=r.custom?`data-custom-image="${r.id}"`:'';return `<article class="recipe-card" data-recipe="${r.id}"><img src="${src}" ${customAttr} alt="${escapeHtml(r.name)}"><div class="recipe-card-body"><div class="recipe-title-row"><h3>${escapeHtml(r.name)}</h3><button class="recipe-heart ${fav?'active':''}" data-recipe-fav="${r.id}" aria-label="Favorite">${fav?'♥':'♡'}</button></div><p>${r.kcal} kcal · ${r.protein} g protein · ${r.fiber||0} g fiber</p><div class="recipe-tags">${recipeTags(r).slice(0,3).map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div></div></article>`}
function toggleRecipeFavorite(id){data.recipeFavorites=data.recipeFavorites||[];data.recipeFavorites=data.recipeFavorites.includes(id)?data.recipeFavorites.filter(x=>x!==id):[...data.recipeFavorites,id];save()}
async function openRecipe(id){const r=findRecipe(id);if(!r)return;let img=recipeImageSrc(r);if(r.custom)img=await getRecipeImage(r.id)||RECIPE_FALLBACK;const fit=recipeFit(r)<.75?'GOOD MATCH TODAY':'RECIPE',customActions=r.custom?`<div class="recipe-owner-actions"><button class="secondary" id="recipe-edit">EDIT RECIPE</button><button class="secondary danger-outline" id="recipe-delete">DELETE</button></div>`:'';openSheet(`<div class="recipe-hero"><img src="${img}" alt="${escapeHtml(r.name)}"></div><div class="sheet-head recipe-sheet-head"><div><p class="eyebrow">${fit}</p><h2>${escapeHtml(r.name)}</h2></div><button class="sheet-close" data-close>×</button></div><div class="recipe-tags big">${recipeTags(r).map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div><div class="recipe-macros"><div><strong>${r.kcal}</strong><span>kcal</span></div><div><strong>${r.protein}g</strong><span>protein</span></div><div><strong>${r.carbs}g</strong><span>carbs</span></div><div><strong>${r.fat}g</strong><span>fat</span></div><div><strong>${r.fiber||0}g</strong><span>fiber</span></div></div><p class="recipe-time">~${r.time||0} min · ${r.servings||1} serving${(r.servings||1)===1?'':'s'} · macros per serving</p><h3 class="recipe-section-title">Ingredients</h3><ul class="ingredient-list">${(r.ingredients||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><h3 class="recipe-section-title">Instructions</h3><ol class="step-list">${(r.steps||[]).map(x=>`<li><span>${escapeHtml(x)}</span></li>`).join('')}</ol>${customActions}<div class="sheet-actions"><button class="primary" id="recipe-add">ADD TO TODAY</button></div>`);$('#recipe-add').onclick=()=>{data.nutrition.push({id:uid(),date:isoToday(),name:r.name,kcal:r.kcal,protein:r.protein,carbs:r.carbs,fat:r.fat,fiber:r.fiber||0,recipeId:r.id});save();closeSheet();nutritionTab='today';nutrition();toast('Recipe added to today')};if(r.custom){$('#recipe-edit').onclick=()=>openRecipeBuilder(r.id);$('#recipe-delete').onclick=()=>confirmDeleteRecipe(r.id)}}
function confirmDeleteRecipe(id){const r=findRecipe(id);if(!r?.custom)return;openSheet(`<div class="sheet-head"><div><p class="eyebrow">My Recipes</p><h2>Delete recipe?</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">${escapeHtml(r.name)} will be removed from My Recipes. Meals already logged today stay in your history.</p><div class="sheet-actions two"><button class="secondary" data-close>CANCEL</button><button class="primary danger-fill" id="confirm-recipe-delete">DELETE RECIPE</button></div>`);$('#confirm-recipe-delete').onclick=async()=>{data.customRecipes=(data.customRecipes||[]).filter(x=>x.id!==id);data.recipeFavorites=(data.recipeFavorites||[]).filter(x=>x!==id);await deleteRecipeImage(id);save();closeSheet();nutritionTab='recipes';recipeLibraryView='mine';nutrition();toast('Recipe deleted')}}
async function openRecipeBuilder(editId=null){const existing=editId?findRecipe(editId):null;if(existing&&!existing.custom)return;let selectedFile=null,removeExistingImage=false,previewUrl=existing?recipeImageSrc(existing):RECIPE_FALLBACK;if(existing)previewUrl=await getRecipeImage(existing.id)||RECIPE_FALLBACK;openSheet(`<div class="sheet-head"><div><p class="eyebrow">My Recipes</p><h2>${existing?'Edit recipe':'Create recipe'}</h2></div><button class="sheet-close" data-close>×</button></div><div class="recipe-photo-editor"><img id="custom-recipe-preview" src="${previewUrl}" alt="Recipe photo preview"><label class="secondary photo-button" for="custom-recipe-photo">CHOOSE / TAKE PHOTO</label><input id="custom-recipe-photo" class="visually-hidden" type="file" accept="image/*"><button class="text-btn" id="remove-recipe-photo" type="button">REMOVE PHOTO</button><small>Your photo uses the exact same crop and image area as every other recipe card.</small></div><div class="field"><label>Recipe name</label><input id="cr-name" value="${escapeHtml(existing?.name||'')}" placeholder="e.g. High Protein Lasagna"></div><div class="inline-fields"><div class="field"><label>Servings</label><input id="cr-servings" type="number" min="1" max="20" value="${existing?.servings||1}"></div><div class="field"><label>Time (min)</label><input id="cr-time" type="number" min="1" value="${existing?.time||30}"></div></div><div class="field"><label>Category</label><select id="cr-cuisine">${RECIPE_CATEGORIES.filter(x=>x!=='All'&&x!=='Bottom-friendly').map(x=>`<option value="${escapeHtml(x)}" ${existing?.cuisine===x?'selected':''}>${escapeHtml(x)}</option>`).join('')}<option value="Other" ${existing?.cuisine==='Other'?'selected':''}>Other</option></select></div><p class="eyebrow form-divider">Macros per serving</p><div class="inline-fields"><div class="field"><label>Calories</label><input id="cr-kcal" type="number" min="0" value="${existing?.kcal||''}"></div><div class="field"><label>Protein (g)</label><input id="cr-protein" type="number" min="0" step="0.1" value="${existing?.protein||''}"></div></div><div class="inline-fields"><div class="field"><label>Carbs (g)</label><input id="cr-carbs" type="number" min="0" step="0.1" value="${existing?.carbs||''}"></div><div class="field"><label>Fat (g)</label><input id="cr-fat" type="number" min="0" step="0.1" value="${existing?.fat||''}"></div></div><div class="field"><label>Fiber (g)</label><input id="cr-fiber" type="number" min="0" step="0.1" value="${existing?.fiber||''}"></div><div class="field"><label>Ingredients · one per line</label><textarea id="cr-ingredients" rows="7" placeholder="200 g lean ground beef&#10;90 g whole-wheat pasta&#10;100 g crushed tomatoes">${escapeHtml((existing?.ingredients||[]).join('\n'))}</textarea></div><div class="field"><label>Instructions · one step per line</label><textarea id="cr-steps" rows="7" placeholder="Cook the pasta.&#10;Brown the beef.&#10;Combine and serve.">${escapeHtml((existing?.steps||[]).join('\n'))}</textarea></div><div class="field"><label>Extra tags · comma separated</label><input id="cr-tags" value="${escapeHtml((existing?.tags||[]).filter(x=>x!==existing?.cuisine&&x!=='Bottom-friendly').join(', '))}" placeholder="High protein, Vegetarian"></div><div class="sheet-actions"><button class="primary" id="save-custom-recipe">${existing?'SAVE CHANGES':'CREATE RECIPE'}</button></div>`);const input=$('#custom-recipe-photo'),preview=$('#custom-recipe-preview');input.onchange=()=>{const file=input.files?.[0];if(!file)return;selectedFile=file;removeExistingImage=false;const u=URL.createObjectURL(file);preview.src=u;preview.onload=()=>URL.revokeObjectURL(u)};$('#remove-recipe-photo').onclick=()=>{selectedFile=null;removeExistingImage=true;preview.src=RECIPE_FALLBACK};$('#save-custom-recipe').onclick=async()=>{const name=$('#cr-name').value.trim(),kcal=+$('#cr-kcal').value,protein=+$('#cr-protein').value,ingredients=$('#cr-ingredients').value.split('\n').map(x=>x.trim()).filter(Boolean),steps=$('#cr-steps').value.split('\n').map(x=>x.trim()).filter(Boolean);if(!name||!kcal||!ingredients.length||!steps.length)return toast('Add name, calories, ingredients and steps');const id=existing?.id||`custom-recipe-${uid()}`,cuisine=$('#cr-cuisine').value,extraTags=$('#cr-tags').value.split(',').map(x=>x.trim()).filter(x=>x&&x!=='Bottom-friendly'),tags=[...new Set([cuisine,...extraTags])],recipe={id,name,cuisine,meal:existing?.meal||'Custom',custom:true,servings:Math.max(1,+$('#cr-servings').value||1),time:Math.max(1,+$('#cr-time').value||30),kcal:Math.round(kcal),protein:Math.round(protein*10)/10,carbs:Math.round((+$('#cr-carbs').value||0)*10)/10,fat:Math.round((+$('#cr-fat').value||0)*10)/10,fiber:Math.round((+$('#cr-fiber').value||0)*10)/10,tags,ingredients,steps};if(selectedFile){try{const blob=await compressRecipeImage(selectedFile);if(blob)await putRecipeImage(id,blob)}catch{return toast('Could not save that photo')}}else if(removeExistingImage)await deleteRecipeImage(id);if(existing)data.customRecipes=data.customRecipes.map(x=>x.id===id?recipe:x);else data.customRecipes.push(recipe);save();closeSheet();nutritionTab='recipes';recipeLibraryView='mine';recipeCategory='All';recipeQuery='';nutrition();toast(existing?'Recipe updated':'Recipe created')}}
function macro(name,value,target,unit,tone='pink'){
 const safeValue=Math.max(0,Number(value)||0),safeTarget=Math.max(1,Number(target)||1);
 const percent=Math.max(0,Math.min(100,(safeValue/safeTarget)*100));
 return `<div class="macro macro-${tone}"><div class="macro-head"><span>${escapeHtml(name)}</span><span>${Math.round(safeValue)} / ${Math.round(safeTarget)} ${escapeHtml(unit)}</span></div><div class="macro-bar" role="progressbar" aria-label="${escapeHtml(name)}" aria-valuemin="0" aria-valuemax="${Math.round(safeTarget)}" aria-valuenow="${Math.round(safeValue)}"><span style="width:${percent.toFixed(1)}%"></span></div></div>`;
}
function openFoodSheet(){openSheet(`<div class="sheet-head"><div><p class="eyebrow">Nutrition</p><h2>Add food</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><label>Name</label><input id="f-name" placeholder="e.g. Breakfast"></div><div class="inline-fields"><div class="field"><label>Calories</label><input id="f-kcal" type="number"></div><div class="field"><label>Protein (g)</label><input id="f-protein" type="number"></div></div><div class="inline-fields"><div class="field"><label>Carbs (g)</label><input id="f-carbs" type="number"></div><div class="field"><label>Fat (g)</label><input id="f-fat" type="number"></div></div><div class="field"><label>Fiber (g)</label><input id="f-fiber" type="number" placeholder="Optional"></div><div class="sheet-actions"><button class="primary" id="f-save">ADD TO TODAY</button></div>`);$('#f-save').onclick=()=>{const name=$('#f-name').value.trim(),kcal=+$('#f-kcal').value;if(!name||!kcal)return toast('Add a name and calories');data.nutrition.push({id:uid(),date:isoToday(),name,kcal,protein:+$('#f-protein').value||0,carbs:+$('#f-carbs').value||0,fat:+$('#f-fat').value||0,fiber:+$('#f-fiber').value||0});save();closeSheet();nutrition();toast('Food added')}}
function profile(){const t=calcTargets(data.profile);shell(`${header()}<h1 class="page-title">Profile</h1><section class="section"><article class="card profile-hero"><div class="avatar">${escapeHtml(data.profile.name.slice(0,1).toUpperCase())}</div><div><h2>${escapeHtml(data.profile.name)}</h2><p>${goalLabel(data.profile.goal)} · ${data.profile.autoTargets!==false?'Automatic targets':'Manual targets'}</p></div></article></section><section class="section"><p class="eyebrow">Your goal</p><article class="card goal-summary"><div><span>Goal</span><strong>${goalLabel(data.profile.goal)}</strong></div><div><span>Estimated maintenance</span><strong>~${t.maintenance.toLocaleString()} kcal</strong></div><div><span>Daily target</span><strong>${data.profile.calorieTarget.toLocaleString()} kcal</strong></div><div><span>Protein</span><strong>${data.profile.proteinTarget} g</strong></div></article><p class="science-note">Targets are estimates based on your profile and activity. Adjust using your real weight trend over several weeks.</p></section><section class="section"><p class="eyebrow">Settings</p><article class="card" style="padding:0 14px"><button class="settings-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="edit-profile"><span>Profile, activity & goal</span><small>›</small></button><button class="settings-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="open-nutrition"><span>Nutrition</span><small>${data.profile.calorieTarget} kcal ›</small></button><button class="settings-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="notification-settings"><span>Notifications</span><small>GAYM sass ›</small></button><button class="settings-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="export-data"><span>Export data</span><small>JSON ›</small></button><button class="settings-row" style="width:100%;background:none;border:0;color:inherit;text-align:left" id="show-welcome"><span>Show welcome screen</span><small>›</small></button></article></section><section class="section"><p class="eyebrow">App</p><article class="card" style="padding:14px"><p class="subtle" style="margin:0">Mobile-first · strength + cardio + rehab · local autosave.</p></article></section>`);$('#edit-profile').onclick=openProfileSheet;$('#open-nutrition').onclick=()=>go('nutrition');$('#notification-settings').onclick=openNotificationSettings;$('#export-data').onclick=exportData;$('#show-welcome').onclick=()=>{entryUnlocked=false;entry()};}

function openNotificationSettings(){
 const s=notificationSettings();
 const row=(key,label,desc)=>`<label class="notification-setting"><span><strong>${label}</strong><small>${desc}</small></span><input type="checkbox" data-notify-setting="${key}" ${s[key]?'checked':''}></label>`;
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Profile · Notifications</p><h2>Choose your chaos</h2></div><button class="sheet-close" data-close>×</button></div><div class="notification-settings">${row('workout','Workout reminders','Planned workouts and gentle harassment after a few quiet days.')}${row('nutrition','Nutrition reminders','A late-day nudge when calories or protein are lagging.')}${row('progress','Progress & PRs','Celebrate new exercise PRs and link straight to the exercise.')}${row('dailySass','Daily Sass','Maximum one daily GAYM message.')}${row('unhinged','Unhinged GAYM language','Turn the brutal gay commentary on or off.')}</div><div class="inline-fields notification-times"><div class="field"><label>Daily Sass time</label><input id="notify-daily-time" type="time" value="${escapeHtml(s.dailyTime)}"></div><div class="field"><label>Nutrition check</label><input id="notify-nutrition-time" type="time" value="${escapeHtml(s.nutritionTime)}"></div></div><p class="science-note">This GitHub Pages version stores notifications locally. Reliable push alerts while the app is fully closed will need a push/backend service later.</p><div class="sheet-actions"><button class="primary" id="save-notifications">SAVE SETTINGS</button></div>`);
 $('#save-notifications').onclick=()=>{const next={...s};$$('[data-notify-setting]').forEach(x=>next[x.dataset.notifySetting]=x.checked);next.dailyTime=$('#notify-daily-time').value||'09:00';next.nutritionTime=$('#notify-nutrition-time').value||'19:00';data.notificationSettings=next;save();closeSheet();profile();toast('Notification settings saved')};
}

function openProfileSheet(){const p=data.profile;openSheet(`<div class="sheet-head"><div><p class="eyebrow">Profile</p><h2>Your body & goal</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><label>Name</label><input id="p-name" value="${escapeHtml(p.name)}"></div><div class="inline-fields"><div class="field"><label>Weight (kg)</label><input id="p-weight" type="number" step="0.1" min="35" value="${p.weight}"></div><div class="field"><label>Height (cm)</label><input id="p-height" type="number" min="130" max="230" value="${p.height||183}"></div></div><div class="inline-fields"><div class="field"><label>Age</label><input id="p-age" type="number" min="18" max="100" value="${p.age||28}"></div><div class="field"><label>Calculation sex</label><select id="p-sex"><option value="male" ${p.sex==='male'?'selected':''}>Male</option><option value="female" ${p.sex==='female'?'selected':''}>Female</option></select></div></div><div class="field"><label>Activity level</label><select id="p-activity"><option value="sedentary" ${p.activity==='sedentary'?'selected':''}>Sedentary · mostly daily living</option><option value="low" ${p.activity==='low'?'selected':''}>Low active · some walking / training</option><option value="active" ${p.activity==='active'?'selected':''}>Active · regular training</option><option value="very" ${p.activity==='very'?'selected':''}>Very active · high daily activity</option></select></div><p class="eyebrow" style="margin-top:18px">Primary goal</p><div class="goal-picker"><button data-goal="lose" class="goal-choice ${p.goal==='lose'?'active':''}"><strong>Lose weight</strong><small>Moderate calorie deficit</small></button><button data-goal="maintain" class="goal-choice ${p.goal==='maintain'?'active':''}"><strong>Maintain</strong><small>Around estimated maintenance</small></button><button data-goal="gain" class="goal-choice ${p.goal==='gain'?'active':''}"><strong>Build muscle</strong><small>Practical calorie surplus · 2.0 g protein/kg</small></button></div><label class="auto-target-row"><input id="p-auto" type="checkbox" ${p.autoTargets!==false?'checked':''}><span><strong>Automatic nutrition targets</strong><small>Calories and macros update when weight, activity or goal changes.</small></span></label><div id="target-preview" class="target-preview"></div><div class="sheet-actions"><button class="primary" id="p-save">SAVE PROFILE</button></div>`);let selectedGoal=p.goal||'gain';function preview(){const temp={...p,weight:+$('#p-weight').value||p.weight,height:+$('#p-height').value||p.height,age:+$('#p-age').value||p.age,sex:$('#p-sex').value,activity:$('#p-activity').value,goal:selectedGoal};const t=calcTargets(temp);$('#target-preview').innerHTML=`<span>Estimated target</span><strong>${t.calories.toLocaleString()} kcal</strong><small>${t.protein} g protein · ${t.carbs} g carbs · ${t.fat} g fat</small>`}$$('[data-goal]').forEach(b=>b.onclick=()=>{selectedGoal=b.dataset.goal;$$('[data-goal]').forEach(x=>x.classList.toggle('active',x===b));preview()});['p-weight','p-height','p-age','p-sex','p-activity'].forEach(id=>$('#'+id).addEventListener('input',preview));preview();$('#p-save').onclick=()=>{data.profile={...data.profile,name:$('#p-name').value.trim()||'Jocke',weight:+$('#p-weight').value||70,height:+$('#p-height').value||175,age:+$('#p-age').value||30,sex:$('#p-sex').value,activity:$('#p-activity').value,goal:selectedGoal,autoTargets:$('#p-auto').checked};if(data.profile.autoTargets)applyAutoTargets();data.profileCreated=true;save();closeSheet();render();toast(pickSass(data.profile.goal||'welcome'))}}
function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`gaym-backup-${isoToday()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast('Backup exported')}
let sheetPageScroll=0,sheetViewportHandler=null;
function keepSheetFieldVisible(el,sheet){
 const viewport=window.visualViewport;
 const visibleBottom=viewport?viewport.height+viewport.offsetTop:window.innerHeight;
 const rect=el.getBoundingClientRect();
 const topGuard=72,bottomGuard=20;
 if(rect.bottom>visibleBottom-bottomGuard||rect.top<topGuard){
  el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});
 }
}
function openSheet(html){
 const root=$('#sheet-root');
 const wasOpen=!!root.querySelector('.sheet-backdrop');
 if(!wasOpen){sheetPageScroll=window.scrollY;document.documentElement.classList.add('sheet-open');document.body.classList.add('sheet-open')}
 root.innerHTML=`<div class="sheet-backdrop"><section class="sheet"><div class="sheet-handle"></div>${html}</section></div>`;
 const sheet=$('.sheet'),backdrop=$('.sheet-backdrop');
 backdrop.onclick=e=>{if(e.target===backdrop)closeSheet()};
 $$('[data-close]',root).forEach(b=>b.onclick=closeSheet);
 $$('[data-session-id]',root).forEach(b=>b.onclick=()=>openSessionDetail(b.dataset.sessionId));
 $$('input,textarea,select',sheet).forEach(el=>el.addEventListener('focus',()=>setTimeout(()=>keepSheetFieldVisible(el,sheet),80),{passive:true}));
 if(window.visualViewport){
  if(sheetViewportHandler){window.visualViewport.removeEventListener('resize',sheetViewportHandler);window.visualViewport.removeEventListener('scroll',sheetViewportHandler)}
  sheetViewportHandler=()=>{document.documentElement.style.setProperty('--visual-viewport-height',`${window.visualViewport.height}px`);document.documentElement.style.setProperty('--visual-viewport-top',`${window.visualViewport.offsetTop}px`)};
  sheetViewportHandler();window.visualViewport.addEventListener('resize',sheetViewportHandler,{passive:true});window.visualViewport.addEventListener('scroll',sheetViewportHandler,{passive:true});
 }
}
function closeSheet(){
 if(sheetViewportHandler&&window.visualViewport){window.visualViewport.removeEventListener('resize',sheetViewportHandler);window.visualViewport.removeEventListener('scroll',sheetViewportHandler);sheetViewportHandler=null}
 $('#sheet-root').innerHTML='';document.documentElement.classList.remove('sheet-open');document.body.classList.remove('sheet-open');document.documentElement.style.removeProperty('--visual-viewport-height');document.documentElement.style.removeProperty('--visual-viewport-top');
 requestAnimationFrame(()=>window.scrollTo({top:sheetPageScroll,left:0,behavior:'auto'}));
}
function render(){evaluateNotifications();clearInterval(cardioTimer);stopWorkoutClock();if(!entryUnlocked)return entry();if(route==='home')home();else if(route==='plan')plan();else if(route==='workout')workout();else if(route==='active')active();else if(route==='progress')progress();else if(route==='nutrition')nutrition();else if(route==='profile')profile();else home();}
migrateProfile();save();if('scrollRestoration'in history)history.scrollRestoration='manual';window.addEventListener('beforeunload',persistActiveSession);window.addEventListener('pagehide',persistActiveSession);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistActiveSession();else if(route==='active'&&data.activeSession)render()});if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));render();
})();
