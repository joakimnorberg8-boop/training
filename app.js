(()=>{
'use strict';
// GAYM v98 LOCAL-FIRST: destructive account auto-sync disabled; nutrition uses safe merge sync.
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

const SUPABASE_URL='https://dkiejeckkwzowpkxapbc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_eJGKDkbbHEU5UVfDPVVNRQ_OUPWKaVZ';
const sb=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})||null;
let authUser=null,cloudProfile=null,cloudBooting=true,authMode='login',socialTab='activity';
const activityPostCache=new Map();
const SOCIAL_PROFILE_CACHE_PREFIX='gaymSocialProfileV2:user:';
function cachedCloudProfile(userId){if(!userId)return null;try{const p=JSON.parse(localStorage.getItem(`${SOCIAL_PROFILE_CACHE_PREFIX}${userId}`)||'null');return p?.id===userId?p:null}catch{return null}}
function cacheCloudProfile(p){if(p?.id)try{localStorage.setItem(`${SOCIAL_PROFILE_CACHE_PREFIX}${p.id}`,JSON.stringify(p))}catch{}}
let socialCache={friends:[],requests:[],feed:[],nightOuts:[],sharedRecipes:[],notifications:[]};
let socialCacheUpdatedAt=0,socialLoadPromise=null;
const SOCIAL_CACHE_TTL=15000;
let activeDataUserId=null,authEpoch=0,cloudDataHydrated=false,cloudSyncTimer=null,cloudSyncRetryTimer=null,cloudSyncRetryCount=0;
let nutritionSyncTimer=null,nutritionSyncBusy=false,nutritionSyncLastHash='';
const AUTO_ACCOUNT_SYNC=false; // v97 local-first: account_data is manual only
let cloudSyncMeta={dirty:false,lastRemoteUpdatedAt:0,lastSyncedAt:0,lastLocalHash:'',lastSyncedHash:'',lastRemoteSessionCount:0};
let cloudSyncState={status:'idle',error:'',conflict:null};

const icons={home:'<svg viewBox="0 0 24 24"><path d="M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',plan:'<svg viewBox="0 0 24 24"><path d="M6 3v3M18 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1z"/><path d="M8 12h3M8 16h3M14 12h2M14 16h2"/></svg>',social:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.8 20c.5-3.7 2.5-5.5 5.2-5.5s4.7 1.8 5.2 5.5M13.5 15.2c1-.7 2.1-1 3.5-1 2.4 0 4 1.5 4.5 4.8"/></svg>',workout:'<svg viewBox="0 0 24 24"><path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/></svg>',progress:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',profile:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"/></svg>',bell:'<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',back:'<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',dots:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></svg>'};
const defaults={
 profile:{name:'Jocke',weight:70.4,height:183,age:28,sex:'male',activity:'active',goal:'gain',calorieTarget:2910,proteinTarget:140,carbTarget:300,fatTarget:80,autoTargets:true},
 customWorkouts:[],customPrograms:[],sessions:[],measurements:[],nutrition:[],nutritionDeletedIds:[],foodFavorites:[],savedMeals:[],recipeFavorites:[],customRecipes:[],
 planned:[], activeSession:null, profileCreated:false, sassSeed:null, dailySass:{date:null,text:''},
 notificationSettings:{workout:true,nutrition:true,progress:true,dailySass:true,unhinged:true,dailyTime:'09:00',nutritionTime:'19:00'},
 updatedAt:0,
 notifications:[], notificationMeta:{dailySassDate:null,nutritionDate:null,absenceDate:null,streakMilestone:null}, unicornEvent:null, unicornBrain:{date:null,slot:null,topic:null,recent:[]}, coachCheckins:[], bottomCheckins:[], nightOut:null, prideMode:'auto', selectedTitle:'', achievementMeta:{}, beginnerEquipment:['dumbbells','barbell','mat']
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
 missed:["You ghosted the gym. Very on brand.","The weights noticed you were missing. Awkward."],
 morning:["Good morning, gorgeous. Go give someone a reason to stare.","Morning, babe. Coffee first, then build the body your tank tops deserve.","Good morning. The gym opens before Grindr gets interesting. Use that information wisely.","Rise and shine, homosexual. Your delts have appointments."],
 afternoon:["Afternoon check. Plenty of daylight left to become inconveniently attractive.","The day is half gone. Your pump does not have to be.","Afternoon, gorgeous. Go move something heavier than your emotional baggage."],
 evening:["Evening plans? Apparently becoming hotter counts.","The day is winding down. Your training era is not.","Clock is ticking, babe. Give the mirror something new to discuss."],
 late:["Still awake? Muscles grow while you sleep, not while you inspect them.","It is late. Put the phone down and let the ass regenerate.","Bedtime, gorgeous. Recovery is the least glamorous part of being annoyingly hot."],
 post:["Back again? Checking whether the jockstrap fits differently yet?","You already trained. The pump will not grow faster because you refresh the app.","Workout logged. Yes, you may inspect the evidence again.","Back already? Your muscles are recovering. Your vanity clearly is not."],
 postLegs:["Leg day survived. Walking normally is tomorrow's administrative problem.","Legs done. Stairs have been promoted to enemy combatant.","Lower body complete. Sit down carefully, princess."],
 postPull:["Pull complete. Back getting wider, doorframes getting nervous.","Pull day done. Keep this up and your shirts are going to need negotiations.","Back trained. Waist-to-lat ratio entering suspicious territory."],
 postPush:["Push complete. The chest has filed for more shelf space.","Push day done. T-shirts are now a temporary housing solution.","Chest and shoulders handled. Posture of a man with absolutely no reason to be humble."],
 multi:["Two workouts in one day. Moderation was apparently not invited.","Double session logged. Your calendar says ambitious. Your laundry says emergency.","Strength and cardio? Pick a struggle, gorgeous. Apparently you picked all of them.","Back again and again. At this point the gym owes you visitation rights."],
 prHome:["New PB. Unfortunately, your ego now requires its own locker.","Personal best detected. Be normal about it for at least six minutes.","New PB. Screenshot it before your humility comes back."],
 fedDone:["Trained and fed. Disturbingly responsible behavior.","Workout done, protein handled. Someone alert the gay council.","Lifted, fed, hydrated-ish. Character development."]
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
function completedSessionsForDate(date=isoToday()){
 return (data.sessions||[]).filter(s=>s.date===date&&s.completed!==false).slice().sort((a,b)=>Number(b.finishedAt||b.startedAt||0)-Number(a.finishedAt||a.startedAt||0));
}
function latestCompletedSession(date=isoToday()){return completedSessionsForDate(date)[0]||null}
function todayState(){
 const date=isoToday(),hour=new Date().getHours(),sessions=completedSessionsForDate(date),session=sessions[0]||null,active=data.activeSession||null;
 const planned=(data.planned||[]).find(p=>p.date===date)||null;
 const rest=!!planned&&(planned.type==='rest'||/rest|recovery/i.test(planned.name||''));
 const plannedCompleted=!!planned?.workoutId&&sessions.some(s=>s.workoutId===planned.workoutId);
 const pendingPlanned=!rest&&!!planned?.workoutId&&!plannedCompleted?planned:null;
 const pr=sessions.flatMap(s=>s.prs||[])[0]||((data.unicornEvent?.type==='pr'&&data.unicornEvent.discoveredDate===date)?data.unicornEvent:null);
 return {date,hour,active,sessions,session,planned,pendingPlanned,plannedCompleted,rest,pr,gap:daysSinceLastSession(),streak:calcStreak(),nutrition:todaysNutritionStatus()};
}
function workoutFlavor(session){
 const name=`${session?.name||''} ${(session?.items||[]).map(x=>x.muscle||'').join(' ')}`.toLowerCase();
 if(/leg|lower|quad|hamstring|glute|calf/.test(name))return 'postLegs';
 if(/pull|back|lat|bicep/.test(name))return 'postPull';
 if(/push|chest|shoulder|tricep/.test(name))return 'postPush';
 return 'post';
}
function sassContext(){
 const st=todayState();let group='welcome',key='welcome';
 if(st.active){group='active';key=`active:${st.active.id}`}
 else if(st.pr&&latestPrMoment(st)&&Date.now()-latestPrMoment(st)<2*60*60000){group='prHome';key=`pr:${st.session?.id||st.pr.sessionId||st.pr.exercise||'today'}`}
 else if(st.sessions.length>1){
  group='multi';key=`multi:${st.sessions.map(s=>s.id).sort().join(':')}`;
 }else if(st.session){
  if(st.nutrition.kcalRatio>=.72&&st.nutrition.proteinRatio>=.72)group='fedDone';else group=workoutFlavor(st.session);
  key=`done:${st.session.id}:${group}`;
 }else if(st.rest){group='rest';key='rest'}
 else if(st.gap!==null&&st.gap>=5){group='back';key=`back:${st.gap}`}
 else if(st.streak>=7){group='streak';key=`streak:${st.streak}`}
 else if(st.hour<10){group='morning';key='morning'}
 else if(st.hour<17){group='afternoon';key='afternoon'}
 else if(st.hour<22){group='evening';key='evening'}
 else {group='late';key='late'}
 return {group,key,state:st};
}
function homeSass(){
 const {group,key,state}=sassContext();
 if(data.dailySass?.date===state.date&&data.dailySass.key===key&&data.dailySass.text)return data.dailySass.text;
 const text=pickSass(group);
 data.dailySass={date:state.date,key,text};save();return text;
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
const LOCAL_DATA_PREFIX='gaymV2:user:';
const LEGACY_LOCAL_KEY='gaymV2';
const SYNC_META_PREFIX='gaymSyncV1:user:';
const HISTORY_RECOVERY_PREFIX='gaymHistoryRecoveryV96:user:';
const LOCAL_BACKUP_PREFIX='gaymV97Backup:user:';
function accountLocalKey(userId){return userId?`${LOCAL_DATA_PREFIX}${userId}`:null}
function accountSyncMetaKey(userId){return userId?`${SYNC_META_PREFIX}${userId}`:null}
function historyRecoveryKey(userId){return userId?`${HISTORY_RECOVERY_PREFIX}${userId}`:null}
function localBackupKey(userId){return userId?`${LOCAL_BACKUP_PREFIX}${userId}`:null}
function loadForUser(userId){
 if(!userId)return structuredClone(defaults);
 try{
  const raw=localStorage.getItem(accountLocalKey(userId));
  return Object.assign({},structuredClone(defaults),raw?JSON.parse(raw):{});
 }catch{return structuredClone(defaults)}
}
function loadSyncMeta(userId){
 if(!userId)return {dirty:false,lastRemoteUpdatedAt:0,lastSyncedAt:0,lastLocalHash:'',lastSyncedHash:'',lastRemoteSessionCount:0};
 try{return Object.assign({dirty:false,lastRemoteUpdatedAt:0,lastSyncedAt:0,lastLocalHash:'',lastSyncedHash:'',lastRemoteSessionCount:0},JSON.parse(localStorage.getItem(accountSyncMetaKey(userId))||'{}'))}catch{return {dirty:false,lastRemoteUpdatedAt:0,lastSyncedAt:0,lastLocalHash:'',lastSyncedHash:'',lastRemoteSessionCount:0}}
}
function persistSyncMeta(){if(!activeDataUserId)return false;try{localStorage.setItem(accountSyncMetaKey(activeDataUserId),JSON.stringify(cloudSyncMeta));return true}catch(e){console.error('save sync metadata',e);return false}}
function historyRecoveryDone(userId=activeDataUserId){if(!userId)return false;try{return localStorage.getItem(historyRecoveryKey(userId))==='done'}catch{return false}}
function markHistoryRecoveryDone(userId=activeDataUserId){if(!userId)return;try{localStorage.setItem(historyRecoveryKey(userId),'done')}catch{}}
function stableStringify(value){
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return `[${value.map(stableStringify).join(',')}]`;
 return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}
function syncContentSnapshot(payload=data){
 const keys=['profile','customWorkouts','customPrograms','sessions','measurements','nutrition','nutritionDeletedIds','foodFavorites','savedMeals','recipeFavorites','customRecipes','planned','activeSession','profileCreated','notificationSettings','coachCheckins','bottomCheckins','nightOut','prideMode','selectedTitle','achievementMeta','beginnerEquipment'];
 return JSON.parse(JSON.stringify(Object.fromEntries(keys.map(k=>[k,payload?.[k]??defaults[k]??null]))));
}
function syncContentHash(payload=data){
 const s=stableStringify(syncContentSnapshot(payload));let h=2166136261;
 for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
 return (h>>>0).toString(36);
}
function recoveryItemKey(collection,item,index=0){
 if(item==null)return `null:${index}`;
 if(typeof item!=='object')return `value:${String(item)}`;
 if(item.id!=null&&item.id!=='')return `id:${String(item.id)}`;
 if(collection==='measurements'||collection==='coachCheckins'||collection==='bottomCheckins')return `date:${item.date||index}`;
 if(collection==='planned')return `plan:${item.date||''}:${item.workoutId||item.type||item.name||index}`;
 if(collection==='sessions')return `session:${item.date||''}:${item.startedAt||item.finishedAt||''}:${item.workoutId||item.name||item.type||index}`;
 return `legacy:${stableStringify(item)}`;
}
function mergeRecoveryArray(collection,remoteItems,localItems){
 const merged=[],positions=new Map();
 for(const [source,preferLocal] of [[Array.isArray(remoteItems)?remoteItems:[],false],[Array.isArray(localItems)?localItems:[],true]]){
  source.forEach((item,index)=>{
   const key=recoveryItemKey(collection,item,index),position=positions.get(key),copy=structuredClone(item);
   if(position==null){positions.set(key,merged.length);merged.push(copy);return}
   if(preferLocal&&copy&&typeof copy==='object'&&!Array.isArray(copy))merged[position]={...merged[position],...copy};
  });
 }
 return merged;
}
const RECOVERY_ARRAY_KEYS=['customWorkouts','customPrograms','sessions','measurements','nutrition','recipeFavorites','customRecipes','planned','coachCheckins','bottomCheckins'];
function buildRecoveryPayload(remotePayload,localPayload=data){
 const remote=remotePayload&&typeof remotePayload==='object'?remotePayload:{},local=localPayload&&typeof localPayload==='object'?localPayload:{};
 const payload=Object.assign({},structuredClone(defaults),remote,local);
 RECOVERY_ARRAY_KEYS.forEach(key=>{payload[key]=mergeRecoveryArray(key,remote[key],local[key])});
 return payload;
}
function localRecoveryAddsCloudData(remotePayload,localPayload=data){
 const remote=remotePayload&&typeof remotePayload==='object'?remotePayload:{};
 return RECOVERY_ARRAY_KEYS.some(key=>mergeRecoveryArray(key,remote[key],localPayload?.[key]).length>(Array.isArray(remote[key])?remote[key].length:0));
}
function normalizeLocalData(){
 if(data.activeSession){const now=Date.now();if(!Number.isFinite(Number(data.activeSession.startedAt))||Number(data.activeSession.startedAt)<=0)data.activeSession.startedAt=now;data.activeSession.startedAt=Number(data.activeSession.startedAt);data.activeSession.totalPause=Math.max(0,Number(data.activeSession.totalPause)||0);if(data.activeSession.pausedAt!=null)data.activeSession.pausedAt=Number(data.activeSession.pausedAt)||null;}
 if(/You said BUILD MUSCLE|Eat the fucking food/i.test(data.dailySass?.text||''))data.dailySass={date:null,text:''};
 data.planned=(data.planned||[]).filter(x=>x&&(x.type==='rest'||x.workoutId));
 data.dailySass=data.dailySass&&typeof data.dailySass==='object'?data.dailySass:{date:null,text:''};
 data.unicornBrain=data.unicornBrain&&typeof data.unicornBrain==='object'?data.unicornBrain:{date:null,slot:null,topic:null,recent:[]};
 data.unicornBrain.recent=Array.isArray(data.unicornBrain.recent)?data.unicornBrain.recent.slice(-4):[];
 data.customRecipes=Array.isArray(data.customRecipes)?data.customRecipes:[];data.recipeFavorites=Array.isArray(data.recipeFavorites)?data.recipeFavorites:[];data.foodFavorites=Array.isArray(data.foodFavorites)?data.foodFavorites:[];data.savedMeals=Array.isArray(data.savedMeals)?data.savedMeals:[];data.nutritionDeletedIds=Array.isArray(data.nutritionDeletedIds)?[...new Set(data.nutritionDeletedIds.map(String))]:[];data.notifications=Array.isArray(data.notifications)?data.notifications:[];data.bottomCheckins=Array.isArray(data.bottomCheckins)?data.bottomCheckins:[];
 data.notificationMeta=Object.assign({dailySassDate:null,nutritionDate:null,absenceDate:null,streakMilestone:null},data.notificationMeta||{});
 recomputePRHistory({notifyNew:false});syncPlannedWorkoutReferences();
}
function switchAccountLocalData(userId){activeDataUserId=userId||null;data=loadForUser(activeDataUserId);normalizeLocalData();cloudSyncMeta=loadSyncMeta(activeDataUserId);cloudSyncMeta.lastLocalHash=syncContentHash(data);nutritionSyncLastHash=nutritionSyncHash();persistSyncMeta()}
function nutritionSyncHash(payload=data){
 const snap={nutrition:Array.isArray(payload?.nutrition)?payload.nutrition:[],nutritionDeletedIds:Array.isArray(payload?.nutritionDeletedIds)?payload.nutritionDeletedIds:[],foodFavorites:Array.isArray(payload?.foodFavorites)?payload.foodFavorites:[],savedMeals:Array.isArray(payload?.savedMeals)?payload.savedMeals:[]};
 return stableStringify(snap);
}
function nutritionItemKey(item,index=0){return item?.id!=null&&item.id!==''?String(item.id):`legacy:${item?.date||''}:${item?.name||''}:${item?.kcal||0}:${index}`}
function mergeNutritionSync(remotePayload,localPayload=data){
 const remote=remotePayload&&typeof remotePayload==='object'?remotePayload:{},local=localPayload&&typeof localPayload==='object'?localPayload:{};
 const deleted=new Set([...(remote.nutritionDeletedIds||[]),...(local.nutritionDeletedIds||[])].map(String));
 const merged=[],positions=new Map();
 for(const [items,preferLocal] of [[Array.isArray(remote.nutrition)?remote.nutrition:[],false],[Array.isArray(local.nutrition)?local.nutrition:[],true]]){
  items.forEach((item,index)=>{const key=nutritionItemKey(item,index);if(deleted.has(key)||deleted.has(String(item?.id||'')))return;const copy=structuredClone(item),pos=positions.get(key);if(pos==null){positions.set(key,merged.length);merged.push(copy)}else if(preferLocal)merged[pos]={...merged[pos],...copy}});
 }
 const mergeTemplates=(a,b)=>{const out=[],pos=new Map();[...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])].forEach(x=>{if(!x)return;const key=String(x.id||x.sourceId||x.name||'');if(!key)return;if(pos.has(key))out[pos.get(key)]={...out[pos.get(key)],...structuredClone(x)};else{pos.set(key,out.length);out.push(structuredClone(x))}});return out.slice(-100)};
 return {nutrition:merged,nutritionDeletedIds:[...deleted].slice(-1000),foodFavorites:mergeTemplates(remote.foodFavorites,local.foodFavorites),savedMeals:mergeTemplates(remote.savedMeals,local.savedMeals)};
}
function markNutritionDeleted(items){
 const ids=(Array.isArray(items)?items:[]).map(x=>x?.id).filter(Boolean).map(String);if(!ids.length)return;
 data.nutritionDeletedIds=[...new Set([...(data.nutritionDeletedIds||[]).map(String),...ids])].slice(-1000);
}
function removeNutritionWhere(predicate){
 const before=(data.nutrition||[]),removed=before.filter(predicate);if(!removed.length)return false;markNutritionDeleted(removed);data.nutrition=before.filter(x=>!predicate(x));return true;
}
function scheduleNutritionCloudSync(delay=500){
 if(!sb||!authUser?.id||activeDataUserId!==authUser.id)return;
 clearTimeout(nutritionSyncTimer);nutritionSyncTimer=setTimeout(()=>syncNutritionCloud(authUser.id,{quiet:true}),delay);
}
async function syncNutritionCloud(expectedUserId=activeDataUserId,{quiet=false,pullOnly=false}={}){
 if(nutritionSyncBusy||!sb||!expectedUserId||authUser?.id!==expectedUserId||activeDataUserId!==expectedUserId)return {skipped:true};
 nutritionSyncBusy=true;
 try{
  const {remote,error}=await readCloudAccountData(expectedUserId);if(error)throw error;
  if(authUser?.id!==expectedUserId||activeDataUserId!==expectedUserId)return {skipped:true};
  const merged=mergeNutritionSync(remote?.payload,data),before=nutritionSyncHash(data);
  data.nutrition=merged.nutrition;data.nutritionDeletedIds=merged.nutritionDeletedIds;data.foodFavorites=merged.foodFavorites;data.savedMeals=merged.savedMeals;normalizeLocalData();persistLocalAccountData();nutritionSyncLastHash=nutritionSyncHash(data);
  if(pullOnly)return {ok:true,pulled:true};
  const remotePayload=remote?.payload&&typeof remote.payload==='object'?remote.payload:{};
  const remoteMerged=mergeNutritionSync(remotePayload,data);
  const nextPayload={...remotePayload,nutrition:remoteMerged.nutrition,nutritionDeletedIds:remoteMerged.nutritionDeletedIds,foodFavorites:remoteMerged.foodFavorites,savedMeals:remoteMerged.savedMeals,updatedAt:Math.max(Number(remotePayload.updatedAt)||0,Date.now())};
  const {error:upError}=await sb.from('account_data').upsert({user_id:expectedUserId,payload:nextPayload,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(upError)throw upError;
  nutritionSyncLastHash=nutritionSyncHash(data);return {ok:true,changed:before!==nutritionSyncLastHash};
 }catch(e){console.error('nutrition cloud sync',e);if(!quiet)toast(`Nutrition sync failed: ${e.message||e}`);return {error:e}}
 finally{nutritionSyncBusy=false}
}
function accountDataUpdatedAt(payload=data){return Math.max(0,Number(payload?.updatedAt)||0)}
function remoteAccountUpdatedAt(remote){return Math.max(0,new Date(remote?.updated_at||0).getTime()||0)}
function hasAccountContent(payload=data){return ['customWorkouts','customPrograms','sessions','measurements','nutrition','recipeFavorites','customRecipes','planned','bottomCheckins'].some(key=>Array.isArray(payload?.[key])&&payload[key].length)}
function persistLocalAccountData(){
 try{
  const key=accountLocalKey(activeDataUserId),next=JSON.stringify(data),previous=key?localStorage.getItem(key):null;
  if(previous&&key){
   try{
    const oldData=JSON.parse(previous),oldSessions=(oldData?.sessions||[]).map(x=>x?.id).filter(Boolean).join('|'),newSessions=(data?.sessions||[]).map(x=>x?.id).filter(Boolean).join('|');
    if(oldSessions!==newSessions)localStorage.setItem(localBackupKey(activeDataUserId),previous);
   }catch{}
  }
  localStorage.setItem(key,next);return true;
 }catch(e){console.error('save local account data',e);return false}
}
function syncStatusView(){
 const s=cloudSyncState.status,last=cloudSyncMeta.lastSyncedAt?new Date(cloudSyncMeta.lastSyncedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
 if(s==='local')return {label:'LOCAL ONLY',detail:'Saved on this device · cloud sync is manual',cls:'success'};
 if(s==='syncing')return {label:'SYNCING',detail:'Manual cloud sync in progress',cls:'working'};
 if(s==='offline')return {label:'OFFLINE',detail:'Saved on this device · will retry',cls:'offline'};
 if(s==='failed')return {label:'FAILED',detail:cloudSyncState.error||'Could not reach cloud storage',cls:'error'};
 if(s==='conflict')return {label:'NEEDS REVIEW',detail:'Newer data exists on another device',cls:'conflict'};
 if(s==='synced'){const count=Math.max(0,Number(cloudSyncMeta.lastRemoteSessionCount)||0),workouts=`${count} workout${count===1?'':'s'} confirmed in cloud`;return {label:'SYNCED',detail:last?`${workouts} · ${last}`:workouts,cls:'success'}}
 return {label:'LOCAL ONLY',detail:'Saved on this device · cloud sync is manual',cls:'success'};
}
function refreshSyncStatusUi(){const el=$('#account-sync-status');if(!el)return;const v=syncStatusView();el.className=`account-sync-status ${v.cls}`;const label=el.querySelector('[data-sync-label]'),detail=el.querySelector('[data-sync-detail]');if(label)label.textContent=v.label;if(detail)detail.textContent=v.detail;el.onclick=cloudSyncState.status==='conflict'?()=>openCloudSyncConflict():null}
function setCloudSyncState(status,error='',conflict=null){cloudSyncState={status,error:String(error||''),conflict:conflict||null};refreshSyncStatusUi()}
function scheduleCloudRetry(){
 clearTimeout(cloudSyncRetryTimer);cloudSyncRetryCount=0;
 // v97 local-first: never retry account_data writes in the background.
}
function scheduleCloudAccountSync(){
 clearTimeout(cloudSyncTimer);
 // v97 local-first: account_data uploads happen only after an explicit user action.
}
function applyRemoteAccountData(remote,{renderAfter=false}={}){
 if(!remote?.payload)return false;
 const remoteTime=remoteAccountUpdatedAt(remote);
 data=Object.assign({},structuredClone(defaults),remote.payload,{updatedAt:Math.max(accountDataUpdatedAt(remote.payload),remoteTime)});normalizeLocalData();persistLocalAccountData();
 const hash=syncContentHash(data);cloudSyncMeta={...cloudSyncMeta,dirty:false,lastRemoteUpdatedAt:remoteTime,lastSyncedAt:Date.now(),lastLocalHash:hash,lastSyncedHash:hash,lastRemoteSessionCount:(remote.payload.sessions||[]).length};persistSyncMeta();cloudSyncRetryCount=0;clearTimeout(cloudSyncRetryTimer);setCloudSyncState('synced');if(renderAfter)render();return true;
}
async function readCloudAccountData(expectedUserId=activeDataUserId){
 if(!sb||!expectedUserId||authUser?.id!==expectedUserId||activeDataUserId!==expectedUserId)return {remote:null,error:new Error('Account changed while syncing.')};
 const {data:remote,error}=await sb.from('account_data').select('payload,updated_at').eq('user_id',expectedUserId).maybeSingle();return {remote,error};
}
async function syncCloudAccountData(expectedUserId=activeDataUserId,{force=false,quiet=false}={}){
 if(!sb||!expectedUserId||authUser?.id!==expectedUserId||activeDataUserId!==expectedUserId)return {error:new Error('Sign in before syncing.')};
 if(navigator.onLine===false){setCloudSyncState('offline');scheduleCloudRetry();return {error:new Error('Offline')};}
 if(!cloudSyncMeta.dirty&&!force){setCloudSyncState('synced');return {skipped:true};}
 setCloudSyncState('syncing');
 const before=await readCloudAccountData(expectedUserId);
 if(before.error){console.error('check cloud account data',before.error);setCloudSyncState('failed',before.error.message);scheduleCloudRetry();if(!quiet)toast(`Sync failed: ${before.error.message}`);return {error:before.error};}
 const remoteTime=remoteAccountUpdatedAt(before.remote),remoteChanged=!!before.remote?.payload&&!!cloudSyncMeta.lastRemoteUpdatedAt&&remoteTime>cloudSyncMeta.lastRemoteUpdatedAt&&syncContentHash(before.remote.payload)!==cloudSyncMeta.lastSyncedHash;
 if(remoteChanged&&!force){setCloudSyncState('conflict','',before.remote);if(!quiet)toast('Newer data exists on another device. Review sync in Profile.');return {conflict:true,remote:before.remote};}
 const uploadPayload=structuredClone(data);uploadPayload.updatedAt=Date.now();
 const {error}=await sb.from('account_data').upsert({user_id:expectedUserId,payload:uploadPayload,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(error){console.error('sync account data',error);setCloudSyncState('failed',error.message);scheduleCloudRetry();if(!quiet)toast(`Sync failed: ${error.message}`);return {error};}
 const verified=await readCloudAccountData(expectedUserId);
 if(verified.error||!verified.remote?.payload){const verifyError=verified.error||new Error('Cloud copy could not be verified.');console.error('verify cloud account data',verifyError);setCloudSyncState('failed',verifyError.message);scheduleCloudRetry();if(!quiet)toast(`Sync failed: ${verifyError.message}`);return {error:verifyError};}
 const verifiedHash=syncContentHash(verified.remote.payload),localHash=syncContentHash(data);
 if(verifiedHash!==localHash){const verifyError=new Error('The verified cloud copy did not match this device.');setCloudSyncState('failed',verifyError.message);scheduleCloudRetry();if(!quiet)toast(verifyError.message);return {error:verifyError};}
 data.updatedAt=Math.max(accountDataUpdatedAt(verified.remote.payload),remoteAccountUpdatedAt(verified.remote));persistLocalAccountData();cloudSyncMeta={...cloudSyncMeta,dirty:false,lastRemoteUpdatedAt:remoteAccountUpdatedAt(verified.remote),lastSyncedAt:Date.now(),lastLocalHash:localHash,lastSyncedHash:localHash,lastRemoteSessionCount:(verified.remote.payload.sessions||[]).length};persistSyncMeta();cloudSyncRetryCount=0;clearTimeout(cloudSyncRetryTimer);setCloudSyncState('synced');return {ok:true,remote:verified.remote};
}
async function forceCloudAccountSync(){
 if(!sb||!authUser?.id||activeDataUserId!==authUser.id)return toast('Sign in before syncing.');
 const button=$('#account-sync-now');if(button)button.disabled=true;cloudSyncMeta.dirty=true;cloudSyncMeta.lastLocalHash=syncContentHash(data);persistSyncMeta();const result=await syncCloudAccountData(authUser.id);
 if(button)button.disabled=false;
 if(result?.conflict)return openCloudSyncConflict(result.remote);
 if(!result?.error)toast('Cloud copy verified.');
}
async function forceCloudAccountLoad(){
 if(!sb||!authUser?.id||activeDataUserId!==authUser.id)return toast('Sign in before loading data.');
 if(cloudSyncMeta.dirty&&!confirm('This device has unsynced changes. Replace them with the cloud copy?'))return;
 const button=$('#account-load-now');if(button)button.disabled=true;setCloudSyncState('syncing');const {remote,error}=await readCloudAccountData(authUser.id);if(button)button.disabled=false;
 if(error){setCloudSyncState('failed',error.message);return toast(`Load failed: ${error.message}`)}
 if(!remote?.payload){setCloudSyncState('failed','No cloud copy exists yet.');return toast('No account data found in the cloud yet.')}
 applyRemoteAccountData(remote);cloudDataHydrated=true;toast(`Loaded ${(data.sessions||[]).length} workouts from your account.`);profile();
}
async function repairCloudWorkoutHistory(){
 if(!sb||!authUser?.id||activeDataUserId!==authUser.id)return toast('Sign in before repairing sync.');
 const button=$('#account-repair-history');if(button){button.disabled=true;button.lastElementChild.textContent='CHECKING…'}
 setCloudSyncState('syncing');const {remote,error}=await readCloudAccountData(authUser.id);
 if(error){if(button){button.disabled=false;button.lastElementChild.textContent='REPAIR'}setCloudSyncState('failed',error.message);return toast(`Repair failed: ${error.message}`)}
 const localBefore=(data.sessions||[]).length,cloudBefore=(remote?.payload?.sessions||[]).length;
 data=buildRecoveryPayload(remote?.payload,data);normalizeLocalData();persistLocalAccountData();cloudDataHydrated=true;
 const remoteTime=remoteAccountUpdatedAt(remote),remoteHash=remote?.payload?syncContentHash(remote.payload):'';
 cloudSyncMeta={...cloudSyncMeta,dirty:true,lastRemoteUpdatedAt:remoteTime,lastSyncedHash:remoteHash,lastLocalHash:syncContentHash(data),lastRemoteSessionCount:cloudBefore};persistSyncMeta();markHistoryRecoveryDone();
 const result=await syncCloudAccountData(authUser.id,{force:true});
 if(button){button.disabled=false;button.lastElementChild.textContent='REPAIR'}
 if(result?.error)return;
 const recovered=(data.sessions||[]).length;profile();toast(`Verified ${recovered} workouts · device had ${localBefore}, cloud had ${cloudBefore}.`);
}
async function hydrateCloudAccountData(expectedUserId=activeDataUserId){
 if(!expectedUserId||authUser?.id!==expectedUserId||activeDataUserId!==expectedUserId)return;
 // v98 local-first: NEVER hydrate the whole account payload. Only nutrition is merged by item ID/tombstone.
 await syncNutritionCloud(expectedUserId,{quiet:true});
 if(authUser?.id!==expectedUserId||activeDataUserId!==expectedUserId)return;
 cloudDataHydrated=true;
 cloudSyncMeta.lastLocalHash=syncContentHash(data);
 nutritionSyncLastHash=nutritionSyncHash(data);
 persistSyncMeta();
 setCloudSyncState('local');
}
function openCloudSyncConflict(remote=cloudSyncState.conflict){
 if(!remote?.payload)return toast('Cloud conflict details are no longer available. Try again.');
 const cloudSessions=(remote.payload.sessions||[]).length,localSessions=(data.sessions||[]).length,cloudTime=remoteAccountUpdatedAt(remote)?new Date(remoteAccountUpdatedAt(remote)).toLocaleString():'Unknown';
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Account sync</p><h2>Two versions need attention</h2></div><button class="sheet-close" data-close>×</button></div><article class="sync-conflict-card"><p>Another device saved a newer cloud version. GAYM stopped the upload so nothing was silently overwritten.</p><div><span><small>THIS DEVICE</small><strong>${localSessions} workouts</strong></span><span><small>CLOUD</small><strong>${cloudSessions} workouts</strong><em>${escapeHtml(cloudTime)}</em></span></div></article><div class="sheet-actions"><button class="primary" id="sync-use-cloud">USE CLOUD VERSION</button><button class="secondary" id="sync-keep-device">KEEP THIS DEVICE</button><button class="text-btn" data-close>CANCEL</button></div><p class="science-note">Using the cloud version replaces unsynced changes on this device. Keeping this device deliberately replaces the current cloud copy.</p>`);
 $('#sync-use-cloud').onclick=()=>{applyRemoteAccountData(remote);closeSheet();render();toast('Cloud version loaded safely.')};
 $('#sync-keep-device').onclick=async()=>{if(!confirm('Replace the newer cloud copy with this device?'))return;const btn=$('#sync-keep-device');btn.disabled=true;btn.textContent='VERIFYING…';cloudSyncMeta.dirty=true;persistSyncMeta();const result=await syncCloudAccountData(activeDataUserId,{force:true});if(result?.error){btn.disabled=false;btn.textContent='KEEP THIS DEVICE';return}closeSheet();render();toast('This device is now the verified cloud copy.')};
}
async function refreshCloudAccountData(){
 // v97 local-first: intentionally disabled. Safari focus/visibility must never pull account_data.
 return {skipped:true,reason:'manual-only'};
}
let data=structuredClone(defaults), route='home', routeArgs={}, entryUnlocked=false;normalizeLocalData();
function activityFactor(sex,level){const table={sedentary:1.20,low:1.375,active:1.55,very:1.725};return table[level]||1.55}
function goalLabel(goal){return goal==='lose'?'Lose weight':goal==='maintain'?'Maintain weight':'Build muscle'}
function calcTargets(profile){const weight=Math.max(35,+profile.weight||70),height=Math.max(130,+profile.height||175),age=Math.max(18,+profile.age||30),sex=profile.sex==='female'?'female':'male';const rmr=10*weight+6.25*height-5*age+(sex==='male'?5:-161);const maintenance=Math.round(rmr*activityFactor(sex,profile.activity));const goal=profile.goal||'maintain';let calories=maintenance;if(goal==='lose')calories=maintenance-Math.max(300,Math.min(500,Math.round(maintenance*0.15)));if(goal==='gain')calories=maintenance+Math.max(250,Math.min(400,Math.round(maintenance*0.12)));calories=Math.round(calories/10)*10;const proteinPerKg=goal==='gain'?2.0:goal==='lose'?2.0:1.8;const protein=Math.round(weight*proteinPerKg);const fatPerKg=goal==='gain'?1.0:goal==='lose'?0.8:0.9;const fat=Math.max(45,Math.round(weight*fatPerKg));const carbs=Math.max(0,Math.round((calories-protein*4-fat*9)/4));return {rmr:Math.round(rmr),maintenance,calories,protein,fat,carbs,proteinPerKg,surplus:goal==='gain'?calories-maintenance:0,deficit:goal==='lose'?maintenance-calories:0}}
function applyAutoTargets(){data.profile.autoTargets=data.profile.autoTargets!==false;if(!data.profile.autoTargets)return;const t=calcTargets(data.profile);data.profile.calorieTarget=t.calories;data.profile.proteinTarget=t.protein;data.profile.carbTarget=t.carbs;data.profile.fatTarget=t.fat}
function migrateProfile(){const hadAuto=typeof data.profile?.autoTargets==='boolean';data.profile={height:183,age:28,sex:'male',activity:'active',goal:'gain',autoTargets:hadAuto?data.profile.autoTargets:false,...data.profile};if(data.profile.autoTargets)applyAutoTargets()}
function syncPlannedWorkoutReferences(){
 data.customWorkouts=Array.isArray(data.customWorkouts)?data.customWorkouts:[];
 data.customPrograms=Array.isArray(data.customPrograms)?data.customPrograms:[];
 data.sessions=Array.isArray(data.sessions)?data.sessions:[];
 data.measurements=Array.isArray(data.measurements)?data.measurements:[];
 data.nutrition=Array.isArray(data.nutrition)?data.nutrition:[];
 data.planned=Array.isArray(data.planned)?data.planned:[];
 data.planned=data.planned.filter(p=>{
  if(!p)return false;
  if(p.type==='rest'||/rest|recovery/i.test(p.name||'')){p.type='rest';p.name='Rest Day';p.workoutId='';return true}
  const w=data.customWorkouts.find(x=>x.id===p.workoutId);
  if(!w)return false;
  p.name=w.name;p.type=w.type||'strength';return true;
 });
}
function save(){
 if(!activeDataUserId||!authUser||authUser.id!==activeDataUserId)return false;
 syncPlannedWorkoutReferences();
 const nextHash=syncContentHash(data),contentChanged=nextHash!==cloudSyncMeta.lastLocalHash;
 const nextNutritionHash=nutritionSyncHash(data),nutritionChanged=nextNutritionHash!==nutritionSyncLastHash;
 if(contentChanged){
  data.updatedAt=Date.now();cloudSyncMeta.dirty=true;cloudSyncMeta.lastLocalHash=syncContentHash(data);persistSyncMeta();setCloudSyncState('local');
 }
 const saved=persistLocalAccountData();
 if(saved&&nutritionChanged){nutritionSyncLastHash=nextNutritionHash;scheduleNutritionCloudSync()}
 return saved;
}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2200)}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function fmtDate(d){return new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'}).format(d)}
function entry(){
 const app=$('#app');
 if(cloudBooting){app.innerHTML=`<main class="entry-screen"><section class="entry-card auth-card"><div class="entry-brand">GA<i>Y</i>M</div><div class="cloud-loader"></div><p class="entry-copy">Connecting your account…</p></section></main>`;return}
 if(authUser){entryUnlocked=true;return render()}
 const isCreate=authMode==='create';
 app.innerHTML=`<main class="entry-screen"><section class="entry-card auth-card"><div class="entry-brand">GA<i>Y</i>M</div><p class="entry-kicker">${isCreate?'JOIN GAYM':'WELCOME BACK'}</p><h1>${isCreate?'Train together.':'Your gym people are waiting.'}</h1><p class="entry-copy">${isCreate?'Create your profile, find friends and turn training into a team sport.':'Log in to sync workouts, friends and shared recipes.'}</p>
 <div class="auth-toggle"><button class="${!isCreate?'active':''}" data-auth-mode="login">LOG IN</button><button class="${isCreate?'active':''}" data-auth-mode="create">CREATE ACCOUNT</button></div>
 ${isCreate?`<div class="field"><label>Display name</label><input id="auth-name" autocomplete="name" placeholder="Joakim"></div><div class="field"><label>Username</label><input id="auth-username" autocomplete="username" autocapitalize="none" placeholder="jocke"></div>`:''}
 <div class="field"><label>Email</label><input id="auth-email" type="email" autocomplete="email" autocapitalize="none" placeholder="you@example.com"></div>
 <div class="field"><label>Password</label><input id="auth-password" type="password" autocomplete="${isCreate?'new-password':'current-password'}" minlength="8" placeholder="At least 8 characters"></div>
 <button class="primary entry-primary" id="auth-submit">${isCreate?'CREATE ACCOUNT':'LOG IN'}</button>
 ${!isCreate?`<button class="text-btn auth-forgot" id="auth-forgot">FORGOT PASSWORD?</button>`:''}
 <p class="entry-note">Your private body, nutrition and BottomCheck data is never shown to friends. Social sharing is controlled separately.</p></section></main>`;
 $$('[data-auth-mode]').forEach(b=>b.onclick=()=>{authMode=b.dataset.authMode;entry()});
 $('#auth-submit').onclick=submitAuth;
 if($('#auth-forgot'))$('#auth-forgot').onclick=sendPasswordReset;
}
function nav(){return `<nav class="bottom-nav">${[['home','Home'],['social','Social'],['workout','Workout'],['progress','Progress'],['profile','Profile']].map(([r,l])=>`<button class="nav-item ${route===r?'active':''} ${r==='workout'?'center':''}" data-route="${r}">${r==='workout'?`<span class="nav-bubble">${icons.workout}</span>`:icons[r]}<span>${l}</span></button>`).join('')}</nav>`}
function shell(content){$('#app').innerHTML=`<main class="screen">${content}</main>${nav()}`; bindGlobal()}
function bindGlobal(){$$('[data-route]').forEach(b=>b.onclick=()=>go(b.dataset.route));$$('[data-action="notify"]').forEach(b=>b.onclick=openNotifications);$$('[data-action="quick-menu"]').forEach(b=>b.onclick=openQuickMenu);$$('[data-session-id]').forEach(b=>b.onclick=()=>openSessionDetail(b.dataset.sessionId));}
function go(r,args={}){route=r;routeArgs=args;render();requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}))}
function socialUnreadCount(){return (socialCache.notifications||[]).filter(n=>!n.read_at).length}
function header(title='',back=false){const unread=socialUnreadCount();return `<header class="topbar"><div class="topbar-left"><button class="icon-btn quick-menu-trigger" data-action="quick-menu" aria-label="Open quick navigation" aria-haspopup="dialog">${icons.menu}</button>${back?`<button class="icon-btn" data-back aria-label="Go back">${icons.back}</button>`:`<div class="brand">GAYM.</div>`}</div><strong>${escapeHtml(title)}</strong>${back?`<span style="width:42px"></span>`:`<button class="icon-btn notification-bell" data-action="notify">${icons.bell}${unread?`<b class="notification-badge">${Math.min(unread,9)}${unread>9?'+':''}</b>`:''}</button>`}</header>`}
function quickMenuGroup(icon,label,items,open=false){return `<details class="quick-menu-group" ${open?'open':''}><summary>${icon}<strong>${label}</strong><span class="quick-menu-chevron">⌄</span></summary><div class="quick-menu-links">${items.map(([key,name])=>`<button type="button" data-quick-go="${key}">${name}<span>›</span></button>`).join('')}</div></details>`}
function openQuickMenu(){const root=$('#sheet-root');root.innerHTML=`<div class="quick-menu-backdrop"><aside class="quick-menu" role="dialog" aria-modal="true" aria-label="Quick navigation"><div class="quick-menu-head"><strong>QUICK NAVIGATION</strong><button class="sheet-close" data-quick-close aria-label="Close navigation">×</button></div>${quickMenuGroup(icons.home,'Home',[['home','Dashboard'],['plan','My plan']],true)}${quickMenuGroup(icons.workout,'Workout',[['workout','My training'],['workout-beginner','Beginner training'],['workout-history','Log or view history']])}${quickMenuGroup(icons.progress,'Progress',[['progress','Exercise progress'],['progress-history','Workout history'],['progress-body','Body measurements']])}${quickMenuGroup(icons.plan,'Nutrition',[['nutrition-today','Today'],['nutrition-recipes','Recipes'],['nutrition-community','Community recipes']])}${quickMenuGroup(icons.social,'Social',[['social-activity','Activity'],['social-messages','Messages'],['social-friends','Friends']])}${quickMenuGroup(icons.profile,'Profile',[['profile','Profile'],['profile-body','Body & goal'],['profile-notifications','Notifications']])}</aside></div>`;const backdrop=$('.quick-menu-backdrop',root);backdrop.onclick=e=>{if(e.target===backdrop)closeQuickMenu()};$$('[data-quick-close]',root).forEach(b=>b.onclick=closeQuickMenu);$$('[data-quick-go]',root).forEach(b=>b.onclick=()=>quickGo(b.dataset.quickGo));requestAnimationFrame(()=>root.querySelector('[data-quick-close]')?.focus())}
function closeQuickMenu(){$('#sheet-root').innerHTML=''}
function quickGo(target){closeQuickMenu();if(target==='workout-beginner'){go('workout');requestAnimationFrame(()=>$('#workout-beginner-tab')?.click());return}if(target==='workout-history'){go('plan');requestAnimationFrame(openHistorySheet);return}if(target==='progress-history'){go('progress');requestAnimationFrame(openHistorySheet);return}if(target==='progress-body'){go('progress');requestAnimationFrame(openBodySheet);return}if(target.startsWith('nutrition-')){nutritionTab=target.replace('nutrition-','');go('nutrition');return}if(target.startsWith('social-')){socialTab=target.replace('social-','');go('social');return}if(target==='profile-body'){go('profile');requestAnimationFrame(openProfileSheet);return}if(target==='profile-notifications'){go('profile');requestAnimationFrame(openNotificationSettings);return}go(target)}


const GAY_REACTIONS=['ATE','HOT','STRONG','RUDE','MOTHER'];
const TITLE_RULES=[
 {name:'Bench Princess',test:()=>data.sessions.some(s=>(s.items||[]).some(x=>/bench press/i.test(x.name||'')))},
 {name:'Leg Day Survivor',test:()=>data.sessions.filter(s=>/leg|lower/i.test(s.name||'')).length>=3},
 {name:'Cardio Homosexual',test:()=>data.sessions.filter(s=>s.type==='cardio').length>=5},
 {name:'Protein Royalty',test:()=>{const days=[...new Set(data.nutrition.map(x=>x.date))].slice(-7);return days.length>=3&&days.filter(d=>data.nutrition.filter(x=>x.date===d).reduce((a,x)=>a+(+x.protein||0),0)>=(data.profile.proteinTarget||140)*.9).length>=3}},
 {name:'PR Machine',test:()=>data.sessions.reduce((n,s)=>n+(s.prs?.length||0),0)>=3},
 {name:'Sunday Sinner',test:()=>data.sessions.some(s=>new Date(`${s.date}T12:00:00`).getDay()===0)}
];
function unlockedTitles(){return TITLE_RULES.filter(x=>{try{return x.test()}catch{return false}}).map(x=>x.name)}
function selectedSocialTitle(){const unlocked=unlockedTitles();return unlocked.includes(data.selectedTitle)?data.selectedTitle:(unlocked[0]||'')}
function prideModeActive(){if(data.prideMode==='on')return true;if(data.prideMode==='off')return false;return new Date().getMonth()===5}
function thisWeekStart(){const d=new Date(),day=(d.getDay()+6)%7;d.setHours(0,0,0,0);d.setDate(d.getDate()-day);return d}
function weeklyGayStats(){const start=thisWeekStart(),sessions=(data.sessions||[]).filter(s=>new Date(`${s.date}T12:00:00`)>=start),dates=[...Array(7)].map((_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return isoToday(d)}),nutritionDays=dates.map(d=>data.nutrition.filter(x=>x.date===d)).filter(x=>x.length),avgProtein=nutritionDays.length?Math.round(nutritionDays.reduce((sum,arr)=>sum+arr.reduce((a,x)=>a+(+x.protein||0),0),0)/nutritionDays.length):0,prs=sessions.reduce((n,s)=>n+(s.prs?.length||0),0),nights=(nightOutState()?.date&&dates.includes(nightOutState().date))?1:0;let verdict='Cute. The week is still loading.';if(sessions.length>=5)verdict='Suspiciously disciplined.';else if(prs>=2)verdict='Competitive homosexual behavior detected.';else if(sessions.length>=3)verdict='Consistent enough to become annoying.';return {workouts:sessions.length,prs,avgProtein,nights,verdict}}
function weeklyGayCard(){const w=weeklyGayStats();return `<article class="card gay-week-card"><div class="section-head"><h3>YOUR GAY WEEK</h3><span class="eyebrow">${prideModeActive()?'PRIDE MODE':'WEEKLY RECEIPTS'}</span></div><div class="gay-week-grid"><span><b>${w.workouts}</b><small>WORKOUTS</small></span><span><b>${w.prs}</b><small>PBs</small></span><span><b>${w.avgProtein||'—'}</b><small>AVG PROTEIN</small></span><span><b>${w.nights}</b><small>NIGHT OUT</small></span></div><p>${escapeHtml(w.verdict)}</p></article>`}
function workoutMilestones(){return [10,25,50,100,200]}
function currentWorkoutMilestone(){const count=(data.sessions||[]).length;return [...workoutMilestones()].reverse().find(x=>count>=x)||0}
async function syncWorkoutAchievement(expectedUserId=activeDataUserId){
 if(!sb||!authUser||authUser.id!==expectedUserId||activeDataUserId!==expectedUserId)return;
 const m=currentWorkoutMilestone();if(!m)return;data.achievementMeta=data.achievementMeta||{};if(data.achievementMeta[`workouts-${m}`])return;
 const row={user_id:expectedUserId,kind:'achievement',source_id:`workouts:${m}`,title:`${m} workouts`,body:'This is getting concerning.',metadata:{achievement:'workouts',value:m},visibility:'friends',updated_at:new Date().toISOString(),created_at:new Date().toISOString()};
 const {data:post,error}=await sb.from('activity_posts').upsert(row,{onConflict:'user_id,kind,source_id',ignoreDuplicates:false}).select('id').single();if(error){console.error('achievement post',error);return}
 const r=await sb.rpc('notify_friends_achievement',{p_post_id:post.id});if(r.error){console.error('achievement notify',r.error);return}
 data.achievementMeta[`workouts-${m}`]=Date.now();save();socialCacheUpdatedAt=0;
}
function todaysNightOutFriends(){return (socialCache.nightOuts||[]).filter(p=>p.kind==='night_out'&&p.metadata?.active!==false&&(p.metadata?.date===isoToday()||String(p.created_at||'').slice(0,10)===isoToday())&&p.user_id!==authUser?.id)}
function nightOutRadarMarkup(){
 const rows=todaysNightOutFriends(),count=rows.length;
 return `<button type="button" class="card night-radar-summary" id="night-out-radar-open" ${count?'':'aria-disabled="true"'}><span><small>FRIDAY RADAR</small><strong>WHO'S OUT TONIGHT?</strong></span><span class="night-radar-count"><b>${count}</b><small>${count===1?'PERSON':'PEOPLE'}</small></span><span class="night-radar-chevron">${count?'›':''}</span></button>`;
}
function openNightOutRadar(){
 const rows=todaysNightOutFriends(); if(!rows.length)return;
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">FRIDAY RADAR</p><h2>Who's out tonight?</h2></div><button class="sheet-close" data-close>×</button></div><p class="night-radar-sheet-count">${rows.length} ${rows.length===1?'person is':'people are'} sharing tonight.</p><div class="night-radar-list">${rows.map(p=>`<button type="button" data-night-radar-post="${p.id}">${avatarMarkup(p.profiles||{},'sm')}<span><strong>${escapeHtml(p.profiles?.display_name||p.profiles?.username||'Friend')}</strong><small>${escapeHtml(p.metadata?.location_type==='home'?'Home tonight':p.metadata?.place||'Out tonight')}</small></span><b>›</b></button>`).join('')}</div>`);
 $$('[data-night-radar-post]').forEach(b=>b.onclick=()=>{const id=b.dataset.nightRadarPost;closeSheet();const post=activityPostCache.get(id)||socialCache.nightOuts?.find(p=>p.id===id)||socialCache.feed.find(p=>p.id===id);if(post)openActivityDetail(post);else openActivityPostById(id)});
}
function bindNightOutRadar(){const button=$('#night-out-radar-open');if(button)button.onclick=()=>{if(todaysNightOutFriends().length)openNightOutRadar()};}
async function uploadWorkoutPhoto(sessionId,file,share=true){
 if(!file||!sb||!authUser)return;const sess=data.sessions.find(x=>x.id===sessionId);if(!sess)return toast('Workout not found.');
 const blob=await prepareAvatarImage(file);const path=`${authUser.id}/${sessionId}-${Date.now()}-${Math.random().toString(36).slice(2,7)}.jpg`;const {error}=await sb.storage.from('workout-images').upload(path,blob,{upsert:false,contentType:'image/jpeg',cacheControl:'31536000'});if(error)throw error;const url=sb.storage.from('workout-images').getPublicUrl(path).data.publicUrl;sess.socialPhotoUrl=url;sess.photoVisibility=share?'friends':'private';if(!save())throw new Error('Could not save photo on this device.');await syncRecentActivitiesFromLocal(activeDataUserId);socialCacheUpdatedAt=0;return url;
}
async function updateWorkoutPhotoSharing(sessionId,share){
 const sess=data.sessions.find(x=>x.id===sessionId);if(!sess?.socialPhotoUrl)return;
 const previous=sess.photoVisibility;sess.photoVisibility=share?'friends':'private';if(!save()){sess.photoVisibility=previous;throw new Error('Could not save photo sharing on this device.')}
 await syncRecentActivitiesFromLocal(activeDataUserId);socialCacheUpdatedAt=0;
}

function notificationSettings(){return Object.assign({workout:true,nutrition:true,progress:true,dailySass:true,unhinged:true,dailyTime:'09:00',nutritionTime:'19:00'},data.notificationSettings||{})}
function notificationText(clean,sassy){return notificationSettings().unhinged?sassy:clean}
function queueNotification({kind='general',title='GAYM',body='',route='home',args={},dedupeKey=null}){
 data.notifications=data.notifications||[];
 if(dedupeKey&&data.notifications.some(n=>n.dedupeKey===dedupeKey))return null;
 const n={id:uid(),kind,title,body,route,args,createdAt:Date.now(),read:false,dedupeKey};
 data.notifications.unshift(n);data.notifications=data.notifications.slice(0,50);save();return n;
}
async function markSocialNotificationRead(id){
 if(!sb||!authUser||!id)return;
 const n=(socialCache.notifications||[]).find(x=>x.id===id);if(n)n.read_at=new Date().toISOString();
 const {error}=await sb.from('social_notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('recipient_id',authUser.id);
 if(error)console.error('mark social notification read',error);
 refreshBellBadge();
}
function refreshBellBadge(){
 const count=socialUnreadCount();$$('[data-action="notify"]').forEach(btn=>{let b=btn.querySelector('.notification-badge');if(count){if(!b){b=document.createElement('b');b.className='notification-badge';btn.appendChild(b)}b.textContent=`${Math.min(count,9)}${count>9?'+':''}`}else b?.remove()});
}
async function navigateNotification(n){
 if(n.social){await markSocialNotificationRead(n.id);closeSheet();if(n.kind==='friend_request'){socialTab='friends';go('social');return}if(n.kind==='message'&&n.actor_id){closeSheet();go('chat',{userId:n.actor_id,profile:n.actor});return}if(n.metadata?.post_id){await openActivityPostById(n.metadata.post_id);return}if(n.actor_id&&n.actor_id!==authUser?.id){openUserProfile(n.actor_id);return}go('home');return}
 n.read=true;save();closeSheet();
 if(n.route==='progress-exercise'){go('progress');requestAnimationFrame(()=>setTimeout(()=>openExerciseProgress(n.args?.name),80));return}
 if(n.route==='nutrition'){go('nutrition');return}
 if(n.route==='plan'){go('plan');return}
 if(n.route==='workout'){go('workout');return}
 go(n.route||'home',n.args||{});
}
async function loadSocialNotifications(expectedUserId=activeDataUserId){
 if(!sb||!authUser||!expectedUserId||authUser.id!==expectedUserId)return;
 const {data:rows,error}=await sb.from('social_notifications').select('id,recipient_id,actor_id,kind,title,body,metadata,read_at,created_at,actor:profiles!social_notifications_actor_id_fkey(id,username,display_name,avatar_url)').eq('recipient_id',expectedUserId).order('created_at',{ascending:false}).limit(50);
 if(error){if(error.code!=='42P01')console.error('load social notifications',error);return}
 if(authUser?.id!==expectedUserId||activeDataUserId!==expectedUserId)return;
 socialCache.notifications=rows||[];refreshBellBadge();
}
async function sendSocialNotification(recipientId,kind,title,body,metadata={},dedupeKey=null){
 const sender=authUser?.id;if(!sb||!sender||!recipientId||sender===recipientId)return {error:null};
 const row={recipient_id:recipientId,actor_id:sender,kind,title,body,metadata,dedupe_key:dedupeKey};
 const {error}=await sb.from('social_notifications').insert(row);if(error&&error.code!=='23505')console.error('send social notification',error);return {error};
}
async function openNotifications(){
 evaluateNotifications();await loadSocialNotifications();
 const cloud=(socialCache.notifications||[]).map(n=>({id:n.id,social:true,kind:n.kind,title:n.title,body:n.body,metadata:n.metadata||{},createdAt:new Date(n.created_at).getTime(),read:!!n.read_at,actor_id:n.actor_id,actor:n.actor}));
 const list=[...cloud,...(data.notifications||[])].sort((a,b)=>b.createdAt-a.createdAt);
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Notifications</p><h2>Your GAYM circle</h2></div><button class="sheet-close" data-close>×</button></div>${list.length?`<div class="notification-list">${list.map(n=>`<button class="notification-card ${n.read?'':'unread'}" data-notification="${n.id}" data-social-notification="${n.social?'1':'0'}"><span class="notification-dot"></span><span class="grow"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body)}</p><small>${new Date(n.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small></span><span class="chev">›</span></button>`).join('')}</div><button class="text-btn notification-clear" id="notification-clear">CLEAR ALL</button>`:`<div class="empty"><strong>No notifications</strong>Your unicorn is currently minding its own business. Suspicious.</div>`}`);
 $$('[data-notification]').forEach(b=>b.onclick=()=>{const id=b.dataset.notification;const n=b.dataset.socialNotification==='1'?cloud.find(x=>x.id===id):(data.notifications||[]).find(x=>x.id===id);if(n)navigateNotification(n)});
 const clear=$('#notification-clear');if(clear)clear.onclick=async()=>{data.notifications=[];save();if(sb&&authUser){const ids=(socialCache.notifications||[]).map(n=>n.id);if(ids.length){const {error}=await sb.from('social_notifications').delete().eq('recipient_id',authUser.id).in('id',ids);if(error)console.error('clear social notifications',error)}socialCache.notifications=[]}refreshBellBadge();openNotifications()};
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

const GAYM_VOICE={
 active:[
  "Workout in progress. Stop flirting with the home screen.",
  "You started it. Now finish it, gorgeous.",
  "The weights are waiting. Unlike your situationship, they are consistent.",
  "Less refreshing. More lifting."
 ],
 pr:[
  "A personal best? Unfortunately this will affect your personality.",
  "New PB. Be humble about it for at least eleven seconds.",
  "Stronger than last time. Your old numbers have been asked to leave.",
  "New PB. Screenshot it before your ego rewrites history.",
  "The weight went up. So did the audacity."
 ],
 multi:[
  "Two sessions today. Completely normal behavior.",
  "Double session energy. Subtlety has left the building.",
  "Apparently one workout was merely an opening act.",
  "Multiple workouts today. Your recovery has requested legal counsel."
 ],
 trained:[
  "Workout done. The pump is temporary. The evidence is saved.",
  "Training complete. Go stand suspiciously close to a mirror.",
  "The work has been done. You may now become unbearable.",
  "Weights moved. Ego nourished. Excellent.",
  "Back again? Checking if the jockstraps fit differently yet?"
 ],
 fed:[
  "Trained and fed. Annoyingly responsible.",
  "Workout logged and nutrition handled. Who authorized this competence?",
  "Protein handled. Training handled. Diva behavior, administratively flawless.",
  "Fed, trained, dangerous. Carry on."
 ],
 rest:[
  "Rest day. Even divas require maintenance.",
  "Recover today. Cause problems tomorrow.",
  "Muscles grow during recovery. Tragically, lying down is productive.",
  "Today we lift nothing but standards."
 ],
 gap:[
  "The dumbbells have filed a missing person report.",
  "Your gym membership would like to know if this is still a relationship.",
  "The weights remember you. Awkward.",
  "Absence makes the heart grow fonder. It does very little for progressive overload."
 ],
 streak:[
  "Consistency? In this community? Historic.",
  "That streak is becoming a personality trait.",
  "Discipline looks suspiciously good on you.",
  "Another day on the streak. The gym should consider charging rent."
 ],
 morning:[
  "Good morning, gorgeous. Go give someone a reason to stare.",
  "Morning, babe. Coffee first, then shoulders with opinions.",
  "Rise and train. The tank tops are counting on you.",
  "Good morning. Your delts have appointments."
 ],
 afternoon:[
  "Afternoon, gorgeous. Plenty of daylight left to become inconveniently attractive.",
  "The day is half gone. Your pump does not have to be.",
  "Afternoon check. Move something heavy, then act casual.",
  "Still time to make today's shirt fit differently."
 ],
 evening:[
  "Evening plans? Apparently becoming hotter counts.",
  "Finish the day strong. The mirror can debrief you later.",
  "Prime time for weights and questionable confidence.",
  "The sun is going down. Your standards remain offensively high."
 ],
 late:[
  "It is late. Put the phone down and let the ass regenerate.",
  "Still awake? Recovery is part of the plot.",
  "Bedtime, gorgeous. Muscles cannot grow on screen time alone.",
  "The gym will still exist tomorrow. Your sleep schedule may not."
 ],
 beginner:[
  "Technique first. Main character arc later.",
  "Light weight, clean reps. We are building lore.",
  "No ego required. Suspiciously mature behavior.",
  "Learn the movement first. The dramatic weights can arrive later."
 ],
 exerciseDone:[
  "She survived.",
  "Exercise done. Gorgeous.",
  "One less thing between you and the pump.",
  "Handled. Next.",
  "Clean work. Try not to make it your whole personality."
 ],
 extraSet:[
  "Another set? Okay babe, we get it.",
  "Bonus set. Somebody wants attention.",
  "One more set has entered the chat."
 ]
};
function voicePick(pool,key=''){
 if(!pool?.length)return '';
 const seed=String(key||isoToday()).split('').reduce((a,c)=>((a*31)+c.charCodeAt(0))>>>0,7);
 return pool[seed%pool.length];
}
const UNICORN_STATES={
 default:{key:'default',label:'GLITTER READY',image:'assets/unicorns_hd/unicorn_default.webp'},
 newWorkout:{key:'new-workout',label:'READY TO TRAIN',image:'assets/unicorns_hd/unicorn_workout_ready.webp'},
 activeWorkout:{key:'active-workout',label:'WORKOUT MODE',image:'assets/unicorns_hd/unicorn_workout_active.webp'},
 fed:{key:'fed',label:'FED & TRAINED',image:'assets/unicorns_hd/unicorn_fed.webp'},
 pr:{key:'pr',label:'NEW PB / PR',image:'assets/unicorns_hd/unicorn_pb.webp'},
 judging:{key:'judging',label:'JUDGING YOU',image:'assets/unicorns_hd/unicorn_judging.webp'},
 hungry:{key:'hungry',label:'LOW NUTRITION',image:'assets/unicorns_hd/unicorn_low_nutrition.webp'},
 calories:{key:'calories',label:'LOW CALORIES',image:'assets/unicorns_hd/unicorn_low_calories.webp'},
 protein:{key:'protein',label:'LOW PROTEIN',image:'assets/unicorns_hd/unicorn_low_protein.webp'},
 streak:{key:'streak',label:'STREAK MODE',image:'assets/unicorns_hd/unicorn_streak.webp'},
 rest:{key:'rest',label:'REST DAY',image:'assets/unicorns_hd/unicorn_rest_day.webp'},
 morning:{key:'morning',label:'MORNING MODE',image:'assets/unicorns_hd/unicorn_morning.webp'},
 afternoon:{key:'afternoon',label:'AFTERNOON MODE',image:'assets/unicorns_hd/unicorn_afternoon.webp'},
 evening:{key:'evening',label:'EVENING MODE',image:'assets/unicorns_hd/unicorn_evening.webp'},
 late:{key:'late',label:'LATE NIGHT SASS',image:'assets/unicorns_hd/unicorn_late_night.webp'},
 nightOut:{key:'night-out',label:'NIGHT OUT',image:'assets/unicorns_hd/unicorn_night_out.webp'}
};
function unicornWithSass(base,sass){return {...base,sass}}
function latestPrMoment(st){const session=st.sessions.find(s=>(s.prs||[]).length)||st.session;return Number(session?.finishedAt||session?.startedAt||0)}
function unicornNutritionLine(st){
 const nut=st.nutrition,kcalLeft=Math.max(0,Math.round((data.profile.calorieTarget||0)-nut.kcal)),proteinLeft=Math.max(0,Math.round((data.profile.proteinTarget||0)-nut.protein));
 if(nut.kcalRatio<.70&&nut.proteinRatio<.70)return {state:UNICORN_STATES.hungry,text:st.pr?`The PB was cute. Now feed the muscles that made it happen. ${kcalLeft} kcal and ${proteinLeft} g protein left.`:`${kcalLeft} kcal and ${proteinLeft} g protein left. Your muscles have filed a formal request for dinner.`};
 if(nut.kcalRatio<.70)return {state:UNICORN_STATES.calories,text:st.pr?`You broke the record. Now carbs have a job to do. ${kcalLeft} kcal left.`:`Protein survived. Your calories did not. ${kcalLeft} kcal left, gorgeous.`};
 return {state:UNICORN_STATES.protein,text:st.pr?`PB celebrated. Now give it building materials: ${proteinLeft} g protein left.`:`${proteinLeft} g protein left. That number is looking deeply unserious.`};
}
function chooseUnicornCandidate(candidates,date){
 const slot=Math.floor(Date.now()/(45*60000)),brain=data.unicornBrain||{};
 if(brain.date===date&&brain.slot===slot&&brain.topic){const same=candidates.find(c=>c.topic===brain.topic);if(same)return same}
 const recent=brain.date===date?(brain.recent||[]):[];
 candidates.forEach(c=>{if(recent.includes(c.topic))c.score-=c.topic==='pr'?110:34});candidates.sort((a,b)=>b.score-a.score);
 const chosen=candidates[0];data.unicornBrain={date,slot,topic:chosen.topic,recent:[...recent.filter(x=>x!==chosen.topic),chosen.topic].slice(-4)};save();return chosen;
}
function unicornState(){
 const st=todayState(),nut=st.nutrition,night=nightOutState();
 if(night&&night.date===isoToday())return unicornWithSass(UNICORN_STATES.nightOut,night.partyLine||"Night Out active. The macros have entered witness protection.");
 if(st.active)return unicornWithSass(UNICORN_STATES.activeWorkout,voicePick(st.active.beginner?GAYM_VOICE.beginner:GAYM_VOICE.active,`active-${st.active.id}-${isoToday()}`));
 const candidates=[],add=(topic,score,state,text)=>candidates.push({topic,score,state,text});
 const late=st.hour>=22||st.hour<5,dayProgress=st.hour<5?1:Math.min(1,Math.max(.15,(st.hour-7)/15));
 if(st.pr){const exercise=st.pr.exercise||st.pr.name||'that lift',weight=st.pr.weight?` ${st.pr.weight} kg${st.pr.reps?` × ${st.pr.reps}`:''}.`:'';const moment=latestPrMoment(st),age=moment?Date.now()-moment:Infinity;if(age<2*60*60000)add('pr',age<30*60000?125:88,UNICORN_STATES.pr,`NEW PB · ${exercise}!${weight} ${voicePick(GAYM_VOICE.pr,`pr-${exercise}-${st.pr.weight}-${st.pr.reps}`)}`)}
 if(st.sessions.length>1){const cardio=st.sessions.filter(s=>s.type==='cardio').length,strength=st.sessions.length-cardio,mix=cardio&&strength?`${strength} strength + ${cardio} cardio`:`${st.sessions.length} workouts`;add('multi',78,UNICORN_STATES.activeWorkout,`${mix} today. ${voicePick(GAYM_VOICE.multi,`multi-${isoToday()}-${st.sessions.length}`)}`)}
 if(st.pendingPlanned)add('planned',82,UNICORN_STATES.newWorkout,`${st.session?.name||'One workout'} logged. ${st.pendingPlanned.name||'Your planned workout'} is still waiting. Ambitious. Concerning. Hot.`);else if(st.planned&&!st.rest&&!st.session)add('planned',54+(st.hour>=17?20:0),UNICORN_STATES.newWorkout,`${st.planned.name||'Workout'} is waiting. The weights are being very brave about it.`);
 if(st.session){if(nut.kcalRatio>=.88&&nut.proteinRatio>=.88)add('fed',70,UNICORN_STATES.fed,voicePick(GAYM_VOICE.fed,`fed-${isoToday()}`));else add('trained',58,UNICORN_STATES.activeWorkout,voicePick(GAYM_VOICE.trained,`trained-${isoToday()}-${st.session.id}`))}
 if(st.rest)add('rest',78,UNICORN_STATES.rest,late?'Rest day nearly complete. You lifted nothing but standards. Now go to bed.':voicePick(GAYM_VOICE.rest,`rest-${isoToday()}`));
 if(st.gap!==null&&st.gap>=4)add('gap',66+(st.gap*2),UNICORN_STATES.judging,`${st.gap} days without training. ${voicePick(GAYM_VOICE.gap,`gap-${isoToday()}`)}`);
 const nutritionBehind=(nut.kcalRatio<Math.max(.45,dayProgress-.18)||nut.proteinRatio<Math.max(.45,dayProgress-.18))&&(st.hour>=12||late);
 if(nutritionBehind){const line=unicornNutritionLine(st);add('nutrition',60+Math.round(dayProgress*38)+(late?18:0)+(st.session?10:0),line.state,late?`It is nearly bedtime and the nutrition math is still not mathing. ${line.text}`:line.text)}
 if(st.streak>=3)add('streak',52+Math.min(22,st.streak*2),UNICORN_STATES.streak,st.session?`${st.streak} days showing up. That's not motivation anymore, babe. That's a habit.`:`${st.streak} day streak. ${voicePick(GAYM_VOICE.streak,`streak-${isoToday()}`)}`);
 if(late)add('late',72+(st.hour>=23||st.hour<5?12:0),UNICORN_STATES.late,st.session&&nut.kcalRatio>=.85&&nut.proteinRatio>=.85?`It is late. Gym done, food handled. You may now become horizontal.`:voicePick(GAYM_VOICE.late,`late-${isoToday()}`));else if(st.hour<10)add('time',42,UNICORN_STATES.morning,voicePick(GAYM_VOICE.morning,`morning-${isoToday()}`));else if(st.hour<17)add('time',38,UNICORN_STATES.afternoon,voicePick(GAYM_VOICE.afternoon,`afternoon-${isoToday()}`));else add('time',46,UNICORN_STATES.evening,voicePick(GAYM_VOICE.evening,`evening-${isoToday()}`));
 const chosen=chooseUnicornCandidate(candidates,st.date);return unicornWithSass(chosen.state,chosen.text);
}
function unicornPersonalityLevel(){const n=(data.sessions||[]).length,prs=(data.sessions||[]).reduce((a,s)=>a+(s.prs?.length||0),0);if(n>=100||prs>=20)return 'ICON';if(n>=50||prs>=10)return 'MENACE';if(n>=15||prs>=3)return 'REGULAR';return 'BABY GAYM'}
function unicornMood(){const u=unicornState();return {mood:u.key,label:u.label,image:u.image,sass:u.sass}}
function renderHomeUnicorn(){
 const u=unicornState();
 const night=nightOutState(),party=night&&night.date===isoToday();return `<div class="hero-art hero-art-full ${u.key} ${party?'party-active':''}" aria-hidden="true"><img class="hero-mascot hero-mascot-full" src="${u.image}" alt=""><div class="hero-image-shade"></div><div class="unicorn-copy-panel"><div class="unicorn-speech unicorn-speech-overlay">${escapeHtml(u.sass)}</div><span class="mascot-state-label">${escapeHtml(u.label)} · ${unicornPersonalityLevel()}</span></div></div>`;
}
function weekDays(offset=0){let start=new Date();start.setHours(12,0,0,0);start.setDate(start.getDate()-((start.getDay()+6)%7)+(offset*7));return Array.from({length:7},(_,i)=>{let d=new Date(start);d.setDate(start.getDate()+i);return d})}
let planWeekOffset=0;
function thisWeekSessions(){const days=weekDays().map(isoToday);return data.sessions.filter(s=>days.includes(s.date))}
function homeWorkoutState(){
 const st=todayState();
 if(st.active)return {kind:'active',name:st.active.name,type:st.active.type||'strength',active:true,items:st.active.items||[],startedAt:st.active.startedAt,workoutId:st.active.workoutId||'',session:st.active,sessions:st.sessions};
 let pending=null;
 if(st.pendingPlanned){const workout=(data.customWorkouts||[]).find(w=>w.id===st.pendingPlanned.workoutId);if(workout)pending={kind:'planned',...st.pendingPlanned,name:workout.name,type:workout.type||'strength',planned:true}}
 if(st.sessions.length)return {kind:'day',completed:true,sessions:st.sessions,pending,rest:st.rest};
 if(st.rest)return {kind:'rest',...st.planned,planned:true,sessions:[]};
 if(pending)return {...pending,sessions:[]};
 return null;
}
function sessionHomeMeta(s){
 const prs=s.prs?.length||0;
 if(s.type==='cardio'){const derived=s.derived||cardioDerivedMeta(s.mode||s.name,s.durationMin,s.distance);return `${s.durationMin||0} min${s.distance?` · ${s.distance} km`:''}${derived?` · ${derived}`:''}${s.intensity?` · ${s.intensity}`:''}`;}
 return `${s.durationMin||0} min · ${s.doneSets||0}/${s.totalSets||0} sets${prs?` · ${prs} PB${prs===1?'':'s'}`:''}`;
}
function completedHomeMarkup(today){
 const sessions=today.sessions||[];
 const count=sessions.length,totalMin=sessions.reduce((n,s)=>n+(Number(s.durationMin)||0),0);
 const rows=sessions.map(s=>`<button class="home-session-row" data-home-session="${escapeHtml(s.id)}"><span class="home-session-icon ${s.type==='cardio'?'cardio':''}">${s.type==='cardio'?'C':'✓'}</span><span class="grow"><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(sessionHomeMeta(s))}</small></span><span class="chev">›</span></button>`).join('');
 const pending=today.pending?`<div class="home-next-workout"><div><span class="eyebrow">UP NEXT</span><strong>${escapeHtml(today.pending.name)}</strong><small>${escapeHtml(today.pending.type||'strength')}</small></div><button class="primary compact" id="home-start">START</button></div>`:`<button class="secondary home-add-workout" id="home-start">+ START ANOTHER WORKOUT</button>`;
 return `<span class="eyebrow completed-label">TODAY'S TRAINING</span><div class="home-day-title"><h2 class="hero-title">${count} ${count===1?'workout':'workouts'} complete</h2><span>${totalMin} min total</span></div><div class="home-session-list">${rows}</div>${pending}`;
}
function weightHistory(){
 const byDate=new Map();
 (data.measurements||[]).filter(Boolean).forEach((m,i)=>{const weight=Number(m.weight);if(!m.date||!Number.isFinite(weight)||weight<=0)return;byDate.set(String(m.date),{date:String(m.date),weight,index:i})});
 const current=Number(data.profile.weight);
 if(Number.isFinite(current)&&current>0){const today=isoToday(),existing=byDate.get(today);byDate.set(today,{date:today,weight:current,index:existing?.index??Number.MAX_SAFE_INTEGER})}
 return [...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.index-b.index);
}
function weightTrendSummary(){
 const history=weightHistory(),current=Number(data.profile.weight)||history.at(-1)?.weight||70,first=history[0]?.weight??current,change=current-first;
 return {history,current,first,change};
}
function weightSparklineMarkup(){
 const {history,current}=weightTrendSummary();
 const points=history.length?history:[{date:isoToday(),weight:current}];
 if(points.length===1)return `<svg class="spark weight-spark" viewBox="0 0 120 26" aria-label="Weight trend"><line class="weight-flat" x1="0" y1="13" x2="120" y2="13"/><circle class="weight-dot" cx="120" cy="13" r="2.4"/></svg>`;
 const weights=points.map(x=>x.weight),min=Math.min(...weights),max=Math.max(...weights),rawRange=max-min,pad=Math.max(.25,rawRange*.18),lo=min-pad,hi=max+pad,range=Math.max(.5,hi-lo),n=points.length;
 const coords=points.map((x,i)=>{const px=n===1?60:i*(120/(n-1)),py=23-((x.weight-lo)/range)*20;return `${px.toFixed(1)},${py.toFixed(1)}`}).join(' ');
 const last=coords.split(' ').at(-1).split(',');
 return `<svg class="spark weight-spark" viewBox="0 0 120 26" aria-label="Weight trend"><polyline points="${coords}"/><circle class="weight-dot" cx="${last[0]}" cy="${last[1]}" r="2.4"/></svg>`;
}
function refreshUnderlyingView(){render()}
function home(){const today=homeWorkoutState();const week=thisWeekSessions();const min=week.reduce((a,s)=>a+(s.durationMin||0),0);const foods=data.nutrition.filter(n=>n.date===isoToday());const kcal=foods.reduce((a,n)=>a+(+n.kcal||0),0),prot=foods.reduce((a,n)=>a+(+n.protein||0),0);const weightTrend=weightTrendSummary(),latest=weightTrend.current,diff=weightTrend.change.toFixed(1);const days=weekDays();
 let heroBody='';
 if(today?.completed)heroBody=completedHomeMarkup(today);
 else if(today)heroBody=`<span class="eyebrow" style="color:var(--cyan)">${today.active?'Workout in progress':today.type||'Training'}</span><h2 class="hero-title">${escapeHtml(today.name)}</h2><div class="meta">${today.active?`${today.items?.length||0} exercises · started ${new Date(today.startedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`:'Ready when you are.'}</div><div class="stats-row"><span class="stat-pill">${today.type||'strength'}</span>${today.active?'<span class="stat-pill">Autosaved</span>':''}</div><button class="primary" id="home-start">${today.active?'CONTINUE WORKOUT':today.type==='rest'?'VIEW REST DAY':'START WORKOUT'}</button>`;
 else heroBody=`<span class="eyebrow" style="color:var(--cyan)">TODAY</span><h2 class="hero-title">No plans today</h2><div class="meta">Your calendar is clear. Train if you want to, gorgeous.</div><div class="stats-row"><span class="stat-pill">Choose your workout</span></div><button class="primary" id="home-start">START WORKOUT</button>`;
 shell(`${header()}<section class="home-intro ${prideModeActive()?'pride-mode':''}"><p class="eyebrow">${fmtDate(new Date())}</p><div class="daily-brief"><span class="daily-brief-kicker">DAILY GAYM CHECK-IN</span><p class="greeting">${escapeHtml(homeSass())}</p><span class="daily-brief-rule"></span></div></section><section class="section"><p class="eyebrow">Today's workout</p><article class="card hero-card">${renderHomeUnicorn()}${nightOutHomeMarkup()}<div class="hero-content">${heroBody}</div></article></section>
 <section class="section coach-home-section">${coachMarkup()}</section>
 <section class="section bottom-home-section">${bottomHomeMarkup()}</section>
 <section class="section"><div class="section-head"><h2>This week</h2><button class="text-btn" data-home-plan>VIEW PLAN</button></div><article class="card week-card"><div class="week-summary"><span>${week.length} workouts · ${Math.floor(min/60)}h ${min%60}m</span><span>${week.reduce((a,s)=>a+(s.durationMin||0),0)} min</span></div><div class="week-days">${days.map(d=>{const done=data.sessions.some(s=>s.date===isoToday(d));return `<div class="day ${done?'done':''} ${isoToday(d)===isoToday()?'today':''}"><span>${d.toLocaleDateString('en',{weekday:'short'}).slice(0,2)}</span><span class="day-dot">${done?'✓':d.getDate()}</span></div>`}).join('')}</div></article></section>
 <section class="section"><div class="quick-grid"><button class="card quick-card" data-home-nutrition style="text-align:left"><div style="display:flex;justify-content:space-between"><span class="quick-label">NUTRITION</span><span class="ring" style="--p:${Math.min(100,kcal/data.profile.calorieTarget*100)}"></span></div><div><div class="quick-value">${kcal.toLocaleString()} <small style="font-size:11px;color:var(--muted)">kcal</small></div><div class="quick-sub">${Math.round(prot)} / ${data.profile.proteinTarget} g protein</div></div></button><button class="card quick-card" data-home-progress style="text-align:left"><span class="quick-label">PROGRESS</span><div><div class="quick-value">${latest.toFixed?latest.toFixed(1):latest} <small style="font-size:11px;color:var(--muted)">kg</small></div><div class="quick-sub">${+diff>=0?'+':''}${diff} kg logged change</div>${weightSparklineMarkup()}</div></button></div></section>`);
 const homeStart=$('#home-start');if(homeStart)homeStart.onclick=()=>{if(data.activeSession)return go('active');if(today?.kind==='day'&&today.pending?.workoutId)return startWorkout(today.pending.workoutId);if(today?.kind==='day')return go('workout');if(today?.type==='rest')return go('plan');if(today?.workoutId)return startWorkout(today.workoutId);go('workout')};$$('[data-home-session]').forEach(b=>b.onclick=()=>openSessionDetail(b.dataset.homeSession));$('[data-home-plan]').onclick=()=>go('plan');$('[data-home-nutrition]').onclick=()=>go('nutrition');$('[data-home-progress]').onclick=()=>go('progress');const cw=$('#coach-why');if(cw)cw.onclick=openCoachWhy;const bc=$('#bottom-check');if(bc)bc.onclick=openBottomCheck;const no=$('#night-out-home');if(no)no.onclick=()=>{const s=nightOutState(),today=isoToday();if(s?.date===today)return showNightOutParty();if(s?.date===yesterdayKey()&&s.lastPromptDate!==today)return openLastNight();showNightOutConfirm()};}
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
 if(workoutType==='cardio'){openLogCardio({activity:day.mode||'Cardio',duration:day.duration||'',distance:day.distance||'',notes:`${program.name} program`,program:program.name,programDay:day.id,workoutId:`${program.key}-day-${day.id}`});return;}

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
  $$('[data-program-ex-sets]').forEach(inp=>inp.oninput=()=>items[+inp.dataset.programExSets].sets=Math.max(1,+inp.value||1));
  $$('[data-program-ex-reps]').forEach(inp=>inp.oninput=()=>items[+inp.dataset.programExReps].reps=inp.value);
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
const GROUP_CLASS_CATALOG=[
 ['ABSolution','Core'],['Aroma Relax','Yoga'],['Ashtanga Beginner','Yoga'],['Ashtanga Mysore','Yoga'],['Ashtanga Primary Half Led','Yoga'],['Ashtanga Primary Led','Yoga'],['Ashtanga Yoga','Yoga'],['Barre & Pilates','Pilates'],['BODYBALANCE™','Pilates / Yoga'],['BODYCOMBAT™','Cardio / Boxing'],['BODYJAM™','Dance / Cardio'],['BODYPUMP™','Strength'],['Bootylicious','Strength'],['Box','Boxing'],['Breathing for Stress Relief','Stress relief'],['Cardio Combat','Cardio / Boxing'],['Cardio Dance','Dance / Cardio'],['Cardio Energy','Cardio'],['Cardio Energy – no jumping','Cardio'],['Cardio Event','Cardio'],['Cardio Step','Cardio / Step'],['Cardio Step & Strength','Cardio / Strength'],['Core','Strength / Core'],['Crosstraining','Strength / HIIT'],['Cycling','Cycling'],['Cycling Event','Cycling'],['Cycling FTP Test','Cycling'],['Cycling HIIT','Cycling / HIIT'],['Cycling Interval','Cycling / Cardio'],['Cycling Rhythm Ride','Cycling / Cardio'],['Cycling The Journey','Cycling / Cardio'],['Dance Aerobic','Dance'],['Dance Event','Dance'],['Dance Step','Dance / Step'],['Dancehall','Dance'],['Deep Rest','Yoga / Stress relief'],['Flexibility','Flexibility'],['Forrest Yoga','Yoga'],['Gentle Flow Yoga','Yoga'],['Gentle Vinyasa Yoga','Yoga'],['Group Training Mix','Event'],['Hatha Yoga','Yoga'],['HIIT Circuit','HIIT'],['HIIT Run & Box','HIIT / Boxing'],['HIIT Run & Lift','HIIT / Strength'],['HIIT Zone Event','HIIT / Event'],['Hot 26+2','Hot / Yoga'],['Hot ABSolution','Hot / Core'],['Hot Aroma Relax','Hot / Yoga'],['Hot BODYBALANCE™','Hot / Pilates'],['Hot Flexibility','Hot / Flexibility'],['Hot Gentle Flow Yoga','Hot / Yoga'],['Hot Gentle Vinyasa Yoga','Hot / Yoga'],['Hot Hatha Yoga','Hot / Yoga'],['Hot Pilates','Hot / Pilates'],['Hot Pilates HIIT','Hot / Pilates / HIIT'],['Hot Power Pilates','Hot / Pilates'],['Hot Tabata','Hot / HIIT'],['Hot Vinyasa Yoga','Hot / Yoga'],['Hot Yin Yoga','Hot / Yoga'],['Hot Yoga for Athletes','Hot / Yoga'],['Indoor Running','Running / Cardio'],['Performance HIIT','Performance / HIIT'],['Performance Hyrox','Performance'],['Performance Load & HIIT','Performance / Strength'],['Pilates','Pilates'],['Pilates HIIT','Pilates / HIIT'],['Power Pilates','Pilates'],['Power Step','Cardio / Step'],['Pure Strength','Strength'],['Pure Strength Upper Body','Strength'],['Reformer HIIT','Reformer / HIIT'],['Reformer Introduction','Reformer'],['Reformer Pilates','Reformer / Pilates'],['Reformer Strength','Reformer / Strength'],['Senior Cardio & Strength','Senior'],['Senior Crosstraining','Senior'],['Senior Strength','Senior'],['Shape Up','Strength / Cardio'],['Strong Mama','Mama'],['Tabata','HIIT'],['Vinyasa Yoga','Yoga'],['Yin Yoga','Yoga'],['Zumba','Dance / Cardio']
].map(([name,category])=>({name,category}));
function openGroupClassLogger(){
 const cats=['All',...new Set(GROUP_CLASS_CATALOG.map(x=>x.category.split(' / ')[0]))];
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Group class</p><h2>Log a class</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">SATS-inspired class catalog. Pick a class or type your own, then log what you actually did.</p><div class="inline-fields group-log-top"><div class="field"><label>Date</label><input id="group-date" type="date" max="${isoToday()}" value="${isoToday()}"></div><div class="field"><label>Duration</label><input id="group-duration" type="number" min="1" max="300" value="45"><small class="field-help">minutes</small></div></div><div class="field"><label>Find class</label><input id="group-search" placeholder="Cycling, Pilates, HIIT…"></div><div class="field"><label>Category</label><select id="group-category">${cats.map(c=>`<option>${escapeHtml(c)}</option>`).join('')}</select></div><div class="group-class-results" id="group-class-results"></div><div class="field"><label>Class name</label><input id="group-name" maxlength="100" placeholder="Choose above or write your own"></div><div class="inline-fields"><div class="field"><label>Gym / center</label><input id="group-center" maxlength="100" placeholder="e.g. SATS Storo"></div><div class="field"><label>Instructor</label><input id="group-instructor" maxlength="100" placeholder="Optional"></div></div><div class="field"><label>Intensity</label><select id="group-intensity"><option value="1">1 · Easy</option><option value="2">2 · Light</option><option value="3" selected>3 · Moderate</option><option value="4">4 · Hard</option><option value="5">5 · Very hard</option></select></div><div class="field"><label>What did you do?</label><textarea id="group-notes" maxlength="1000" rows="4" placeholder="Intervals, exercises, how it felt, modifications…"></textarea></div><div class="sheet-actions"><button class="primary" id="save-group-class">SAVE CLASS</button></div>`);
 let selectedCategory='';function paint(){const q=$('#group-search').value.trim().toLowerCase(),cat=$('#group-category').value;const rows=GROUP_CLASS_CATALOG.filter(x=>(cat==='All'||x.category.startsWith(cat))&&(!q||`${x.name} ${x.category}`.toLowerCase().includes(q))).slice(0,40);$('#group-class-results').innerHTML=rows.map(x=>`<button type="button" class="group-class-choice" data-group-class="${escapeHtml(x.name)}" data-group-category="${escapeHtml(x.category)}"><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.category)}</small></button>`).join('')||'<div class="empty">No matching class. You can still type the class name below.</div>';$$('[data-group-class]').forEach(b=>b.onclick=()=>{$('#group-name').value=b.dataset.groupClass;selectedCategory=b.dataset.groupCategory;$$('[data-group-class]').forEach(x=>x.classList.toggle('active',x===b))})}
 $('#group-search').oninput=paint;$('#group-category').onchange=paint;paint();
 $('#save-group-class').onclick=async()=>{const name=$('#group-name').value.trim();if(!name)return toast('Choose or enter a class name.');const date=$('#group-date').value;if(!date||date>isoToday())return toast('Choose a valid date.');const durationMin=Math.max(1,Math.min(300,Number($('#group-duration').value)||45)),startedAt=new Date(`${date}T12:00:00`).getTime(),session={id:uid(),name,type:'group',date,durationMin,groupClass:name,groupCategory:selectedCategory||$('#group-category').value.replace('All','Other'),groupCenter:$('#group-center').value.trim(),groupInstructor:$('#group-instructor').value.trim(),intensity:Number($('#group-intensity').value)||3,notes:$('#group-notes').value.trim(),items:[],doneSets:0,totalSets:0,startedAt,finishedAt:startedAt+durationMin*60000,completed:true,manualEntry:true};data.sessions.push(session);save();await syncRecentActivitiesFromLocal(activeDataUserId);closeSheet();render();toast('Group class logged. Social cardio, but make it scheduled.')};
}
function workout(){
 const customPrograms=data.customPrograms||[];
 const recovery=muscleRecovery();
 shell(`${header()}<h1 class="page-title">Workout</h1><div class="tabs workout-mode-tabs"><button class="tab active">MY TRAINING</button><button class="tab" id="workout-beginner-tab">BEGINNER</button></div><p class="subtle">Strength lives here. Log cardio results in seconds, or jump into a GAYM program.</p>${recovery.length?`<section class="section recovery-strip"><div class="section-head"><h2>Last trained</h2><span class="eyebrow">RECOVERY SNAPSHOT</span></div><div class="recovery-chips">${recovery.map(r=>`<span class="recovery-chip ${r.days===0?'today':''}"><strong>${escapeHtml(r.muscle)}</strong><small>${r.days===0?'today':r.days===1?'1 day ago':`${r.days} days ago`}</small></span>`).join('')}</div></section>`:''}
 <section class="section"><p class="eyebrow">Choose workout type</p><div class="builder-type-grid"><button class="type-card active" data-type="strength">${icons.workout}<strong>Strength</strong><small>Sets, reps & weight</small></button><button class="type-card cardio-log-card" id="log-cardio"><span style="font-size:23px;color:var(--cyan)">↗</span><strong>Log cardio</strong><small>Time, distance & intensity</small></button><button class="type-card group-log-card" id="log-group-class"><span class="group-class-mark">G</span><strong>Group class</strong><small>Class, time & what you did</small></button><button class="type-card" data-type="rehab"><span style="font-size:21px;color:var(--lime);font-weight:900">R</span><strong>Rehab</strong><small>Controlled sets & notes</small></button></div></section>
 <section class="section"><p class="eyebrow">Ready-made programs</p><div class="builder-type-grid program-type-grid"><button class="type-card kai-type-card" data-program="kai"><span class="kai-mark">K</span><strong>Kai</strong><small>Ready-made 5-day split</small></button><button class="type-card raymond-type-card" data-program="raymond"><span class="raymond-mark">R</span><strong>Raymond’s Big Gay Arms</strong><small>Biceps, triceps & sleeve problems</small></button><button class="type-card jocke-type-card" data-program="jocke"><span class="jocke-mark">J</span><strong>Jocke</strong><small>Push · Pull · Legs · Upper · Lower + Arms</small></button></div></section>
 <section class="section"><div class="section-head"><div><p class="eyebrow">Your programs</p><h2>Custom Programs</h2></div><button class="text-btn" id="new-program">+ CREATE</button></div><div class="custom-program-grid">${customPrograms.length?customPrograms.map(p=>`<button class="type-card custom-program-card" data-custom-program="${p.id}"><span class="custom-program-mark">P</span><strong>${escapeHtml(p.name)}</strong><small>${p.days?.length||0} days · Your plan</small></button>`).join(''):`<button class="type-card create-program-card" id="empty-program-create"><span class="custom-program-mark">+</span><strong>Create your program</strong><small>Plan strength, rehab & rest day by day</small></button>`}</div></section>
 <section class="section"><div class="section-head"><h2>Your workouts</h2><button class="text-btn" id="new-workout">+ NEW</button></div><div class="tabs" id="workout-tabs"><button class="tab active" data-filter="all">All</button><button class="tab" data-filter="strength">Strength</button><button class="tab" data-filter="rehab">Rehab</button>${data.customWorkouts.some(w=>w.type==='cardio')?'<button class="tab" data-filter="cardio">Cardio</button>':''}</div><div class="list" id="workout-list" style="margin-top:11px"></div></section>`);
 const beginnerTab=$('#workout-beginner-tab');if(beginnerTab)beginnerTab.onclick=beginnerWorkout;
 let chosen='strength',filter='all';
 function paint(){
  const arr=data.customWorkouts.filter(w=>filter==='all'||w.type===filter);
  $('#workout-list').innerHTML=arr.length?arr.map(w=>`<button class="list-card" style="width:100%;color:inherit;text-align:left" data-workout-id="${w.id}"><span class="badge-icon ${w.type==='cardio'?'cardio':w.type==='rehab'?'rehab':''}">${w.type==='cardio'?'↗':w.type==='rehab'?'R':'S'}</span><span class="grow"><h3>${escapeHtml(w.name)}</h3><p>${w.type==='cardio'?(w.duration||30)+' min':(w.items?.length||0)+' exercises'} · Custom workout</p></span><span class="chev">›</span></button>`).join(''):`<div class="empty"><strong>No ${filter==='all'?'custom':filter} workouts yet</strong>Tap “New” to build one from scratch.</div>`;
  $$('[data-workout-id]').forEach(b=>b.onclick=()=>openWorkoutSheet(b.dataset.workoutId))
 }
 paint();
 $$('[data-type]').forEach(b=>b.onclick=()=>{chosen=b.dataset.type;$$('[data-type]').forEach(x=>x.classList.toggle('active',x===b));openBuilder(chosen)});const logCardioBtn=$('#log-cardio');if(logCardioBtn)logCardioBtn.onclick=()=>openLogCardio();const logGroupBtn=$('#log-group-class');if(logGroupBtn)logGroupBtn.onclick=openGroupClassLogger;
 $$('[data-program]').forEach(b=>b.onclick=()=>openReadyProgram(b.dataset.program));
 $$('[data-custom-program]').forEach(b=>b.onclick=()=>openCustomProgramMenu(b.dataset.customProgram));
 $('#new-program').onclick=()=>openProgramBuilder();
 if($('#empty-program-create'))$('#empty-program-create').onclick=()=>openProgramBuilder();
 $('#new-workout').onclick=()=>openBuilder(chosen);
 $$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;$$('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));paint()});
}


const BEGINNER_EXERCISES={
 'barbell-back-squat':{
  name:'Barbell Back Squat',muscle:'Quads / glutes / adductors',equipment:'Barbell + plates',pattern:'squat',sets:3,reps:'8-12',
  setup:['Rest the bar securely across your upper back, not directly on the neck.','Start around shoulder-width with the whole foot planted.','Take a breath and brace your trunk before you descend.'],
  move:['Sit down and slightly back while bending the knees.','Let the knees follow the direction of your toes.','Descend only as far as you can control, then stand up with hips and chest rising together.'],
  feel:'Mainly the front of the thighs and glutes. Your trunk works to keep you stable.',
  mistakes:['Bar resting directly on the neck','Heels lifting or feet losing contact','Knees collapsing inward','Rounding the lower back or losing torso control'],
  easier:['goblet-squat','dumbbell-squat'],alternatives:['bulgarian-split-squat','reverse-lunge'],
  note:'No rack? Only use a load you can get into and out of position safely.'
 },
 'goblet-squat':{
  name:'Goblet Squat',muscle:'Quads / glutes',equipment:'Dumbbell',pattern:'squat',sets:3,reps:'8-12',
  setup:['Hold one dumbbell close to your chest.','Stand about shoulder-width with your whole foot planted.','Brace your trunk and keep the weight close.'],
  move:['Lower under control by bending hips and knees.','Keep knees tracking with your toes.','Stand back up without bouncing out of the bottom.'],
  feel:'Front of the thighs and glutes. You should feel stable through the whole foot.',
  mistakes:['Letting the weight drift away from the chest','Heels lifting','Knees collapsing inward'],
  easier:['dumbbell-squat'],alternatives:['barbell-back-squat','bulgarian-split-squat']
 },
 'dumbbell-squat':{
  name:'Dumbbell Squat',muscle:'Quads / glutes',equipment:'Dumbbells',pattern:'squat',sets:3,reps:'8-12',
  setup:['Hold the dumbbells comfortably at your sides.','Stand around shoulder-width.','Brace before each set.'],
  move:['Lower with control while keeping the whole foot down.','Let knees follow the toes.','Stand tall without rushing.'],
  feel:'Front thighs and glutes.',
  mistakes:['Rushing the bottom position','Heels lifting','Losing trunk control'],
  easier:[],alternatives:['goblet-squat','reverse-lunge']
 },
 'bulgarian-split-squat':{
  name:'Bulgarian Split Squat',muscle:'Quads / glutes',equipment:'Dumbbells + stable support',pattern:'lunge',sets:3,reps:'8-12 / leg',
  setup:['Place the rear foot on a low, stable support.','Set the front foot far enough forward that you can descend without losing balance.','Start bodyweight if the setup feels unfamiliar.'],
  move:['Lower the back knee toward the floor under control.','Keep the front foot planted and front knee following the toes.','Push through the front leg to return.'],
  feel:'Mostly the front thigh and glute of the working leg.',
  mistakes:['Using an unstable support','Front heel lifting','Dropping too quickly','Letting the front knee collapse inward'],
  easier:['reverse-lunge'],alternatives:['goblet-squat','barbell-back-squat']
 },
 'reverse-lunge':{
  name:'Reverse Lunge',muscle:'Quads / glutes',equipment:'Bodyweight or dumbbells',pattern:'lunge',sets:3,reps:'8-12 / leg',
  setup:['Stand tall with feet about hip-width apart.','Start without weight until the step feels stable.'],
  move:['Step one foot backward and lower under control.','Keep most of your balance through the front foot.','Push through the front leg to return to standing.'],
  feel:'Front-leg quads and glutes.',
  mistakes:['Taking too short a step','Losing balance by rushing','Front knee collapsing inward'],
  easier:[],alternatives:['bulgarian-split-squat','goblet-squat']
 },
 'barbell-rdl':{
  name:'Barbell Romanian Deadlift',muscle:'Hamstrings / glutes',equipment:'Barbell + plates',pattern:'hinge',sets:3,reps:'8-12',
  setup:['Stand about hip-width with the bar in front of your thighs.','Keep a small bend in the knees and brace your trunk.','Keep shoulders controlled and spine neutral.'],
  move:['Push the hips backward rather than squatting down.','Keep the bar close to your legs.','Stop when you feel a strong hamstring stretch while your back position stays controlled, then drive the hips forward to stand.'],
  feel:'A stretch and tension through the hamstrings, with the glutes working as you stand.',
  mistakes:['Rounding the lower back','Bending the knees so much it becomes a squat','Letting the bar drift away from the legs','Going lower after the back starts to round'],
  easier:['dumbbell-rdl'],alternatives:['glute-bridge']
 },
 'dumbbell-rdl':{
  name:'Dumbbell Romanian Deadlift',muscle:'Hamstrings / glutes',equipment:'Dumbbells',pattern:'hinge',sets:3,reps:'8-12',
  setup:['Stand hip-width holding the dumbbells close to your thighs.','Keep a slight knee bend and brace your trunk.'],
  move:['Push your hips backward and keep the dumbbells close to your legs.','Stop when the hamstrings feel stretched and your spine is still controlled.','Drive the hips forward to stand.'],
  feel:'Hamstrings during the lowering phase and glutes as you stand.',
  mistakes:['Turning it into a squat','Rounding the back','Using momentum'],
  easier:['glute-bridge'],alternatives:['barbell-rdl']
 },
 'glute-bridge':{
  name:'Glute Bridge',muscle:'Glutes / hamstrings',equipment:'Mat + optional weight',pattern:'bridge',sets:3,reps:'10-15',
  setup:['Lie on your back with knees bent and feet planted.','Place feet where you can keep them flat as the hips rise.'],
  move:['Brace lightly and squeeze the glutes to lift the hips.','Stop when your hips are extended without arching hard through the lower back.','Lower under control.'],
  feel:'Primarily the glutes; some hamstring work is normal.',
  mistakes:['Overarching the lower back','Pushing mainly from the toes','Bouncing through repetitions'],
  easier:[],alternatives:['dumbbell-rdl','barbell-rdl']
 },
 'dumbbell-floor-press':{
  name:'Dumbbell Floor Press',muscle:'Chest / triceps',equipment:'Dumbbells + mat',pattern:'press',sets:3,reps:'8-12',
  setup:['Lie on your back with knees bent and feet planted.','Hold dumbbells over the chest with wrists stacked over elbows.','Keep shoulders controlled against the floor.'],
  move:['Lower until the upper arms gently contact the floor.','Pause briefly rather than bouncing.','Press the dumbbells back up under control.'],
  feel:'Chest and triceps. The shoulders should feel stable rather than pinched.',
  mistakes:['Bouncing elbows off the floor','Wrists folding backward','Letting elbows flare aggressively'],
  easier:[],alternatives:['push-up','dumbbell-shoulder-press']
 },
 'push-up':{
  name:'Push-Up',muscle:'Chest / triceps / shoulders',equipment:'Bodyweight',pattern:'press',sets:3,reps:'6-12',
  setup:['Hands slightly wider than shoulder-width as a starting point.','Keep head, trunk and hips in one controlled line.','Use an elevated surface if floor push-ups are too difficult.'],
  move:['Lower the chest toward the floor while keeping the body controlled.','Press the floor away to return.'],
  feel:'Chest, triceps and front shoulders.',
  mistakes:['Hips sagging','Head reaching forward','Elbows flaring straight out'],
  easier:[],alternatives:['dumbbell-floor-press']
 },
 'one-arm-db-row':{
  name:'One-Arm Dumbbell Row',muscle:'Back / biceps',equipment:'Dumbbell + stable support',pattern:'row',sets:3,reps:'8-12 / arm',
  setup:['Support yourself with the free hand on something stable.','Keep the torso controlled and spine neutral.','Let the working arm hang naturally.'],
  move:['Pull the dumbbell toward the side of your torso.','Keep the shoulder away from the ear and avoid twisting the body.','Lower under control.'],
  feel:'Upper back and lat on the working side; biceps also assist.',
  mistakes:['Rotating the torso to lift the weight','Shrugging the shoulder','Jerking the dumbbell upward'],
  easier:[],alternatives:['barbell-row','two-arm-db-row']
 },
 'two-arm-db-row':{
  name:'Two-Arm Dumbbell Row',muscle:'Back / biceps',equipment:'Dumbbells',pattern:'row',sets:3,reps:'8-12',
  setup:['Hinge at the hips with a slight knee bend.','Brace and keep your spine controlled.','Let both dumbbells hang below the shoulders.'],
  move:['Pull both dumbbells toward your torso.','Keep elbows controlled and shoulders away from ears.','Lower without losing the hinge.'],
  feel:'Upper back and lats; biceps assist.',
  mistakes:['Standing up between reps','Rounding the back','Using momentum'],
  easier:['one-arm-db-row'],alternatives:['barbell-row']
 },
 'barbell-row':{
  name:'Bent-Over Barbell Row',muscle:'Back / biceps',equipment:'Barbell + plates',pattern:'row',sets:3,reps:'8-12',
  setup:['Stand with feet about hip-width and hinge at the hips.','Keep a slight knee bend, brace your trunk and hold the bar with control.'],
  move:['Pull the bar toward the lower ribs/upper abdomen.','Avoid using the hips to throw the bar upward.','Lower under control while maintaining your torso position.'],
  feel:'Upper back and lats, with biceps helping.',
  mistakes:['Rounding the back','Jerking with the hips','Shrugging toward the ears'],
  easier:['one-arm-db-row'],alternatives:['two-arm-db-row']
 },
 'dumbbell-shoulder-press':{
  name:'Dumbbell Shoulder Press',muscle:'Shoulders / triceps',equipment:'Dumbbells',pattern:'overhead',sets:3,reps:'8-12',
  setup:['Stand or sit tall with dumbbells around shoulder height.','Brace your trunk and keep wrists stacked over forearms.'],
  move:['Press overhead under control.','Finish with arms overhead without aggressively arching the lower back.','Lower back to shoulder level.'],
  feel:'Shoulders and triceps.',
  mistakes:['Overarching the lower back','Using leg drive when the goal is a strict press','Wrists folding backward'],
  easier:[],alternatives:['dumbbell-floor-press']
 },
 'lateral-raise':{
  name:'Dumbbell Lateral Raise',muscle:'Shoulders / side delts',equipment:'Dumbbells',pattern:'raise',sets:2,reps:'12-15',
  setup:['Stand tall with light dumbbells at your sides.','Keep elbows softly bent and shoulders relaxed.'],
  move:['Raise the arms out to the sides under control.','Stop around shoulder height or earlier if that feels better.','Lower slowly.'],
  feel:'The outside of the shoulders.',
  mistakes:['Shrugging','Swinging the weights','Choosing a weight that forces momentum'],
  easier:[],alternatives:['dumbbell-shoulder-press']
 },
 'dumbbell-curl':{
  name:'Dumbbell Curl',muscle:'Biceps',equipment:'Dumbbells',pattern:'curl',sets:2,reps:'10-15',
  setup:['Stand tall with arms by your sides.','Keep elbows close to the torso.'],
  move:['Bend the elbows to curl the dumbbells upward.','Keep the upper arms mostly still.','Lower under control.'],
  feel:'Front of the upper arms.',
  mistakes:['Swinging the body','Driving elbows forward','Dropping the weight quickly'],
  easier:[],alternatives:['hammer-curl']
 },
 'hammer-curl':{
  name:'Hammer Curl',muscle:'Biceps / forearms',equipment:'Dumbbells',pattern:'curl',sets:2,reps:'10-15',
  setup:['Stand tall with palms facing each other.','Keep elbows close to your sides.'],
  move:['Curl the dumbbells upward without rotating the wrists.','Keep the upper arms quiet.','Lower under control.'],
  feel:'Front of the upper arms and some forearm work.',
  mistakes:['Swinging the torso','Letting elbows travel far forward','Dropping the dumbbells quickly'],
  easier:[],alternatives:['dumbbell-curl']
 },

 'dead-hang':{
  name:'Dead Hang',muscle:'Grip / shoulders / upper back',equipment:'Pull-up bar',pattern:'overhead',sets:3,reps:'15-30 sec',
  setup:['Use a secure pull-up bar.','Take a comfortable overhand grip.','Step off only when you are sure the bar and grip are secure.'],
  move:['Hang with control rather than swinging.','Keep breathing and finish the set before your grip fails completely.'],
  feel:'Forearms and grip working, with the shoulders and upper back supporting the hang.',
  mistakes:['Swinging','Holding your breath','Staying on after your grip is no longer secure'],
  easier:[],alternatives:['scapular-pull-up']
 },
 'scapular-pull-up':{
  name:'Scapular Pull-Up',muscle:'Upper back / lats / shoulder control',equipment:'Pull-up bar',pattern:'overhead',sets:3,reps:'6-10',
  setup:['Hang from a secure pull-up bar with straight arms.','Keep the body quiet and avoid kicking.'],
  move:['Without bending the elbows much, gently pull the shoulders down away from the ears so the body rises slightly.','Pause briefly, then return to a relaxed controlled hang.'],
  feel:'Upper back and the muscles around the shoulder blades, not a full biceps pull-up.',
  mistakes:['Turning it into a full pull-up','Shrugging aggressively','Swinging to create movement'],
  easier:['dead-hang'],alternatives:['negative-pull-up','band-pulldown']
 },
 'negative-pull-up':{
  name:'Negative Pull-Up',muscle:'Back / biceps',equipment:'Pull-up bar + stable step',pattern:'overhead',sets:3,reps:'3-6 slow reps',
  setup:['Use a secure step to begin with your chin near or above the bar.','Grip the bar firmly before taking your weight.'],
  move:['Lower yourself as slowly and smoothly as you can until the arms are long.','Step back up for the next repetition rather than repeatedly jumping.'],
  feel:'Lats and upper back with biceps helping during the slow lowering phase.',
  mistakes:['Dropping quickly','Starting from an unstable step','Swinging'],
  easier:['scapular-pull-up'],alternatives:['assisted-pull-up','band-pulldown']
 },
 'assisted-pull-up':{
  name:'Band-Assisted Pull-Up',muscle:'Back / biceps',equipment:'Pull-up bar + resistance band',pattern:'overhead',sets:3,reps:'5-10',
  setup:['Secure the resistance band to a stable pull-up bar exactly as intended for the band.','Place the foot or knee into the band carefully while holding the bar.'],
  move:['Pull your chest upward while keeping the body controlled.','Lower slowly until the arms are long again.'],
  feel:'Lats and upper back with biceps assisting.',
  mistakes:['Using a damaged or poorly secured band','Swinging','Losing control on the way down'],
  easier:['negative-pull-up','scapular-pull-up'],alternatives:['pull-up-beginner','band-pulldown']
 },
 'pull-up-beginner':{
  name:'Pull-Up',muscle:'Back / biceps',equipment:'Pull-up bar',pattern:'overhead',sets:3,reps:'3-8',
  setup:['Take a secure overhand grip on a stable bar.','Start from a controlled hang without swinging.'],
  move:['Pull yourself upward by driving the elbows down.','Rise as high as you can without kicking, then lower under control.'],
  feel:'Lats and upper back with the biceps assisting.',
  mistakes:['Kipping or kicking when the goal is a strict rep','Shrugging toward the ears','Dropping through the lowering phase'],
  easier:['assisted-pull-up','negative-pull-up'],alternatives:['band-pulldown','one-arm-db-row']
 },
 'dumbbell-bench-press':{
  name:'Dumbbell Bench Press',muscle:'Chest / triceps',equipment:'Dumbbells + bench',pattern:'press',sets:3,reps:'8-12',
  setup:['Lie on a stable bench with feet planted.','Hold the dumbbells over the chest with wrists stacked over the forearms.','Keep the shoulders controlled against the bench.'],
  move:['Lower the dumbbells under control to a comfortable chest position.','Press them back up without bouncing or clashing the weights together.'],
  feel:'Chest and triceps, with the shoulders staying stable.',
  mistakes:['Bench or feet unstable','Wrists folding backward','Elbows flaring aggressively'],
  easier:['dumbbell-floor-press'],alternatives:['push-up']
 },
 'chest-supported-db-row-home':{
  name:'Chest-Supported Dumbbell Row',muscle:'Back / biceps',equipment:'Dumbbells + bench',pattern:'row',sets:3,reps:'8-12',
  setup:['Set a stable bench to a comfortable incline and lie chest-down.','Let the dumbbells hang below the shoulders.'],
  move:['Pull the dumbbells toward the sides of your torso.','Keep the chest supported and shoulders away from the ears.','Lower under control.'],
  feel:'Upper back and lats with biceps assisting.',
  mistakes:['Shrugging','Lifting the chest off the bench to create momentum','Dropping the weights quickly'],
  easier:['one-arm-db-row'],alternatives:['barbell-row','two-arm-db-row']
 },
 'step-up':{
  name:'Step-Up',muscle:'Quads / glutes',equipment:'Stable bench or step',pattern:'lunge',sets:3,reps:'8-12 / leg',
  setup:['Use a stable surface that will not slide or tip.','Start with bodyweight until you are comfortable with the height.'],
  move:['Place the whole working foot on the step.','Drive through that leg to stand on the step.','Lower under control rather than dropping back down.'],
  feel:'Quads and glute of the working leg.',
  mistakes:['Using an unstable surface','Pushing excessively from the trailing foot','Dropping down without control'],
  easier:['reverse-lunge'],alternatives:['bulgarian-split-squat','goblet-squat']
 },
 'band-row':{
  name:'Resistance Band Row',muscle:'Back / biceps',equipment:'Resistance band + secure anchor',pattern:'row',sets:3,reps:'10-15',
  setup:['Anchor the band securely at about torso height.','Step back until the band has light tension and stand or sit tall.'],
  move:['Pull the band toward your torso.','Keep shoulders away from ears and return slowly.'],
  feel:'Upper back and lats, with biceps helping.',
  mistakes:['Using an unsafe anchor','Shrugging','Letting the band snap back'],
  easier:[],alternatives:['one-arm-db-row','band-pulldown']
 },
 'band-face-pull':{
  name:'Band Face Pull',muscle:'Rear shoulders / upper back',equipment:'Resistance band + secure anchor',pattern:'row',sets:2,reps:'12-15',
  setup:['Anchor the band securely around upper-chest to face height.','Use a light resistance and stand far enough back for gentle tension.'],
  move:['Pull the band toward your face while allowing the elbows to move outward.','Squeeze the upper back briefly and return under control.'],
  feel:'Rear shoulders and upper back.',
  mistakes:['Using a weak or unsafe anchor','Shrugging','Using so much resistance that the body rocks backward'],
  easier:[],alternatives:['lateral-raise','band-row']
 },
 'band-pulldown':{
  name:'Resistance Band Pulldown',muscle:'Back / lats / biceps',equipment:'Resistance band + high secure anchor',pattern:'overhead',sets:3,reps:'10-15',
  setup:['Anchor the band securely above head height.','Kneel or sit far enough away that the band is lightly tensioned.'],
  move:['Pull the band down toward the upper chest while keeping the torso controlled.','Return slowly until the arms are long.'],
  feel:'Lats and upper back with biceps assisting.',
  mistakes:['Unsafe anchor','Leaning far backward','Letting the band snap upward'],
  easier:[],alternatives:['band-row','one-arm-db-row']
 },
 'leg-press':{
  name:'Leg Press',muscle:'Quads / glutes',equipment:'Leg press machine',pattern:'squat',sets:3,reps:'8-12',
  setup:['Place feet comfortably on the platform and keep your back supported.','Start with a light load and a range you can control.'],
  move:['Lower the platform under control.','Keep knees tracking with the feet.','Press back without forcefully locking the knees.'],
  feel:'Front thighs and glutes.',
  mistakes:['Hips rolling off the pad','Knees collapsing inward','Using more depth than you can control'],
  easier:[],alternatives:['goblet-squat','barbell-back-squat']
 },
 'chest-press-machine':{
  name:'Chest Press Machine',muscle:'Chest / triceps',equipment:'Chest press machine',pattern:'press',sets:3,reps:'8-12',
  setup:['Adjust the seat so the handles sit around mid-chest level.','Keep your back supported and wrists neutral.'],
  move:['Press the handles forward under control.','Return slowly until you reach a comfortable chest stretch.'],
  feel:'Chest and triceps.',
  mistakes:['Shoulders shrugging forward','Seat set too high or low','Letting the weight slam back'],
  easier:[],alternatives:['dumbbell-floor-press','push-up']
 },
 'lat-pulldown':{
  name:'Lat Pulldown',muscle:'Back / biceps',equipment:'Cable pulldown',pattern:'pull',sets:3,reps:'8-12',
  setup:['Sit securely with thighs supported.','Take a comfortable grip and keep the chest tall.','Set the shoulders down away from the ears.'],
  move:['Pull the bar toward the upper chest without swinging backward.','Control the return until the arms are long again.'],
  feel:'Lats/upper back with biceps helping.',
  mistakes:['Leaning far backward','Pulling behind the neck','Shrugging through the movement'],
  easier:[],alternatives:['one-arm-db-row','barbell-row']
 },
 'leg-curl':{
  name:'Leg Curl',muscle:'Hamstrings',equipment:'Leg curl machine',pattern:'curl-leg',sets:3,reps:'10-15',
  setup:['Adjust the machine so the knee joint lines up comfortably with the machine pivot.','Set the pad securely against the lower leg.'],
  move:['Curl the heels toward you under control.','Pause briefly and return slowly.'],
  feel:'Back of the thighs.',
  mistakes:['Lifting the hips away from the pad','Using momentum','Letting the stack slam down'],
  easier:[],alternatives:['dumbbell-rdl','barbell-rdl']
 }
};
const BEGINNER_PROGRAMS={
 homeA:{name:'Beginner Home A',tag:'HOME · A',description:'Full body · dumbbells + barbell · about 40–50 min',items:['barbell-back-squat','dumbbell-floor-press','one-arm-db-row','barbell-rdl','lateral-raise']},
 homeB:{name:'Beginner Home B',tag:'HOME · B',description:'Full body · dumbbells + barbell · about 40–50 min',items:['bulgarian-split-squat','dumbbell-shoulder-press','barbell-row','glute-bridge','dumbbell-curl']},
 gym:{name:'Beginner Gym Full Body',tag:'GYM',description:'Simple machines + basic movement patterns · about 40 min',items:['leg-press','chest-press-machine','lat-pulldown','leg-curl','lateral-raise']}
};
function beginnerItem(key){const g=BEGINNER_EXERCISES[key];return g?{name:g.name,muscle:g.muscle,equipment:g.equipment,sets:g.sets,reps:g.reps,beginnerGuideKey:key}:null}

const BEGINNER_EQUIPMENT_RULES={
 'barbell-back-squat':['barbell'],
 'goblet-squat':['dumbbells'],
 'dumbbell-squat':['dumbbells'],
 'bulgarian-split-squat':[],
 'reverse-lunge':[],
 'barbell-rdl':['barbell'],
 'dumbbell-rdl':['dumbbells'],
 'glute-bridge':['mat'],
 'dumbbell-floor-press':['dumbbells','mat'],
 'push-up':[],
 'one-arm-db-row':['dumbbells'],
 'two-arm-db-row':['dumbbells'],
 'barbell-row':['barbell'],
 'dumbbell-shoulder-press':['dumbbells'],
 'lateral-raise':['dumbbells'],
 'dumbbell-curl':['dumbbells'],
 'hammer-curl':['dumbbells'],
 'dead-hang':['pullup'],
 'scapular-pull-up':['pullup'],
 'negative-pull-up':['pullup'],
 'assisted-pull-up':['pullup','bands'],
 'pull-up-beginner':['pullup'],
 'dumbbell-bench-press':['dumbbells','bench'],
 'chest-supported-db-row-home':['dumbbells','bench'],
 'step-up':['bench'],
 'band-row':['bands'],
 'band-face-pull':['bands'],
 'band-pulldown':['bands'],
 'leg-press':['gym'],
 'chest-press-machine':['gym'],
 'lat-pulldown':['gym'],
 'leg-curl':['gym']
};
function beginnerEquipmentRequirements(key){return BEGINNER_EQUIPMENT_RULES[key]||[]}
function currentBeginnerEquipment(){return Array.isArray(data.beginnerEquipment)&&data.beginnerEquipment.length?data.beginnerEquipment:['dumbbells','barbell','mat']}
function beginnerEquipmentSupports(key){
 if(!BEGINNER_EXERCISES[key])return false;
 const req=beginnerEquipmentRequirements(key),have=currentBeginnerEquipment();
 if(req.includes('gym'))return false;
 return req.every(x=>have.includes(x));
}

function beginnerExercisesUnlockedBy(equipment){
 const have=new Set(currentBeginnerEquipment());
 if(have.has(equipment))return [];
 const simulated=[...have,equipment];
 return Object.entries(BEGINNER_EXERCISES)
  .filter(([key])=>{const req=beginnerEquipmentRequirements(key);return !req.includes('gym')&&req.length&&req.every(x=>simulated.includes(x))&&!req.every(x=>have.has(x))})
  .map(([key,g])=>({key,...g}));
}
function beginnerAvailableHomeExercises(){
 return Object.entries(BEGINNER_EXERCISES)
  .filter(([key])=>beginnerEquipmentSupports(key))
  .map(([key,g])=>({key,...g}))
  .sort((a,b)=>a.name.localeCompare(b.name));
}
function beginnerLibraryEntries(){
 return Object.entries(BEGINNER_EXERCISES).map(([key,g])=>({
  name:g.name,muscle:g.muscle,equipment:g.equipment,sets:g.sets,reps:g.reps,
  beginnerFriendly:true,beginnerGuideKey:key
 }));
}
function beginnerHomeChoice(key,seen=new Set()){
 if(beginnerEquipmentSupports(key))return key;if(seen.has(key))return key;seen.add(key);
 const g=BEGINNER_EXERCISES[key],candidates=[...(g?.easier||[]),...(g?.alternatives||[])];
 for(const alt of candidates){if(beginnerEquipmentSupports(alt))return alt}
 for(const alt of candidates){const nested=beginnerHomeChoice(alt,seen);if(beginnerEquipmentSupports(nested))return nested}
 return key;
}
function openBeginnerEquipment(){
 const options=[['dumbbells','Dumbbells'],['barbell','Barbell + plates'],['mat','Exercise mat'],['bench','Bench'],['bands','Resistance bands'],['pullup','Pull-up bar']],selected=new Set(currentBeginnerEquipment());
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Home setup</p><h2>What do you have?</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">This controls Home workouts and “Available with your setup”. Beginner Gym is intentionally separate because gym equipment is not your home setup.</p><div class="beginner-equipment-list">${options.map(([id,label])=>{const adds=selected.has(id)?0:beginnerExercisesUnlockedBy(id).length;return `<label><input type="checkbox" value="${id}" ${selected.has(id)?'checked':''}><span><strong>${label}</strong><small>${selected.has(id)?'Currently available':adds?`Adds ${adds} exercise${adds===1?'':'s'}`:'Optional equipment'}</small></span></label>`}).join('')}</div><button class="primary" id="save-beginner-equipment">SAVE HOME SETUP</button>`);
 $('#save-beginner-equipment').onclick=()=>{const before=new Set(beginnerAvailableHomeExercises().map(x=>x.key)),picked=$$('.beginner-equipment-list input:checked').map(x=>x.value);if(!picked.length)return toast('Choose at least one thing you can train with');data.beginnerEquipment=picked;const after=beginnerAvailableHomeExercises(),unlocked=after.filter(x=>!before.has(x.key));save();closeSheet();beginnerWorkout();toast(unlocked.length?`${unlocked.length} new beginner exercise${unlocked.length===1?'':'s'} available`:'Home setup updated')};
}

const BEGINNER_HOME_SLOTS={
 homeA:[
  {role:'squat',preferred:['barbell-back-squat','goblet-squat','dumbbell-squat','reverse-lunge']},
  {role:'horizontal press',preferred:['dumbbell-bench-press','dumbbell-floor-press','push-up']},
  {role:'row/pull',preferred:['chest-supported-db-row-home','one-arm-db-row','band-row','barbell-row']},
  {role:'hinge',preferred:['barbell-rdl','dumbbell-rdl','glute-bridge']},
  {role:'shoulders',preferred:['lateral-raise','dumbbell-shoulder-press','band-face-pull']}
 ],
 homeB:[
  {role:'single-leg',preferred:['bulgarian-split-squat','step-up','reverse-lunge','goblet-squat']},
  {role:'vertical press',preferred:['dumbbell-shoulder-press','push-up','dumbbell-floor-press']},
  {role:'vertical pull / row',preferred:['assisted-pull-up','negative-pull-up','pull-up-beginner','scapular-pull-up','band-pulldown','barbell-row','one-arm-db-row']},
  {role:'glutes / hinge',preferred:['glute-bridge','dumbbell-rdl','barbell-rdl']},
  {role:'arms',preferred:['hammer-curl','dumbbell-curl','band-row']}
 ]
};
function resolvedBeginnerHomeProgram(key){
 const slots=BEGINNER_HOME_SLOTS[key]||[];
 const used=new Set();
 return slots.map(slot=>{
  const picked=slot.preferred.find(ex=>!used.has(ex)&&beginnerEquipmentSupports(ex));
  const fallback=picked||slot.preferred.find(ex=>beginnerEquipmentSupports(ex))||beginnerHomeChoice(slot.preferred[0]);
  if(fallback)used.add(fallback);
  return fallback;
 }).filter(Boolean);
}
function beginnerHomeSwapNote(original,resolved){
 if(original===resolved)return '';
 const from=BEGINNER_EXERCISES[original]?.name||original,to=BEGINNER_EXERCISES[resolved]?.name||resolved;
 return `${from} → ${to}`;
}
function startBeginnerProgram(key){
 const p=BEGINNER_PROGRAMS[key];if(!p)return;
 const keys=key.startsWith('home')?resolvedBeginnerHomeProgram(key):p.items;
 startWorkoutTemplate({id:`beginner-${key}`,name:p.name,type:'strength',program:'Beginner',programDay:key,beginner:true,notes:'Beginner guided workout',items:keys.map(beginnerItem).filter(Boolean)});
}

const EXERCISE_GUIDE_TEMPLATES={
 press:{setup:['Set your shoulders in a stable position and keep the load controlled.','Use a grip and range that lets wrists and elbows stay stacked.','Brace before the first rep.'],move:['Lower under control toward the chest line.','Press smoothly without bouncing or losing shoulder position.','Finish the rep with control rather than snapping into lockout.'],mistakes:['Using momentum or bouncing','Letting shoulders roll forward','Losing wrist and elbow alignment']},
 overhead:{setup:['Stand or sit tall with the load around shoulder height.','Brace your trunk and keep ribs controlled.','Keep wrists stacked over the forearms.'],move:['Press overhead in a smooth path.','Finish overhead without aggressively arching the lower back.','Lower back to shoulder height under control.'],mistakes:['Overarching the lower back','Using leg drive on a strict set','Letting wrists fold backward']},
 row:{setup:['Brace your trunk and set the shoulders away from the ears.','Choose a position that lets the spine stay controlled.','Start with the arms long without losing torso position.'],move:['Pull the handle or weight toward the torso.','Drive the elbows back while keeping the shoulders controlled.','Return slowly to a long-arm position.'],mistakes:['Jerking with the torso','Shrugging toward the ears','Rushing the lowering phase']},
 pulldown:{setup:['Take a secure grip and create space between shoulders and ears.','Brace the trunk before pulling.','Start from a controlled stretched position.'],move:['Pull by driving the elbows down toward the ribs.','Bring the chest toward the handle or bar without throwing the torso backward.','Return slowly to the start.'],mistakes:['Swinging for momentum','Pulling mainly with the hands','Shrugging at the top']},
 squat:{setup:['Plant the whole foot and choose a comfortable stance.','Brace your trunk before descending.','Let the knees track in the same direction as the toes.'],move:['Lower by bending hips and knees together.','Stay balanced over the whole foot.','Stand up with hips and chest rising together.'],mistakes:['Heels lifting','Knees collapsing inward','Losing control at the bottom']},
 lunge:{setup:['Start tall and create enough space for a stable step.','Keep the front foot fully planted.','Begin without load if balance is uncertain.'],move:['Lower under control through the working leg.','Keep the working knee tracking with the toes.','Drive through the working foot to return.'],mistakes:['Taking an unstable step','Front heel lifting','Rushing and losing balance']},
 hinge:{setup:['Stand with a small knee bend and brace your trunk.','Keep the load close to the body.','Set the shoulders and keep the spine neutral.'],move:['Push the hips backward rather than squatting down.','Lower only while the back position stays controlled.','Drive the hips forward to stand.'],mistakes:['Rounding the lower back','Turning the hinge into a squat','Letting the load drift away']},
 bridge:{setup:['Set the upper back or torso securely and plant the feet.','Brace lightly before lifting.','Choose a foot position that feels stable.'],move:['Drive the hips upward by squeezing the glutes.','Finish with the hips extended without over-arching the lower back.','Lower under control.'],mistakes:['Overarching at the top','Pushing mainly through the toes','Bouncing through the bottom']},
 legcurl:{setup:['Align the machine pad comfortably with the lower leg.','Keep hips and torso stable against the machine.','Start with a load you can control through the full range.'],move:['Curl the lower leg toward the body.','Pause briefly while keeping the hips still.','Return slowly to the start.'],mistakes:['Lifting the hips','Using momentum','Dropping the weight on the return']},
 legextension:{setup:['Align the knee joint with the machine pivot.','Place the pad above the ankle and sit firmly back.','Choose a controlled load.'],move:['Extend the knees smoothly.','Pause briefly near the top without violently locking out.','Lower slowly.'],mistakes:['Kicking the weight','Hips lifting from the seat','Dropping the stack']},
 raise:{setup:['Stand or sit tall with a light, controllable load.','Set the shoulders away from the ears.','Keep a soft bend in the elbows.'],move:['Raise the arms through the intended path without swinging.','Stop where the shoulder stays controlled.','Lower slowly.'],mistakes:['Swinging the torso','Shrugging','Using a load that removes control']},
 curl:{setup:['Keep the upper arm stable and shoulders relaxed.','Use a grip that keeps wrists neutral.','Brace before the first rep.'],move:['Curl by bending the elbow without throwing it forward.','Squeeze briefly near the top.','Lower all the way under control.'],mistakes:['Swinging the torso','Elbows drifting forward','Dropping the weight']},
 triceps:{setup:['Set the shoulders and upper arms in a stable position.','Keep wrists neutral and choose a controllable load.','Brace the trunk.'],move:['Extend the elbows until the triceps contract strongly.','Keep the upper arm position as consistent as possible.','Return slowly.'],mistakes:['Using shoulder movement to cheat','Flaring the elbows excessively','Rushing the return']},
 calf:{setup:['Place the ball of the foot securely on the platform or floor.','Keep the ankle aligned and use support if needed.','Start from a controlled stretch.'],move:['Rise onto the toes as high as you can control.','Pause briefly at the top.','Lower slowly into the stretch.'],mistakes:['Bouncing','Rolling the ankle outward','Using a tiny range of motion']},
 core:{setup:['Brace as if preparing for a gentle punch.','Keep the spine and pelvis in the position the exercise requires.','Start with a version you can control.'],move:['Move slowly while keeping the trunk stable.','Exhale through the hardest part of the rep.','Stop before form breaks down.'],mistakes:['Holding the breath','Letting the lower back lose position','Rushing for extra reps']},
 stability:{setup:['Use a stable surface and clear space around you.','Start with a simple range or light resistance.','Move only as far as you can control.'],move:['Perform the movement slowly and deliberately.','Keep the target joint aligned throughout.','Stop the set when control is lost.'],mistakes:['Using momentum','Forcing range','Continuing after balance or alignment is lost']}
};
function exerciseMotionType(name='',pattern=''){
 const n=String(name).toLowerCase(),p=String(pattern).toLowerCase();
 if(/side plank/.test(n))return 'sideplank';
 if(/plank/.test(n))return 'plank';
 if(/push-up/.test(n))return 'pushup';
 if(/bench press|floor press|chest press/.test(n))return 'benchpress';
 if(/cable fly|pec deck/.test(n))return 'fly';
 if(/shoulder press|military press|arnold press/.test(n))return 'overhead';
 if(/face pull/.test(n))return 'facepull';
 if(/external rotation/.test(n))return 'externalrotation';
 if(/shrug/.test(n))return 'shrug';
 if(/row|scapular retraction/.test(n))return 'row';
 if(/pull-up|chin-up|scapular pull|dead hang/.test(n))return 'pullup';
 if(/pulldown/.test(n))return 'pulldown';
 if(/leg press/.test(n))return 'legpress';
 if(/back squat|front squat|hack squat|goblet squat|dumbbell squat|bodyweight squat/.test(n)||p==='squat')return 'squat';
 if(/lunge|split squat|step-up/.test(n)||p==='lunge')return 'lunge';
 if(/deadlift|romanian|rdl/.test(n)||p==='hinge')return 'hinge';
 if(/hip thrust|glute bridge/.test(n)||p==='bridge')return 'bridge';
 if(/leg curl/.test(n))return 'legcurl';
 if(/leg extension/.test(n))return 'legextension';
 if(/kickback/.test(n))return 'kickback';
 if(/abduction/.test(n))return 'abduction';
 if(/lateral raise|front raise|reverse pec deck|wall slide/.test(n)||p==='raise')return 'raise';
 if(/curl/.test(n))return 'curl';
 if(/triceps|skull crusher|dip|close-grip/.test(n))return 'triceps';
 if(/calf/.test(n))return 'calf';
 if(/hanging knee raise/.test(n))return 'kneeraise';
 if(/crunch/.test(n))return 'crunch';
 if(/dead bug/.test(n))return 'deadbug';
 if(/bird dog/.test(n))return 'birddog';
 if(/balance|mobility|isometric/.test(n))return 'stability';
 return ['press','overhead','row','lunge','hinge','bridge','raise'].includes(p)?p:'stability';
}
function guideKeyFromName(name=''){
 const key=String(name).trim().toLowerCase();
 return Object.keys(BEGINNER_EXERCISES).find(k=>String(BEGINNER_EXERCISES[k].name).trim().toLowerCase()===key)||'';
}
function normalizeExerciseEntry(x={},extras={}){
 const name=String(x.name||'').trim();if(!name)return null;
 return {
  name,
  muscle:x.muscle||extras.muscle||'Custom',
  equipment:x.equipment||extras.equipment||'Custom',
  sets:Number(x.sets)||Number(extras.sets)||Math.max(1,x.sets?.length||3),
  reps:x.reps||x.targetReps||extras.reps||'8-12',
  pattern:x.pattern||extras.pattern||'',
  beginnerGuideKey:x.beginnerGuideKey||guideKeyFromName(name)||extras.beginnerGuideKey||'',
  beginnerFriendly:!!(x.beginnerFriendly||extras.beginnerFriendly)
 };
}
function allGuideExercises(){
 const map=new Map(),put=(raw,extras={})=>{
  const x=normalizeExerciseEntry(raw,extras);if(!x)return;
  const key=x.name.toLowerCase(),old=map.get(key);
  map.set(key,old?{...old,...x,beginnerFriendly:old.beginnerFriendly||x.beginnerFriendly,beginnerGuideKey:x.beginnerGuideKey||old.beginnerGuideKey}:{...x});
 };
 [...(exerciseLibrary.strength||[]),...(exerciseLibrary.rehab||[])].forEach(x=>put(x));
 Object.entries(BEGINNER_EXERCISES).forEach(([key,g])=>put(g,{beginnerGuideKey:key,beginnerFriendly:true}));
 (data.customWorkouts||[]).forEach(w=>(w.items||[]).forEach(x=>put(x)));
 (data.sessions||[]).filter(s=>s.type!=='cardio').forEach(s=>(s.items||[]).forEach(x=>put(x)));
 if(data.activeSession?.type!=='cardio')(data.activeSession?.items||[]).forEach(x=>put(x));
 return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
function exerciseGuideFor(name='',beginnerKey='',fallback={}){
 const key=beginnerKey&&BEGINNER_EXERCISES[beginnerKey]?beginnerKey:guideKeyFromName(name),specific=key?BEGINNER_EXERCISES[key]:null;
 const lib=allGuideExercises().find(x=>x.name.toLowerCase()===String(name).toLowerCase())||fallback||{};
 const motion=exerciseMotionType(name,specific?.pattern||lib.pattern||'');
 const template=EXERCISE_GUIDE_TEMPLATES[motion]||EXERCISE_GUIDE_TEMPLATES[{pushup:'press',benchpress:'press',fly:'press',facepull:'row',externalrotation:'stability',shrug:'row',pullup:'pulldown',legpress:'squat',kickback:'stability',abduction:'stability',plank:'core',sideplank:'core',kneeraise:'core',crunch:'core',deadbug:'core',birddog:'core'}[motion]]||EXERCISE_GUIDE_TEMPLATES.stability;
 const muscle=specific?.muscle||lib.muscle||fallback.muscle||'Full body';
 const equipment=specific?.equipment||lib.equipment||fallback.equipment||'Varies';
 const reps=specific?.reps||lib.reps||fallback.targetReps||'Controlled reps';
 const sets=specific?.sets||lib.sets||Math.max(1,fallback.sets?.length||3);
 return {key,name:specific?.name||lib.name||name||'Exercise',muscle,equipment,reps,sets,motion,beginnerFriendly:!!specific||!!lib.beginnerFriendly,
  setup:specific?.setup||template.setup,move:specific?.move||template.move,mistakes:specific?.mistakes||template.mistakes,
  feel:specific?.feel||`You should mainly feel ${muscle.toLowerCase()} working. Stop if you feel sharp or pinching pain.`,note:specific?.note||'',
  easier:specific?.easier||[],alternatives:specific?.alternatives||[]};
}
function guideMuscleState(muscle=''){
 const m=String(muscle).toLowerCase();
 return {chest:/chest|pectoral/.test(m),back:/back|lat|trap|scapula|rhomboid/.test(m),shoulders:/shoulder|delt|rotator/.test(m),arms:/bicep|tricep|forearm/.test(m),core:/core|ab|oblique/.test(m),glutes:/glute|hip/.test(m),quads:/quad|thigh|knee/.test(m),hamstrings:/hamstring/.test(m),calves:/calf|ankle/.test(m)};
}
const EXERCISEDB_URL='https://oss.exercisedb.dev/api/v1/exercises';
const EXERCISE_MEDIA_ALIASES={
 'bench press':'barbell bench press','back squat':'barbell full squat','barbell back squat':'barbell full squat',
 'biceps curl':'dumbbell biceps curl','dumbbell curl':'dumbbell biceps curl','pull ups':'pull-up','pull-up':'pull-up',
 'romanian deadlift':'barbell romanian deadlift','barbell romanian deadlift':'barbell romanian deadlift',
 'machine chest press':'leverage chest press','chest press machine':'leverage chest press',
 'shoulder press':'dumbbell seated shoulder press','seated dumbbell shoulder press':'dumbbell seated shoulder press',
 'dumbbell shoulder press':'dumbbell seated shoulder press','military press':'barbell standing military press',
 'cable lateral raise':'cable lateral raise','dumbbell lateral raise':'dumbbell lateral raise',
 'hip abduction':'lever seated hip abduction','leg curl':'lever lying leg curl','leg extension':'lever leg extension',
 'seated calf raise':'lever seated calf raise','standing calf raise':'standing calf raise',
 'cable crunch':'cable kneeling crunch','weighted dips':'weighted tricep dips','close-grip bench press':'barbell close grip bench press',
 'skull crushers':'ez barbell lying triceps extension','overhead triceps extension':'cable overhead triceps extension',
 'triceps pushdown':'cable pushdown','reverse pec deck':'lever reverse fly','pec deck':'lever seated fly',
 'chest-supported row':'dumbbell incline row','chest-supported dumbbell row':'dumbbell incline row',
 'one-arm dumbbell row':'dumbbell one arm bent-over row','two-arm dumbbell row':'dumbbell bent over row',
 'bent-over barbell row':'barbell bent over row','barbell curl':'barbell curl','ez-bar curl':'ez barbell curl',
 'preacher curl':'barbell preacher curl','hammer curl':'dumbbell hammer curl','arnold press':'dumbbell arnold press',
 'incline dumbbell press':'dumbbell incline bench press','incline barbell bench press':'barbell incline bench press',
 'dumbbell bench press':'dumbbell bench press','cable fly':'cable middle fly','face pull':'cable standing face pull',
 'face pull - light':'cable standing face pull','lat pulldown':'cable pulldown','chin-ups':'chin-up',
 'dead hang':'dead hang','scapular pull-up':'scapular pull-up','band-assisted pull-up':'band assisted pull-up',
 'negative pull-up':'negative pull-up','resistance band pulldown':'band pulldown','resistance band row':'band seated row',
 'band face pull':'band face pull','band external rotation':'band external shoulder rotation',
 'bulgarian split squat':'dumbbell bulgarian split squat','walking lunge':'dumbbell walking lunge',
 'reverse lunge':'dumbbell rear lunge','step-up':'dumbbell step-up','front squat':'barbell front chest squat',
 'hack squat':'sled hack squat','leg press':'sled 45° leg press','hip thrust':'barbell hip thrust',
 'cable kickback':'cable glute kickback','glute bridge':'glute bridge','dumbbell shrug':'dumbbell shrug',
 'plank':'front plank','side plank':'side plank','dead bug':'dead bug','bird dog':'bird dog',
 'hanging knee raise':'hanging knee raise','wall slide':'wall slide','single-leg balance':'single leg balance',
 'tempo bodyweight squat':'bodyweight squat','dumbbell squat':'dumbbell squat','goblet squat':'dumbbell goblet squat',
 'push-up':'push-up','dumbbell floor press':'dumbbell floor press','isometric hold':'isometric exercise',
 'calf isometric':'standing calf raise','hip mobility flow':'hip mobility'
};
let exerciseDbPromise=null,exerciseDbCache=null;
function mediaNorm(v=''){return String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\b(dumbbells|barbells|cables|machines)\b/g,m=>m.slice(0,-1)).replace(/\bups\b/g,'up')}
function mediaTokens(v=''){return new Set(mediaNorm(v).split(/\s+/).filter(Boolean))}
const EXERCISE_MEDIA_ALIAS_MAP=Object.fromEntries(Object.entries(EXERCISE_MEDIA_ALIASES).map(([k,v])=>[mediaNorm(k),v]));
function exerciseMediaScore(g,x){
 const original=mediaNorm(g.name),alias=mediaNorm(EXERCISE_MEDIA_ALIAS_MAP[original]||g.name),name=mediaNorm(x.name||'');
 if(name===alias)return 1000;if(name===original)return 950;
 const q=mediaTokens(alias),n=mediaTokens(name),common=[...q].filter(v=>n.has(v)).length,union=new Set([...q,...n]).size||1;
 let score=(common/union)*100+(common===q.size?45:0);
 const ge=mediaTokens(g.equipment||''),xe=mediaTokens((x.equipments||[]).join(' '));score+=[...ge].filter(v=>xe.has(v)).length*7;
 const gm=mediaTokens(g.muscle||''),xm=mediaTokens([...(x.targetMuscles||[]),...(x.secondaryMuscles||[]),...(x.bodyParts||[])].join(' '));score+=[...gm].filter(v=>xm.has(v)).length*4;
 return score;
}
async function loadExerciseDb(){
 if(exerciseDbCache)return exerciseDbCache;if(exerciseDbPromise)return exerciseDbPromise;
 exerciseDbPromise=(async()=>{try{
  const cached=localStorage.getItem('gaymExerciseDbV1');if(cached){const parsed=JSON.parse(cached);if(parsed?.savedAt>Date.now()-604800000&&Array.isArray(parsed.items)&&parsed.items.length>500){exerciseDbCache=parsed.items;return exerciseDbCache}}
  const r=await fetch(EXERCISEDB_URL,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`ExerciseDB ${r.status}`);
  const json=await r.json(),raw=Array.isArray(json)?json:(json?.data||json?.exercises||[]);
  if(!Array.isArray(raw)||raw.length<100)throw new Error('ExerciseDB returned too few exercises');
  const items=raw.map(x=>({name:x.name||'',gifUrl:x.gifUrl||'',equipments:x.equipments||[],targetMuscles:x.targetMuscles||[],secondaryMuscles:x.secondaryMuscles||[],bodyParts:x.bodyParts||[]})).filter(x=>x.name&&x.gifUrl);
  if(items.length<100)throw new Error('ExerciseDB media missing');
  exerciseDbCache=items;try{localStorage.setItem('gaymExerciseDbV1',JSON.stringify({savedAt:Date.now(),items}))}catch{}
  return items;
 }catch(err){console.warn('ExerciseDB unavailable',err);exerciseDbCache=[];return []}})();
 return exerciseDbPromise;
}
async function exerciseMediaFor(g){
 const items=await loadExerciseDb();if(!items.length)return null;
 let best=null,bestScore=-1;
 for(const x of items){const score=exerciseMediaScore(g,x);if(score>bestScore){best=x;bestScore=score}}
 return best&&bestScore>=38&&best.gifUrl?best:null;
}
function exerciseMediaMarkup(g,compact=false){
 return `<div class="exercise-media ${compact?'compact':''}" data-exercise-media="${escapeHtml(g.name)}" data-exercise-muscle="${escapeHtml(g.muscle||'')}" data-exercise-equipment="${escapeHtml(g.equipment||'')}"><div class="exercise-media-loading"><span></span><strong>${compact?'Loading':'Loading 3D animation…'}</strong></div></div>`;
}
async function hydrateExerciseMedia(root=document){
 const nodes=[...root.querySelectorAll('[data-exercise-media]:not([data-media-ready])')];if(!nodes.length)return;
 await Promise.all(nodes.map(async node=>{node.dataset.mediaReady='1';const g={name:node.dataset.exerciseMedia,muscle:node.dataset.exerciseMuscle,equipment:node.dataset.exerciseEquipment},media=await exerciseMediaFor(g);
  if(!node.isConnected)return;
  if(!media){node.innerHTML=`<div class="exercise-media-fallback"><strong>Animation unavailable</strong><small>Connect to the internet and reopen HOW TO.</small></div>`;return}
  const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt=`${g.name} exercise animation`;img.src=media.gifUrl;
  img.onerror=()=>{if(node.isConnected)node.innerHTML=`<div class="exercise-media-fallback"><strong>Animation unavailable</strong><small>The exercise guide still works.</small></div>`};
  node.innerHTML='';node.appendChild(img);
 }));
}
function exerciseDemoSVG(g,compact=false){return exerciseMediaMarkup(g,compact)}
function exerciseThumbSVG(g){const group=normalizeMuscle(g.muscle||'');return `<div class="exercise-thumb exercise-thumb-static"><span class="exercise-thumb-3d">3D</span><strong>${escapeHtml(group||'Exercise')}</strong><small>${escapeHtml(g.equipment||'')}</small></div>`}
function exerciseMuscleDiagram(g){
 const raw=String(g.muscle||'').split(/\s*\/\s*|\s*,\s*/).map(x=>x.trim()).filter(Boolean);
 const muscles=raw.length?raw:[normalizeMuscle(g.muscle||'')||'Target muscle'];
 return `<div class="guide-muscle-card muscle-text-only"><div class="guide-muscle-head"><h3>Muscles trained</h3></div><div class="muscle-chip-list">${muscles.map((x,i)=>`<span class="muscle-chip ${i===0?'primary':'secondary'}"><b></b>${escapeHtml(x)}</span>`).join('')}</div><p class="muscle-text-note">The 3D exercise animation above shows the movement. Use this list to check which muscles should be doing the work.</p></div>`;
}
function guideDifficulty(g){return g.beginnerFriendly?'Beginner':'Standard'}
function exerciseVariationFamily(name='',motion='',muscle=''){
 const n=String(name).toLowerCase(),m=String(muscle).toLowerCase();
 if(/close-grip bench press/.test(n))return 'elbow-extension';
 if(/reverse pec deck|face pull/.test(n))return 'rear-delt-upper-back';
 if(/bench press|chest press|floor press|push-up/.test(n))return 'horizontal-chest-press';
 if(/cable fly|pec deck|fly/.test(n))return 'chest-fly';
 if(/shoulder press|military press|arnold press/.test(n))return 'vertical-press';
 if(/lateral raise/.test(n))return 'lateral-delt';
 if(/pull-up|chin-up|pulldown|dead hang|scapular pull/.test(n))return 'vertical-pull';
 if(/row|scapular retraction/.test(n))return 'horizontal-pull';
 if(/back squat|front squat|hack squat|leg press|goblet squat|dumbbell squat|bodyweight squat/.test(n))return 'bilateral-knee-dominant';
 if(/bulgarian|lunge|step-up/.test(n))return 'unilateral-knee-dominant';
 if(/romanian|rdl|deadlift/.test(n))return 'hinge';
 if(/hip thrust|glute bridge|kickback/.test(n))return 'hip-extension';
 if(/hip abduction/.test(n))return 'hip-abduction';
 if(/leg curl/.test(n))return 'knee-flexion';
 if(/leg extension/.test(n))return 'knee-extension';
 if(/calf/.test(n))return 'calves';
 if(/curl/.test(n)&&!/leg curl/.test(n))return 'elbow-flexion';
 if(/triceps|skull crusher|close-grip|dip/.test(n))return 'elbow-extension';
 if(/crunch/.test(n))return 'core-flexion';
 if(/plank/.test(n))return /side plank/.test(n)?'side-core-isometric':'front-core-isometric';
 if(/dead bug|bird dog/.test(n))return 'core-stability';
 if(/hanging knee raise/.test(n))return 'hip-flexion-core';
 if(/external rotation|wall slide/.test(n))return 'shoulder-rehab';
 if(/balance/.test(n))return 'balance';
 if(/mobility/.test(n))return 'mobility';
 if(/isometric hold/.test(n))return 'general-isometric';
 if(/shrug/.test(n))return 'traps';
 if(motion==='row')return 'horizontal-pull';
 if(motion==='pulldown'||motion==='pullup')return 'vertical-pull';
 if(motion==='press'||motion==='benchpress'||/chest/.test(m))return 'horizontal-chest-press';
 if(motion==='overhead')return 'vertical-press';
 if(motion==='squat'||motion==='legpress')return 'bilateral-knee-dominant';
 if(motion==='lunge')return 'unilateral-knee-dominant';
 if(motion==='hinge')return 'hinge';
 return `motion:${motion||normalizeMuscle(muscle)||'general'}`;
}
const VARIATION_FAMILY_PRIORITY={
 'horizontal-chest-press':['Bench Press','Dumbbell Bench Press','Machine Chest Press','Chest Press Machine','Push-Up','Dumbbell Floor Press','Incline Dumbbell Press','Incline Barbell Bench Press','Close-Grip Bench Press'],
 'chest-fly':['Cable Fly','Pec Deck','Reverse Pec Deck'],
 'vertical-press':['Shoulder Press','Dumbbell Shoulder Press','Seated Dumbbell Shoulder Press','Military Press','Arnold Press'],
 'lateral-delt':['Cable Lateral Raise','Dumbbell Lateral Raise'],
 'rear-delt-upper-back':['Reverse Pec Deck','Face Pull','Face Pull - Light','Band Face Pull'],
 'vertical-pull':['Pull-Up','Pull-Ups','Chin-Ups','Lat Pulldown','Band-Assisted Pull-Up','Negative Pull-Up','Resistance Band Pulldown','Scapular Pull-Up','Dead Hang'],
 'horizontal-pull':['Seated Cable Row','Bent-Over Barbell Row','One-Arm Dumbbell Row','Two-Arm Dumbbell Row','Chest-Supported Row','Chest-Supported Dumbbell Row','Resistance Band Row','Scapular Retraction'],
 'bilateral-knee-dominant':['Back Squat','Barbell Back Squat','Front Squat','Hack Squat','Leg Press','Goblet Squat','Dumbbell Squat','Tempo Bodyweight Squat'],
 'unilateral-knee-dominant':['Bulgarian Split Squat','Walking Lunge','Reverse Lunge','Step-Up'],
 'hinge':['Romanian Deadlift','Barbell Romanian Deadlift','Dumbbell Romanian Deadlift','Deadlift'],
 'hip-extension':['Hip Thrust','Glute Bridge','Cable Kickback'],
 'hip-abduction':['Hip Abduction'],
 'knee-flexion':['Leg Curl'],
 'knee-extension':['Leg Extension'],
 'calves':['Standing Calf Raise','Seated Calf Raise','Calf Isometric'],
 'elbow-flexion':['Biceps Curl','Dumbbell Curl','Barbell Curl','EZ-Bar Curl','Preacher Curl','Hammer Curl'],
 'elbow-extension':['Triceps Pushdown','Overhead Triceps Extension','Skull Crushers','Close-Grip Bench Press','Weighted Dips'],
 'core-flexion':['Cable Crunch'],
 'front-core-isometric':['Plank','Dead Bug','Bird Dog'],
 'side-core-isometric':['Side Plank','Plank','Bird Dog'],
 'core-stability':['Dead Bug','Bird Dog','Plank','Side Plank'],
 'hip-flexion-core':['Hanging Knee Raise','Dead Bug','Cable Crunch'],
 'shoulder-rehab':['Band External Rotation','Wall Slide','Face Pull - Light','Band Face Pull','Scapular Retraction'],
 'balance':['Single-Leg Balance','Step-Up','Reverse Lunge'],
 'mobility':['Hip Mobility Flow','Glute Bridge','Dead Bug'],
 'general-isometric':['Isometric Hold','Plank','Calf Isometric'],
 'traps':['Dumbbell Shrug','Face Pull','Bent-Over Barbell Row']
};
const VARIATION_RELATED_FAMILIES={
 'chest-fly':['horizontal-chest-press'],
 'horizontal-chest-press':['chest-fly'],
 'lateral-delt':['vertical-press','rear-delt-upper-back'],
 'rear-delt-upper-back':['horizontal-pull','lateral-delt'],
 'vertical-press':['lateral-delt'],
 'vertical-pull':['horizontal-pull'],
 'horizontal-pull':['vertical-pull'],
 'bilateral-knee-dominant':['unilateral-knee-dominant'],
 'unilateral-knee-dominant':['bilateral-knee-dominant'],
 'knee-flexion':['hinge'],
 'knee-extension':['bilateral-knee-dominant','unilateral-knee-dominant'],
 'hinge':['hip-extension','knee-flexion'],
 'hip-extension':['hinge','hip-abduction'],
 'hip-abduction':['hip-extension','unilateral-knee-dominant'],
 'calves':['balance'],
 'elbow-flexion':['horizontal-pull','vertical-pull'],
 'elbow-extension':['horizontal-chest-press','vertical-press'],
 'core-flexion':['front-core-isometric','core-stability','hip-flexion-core'],
 'front-core-isometric':['core-stability','side-core-isometric'],
 'side-core-isometric':['core-stability','front-core-isometric'],
 'core-stability':['front-core-isometric','side-core-isometric'],
 'hip-flexion-core':['core-flexion','core-stability'],
 'shoulder-rehab':['rear-delt-upper-back','horizontal-pull'],
 'balance':['unilateral-knee-dominant'],
 'mobility':['hip-extension','core-stability'],
 'general-isometric':['front-core-isometric','balance'],
 'traps':['rear-delt-upper-back','horizontal-pull']
};
function exerciseVariationsFor(g,limit=5){
 const all=allGuideExercises(),byName=new Map(all.map(x=>[x.name.toLowerCase(),x]));
 const family=exerciseVariationFamily(g.name,g.motion,g.muscle),priority=VARIATION_FAMILY_PRIORITY[family]||[];
 const seen=new Set([g.name.toLowerCase()]),out=[];
 const add=x=>{if(!x||seen.has(x.name.toLowerCase()))return;seen.add(x.name.toLowerCase());out.push({...x,_guide:exerciseGuideFor(x.name,x.beginnerGuideKey||'',x)})};
 for(const wanted of priority){add(byName.get(wanted.toLowerCase()));if(out.length>=limit)return out.slice(0,limit)}
 const sameFamily=all.filter(x=>!seen.has(x.name.toLowerCase())&&exerciseVariationFamily(x.name,exerciseMotionType(x.name,x.pattern||''),x.muscle)===family);
 sameFamily.sort((a,b)=>a.name.localeCompare(b.name)).forEach(add);
 if(out.length<limit){
  for(const related of (VARIATION_RELATED_FAMILIES[family]||[])){
   all.filter(x=>!seen.has(x.name.toLowerCase())&&exerciseVariationFamily(x.name,exerciseMotionType(x.name,x.pattern||''),x.muscle)===related)
    .sort((a,b)=>a.name.localeCompare(b.name)).forEach(x=>{if(out.length<limit)add(x)});
   if(out.length>=limit)break;
  }
 }
 if(out.length<limit){
  const group=normalizeMuscle(g.muscle);
  all.filter(x=>!seen.has(x.name.toLowerCase())&&normalizeMuscle(x.muscle)===group)
   .sort((a,b)=>a.name.localeCompare(b.name)).forEach(x=>{if(out.length<limit)add(x)});
 }
 return out.slice(0,limit);
}
function openExerciseGuideByName(name,activeIndex=null,beginnerKey='',fallback={}){
 const g=exerciseGuideFor(name,beginnerKey,fallback),variations=exerciseVariationsFor(g);
 openSheet(`<div class="sheet-head exercise-guide-title"><div><p class="eyebrow">Exercise guide</p><h2>${escapeHtml(g.name)}</h2></div><button class="sheet-close" data-close>×</button></div><div class="guide-tabs"><button class="active" data-guide-tab="overview">Overview</button><button data-guide-tab="howto">How To</button><button data-guide-tab="muscles">Muscles</button><button data-guide-tab="tips">Tips</button><button data-guide-tab="variations">Variations</button></div><div class="guide-panel active" data-guide-panel="overview">${exerciseDemoSVG(g)}<div class="guide-step-preview"><span>Controlled movement</span><strong>${escapeHtml(g.move[0]||'Move with control through the full range.')}</strong></div>${exerciseMuscleDiagram(g)}<div class="guide-facts"><div><span>Type</span><strong>Strength</strong></div><div><span>Sets</span><strong>${escapeHtml(g.sets)}</strong></div><div><span>Equipment</span><strong>${escapeHtml(g.equipment)}</strong></div><div><span>Reps</span><strong>${escapeHtml(g.reps)}</strong></div><div><span>Difficulty</span><strong>${guideDifficulty(g)}</strong></div><div><span>Rest</span><strong>60–90 sec</strong></div></div></div><div class="guide-panel" data-guide-panel="howto"><section class="beginner-guide-section"><span class="eyebrow">1 · SET UP</span><ol>${g.setup.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></section><section class="beginner-guide-section"><span class="eyebrow">2 · MOVE</span><ol>${g.move.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></section><section class="beginner-feel"><span class="eyebrow">WHERE SHOULD I FEEL IT?</span><strong>${escapeHtml(g.feel)}</strong></section>${g.note?`<article class="card beginner-safety-note"><span class="eyebrow">SETUP NOTE</span><p>${escapeHtml(g.note)}</p></article>`:''}</div><div class="guide-panel" data-guide-panel="muscles">${exerciseMuscleDiagram(g)}</div><div class="guide-panel" data-guide-panel="tips"><section class="beginner-guide-section mistakes"><span class="eyebrow">WATCH OUT FOR</span><ul>${g.mistakes.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></section><p class="science-note">Use a load and range you can control. Stop if you feel sharp or pinching pain rather than normal muscular effort.</p></div><div class="guide-panel" data-guide-panel="variations"><div class="variation-list">${variations.map(v=>`<button type="button" class="variation-card" data-view-variation="${escapeHtml(v.name)}">${exerciseThumbSVG(v._guide)}<span><strong>${escapeHtml(v.name)}</strong><small>${escapeHtml(v.muscle)} · ${escapeHtml(v.equipment)}</small><em>${escapeHtml(String(v.sets||3))} sets · ${escapeHtml(v.reps||'controlled')}</em></span><span class="chev">›</span></button>`).join('')}</div></div>${activeIndex!==null&&g.key?`<div class="sheet-actions"><button class="primary" id="guide-use-current">USE THIS EXERCISE</button></div>`:''}<p class="guide-attribution">Exercise animation: ExerciseDB / AscendAPI V1. Technique text uses GAYM's guide system; verify setup against your equipment and comfort.</p>`);
 hydrateExerciseMedia($('#sheet-root'));
 const setTab=tab=>{$$('[data-guide-tab]').forEach(b=>b.classList.toggle('active',b.dataset.guideTab===tab));$$('[data-guide-panel]').forEach(p=>p.classList.toggle('active',p.dataset.guidePanel===tab))};
 $$('[data-guide-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.guideTab));
  $$('[data-view-variation]').forEach(b=>b.onclick=()=>openExerciseGuideByName(b.dataset.viewVariation,activeIndex,'',allGuideExercises().find(x=>x.name===b.dataset.viewVariation)||{}));
 const use=$('#guide-use-current');if(use&&activeIndex!==null&&g.key)use.onclick=()=>{const s=data.activeSession;if(!s||!s.items?.[activeIndex])return;const oldSets=s.items[activeIndex].sets||[],src=BEGINNER_EXERCISES[g.key];s.items[activeIndex]={...beginnerItem(g.key),targetReps:src.reps,note:'',sets:Array.from({length:src.sets},(_,i)=>oldSets[i]||{weight:'',reps:'',done:false})};activeExerciseOpen=activeIndex;save();closeSheet();active();toast(`${g.name} ready`)};
}
function openBeginnerGuide(key,activeIndex=null){const g=BEGINNER_EXERCISES[key];if(g)openExerciseGuideByName(g.name,activeIndex,key)}
function openBeginnerAlternative(key,activeIndex,fromKey){const g=BEGINNER_EXERCISES[key];if(g)openExerciseGuideByName(g.name,activeIndex,key)}
function beginnerExerciseCard(ex){const g=exerciseGuideFor(ex.name,ex.beginnerGuideKey||'',ex);return `<button type="button" class="beginner-library-card" data-guide-name="${escapeHtml(ex.name)}"><div>${exerciseThumbSVG(g)}</div><span class="beginner-card-copy"><span class="beginner-card-title"><strong>${escapeHtml(ex.name)}</strong>${g.beginnerFriendly?'<b>Beginner</b>':''}</span><small>${escapeHtml(ex.muscle)} · ${escapeHtml(ex.equipment)}</small><em>${escapeHtml(String(ex.sets||3))} sets · ${escapeHtml(ex.reps||'controlled')}</em></span><span class="chev">›</span></button>`}
function beginnerWorkoutsMarkup(){return `<section class="section"><div class="section-head"><div><p class="eyebrow">Home workouts</p><h2>Built for your setup</h2></div><button class="text-btn" id="beginner-equipment-button">HOME SETUP</button></div><div class="beginner-program-grid">${['homeA','homeB'].map(k=>{const p=BEGINNER_PROGRAMS[k],resolved=resolvedBeginnerHomeProgram(k);return `<article class="card beginner-program-card"><span class="eyebrow">${p.tag}</span><h3>${p.name}</h3><p>${p.description}</p><div class="beginner-ex-list">${resolved.map((x,i)=>`<button type="button" data-beginner-guide="${x}"><span>${i+1}</span><span><strong>${escapeHtml(BEGINNER_EXERCISES[x].name)}</strong><small>${escapeHtml(BEGINNER_EXERCISES[x].sets+' × '+BEGINNER_EXERCISES[x].reps)}</small></span><span class="chev">›</span></button>`).join('')}</div><button class="primary" data-start-beginner="${k}">START ${k==='homeA'?'A':'B'}</button></article>`}).join('')}<article class="card beginner-program-card"><span class="eyebrow">GYM</span><h3>${BEGINNER_PROGRAMS.gym.name}</h3><p>${BEGINNER_PROGRAMS.gym.description}</p><div class="beginner-ex-list">${BEGINNER_PROGRAMS.gym.items.map((x,i)=>`<button type="button" data-beginner-guide="${x}"><span>${i+1}</span><span><strong>${escapeHtml(BEGINNER_EXERCISES[x].name)}</strong><small>${escapeHtml(BEGINNER_EXERCISES[x].sets+' × '+BEGINNER_EXERCISES[x].reps)}</small></span><span class="chev">›</span></button>`).join('')}</div><button class="primary" data-start-beginner="gym">START GYM WORKOUT</button></article></div></section>`}
function beginnerExercisesMarkup(){const all=allGuideExercises();return `<section class="beginner-library-section"><div class="beginner-library-tools"><label><span>⌕</span><input id="beginner-library-search" placeholder="Search exercises..."></label><select id="beginner-muscle-filter"><option>All muscles</option>${['Chest','Back','Shoulders','Arms','Legs','Core','Glutes'].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="beginner-library-list" id="beginner-library-list">${all.map(beginnerExerciseCard).join('')}</div></section>`}
function beginnerEquipmentMarkup(){return `<section class="section"><article class="card beginner-equipment-hub"><span class="eyebrow">YOUR HOME SETUP</span><h2>${currentBeginnerEquipment().length} equipment choices saved</h2><p>${currentBeginnerEquipment().map(x=>x==='dumbbells'?'Dumbbells':x==='barbell'?'Barbell + plates':x==='mat'?'Exercise mat':x==='pullup'?'Pull-up bar':x==='bands'?'Resistance bands':x==='bench'?'Bench':x).join(' · ')}</p><button class="primary" id="beginner-edit-equipment">EDIT HOME SETUP</button></article><article class="card beginner-note"><span class="eyebrow">GYM MODE</span><strong>Machine exercises stay available.</strong><p>Your home equipment filters Home A/B. It does not remove normal gym exercises from the full exercise library.</p></article></section>`}
function beginnerWorkout(mode='exercises'){
 const active=['workouts','exercises','equipment'].includes(mode)?mode:'exercises';
 shell(`${header()}<div class="beginner-screen-head"><button class="icon-btn" id="beginner-back">${icons.back}</button><h1>Beginner</h1><span class="beginner-mini-unicorn"><img src="${UNICORN_STATES.default.image}" alt=""></span></div><div class="beginner-top-tabs"><button class="${active==='workouts'?'active':''}" data-beginner-mode="workouts">Workouts</button><button class="${active==='exercises'?'active':''}" data-beginner-mode="exercises">Exercises</button><button class="${active==='equipment'?'active':''}" data-beginner-mode="equipment">Equipment</button></div>${active==='workouts'?beginnerWorkoutsMarkup():active==='equipment'?beginnerEquipmentMarkup():beginnerExercisesMarkup()}`);
 $('#beginner-back').onclick=workout;$$('[data-beginner-mode]').forEach(b=>b.onclick=()=>beginnerWorkout(b.dataset.beginnerMode));
 $$('[data-start-beginner]').forEach(b=>b.onclick=()=>startBeginnerProgram(b.dataset.startBeginner));$$('[data-beginner-guide]').forEach(b=>b.onclick=()=>openBeginnerGuide(b.dataset.beginnerGuide,null));
 $('#beginner-equipment-button')?.addEventListener('click',openBeginnerEquipment);$('#beginner-edit-equipment')?.addEventListener('click',openBeginnerEquipment);
 const search=$('#beginner-library-search'),filter=$('#beginner-muscle-filter'),paint=()=>{const q=(search?.value||'').toLowerCase(),f=filter?.value||'All muscles',all=allGuideExercises().filter(ex=>{const hay=`${ex.name} ${ex.muscle} ${ex.equipment}`.toLowerCase(),group=normalizeMuscle(ex.muscle);return hay.includes(q)&&(f==='All muscles'||group===f||(f==='Arms'&&/bicep|tricep|forearm/i.test(ex.muscle))||(f==='Legs'&&/quad|hamstring|calf|leg|knee/i.test(ex.muscle))||(f==='Glutes'&&/glute|hip/i.test(ex.muscle)))});const list=$('#beginner-library-list');if(list)list.innerHTML=all.length?all.map(beginnerExerciseCard).join(''):'<div class="empty"><strong>No exercises found</strong>Try another search or muscle filter.</div>';$$('[data-guide-name]').forEach(b=>b.onclick=()=>openExerciseGuideByName(b.dataset.guideName,null,guideKeyFromName(b.dataset.guideName)))};
 if(search)search.oninput=paint;if(filter)filter.onchange=paint;paint();
}
function openBeginnerBasics(){
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Beginner basics</p><h2>You only need four words.</h2></div><button class="sheet-close" data-close>×</button></div>
 <div class="beginner-basics-grid"><article><span>REP</span><strong>One complete movement.</strong><p>One squat down and back up = one rep.</p></article><article><span>SET</span><strong>A group of reps.</strong><p>10 squats, then rest = one set.</p></article><article><span>3 × 10</span><strong>Three sets of ten reps.</strong><p>10 reps → rest → 10 reps → rest → 10 reps.</p></article><article><span>REST</span><strong>Time before the next set.</strong><p>For these workouts, around 1–3 minutes is fine. Take enough time to perform the next set with control.</p></article></div>
 <article class="card beginner-weight-tip"><span class="eyebrow">HOW HEAVY?</span><strong>Start lighter than you think.</strong><p>Choose a weight you can control for every rep. The final reps can feel challenging, but your technique should still look like the first reps.</p></article>
 <button class="primary" data-close>GOT IT</button>`);
}
function beginnerVisual(pattern='squat'){
 const path=pattern==='hinge'?'M35 26 L56 42 L69 65 M56 42 L83 45 M69 65 L65 92 M69 65 L88 91':pattern==='row'?'M35 28 L58 42 L76 58 M58 42 L85 44 M76 58 L65 88 M76 58 L94 84':pattern==='lunge'?'M50 22 L50 55 M50 38 L31 52 M50 38 L71 51 M50 55 L29 86 M50 55 L79 82':pattern==='press'?'M50 22 L50 55 M50 35 L26 51 M50 35 L76 51 M50 55 L36 89 M50 55 L66 89':pattern==='overhead'?'M50 22 L50 55 M50 34 L31 13 M50 34 L69 13 M50 55 L37 89 M50 55 L64 89':pattern==='bridge'?'M20 67 L43 58 L65 39 L86 58 M20 67 L12 88 M86 58 L96 86':pattern==='raise'?'M50 22 L50 58 M50 38 L17 35 M50 38 L83 35 M50 58 L36 91 M50 58 L64 91':'M50 22 L50 55 M50 38 L30 52 M50 38 L70 52 M50 55 L35 87 M50 55 L65 87';
 return `<div class="beginner-motion"><div><span>START</span><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="14" r="7"/><path d="${path}"/></svg></div><div class="motion-arrow">→</div><div><span>CONTROLLED MOVE</span><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="14" r="7"/><path d="${path}"/><path class="motion-accent" d="M82 22 Q90 50 79 73"/></svg></div></div>`;
}
const CARDIO_ACTIVITIES=['Running','Walking','Cycling','Hiking','Stairmaster','Treadmill','Rowing','Elliptical','Other'];
const CARDIO_INTENSITIES=['Easy','Moderate','Hard'];
function cardioDerivedMeta(activity,durationMin,distance){
 const mode=String(activity||'Cardio'),mins=Math.max(1,Number(durationMin)||0),km=Math.max(0,Number(distance)||0);
 if(!km)return '';
 if(/running|walking|hiking|treadmill/i.test(mode)){
  const pace=mins/km,whole=Math.floor(pace),sec=Math.round((pace-whole)*60),normSec=sec===60?0:sec,normMin=sec===60?whole+1:whole;
  return `${normMin}:${String(normSec).padStart(2,'0')} /km`;
 }
 if(/cycling/i.test(mode))return `${(km/(mins/60)).toFixed(1)} km/h`;
 return '';
}
function openLogCardio(prefill={}){
 const activity=prefill.activity||prefill.mode||'Running',duration=prefill.durationMin||prefill.duration||'',distance=prefill.distance||'',intensity=prefill.intensity||'Moderate',notes=prefill.notes||'';
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Cardio</p><h2>Log cardio</h2></div><button class="sheet-close" data-close>×</button></div>
 <p class="subtle">Track the workout with your watch or cardio app. GAYM only needs the result.</p>
 <div class="field"><label>Activity</label><select id="cardio-log-activity">${CARDIO_ACTIVITIES.map(x=>`<option ${x===activity?'selected':''}>${x}</option>`).join('')}</select></div>
 <div class="inline-fields"><div class="field"><label>Duration (min)</label><input id="cardio-log-duration" type="number" min="1" max="1440" step="1" inputmode="numeric" value="${escapeHtml(duration)}" placeholder="30"></div><div class="field"><label>Distance (km, optional)</label><input id="cardio-log-distance" type="number" min="0" max="1000" step="0.01" inputmode="decimal" value="${escapeHtml(distance)}" placeholder="5.0"></div></div>
 <div class="field"><label>Intensity</label><div class="cardio-intensity-row">${CARDIO_INTENSITIES.map(x=>`<button type="button" class="cardio-intensity ${x===intensity?'active':''}" data-cardio-intensity="${x}">${x.toUpperCase()}</button>`).join('')}</div></div>
 <div class="field"><label>Notes (optional)</label><textarea id="cardio-log-notes" rows="3" maxlength="300" placeholder="Anything worth remembering?">${escapeHtml(notes)}</textarea></div>
 <div class="cardio-log-preview" id="cardio-log-preview"></div>
 <div class="sheet-actions"><button class="primary" id="cardio-log-save">LOG CARDIO</button></div>`);
 let selectedIntensity=intensity;
 const updatePreview=()=>{const a=$('#cardio-log-activity')?.value||'Cardio',m=Math.max(0,Number($('#cardio-log-duration')?.value)||0),km=Math.max(0,Number($('#cardio-log-distance')?.value)||0),derived=m&&km?cardioDerivedMeta(a,m,km):'';const p=$('#cardio-log-preview');if(p)p.innerHTML=m?`<span>${escapeHtml(a)}</span><strong>${m} min${km?` · ${km} km`:''}${derived?` · ${escapeHtml(derived)}`:''}</strong><small>${escapeHtml(selectedIntensity)} intensity</small>`:'<small>Add duration to preview your cardio log.</small>'};
 $$('[data-cardio-intensity]').forEach(b=>b.onclick=()=>{selectedIntensity=b.dataset.cardioIntensity;$$('[data-cardio-intensity]').forEach(x=>x.classList.toggle('active',x===b));updatePreview()});
 ['cardio-log-activity','cardio-log-duration','cardio-log-distance'].forEach(id=>$('#'+id)?.addEventListener('input',updatePreview));
 $('#cardio-log-activity')?.addEventListener('change',updatePreview);updatePreview();
 $('#cardio-log-save').onclick=()=>{const mode=$('#cardio-log-activity').value,durationMin=Math.round(Number($('#cardio-log-duration').value)||0),distanceKm=Math.max(0,Number($('#cardio-log-distance').value)||0),notes=$('#cardio-log-notes').value.trim();if(durationMin<1)return toast('Add the cardio duration first');const id=uid(),derived=cardioDerivedMeta(mode,durationMin,distanceKm);const finished={id,date:prefill.date||isoToday(),workoutId:prefill.workoutId||'',program:prefill.program||'',programDay:prefill.programDay??null,name:mode,type:'cardio',mode,durationMin,distance:distanceKm||0,intensity:selectedIntensity,notes,manualEntry:true,cardioLogVersion:2,derived,items:[],doneSets:0,totalSets:0,finishedAt:Date.now(),completed:true};if(!(data.sessions||[]).some(x=>x.id===id))data.sessions.push(finished);save();syncRecentActivitiesFromLocal();closeSheet();render();actionToast(`${mode} logged`,'UNDO',async()=>{const userId=activeDataUserId;data.sessions=data.sessions.filter(x=>x.id!==id);save();await deleteActivityForSession(id,userId);render();toast('Cardio removed')})};
}

function openWorkoutSheet(id){const w=data.customWorkouts.find(w=>w.id===id);if(!w)return;openSheet(`<div class="sheet-head"><div><p class="eyebrow">${w.type}</p><h2>${escapeHtml(w.name)}</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">${w.type==='cardio'?`${w.duration||30} min${w.distance?` · ${w.distance} km`:''}`:`${w.items?.length||0} exercises`}</p><div class="list">${(w.items||[]).map((x,i)=>`<div class="list-card"><span class="badge-icon">${i+1}</span><span class="grow"><h3>${escapeHtml(x.name)}</h3><p>${x.sets||3} sets${x.reps?` · ${x.reps} reps`:''}</p></span></div>`).join('')}</div><div class="sheet-actions"><button class="primary" id="sheet-start">${w.type==='cardio'?'LOG CARDIO':'START WORKOUT'}</button><button class="secondary" id="sheet-edit">EDIT</button><button class="danger-btn" id="sheet-delete">DELETE</button></div>`);$('#sheet-start').onclick=()=>{closeSheet();startWorkout(id)};$('#sheet-edit').onclick=()=>{closeSheet();w.type==='cardio'?openCardioTemplateBuilder(id):openBuilder(w.type,id)};$('#sheet-delete').onclick=()=>{data.customWorkouts=data.customWorkouts.filter(x=>x.id!==id);data.planned=data.planned.filter(x=>x.workoutId!==id);save();closeSheet();render();toast('Workout deleted')}}
function openCardioTemplateBuilder(editId){const old=data.customWorkouts.find(w=>w.id===editId);if(!old)return;openSheet(`<div class="sheet-head"><div><p class="eyebrow">Edit cardio template</p><h2>${escapeHtml(old.name)}</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><label>Workout name</label><input id="cardio-template-name" maxlength="40" value="${escapeHtml(old.name||'')}"></div><div class="field"><label>Cardio mode</label><select id="cardio-template-mode">${CARDIO_ACTIVITIES.map(m=>`<option ${m===(old.mode||old.name)?'selected':''}>${m}</option>`).join('')}</select></div><div class="inline-fields"><div class="field"><label>Duration (min)</label><input id="cardio-template-duration" type="number" min="1" value="${old.duration||30}"></div><div class="field"><label>Distance (km)</label><input id="cardio-template-distance" type="number" min="0" step="0.1" value="${old.distance||''}"></div></div><div class="field"><label>Notes</label><textarea id="cardio-template-notes" rows="4" maxlength="500">${escapeHtml(old.notes||'')}</textarea></div><div class="sheet-actions"><button class="primary" id="cardio-template-save">SAVE CHANGES</button></div>`);$('#cardio-template-save').onclick=()=>{const name=$('#cardio-template-name').value.trim();if(!name)return toast('Give the workout a name');const updated={...old,name,mode:$('#cardio-template-mode').value,duration:Math.max(1,+$('#cardio-template-duration').value||30),distance:Math.max(0,+$('#cardio-template-distance').value||0),notes:$('#cardio-template-notes').value.trim()};data.customWorkouts=data.customWorkouts.map(w=>w.id===editId?updated:w);syncPlannedWorkoutReferences();save();closeSheet();render();toast('Workout updated everywhere')}}
function openBuilder(type='strength',editId=null,seedItems=null,seedDraft=null){if(type==='cardio'&&editId)return openCardioTemplateBuilder(editId);if(type==='cardio')return openLogCardio();const old=editId?data.customWorkouts.find(w=>w.id===editId):null;let items=seedItems?seedItems.map(x=>({...x})):(old?.items?.map(x=>({...x}))||[]);const draft=seedDraft||{};openSheet(`<div class="sheet-head"><div><p class="eyebrow">${old?'Edit':'Create'} ${type}</p><h2>${old?escapeHtml(old.name):'New workout'}</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><label>Workout name</label><input id="builder-name" maxlength="40" placeholder="e.g. Upper body" value="${escapeHtml(draft.name??(old?.name||''))}"></div>${type==='cardio'?`<div class="inline-fields"><div class="field"><label>Duration (min)</label><input id="builder-duration" type="number" min="1" value="${draft.duration??old?.duration??30}"></div><div class="field"><label>Distance (km)</label><input id="builder-distance" type="number" min="0" step="0.1" value="${draft.distance??old?.distance??''}"></div></div><div class="field"><label>Cardio mode</label><select id="builder-mode">${['Running','Cycling','Walking','Hiking','Rowing','Elliptical','Other'].map(m=>`<option ${m===(draft.mode??old?.mode??'Running')?'selected':''}>${m}</option>`).join('')}</select></div>`:`<section class="section"><div class="section-head"><h2>Exercises</h2><button class="text-btn" id="builder-add">+ ADD</button></div><div class="list" id="builder-items"></div></section>`}<div class="field"><label>Notes</label><textarea id="builder-notes" rows="4" maxlength="500" placeholder="Optional workout notes">${escapeHtml(draft.notes??old?.notes??'')}</textarea></div><div class="builder-actions"><button class="secondary" id="builder-cancel">CANCEL</button><button class="primary" id="builder-save">SAVE WORKOUT</button></div>`);
 if(type!=='cardio'){const paint=()=>{$('#builder-items').innerHTML=items.length?items.map((x,i)=>`<div class="exercise-row"><div class="exercise-row-head"><span class="drag">${i+1}</span><strong>${escapeHtml(x.name)}</strong><button class="small-btn builder-howto" data-builder-howto="${i}">HOW TO</button><button class="small-btn" data-up="${i}" ${i===0?'disabled':''}>↑</button><button class="small-btn" data-down="${i}" ${i===items.length-1?'disabled':''}>↓</button><button class="small-btn danger" data-remove="${i}">REMOVE</button></div><div class="inline-fields"><div class="field"><label>Sets</label><input type="number" min="1" max="20" value="${x.sets||3}" data-item-set="${i}"></div><div class="field"><label>${type==='rehab'?'Reps / time':'Reps'}</label><input value="${escapeHtml(x.reps||'8-12')}" data-item-reps="${i}"></div></div></div>`).join(''):`<div class="empty"><strong>No exercises added</strong>Add exercises to build this session.</div>`;$$('[data-builder-howto]').forEach(b=>b.onclick=()=>{const x=items[+b.dataset.builderHowto];if(x)openExerciseGuideByName(x.name,null,x.beginnerGuideKey||'',x)});$$('[data-remove]').forEach(b=>b.onclick=()=>{items.splice(+b.dataset.remove,1);paint()});$$('[data-up]').forEach(b=>b.onclick=()=>{const i=+b.dataset.up;if(i>0){[items[i-1],items[i]]=[items[i],items[i-1]];paint()}});$$('[data-down]').forEach(b=>b.onclick=()=>{const i=+b.dataset.down;if(i<items.length-1){[items[i+1],items[i]]=[items[i],items[i+1]];paint()}});$$('[data-item-set]').forEach(inp=>inp.oninput=()=>items[+inp.dataset.itemSet].sets=Math.max(1,+inp.value||1));$$('[data-item-reps]').forEach(inp=>inp.oninput=()=>items[+inp.dataset.itemReps].reps=inp.value)};paint();$('#builder-add').onclick=()=>{const currentDraft={name:$('#builder-name').value,notes:$('#builder-notes').value};openExercisePicker(type,x=>{items.push(x);openBuilder(type,editId,items,currentDraft)})}}
 $('#builder-cancel').onclick=closeSheet;$('#builder-save').onclick=()=>{const name=$('#builder-name').value.trim();if(!name)return toast('Give the workout a name');if(type!=='cardio'&&!items.length)return toast('Add at least one exercise');const obj={id:old?.id||uid(),name,type,items,notes:$('#builder-notes').value.trim(),createdAt:old?.createdAt||Date.now()};if(type==='cardio'){obj.duration=Math.max(1,+$('#builder-duration').value||30);obj.distance=Math.max(0,+$('#builder-distance').value||0);obj.mode=$('#builder-mode').value}if(old){data.customWorkouts=data.customWorkouts.map(w=>w.id===old.id?obj:w)}else data.customWorkouts.push(obj);syncPlannedWorkoutReferences();save();closeSheet();render();toast(old?'Workout updated everywhere':'Workout saved')};}
const exerciseLibrary={
 strength:[
  {name:'Bench Press',muscle:'Chest',equipment:'Barbell',sets:3,reps:'6-10'},
  {name:'Incline Dumbbell Press',muscle:'Chest',equipment:'Dumbbells',sets:3,reps:'8-12'},
  {name:'Machine Chest Press',muscle:'Chest',equipment:'Machine',sets:3,reps:'8-12'},
  {name:'Cable Fly',muscle:'Chest',equipment:'Cable',sets:3,reps:'10-15'},
  {name:'Push-Up',muscle:'Chest',equipment:'Bodyweight',sets:3,reps:'8-20'},
  {name:'Lat Pulldown',muscle:'Back',equipment:'Cable',sets:3,reps:'8-12'},
  {name:'Pull-Up',muscle:'Back',equipment:'Bodyweight',sets:3,reps:'5-10'},
  {name:'Pull-Ups',muscle:'Back / biceps',equipment:'Bodyweight',sets:3,reps:'5-10'},
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
  {name:'Dumbbell Bench Press',muscle:'Chest / triceps',equipment:'Dumbbells + bench',sets:3,reps:'8-12'},
  {name:'Incline Barbell Bench Press',muscle:'Upper chest / triceps',equipment:'Barbell + incline bench',sets:3,reps:'6-10'},
  {name:'Pec Deck',muscle:'Chest',equipment:'Machine',sets:3,reps:'10-15'},
  {name:'Front Squat',muscle:'Quads / glutes / core',equipment:'Barbell',sets:3,reps:'6-10'},
  {name:'Barbell Curl',muscle:'Biceps',equipment:'Barbell',sets:3,reps:'8-12'},
  {name:'Skull Crushers',muscle:'Triceps',equipment:'EZ-bar / dumbbells + bench',sets:3,reps:'8-12'},
  {name:'Dumbbell Shrug',muscle:'Traps / upper back',equipment:'Dumbbells',sets:3,reps:'10-15'},
  {name:'Arnold Press',muscle:'Shoulders / triceps',equipment:'Dumbbells',sets:3,reps:'8-12'},
  {name:'Hanging Knee Raise',muscle:'Core / hip flexors',equipment:'Pull-up bar',sets:3,reps:'8-15'},
  {name:'Side Plank',muscle:'Core / obliques',equipment:'Bodyweight',sets:3,reps:'20-45 sec / side'},
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
function openExercisePicker(type,onPick){
 const source=allGuideExercises();
 let muscle='All';openSheet(`<div class="sheet-head"><div><p class="eyebrow">Exercise library</p><h2>Add exercise</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><input id="exercise-search" placeholder="Search exercise, muscle or equipment..."></div><div class="tabs exercise-filter" id="exercise-muscles"></div><div class="list" id="exercise-picks" style="margin-top:12px"></div><div class="sheet-actions"><button class="secondary" id="custom-exercise">+ CUSTOM EXERCISE</button></div>`);const muscles=['All',...new Set(source.map(x=>normalizeMuscle(x.muscle)).filter(Boolean))];$('#exercise-muscles').innerHTML=muscles.map(x=>`<button class="tab ${x==='All'?'active':''}" data-muscle="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join('');function paint(q=''){const query=q.toLowerCase();const arr=source.filter(x=>(muscle==='All'||normalizeMuscle(x.muscle)===muscle)&&(`${x.name} ${x.muscle} ${x.equipment}`).toLowerCase().includes(query));$('#exercise-picks').innerHTML=arr.length?arr.map((x,i)=>`<button class="list-card exercise-pick" style="width:100%;color:inherit;text-align:left" data-pick-index="${source.indexOf(x)}"><span class="badge-icon">+</span><span class="grow"><h3>${escapeHtml(x.name)}${x.beginnerFriendly?` <span class="picker-beginner-badge">BEGINNER FRIENDLY</span>`:''}</h3><p>${escapeHtml(x.muscle)} · ${escapeHtml(x.equipment)}</p></span><span class="exercise-rx">${x.sets} × ${escapeHtml(x.reps)}</span></button>`).join(''):`<div class="empty"><strong>No exercises found</strong>Try another search or add a custom exercise.</div>`;$$('[data-pick-index]').forEach(b=>b.onclick=()=>{const ex=source[+b.dataset.pickIndex],rx=defaultExercisePrescription(ex,type);closeSheet();onPick({name:ex.name,muscle:ex.muscle,equipment:ex.equipment,sets:rx.sets,reps:rx.reps,beginnerGuideKey:ex.beginnerGuideKey||''})})}paint();$('#exercise-search').oninput=e=>paint(e.target.value);$$('[data-muscle]').forEach(b=>b.onclick=()=>{muscle=b.dataset.muscle;$$('[data-muscle]').forEach(x=>x.classList.toggle('active',x===b));paint($('#exercise-search').value)});$('#custom-exercise').onclick=()=>{const n=prompt('Exercise name');if(!n?.trim())return;const muscle=(prompt('Main muscle or muscle group (e.g. Chest, Back, Glutes)')||'Custom').trim()||'Custom';const equipment=(prompt('Equipment (e.g. Dumbbells, Cable, Bodyweight)')||'Custom').trim()||'Custom';closeSheet();onPick({name:n.trim(),muscle,equipment,sets:type==='rehab'?2:3,reps:type==='rehab'?'10 controlled':'8-12'})}}
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
function normalizeMuscle(muscle=''){
 const m=muscle.toLowerCase();
 if(/chest/.test(m))return 'Chest';if(/back|lat|scapula/.test(m))return 'Back';if(/shoulder|delt|rotator/.test(m))return 'Shoulders';if(/bicep|tricep|forearm/.test(m))return 'Arms';if(/quad|hamstring|glute|hip|calf|leg|knee/.test(m))return 'Legs';if(/core|ab/.test(m))return 'Core';return muscle.split('/')[0].trim()||'Other';
}
function daysBetween(dateA,dateB=isoToday()){
 const a=new Date(`${dateA}T12:00:00`).getTime(),b=new Date(`${dateB}T12:00:00`).getTime();return Math.max(0,Math.round((b-a)/86400000));
}
function muscleRecovery(){
 const latest=new Map();sortedSessionsDesc().filter(s=>s.completed!==false&&s.type!=='cardio').forEach(s=>(s.items||[]).forEach(item=>{const group=normalizeMuscle(item.muscle);if(group&&!latest.has(group))latest.set(group,s.date)}));
 return [...latest.entries()].map(([muscle,date])=>({muscle,date,days:daysBetween(date)})).sort((a,b)=>a.days-b.days).slice(0,6);
}
function coachTargetMuscles(){
 const st=todayState(),source=st.active||st.pendingPlanned;
 if(!source)return [];
 const workout=source.items?.length?source:(data.customWorkouts||[]).find(w=>w.id===source.workoutId);
 return [...new Set((workout?.items||[]).map(x=>normalizeMuscle(x.muscle)).filter(Boolean))];
}
function lastMuscleLoad(group){
 return sortedSessionsDesc().filter(s=>s.completed!==false&&s.type!=='cardio').map(s=>{
  const items=(s.items||[]).filter(x=>normalizeMuscle(x.muscle)===group);
  if(!items.length)return null;
  const sets=items.reduce((n,x)=>n+(x.sets||[]).filter(z=>z.done!==false).length,0);
  return {session:s,sets,days:daysBetween(s.date)};
 }).find(Boolean)||null;
}
function latestCoachCheckin(){return (data.coachCheckins||[]).filter(x=>x.date===isoToday()).at(-1)||null}
const COACH_EVIDENCE={
 training:'ACSM 2026 resistance-training position stand: consistency first; multiple sets; for hypertrophy, ~10 weekly sets per muscle is a useful evidence-based reference, not a magic minimum or ceiling.',
 protein:'Morton et al. 2018 meta-analysis: gains from extra protein plateaued around ~1.6 g/kg/day on average. Sports-nutrition reviews commonly use ~1.6–2.2 g/kg/day as a practical muscle-gain range.',
 gain:'Iraki et al. 2019 review: a modest surplus and roughly 0.25–0.5% body-weight gain/week is a practical off-season target for novice/intermediate physique athletes; advanced lifters should generally be more conservative.',
 loss:'Evidence-based physique-athlete reviews generally favour gradual loss, roughly 0.5–1.0% body weight/week, with slower loss often preferred when already lean to better preserve lean mass.',
 effort:'2024 proximity-to-failure meta-regression: hypertrophy tends to improve as sets are taken closer to failure, but failure on every set is not required and the app cannot infer RIR unless you log it.'
};
function coachDateMs(key){const t=new Date(`${key}T12:00:00`).getTime();return Number.isFinite(t)?t:0}
function coachDayNutrition(date){
 const foods=(data.nutrition||[]).filter(n=>n.date===date);
 return {date,logged:foods.length>0,foods:foods.length,kcal:foods.reduce((a,n)=>a+(+n.kcal||0),0),protein:foods.reduce((a,n)=>a+(+n.protein||0),0),carbs:foods.reduce((a,n)=>a+(+n.carbs||0),0),fat:foods.reduce((a,n)=>a+(+n.fat||0),0),fiber:foods.reduce((a,n)=>a+(+n.fiber||0),0)};
}
function coachNutritionWindow(days=7,{includeToday=false}={}){
 const rows=[];for(let i=includeToday?0:1;i<=days-(includeToday?1:0);i++)rows.push(coachDayNutrition(dateOffsetKey(i)));
 const logged=rows.filter(x=>x.logged),sum=(key)=>logged.reduce((a,x)=>a+(Number(x[key])||0),0);
 return {rows,loggedDays:logged.length,avgKcal:logged.length?sum('kcal')/logged.length:0,avgProtein:logged.length?sum('protein')/logged.length:0,avgCarbs:logged.length?sum('carbs')/logged.length:0,avgFat:logged.length?sum('fat')/logged.length:0,avgFiber:logged.length?sum('fiber')/logged.length:0};
}
function coachWeightRate(){
 const rows=weightHistory().filter(x=>coachDateMs(x.date)>=Date.now()-35*86400000);
 if(rows.length<3)return {enough:false,reason:'Log at least 3 weigh-ins across 7+ days for a useful weight trend.'};
 const spanDays=(coachDateMs(rows.at(-1).date)-coachDateMs(rows[0].date))/86400000;
 if(spanDays<7)return {enough:false,reason:'Weight data covers less than 7 days, so the trend is still too noisy.'};
 const xs=rows.map(x=>(coachDateMs(x.date)-coachDateMs(rows[0].date))/86400000),ys=rows.map(x=>Number(x.weight));
 const mx=xs.reduce((a,b)=>a+b,0)/xs.length,my=ys.reduce((a,b)=>a+b,0)/ys.length;
 const den=xs.reduce((a,x)=>a+(x-mx)**2,0),slope=den?xs.reduce((a,x,i)=>a+(x-mx)*(ys[i]-my),0)/den:0;
 const kgWeek=slope*7,pctWeek=my>0?kgWeek/my*100:0;
 return {enough:true,rows:rows.length,spanDays,kgWeek,pctWeek,current:ys.at(-1)};
}
function coachRecentMuscleVolume(days=7){
 const cutoff=Date.now()-(days-1)*86400000,out={};
 (data.sessions||[]).filter(s=>s.completed!==false&&s.type!=='cardio'&&coachDateMs(s.date)>=cutoff).forEach(s=>(s.items||[]).forEach(item=>{
  const g=normalizeMuscle(item.muscle);if(!g)return;const sets=(item.sets||[]).filter(z=>z.done!==false).length;out[g]=(out[g]||0)+sets;
 }));return out;
}
function coachNutritionAssessment(){
 const p=data.profile||{},weight=Math.max(1,Number(p.weight)||70),today=coachDayNutrition(isoToday()),week=coachNutritionWindow(7),proteinFloor=Math.round(weight*1.6),proteinUpper=Math.round(weight*2.2),targetP=Math.max(proteinFloor,Number(p.proteinTarget)||proteinFloor),targetK=Math.max(1,Number(p.calorieTarget)||2000);
 const details=[];if(week.loggedDays)details.push(`Last 7 completed days: ${week.loggedDays}/7 food-log days · avg ${Math.round(week.avgKcal)} kcal · ${Math.round(week.avgProtein)} g protein.`);else details.push('No completed-day nutrition logs in the last 7 days.');
 details.push(`Evidence-based protein reference for muscle gain: about ${proteinFloor}–${proteinUpper} g/day at ${weight.toFixed(1)} kg (1.6–2.2 g/kg).`);
 let flag='neutral',message='Keep logging. The coach needs several complete days before judging your diet trend.';
 if(week.loggedDays>=3){
  if(week.avgProtein<proteinFloor*.9){flag='high';message=`Protein has averaged ${Math.round(week.avgProtein)} g on logged days, below the ~${proteinFloor} g evidence-based lower reference.`}
  else if(week.avgProtein<targetP*.9){flag='medium';message=`Protein is reasonable, but below your app target on average (${Math.round(week.avgProtein)} vs ${Math.round(targetP)} g).`}
  else message=`Protein trend is on target: about ${Math.round(week.avgProtein)} g/day across logged days.`;
  const kcalRatio=week.avgKcal/targetK;if(p.goal==='gain'&&kcalRatio<.92){if(flag==='neutral')flag='medium';details.push(`Average logged energy is ${Math.round((1-kcalRatio)*100)}% below your current muscle-gain calorie target.`)}
  if(p.goal==='lose'&&kcalRatio>1.08){if(flag==='neutral')flag='medium';details.push(`Average logged energy is above your current fat-loss calorie target.`)}
 }
 return {today,week,proteinFloor,proteinUpper,targetP,targetK,flag,message,details};
}
function coachWeightAssessment(){
 const goal=data.profile.goal||'maintain',trend=coachWeightRate();if(!trend.enough)return {flag:'neutral',message:trend.reason,details:[trend.reason],trend};
 const p=trend.pctWeek,abs=Math.abs(p),details=[`Weight trend: ${p>=0?'+':''}${p.toFixed(2)}%/week (${trend.kgWeek>=0?'+':''}${trend.kgWeek.toFixed(2)} kg/week) across ${trend.rows} weigh-ins.`];
 if(goal==='gain'){
  if(p<0.1)return {flag:'medium',message:'Your recent weight trend is not moving upward enough to confirm a muscle-gain surplus.',details:[...details,'Practical muscle-gain reference: roughly +0.25 to +0.5% body weight/week; experienced lifters may prefer the lower end.'],trend};
  if(p>0.65)return {flag:'medium',message:'Your recent gain rate is faster than the conservative muscle-gain range.',details:[...details,'Faster scale gain is not the same thing as faster muscle gain. Consider reviewing average calorie intake if this persists.'],trend};
  return {flag:'good',message:'Your recent body-weight trend is compatible with a conservative gaining phase.',details:[...details,'Practical gaining reference: about +0.25 to +0.5% body weight/week.'],trend};
 }
 if(goal==='lose'){
  if(p>-0.2)return {flag:'medium',message:'Your recent trend is not showing a clear calorie-deficit response yet.',details:[...details,'Physique-sport reviews commonly use about 0.5–1.0% loss/week, with slower rates often preferable when lean.'],trend};
  if(p<-1.0)return {flag:'medium',message:'Your recent weight-loss rate is aggressive for preserving lean mass.',details:[...details,'Consider a less aggressive deficit, especially if strength or recovery is dropping.'],trend};
  return {flag:'good',message:'Your recent weight-loss rate sits in a commonly recommended gradual range.',details,trend};
 }
 if(abs<=.25)return {flag:'good',message:'Body weight is roughly stable, which fits a maintenance goal.',details,trend};
 return {flag:'medium',message:`Body weight is trending ${p>0?'up':'down'} despite a maintenance goal.`,details,trend};
}
function coachTrainingAssessment(){
 const muscles=coachTargetMuscles(),vol=coachRecentMuscleVolume(7),loads=muscles.map(m=>({muscle:m,load:lastMuscleLoad(m),sets:vol[m]||0})),check=latestCoachCheckin(),details=[];
 if(muscles.length)details.push(`Planned muscles: ${muscles.join(', ')}.`);else details.push('No planned strength workout detected for today.');
 loads.forEach(x=>details.push(`${x.muscle}: ${x.sets} direct completed sets in the last 7 days${x.load?` · last trained ${x.load.days===0?'today':x.load.days===1?'yesterday':`${x.load.days} days ago`}`:''}.`));
 if(muscles.length)details.push('For hypertrophy, ~10 weekly sets per muscle is a useful population-level reference, not a mandatory target or hard ceiling.');
 if(check)details.push(`Today’s check-in: ${check.feeling} · soreness ${check.soreness}.`);
 if(check&&(check.feeling==='rough'||check.soreness==='a lot'))return {flag:'high',status:'recovery',headline:'Recovery deserves priority today.',message:'Your own check-in reports substantial fatigue or soreness. Reduce the session, change the target muscles, or rest if performance and movement quality are clearly off.',details,muscles,loads};
 if(loads.some(x=>x.load?.days===0))return {flag:'high',status:'recovery',headline:'Don’t repeat hard work for the same muscles today.',message:'Part of today’s planned muscle group has already been trained today. More volume is not automatically better.',details,muscles,loads};
 if(loads.some(x=>x.load?.days===1&&x.load.sets>=8))return {flag:'medium',status:'caution',headline:'Trainable, but yesterday was substantial.',message:'You can train consecutive days, but the same muscles had a fairly large direct-set dose yesterday. Use performance, soreness and technique to decide whether to reduce volume.',details,muscles,loads};
 if(check&&check.soreness==='some')return {flag:'medium',status:'caution',headline:'Train as planned, adjust by performance.',message:'Some soreness alone does not prove you are unrecovered. Warm up, compare performance with normal, and scale back if reps, load or technique are clearly worse.',details,muscles,loads};
 return {flag:'good',status:'ready',headline:muscles.length?'Training looks reasonable today.':'No recovery warning from your log.',message:muscles.length?'Nothing in your logged training or check-in gives a strong reason to cancel the planned session.':'Choose training based on your plan rather than a made-up readiness score.',details,muscles,loads};
}
function getCoachInsight(){
 const training=coachTrainingAssessment(),nutrition=coachNutritionAssessment(),weight=coachWeightAssessment(),details=[...training.details,...nutrition.details,...weight.details];
 let status=training.status,headline=training.headline,reason=training.message,topic='TRAINING';
 if(training.flag!=='high'&&nutrition.flag==='high'){status='caution';headline='Nutrition is the clearest limiter in your log.';reason=nutrition.message;topic='NUTRITION'}
 else if(training.flag==='good'&&nutrition.flag!=='high'&&weight.flag==='medium'){status='caution';headline='Your weight trend needs a look.';reason=weight.message;topic='PROGRESS'}
 else if(training.flag==='good'&&nutrition.flag==='medium'){status='caution';headline='Training is fine. Nutrition needs tightening.';reason=nutrition.message;topic='NUTRITION'}
 return {status,headline,reason,details,muscles:training.muscles,topic,training,nutrition,weight};
}
function coachMarkup(){const c=getCoachInsight(),n=c.nutrition,w=c.weight.trend;const evidence=w?.enough?`${w.pctWeek>=0?'+':''}${w.pctWeek.toFixed(2)}%/wk`:'NEED DATA';return `<article class="card coach-card ${c.status}"><div class="coach-card-head"><span class="coach-label">GAYM COACH · ${escapeHtml(c.topic)}</span><span class="coach-status">${c.status.toUpperCase()}</span></div><strong>${escapeHtml(c.headline)}</strong><p>${escapeHtml(c.reason)}</p><div class="coach-mini-grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0"><div><small>7D PROTEIN</small><b>${n.week.loggedDays?`${Math.round(n.week.avgProtein)} g`:'—'}</b></div><div><small>WEIGHT TREND</small><b>${escapeHtml(evidence)}</b></div><div><small>FOOD DAYS</small><b>${n.week.loggedDays}/7</b></div></div><div class="coach-actions"><button class="text-btn coach-why" id="coach-why">OPEN COACH</button></div></article>`}

const NIGHT_OUT_PARTY_LINES=[
 "Oh, we're going OUT out. Hydrate, homosexual.",
 "The homosexual agenda has officially moved to the dance floor.",
 "Gym discipline by day. Questionable decisions by night. Versatile.",
 "Somewhere, your meal prep just sighed.",
 "The macros have been informed. They wish you well.",
 "Tonight's progressive overload is apparently tequila.",
 "Muscles built. Standards lowered. Let's dance.",
 "Your protein target cannot save you where you're going.",
 "Four sets of what? Babe, we're doing shots now.",
 "From progressive overload to emotional overload. Gorgeous.",
 "Your gym crush isn't here. Your ex might be. Stay alert.",
 "Cardio tonight comes with a DJ and poor spatial awareness.",
 "You trained hard. Now go stand in a bathroom queue for 35 minutes.",
 "The pump is temporary. The group chat evidence is forever.",
 "Tomorrow's GAYM Coach has already requested annual leave.",
 "Serving muscle. Soon serving absolutely no judgment.",
 "Tonight's workout: 4 × 12 bad decisions. RIR: absolutely none.",
 "Apple Watch calls it cardio. We call it dancing badly.",
 "Go forth. Be gay. Drink water occasionally.",
 "Protein tracked. Outfit questionable. Let's go."
];
const NIGHT_OUT_RARE_LINES=[
 "THE PROPHECY HAS BEEN FULFILLED. Gym. Protein. Tequila. Men. The four horsemen.",
 "The council has voted. Tonight, dignity is optional and hydration is mandatory."
];
function nightOutState(){return data.nightOut&&typeof data.nightOut==='object'?data.nightOut:null}
function yesterdayKey(){return dateOffsetKey(1)}
function pickNightOutLine(){
 const rare=Math.random()<0.05;
 const pool=rare?NIGHT_OUT_RARE_LINES:NIGHT_OUT_PARTY_LINES;
 return pool[Math.floor(Math.random()*pool.length)];
}
function nightOutSocialSource(date=isoToday()){return `nightout:${date}`}
function nightOutPlaceLabel(state=nightOutState()){
 if(!state)return '';
 if(state.locationType==='home')return 'Home';
 return String(state.place||'').trim()||'Out tonight';
}
async function publishNightOutSocial(state=nightOutState(),{notify=true}={}){
 if(!state?.shareWithFriends||!sb||!authUser||activeDataUserId!==authUser.id)return {error:null};
 const place=nightOutPlaceLabel(state),sourceId=nightOutSocialSource(state.date);
 const row={user_id:authUser.id,kind:'night_out',source_id:sourceId,title:state.locationType==='home'?'Night Out · Home':`Night Out · ${place}`,body:state.locationType==='home'?'Home tonight. The group chat has entered active duty.':`Out at ${place} tonight.`,metadata:{date:state.date,place,location_type:state.locationType||'out',active:true},visibility:'friends',updated_at:new Date().toISOString(),created_at:new Date(state.activatedAt||Date.now()).toISOString()};
 const {data:post,error}=await sb.from('activity_posts').upsert(row,{onConflict:'user_id,kind,source_id',ignoreDuplicates:false}).select('id').single();
 if(error){console.error('night out share',error);return {error}}
 socialCacheUpdatedAt=0;
 if(notify&&post?.id){const r=await sb.rpc('notify_friends_night_out',{p_post_id:post.id});if(r.error)console.error('night out friend notification',r.error)}
 return {error:null,postId:post?.id};
}
async function unpublishNightOutSocial(date=nightOutState()?.date){
 if(!date||!sb||!authUser||activeDataUserId!==authUser.id)return {error:null};
 const {error}=await sb.from('activity_posts').delete().eq('user_id',authUser.id).eq('kind','night_out').eq('source_id',nightOutSocialSource(date));
 if(error)console.error('night out unshare',error);else socialCacheUpdatedAt=0;
 return {error};
}
async function activateNightOut({shareWithFriends=false,locationType='out',place=''}={}){
 const line=pickNightOutLine();
 const normalizedType=locationType==='home'?'home':'out';
 const normalizedPlace=normalizedType==='home'?'Home':String(place||'').trim().slice(0,80);
 data.nightOut={date:isoToday(),partyLine:line,activatedAt:Date.now(),lastPromptDate:null,shareWithFriends:!!shareWithFriends,locationType:normalizedType,place:normalizedPlace};
 save();
 if(shareWithFriends){
  if(!authUser){data.nightOut.shareWithFriends=false;save();toast('Log in to share Night Out with friends.')}
  else{const r=await publishNightOutSocial(data.nightOut,{notify:true});if(r.error){data.nightOut.shareWithFriends=false;save();toast(`Night Out is active, but sharing failed: ${r.error.message}`)}else toast('Friends were notified.')}
 }
 showNightOutParty();
}
function nightOutLocationFields(state={}){
 const type=state.locationType==='home'?'home':'out',place=String(state.place||'');
 return `<div class="night-social-fields"><div class="field"><label>Where are you tonight?</label><select id="night-location-type"><option value="out" ${type==='out'?'selected':''}>Bar / club / somewhere out</option><option value="home" ${type==='home'?'selected':''}>Home</option></select></div><div class="field" id="night-place-field" ${type==='home'?'hidden':''}><label>Bar or place</label><input id="night-place" maxlength="80" value="${escapeHtml(type==='home'?'':place)}" placeholder="e.g. London Pub, Elsker, home party…"><small class="field-help">Only this place label is shared. Your drinks, calories and alcohol amounts stay private.</small></div><label class="auto-target-row night-share-toggle"><input id="night-share-friends" type="checkbox" ${state.shareWithFriends?'checked':''} ${!authUser?'disabled':''}><span><strong>Share Night Out with friends</strong><small>${authUser?'Friends get a bell notification and can react/comment in Friends Activity.':'Log in to use social sharing.'}</small></span></label></div>`;
}
function bindNightOutLocationFields(){
 const type=$('#night-location-type'),field=$('#night-place-field');if(type&&field)type.onchange=()=>{field.hidden=type.value==='home'};
}
function showNightOutConfirm(){
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Night Out Mode</p><h2>Going out tonight?</h2></div><button class="sheet-close" data-close>×</button></div>
 <article class="night-confirm-card"><strong>Tonight's coordinates?</strong><p>Tell GAYM where the plot is happening. Sharing is optional.</p></article>${nightOutLocationFields({locationType:'out',place:'',shareWithFriends:false})}
 <div class="night-confirm-actions"><button class="primary" id="night-confirm-yes">ACTIVATE NIGHT OUT</button><button class="secondary" data-close>NOT TONIGHT</button></div>`);
 bindNightOutLocationFields();
 const yes=$('#night-confirm-yes');if(yes)yes.onclick=async()=>{yes.disabled=true;yes.textContent='ACTIVATING…';await activateNightOut({shareWithFriends:!!$('#night-share-friends')?.checked,locationType:$('#night-location-type')?.value||'out',place:$('#night-place')?.value||''})};
}
function editNightOutSharing(){
 const state=nightOutState();if(!state)return showNightOutConfirm();
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Night Out</p><h2>Location & sharing</h2></div><button class="sheet-close" data-close>×</button></div>${nightOutLocationFields(state)}<div class="sheet-actions"><button class="primary" id="night-sharing-save">SAVE</button></div>`);
 bindNightOutLocationFields();
 $('#night-sharing-save').onclick=async()=>{
  const btn=$('#night-sharing-save'),wasShared=!!state.shareWithFriends,nextShared=!!$('#night-share-friends')?.checked,type=$('#night-location-type')?.value==='home'?'home':'out',place=type==='home'?'Home':String($('#night-place')?.value||'').trim().slice(0,80);
  const previous={shareWithFriends:state.shareWithFriends,locationType:state.locationType,place:state.place};
  btn.disabled=true;btn.textContent='SAVING…';
  if(wasShared&&!nextShared){const r=await unpublishNightOutSocial(state.date);if(r.error){btn.disabled=false;btn.textContent='SAVE';return toast(`Could not stop sharing: ${r.error.message}`)}}
  state.shareWithFriends=nextShared;state.locationType=type;state.place=place;if(!save()){Object.assign(state,previous);btn.disabled=false;btn.textContent='SAVE';return toast('Could not save Night Out on this device.')}
  if(nextShared){const r=await publishNightOutSocial(state,{notify:!wasShared});if(r.error){Object.assign(state,previous);save();btn.disabled=false;btn.textContent='SAVE';return toast(`Could not update sharing: ${r.error.message}`)}}
  closeSheet();showNightOutParty();toast(nextShared?'Night Out sharing updated.':'Night Out is private.');
 };
}

const NIGHT_OUT_CANCEL_LINES=[
 "Plot twist. Responsible homosexual.",
 "Plans cancelled. Macros cautiously optimistic.",
 "The dance floor has lost a soldier.",
 "Character development. Disturbing, but noted.",
 "The homosexual agenda has been postponed.",
 "Your liver just exhaled.",
 "Canceled? Fine. The group chat will survive.",
 "Tonight's bad decisions have been rescheduled."
];
function pickNightOutCancelLine(){return NIGHT_OUT_CANCEL_LINES[Math.floor(Math.random()*NIGHT_OUT_CANCEL_LINES.length)]}
function showCancelNightOut(){
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Night Out Mode</p><h2>Cancel Night Out?</h2></div><button class="sheet-close" data-close>×</button></div>
 <article class="night-confirm-card"><strong>Plans changed?</strong><p>Character development.</p></article>
 <div class="night-confirm-actions"><button class="primary" id="night-cancel-yes">YES, CANCEL</button><button class="secondary" data-close>KEEP IT ACTIVE</button></div>`);
 const yes=$('#night-cancel-yes');if(yes)yes.onclick=async()=>{const old=nightOutState();yes.disabled=true;yes.textContent='CANCELLING…';if(old?.shareWithFriends){const r=await unpublishNightOutSocial(old.date);if(r.error){yes.disabled=false;yes.textContent='YES, CANCEL';return toast(`Could not stop sharing: ${r.error.message}`)}}data.nightOut=null;save();const line=pickNightOutCancelLine();openSheet(`<div class="sheet-head"><div><p class="eyebrow">Night Out Cancelled</p><h2>Plot twist.</h2></div><button class="sheet-close" data-close>×</button></div><div class="night-party-unicorn"><div class="night-party-ring"><img src="${UNICORN_STATES.rest.image}" alt=""></div><div class="night-party-speech">${escapeHtml(line)}</div></div><button class="primary" id="night-cancel-done">BACK TO HOME</button>`);const done=$('#night-cancel-done');if(done)done.onclick=()=>{closeSheet();render()};};
}
function showNightOutParty(){
 const s=nightOutState(),line=s?.partyLine||pickNightOutLine();
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Night Out Activated</p><h2>Well then.</h2></div><button class="sheet-close" data-close>×</button></div>
 <div class="night-party-unicorn"><div class="night-party-ring"><img src="${UNICORN_STATES.evening.image}" alt=""></div><div class="night-party-speech">${escapeHtml(line)}</div></div>
 <div class="night-social-status"><span>${s?.shareWithFriends?'SHARED WITH FRIENDS':'PRIVATE'}</span><strong>${escapeHtml(nightOutPlaceLabel(s))}</strong><small>${s?.shareWithFriends?'Friends can see your Night Out and react. Drink details remain private.':'Only you can see this Night Out.'}</small></div>
 <p class="subtle">You don't need to log anything now. Come back later or tomorrow and add roughly what you drank.</p>
 <div class="night-confirm-actions"><button class="primary" id="night-open-drinks">OPEN DRINK MENU</button><button class="secondary" id="night-edit-sharing">LOCATION & SHARING</button><button class="secondary" data-close>ENJOY THE NIGHT</button><button class="text-btn night-cancel-btn" id="night-cancel-mode" type="button">CANCEL NIGHT OUT</button></div>`);
 const b=$('#night-open-drinks');if(b)b.onclick=()=>openNightOut(isoToday());
 const e=$('#night-edit-sharing');if(e)e.onclick=editNightOutSharing;
 const c=$('#night-cancel-mode');if(c)c.onclick=showCancelNightOut;
}
function nightEstimatePreset(level){
 const presets={
  light:{name:'Night out estimate · Light',units:2,kcal:260},
  social:{name:'Night out estimate · Social',units:4,kcal:520},
  lot:{name:'Night out estimate · A lot',units:7,kcal:900},
  questions:{name:'Night out estimate · I have questions',units:10,kcal:1300}
 };
 return presets[level]||null;
}
function removeNightEstimate(date){
 removeNutritionWhere(n=>n.date===date&&n.alcohol===true&&n.drinkPresetId==='night-estimate');
}
function saveNightEstimate(level,date){
 const p=nightEstimatePreset(level);if(!p)return;
 removeNightEstimate(date);
 // If exact drinks already exist, don't add a rough estimate on top of them.
 const exact=(data.nutrition||[]).some(n=>n.date===date&&n.alcohol===true&&n.drinkPresetId!=='night-estimate');
 if(exact){save();return toast('Exact drinks are already logged');}
 data.nutrition.push({id:uid(),date,name:p.name,kcal:p.kcal,protein:0,carbs:0,fat:0,fiber:0,fiberProvided:false,alcohol:true,alcoholUnits:p.units,alcoholGrams:+(p.units*12).toFixed(1),drinkPresetId:'night-estimate',quantity:1});
 if(data.nightOut)data.nightOut.lastPromptDate=isoToday();
 save();openLastNight();toast('Last night estimated');
}
function openLastNight(){
 const date=nightOutState()?.date===yesterdayKey()?yesterdayKey():(nightOutState()?.date||yesterdayKey());
 const sum=alcoholSummary(date);
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Last Night</p><h2>How much did we drink?</h2></div><button class="sheet-close" data-close>×</button></div>
 <p class="subtle">A rough estimate is enough. Or use the exact drink list if you remember the evidence.</p>
 <div class="last-night-levels">
  <button data-night-estimate="light"><strong>LIGHT</strong><small>~2 units</small></button>
  <button data-night-estimate="social"><strong>SOCIAL</strong><small>~4 units</small></button>
  <button data-night-estimate="lot"><strong>A LOT</strong><small>~7 units</small></button>
  <button data-night-estimate="questions"><strong>I HAVE QUESTIONS</strong><small>~10 units</small></button>
 </div>
 ${sum.count?`<article class="last-night-summary"><span>LOGGED</span><strong>~${sum.units.toFixed(1)} units · ~${Math.round(sum.kcal)} kcal</strong></article>`:''}
 <button class="primary" id="last-night-exact">LOG EXACT DRINKS</button>
 <button class="secondary" id="last-night-done">DONE</button>
 <p class="science-note">These quick levels are rough estimates. Exact drink logging is more accurate.</p>`);
 $$('[data-night-estimate]').forEach(b=>b.onclick=()=>saveNightEstimate(b.dataset.nightEstimate,date));
 const exact=$('#last-night-exact');if(exact)exact.onclick=()=>openNightOut(date);
 const done=$('#last-night-done');if(done)done.onclick=()=>{if(data.nightOut){data.nightOut.lastPromptDate=isoToday();save()}closeSheet();render()};
}

// v45 Night Out Mode: alcohol is stored as ordinary nutrition entries with an alcohol tag.
// Presets use Norwegian standard serving sizes and approximate nutrition. No XP, streaks or drinking records.
const NIGHT_OUT_DRINKS=[
 {id:'beer-small',group:'Beer & cider',name:'Small beer · 33 cl',detail:'Pils ~4.7%',ml:330,abv:4.7,kcal:135,protein:1.3,carbs:10.6,fat:0,units:1.0},
 {id:'beer-large',group:'Beer & cider',name:'Large beer · 50 cl',detail:'Pils ~4.7%',ml:500,abv:4.7,kcal:205,protein:2.0,carbs:16.0,fat:0,units:1.5},
 {id:'cider',group:'Beer & cider',name:'Cider · 33 cl',detail:'Sweet cider ~4.5%',ml:330,abv:4.5,kcal:195,protein:0,carbs:28.1,fat:0,units:1.0},
 {id:'wine-red',group:'Wine',name:'Red wine · 12.5 cl',detail:'~12%',ml:125,abv:12,kcal:93,protein:0.1,carbs:0.9,fat:0,units:1.0},
 {id:'wine-red-large',group:'Wine',name:'Large red wine · 17.5 cl',detail:'~12%',ml:175,abv:12,kcal:130,protein:0.2,carbs:1.2,fat:0,units:1.5},
 {id:'wine-white',group:'Wine',name:'White wine · 12.5 cl',detail:'Dry ~12%',ml:125,abv:12,kcal:86,protein:0.1,carbs:0.8,fat:0,units:1.0},
 {id:'wine-white-large',group:'Wine',name:'Large white wine · 17.5 cl',detail:'Dry ~12%',ml:175,abv:12,kcal:121,protein:0.2,carbs:1.1,fat:0,units:1.5},
 {id:'spirit',group:'Shots & simple',name:'Spirit · 4 cl',detail:'Vodka / gin / rum · 40%',ml:40,abv:40,kcal:98,protein:0,carbs:0.8,fat:0,units:1.0},
 {id:'tequila-shot',group:'Shots & simple',name:'Tequila shot · 4 cl',detail:'Tequila ~40%',ml:40,abv:40,kcal:92,protein:0,carbs:0,fat:0,units:1.0,multiShot:true},
 {id:'fireball-shot',group:'Shots & simple',name:'Fireball shot · 4 cl',detail:'Fireball ~33%',ml:40,abv:33,kcal:90,protein:0,carbs:11,fat:0,units:0.9,multiShot:true},
 {id:'vodka-soda',group:'Cocktails',name:'Vodka Soda',detail:'4 cl vodka + soda',ml:190,abv:8.4,kcal:100,protein:0,carbs:1,fat:0,units:1.0},
 {id:'gin-tonic',group:'Cocktails',name:'Gin & Tonic',detail:'4 cl gin + ~15 cl tonic',ml:190,abv:8.4,kcal:155,protein:0,carbs:14,fat:0,units:1.0},
 {id:'gin-tonic-zero',group:'Cocktails',name:'Gin & Tonic Zero',detail:'4 cl gin + zero tonic',ml:190,abv:8.4,kcal:100,protein:0,carbs:1,fat:0,units:1.0},
 {id:'vodka-redbull',group:'Cocktails',name:'Vodka Red Bull',detail:'4 cl vodka + 25 cl Red Bull',ml:290,abv:5.5,kcal:213,protein:0,carbs:28,fat:0,units:1.0,caffeineMg:80},
 {id:'vodka-redbull-zero',group:'Cocktails',name:'Vodka Red Bull Sugarfree',detail:'4 cl vodka + 25 cl sugarfree',ml:290,abv:5.5,kcal:105,protein:0,carbs:1,fat:0,units:1.0,caffeineMg:80},
 {id:'rum-coke',group:'Cocktails',name:'Rum & Coke',detail:'4 cl rum + ~15 cl Coke',ml:190,abv:8.4,kcal:161,protein:0,carbs:17,fat:0,units:1.0},
 {id:'rum-coke-zero',group:'Cocktails',name:'Rum & Coke Zero',detail:'4 cl rum + zero cola',ml:190,abv:8.4,kcal:100,protein:0,carbs:1,fat:0,units:1.0},
 {id:'moscow-mule',group:'Cocktails',name:'Moscow Mule',detail:'4 cl vodka + ginger beer + lime',ml:200,abv:8,kcal:160,protein:0,carbs:16,fat:0,units:1.0},
 {id:'mojito',group:'Cocktails',name:'Mojito',detail:'4 cl rum + lime + sugar + soda',ml:200,abv:8,kcal:145,protein:0,carbs:11,fat:0,units:1.0},
 {id:'aperol-spritz',group:'Cocktails',name:'Aperol Spritz',detail:'9 cl prosecco + 6 cl Aperol + soda',ml:180,abv:8.5,kcal:125,protein:0,carbs:10,fat:0,units:1.2}
];
function alcoholEntriesForDate(date){return (data.nutrition||[]).filter(n=>n.date===date&&n.alcohol===true)}
function alcoholSummary(date=isoToday()){
 const items=alcoholEntriesForDate(date),units=items.reduce((a,n)=>a+(Number(n.alcoholUnits)||0),0),kcal=items.reduce((a,n)=>a+(Number(n.kcal)||0),0),count=items.reduce((a,n)=>a+(Number(n.quantity)||1),0);
 return {items,units,kcal,count};
}
function nightOutHomeMarkup(){
 const s=nightOutState(),today=isoToday(),yday=yesterdayKey();
 if(s?.date===today){
  const a=alcoholSummary(today);
  const place=s.shareWithFriends?` · ${nightOutPlaceLabel(s)}`:'';const sub=(a.count?`${a.count} drink${a.count===1?'':'s'} logged · ~${a.units.toFixed(1)} units`:'Party mode is on. Log later if you want.')+place;
  return `<button class="night-out-home-btn active" id="night-out-home" type="button"><span>🍸</span><span><b>NIGHT OUT ACTIVE</b><small>${escapeHtml(sub)}</small></span><span class="chev">›</span></button>`;
 }
 if(s?.date===yday&&s.lastPromptDate!==today){
  const a=alcoholSummary(yday),sub=a.count?`~${a.units.toFixed(1)} units already logged · review if needed`:'Tell GAYM roughly what happened.';
  return `<button class="night-out-home-btn last-night" id="night-out-home" type="button"><span>🍸</span><span><b>LAST NIGHT…</b><small>${escapeHtml(sub)}</small></span><span class="chev">›</span></button>`;
 }
 return `<button class="night-out-home-btn" id="night-out-home" type="button"><span>🍸</span><span><b>GOING OUT?</b><small>Activate Night Out Mode</small></span><span class="chev">›</span></button>`;
}
function logNightOutDrink(drink,quantity=1,date=isoToday()){
 const qty=Math.max(1,Math.min(12,Math.round(Number(quantity)||1)));
 const alcoholGrams=drink.units*12*qty;
 removeNightEstimate(date);
 data.nutrition.push({id:uid(),date,name:drink.name,kcal:+(drink.kcal*qty).toFixed(1),protein:+((drink.protein||0)*qty).toFixed(1),carbs:+((drink.carbs||0)*qty).toFixed(1),fat:+((drink.fat||0)*qty).toFixed(1),fiber:0,fiberProvided:false,alcohol:true,alcoholUnits:+(drink.units*qty).toFixed(1),alcoholGrams:+alcoholGrams.toFixed(1),drinkPresetId:drink.id,drinkMl:drink.ml*qty,drinkAbv:drink.abv,caffeineMg:(drink.caffeineMg||0)*qty,quantity:qty});
 save();
}
function undoNightOutDrink(id,date=isoToday()){if(removeNutritionWhere(n=>String(n.id)===String(id))){save();refreshUnderlyingView();openNightOut(date);toast('Drink removed')}}
function openNightOut(date=isoToday()){
 const today=alcoholSummary(date),groups=[...new Set(NIGHT_OUT_DRINKS.map(x=>x.group))];
 const logged=today.items.length?`<div class="night-out-tally"><div><span>TONIGHT</span><strong>${today.count} drink${today.count===1?'':'s'}</strong></div><div><span>ALCOHOL</span><strong>~${today.units.toFixed(1)} units</strong></div><div><span>CALORIES</span><strong>~${Math.round(today.kcal)} kcal</strong></div></div><div class="night-out-logged">${today.items.map(n=>`<div><span><strong>${escapeHtml(n.name)}</strong><small>~${Number(n.alcoholUnits||0).toFixed(1)} unit · ${Math.round(Number(n.kcal)||0)} kcal</small></span><button class="text-btn" data-remove-drink="${n.id}">REMOVE</button></div>`).join('')}</div>`:'';
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Night Out Mode</p><h2>Going out?</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">Add what you remember. GAYM logs it straight into Nutrition, so calories, Coach and Bottom Check all use the same data.</p>${logged}${groups.map(g=>`<section class="night-out-group"><p class="eyebrow">${escapeHtml(g)}</p><div class="night-out-grid">${NIGHT_OUT_DRINKS.filter(x=>x.group===g).map(d=>d.multiShot?`<div class="night-drink-card shot-multi-card"><span class="night-drink-name">${escapeHtml(d.name)}</span><span class="night-drink-detail">${escapeHtml(d.detail)}</span><span class="night-drink-macros">${d.kcal} kcal · C ${Math.round(d.carbs)}g · ~${d.units.toFixed(1)} unit each</span><div class="shot-quick-row" aria-label="${escapeHtml(d.name)} quantity"><button type="button" data-multi-drink="${d.id}" data-qty="1">+1</button><button type="button" data-multi-drink="${d.id}" data-qty="2">+2</button><button type="button" data-multi-drink="${d.id}" data-qty="3">+3</button><button type="button" data-multi-drink="${d.id}" data-qty="4">+4</button></div></div>`:`<button class="night-drink-card" data-drink="${d.id}"><span class="night-drink-name">${escapeHtml(d.name)}</span><span class="night-drink-detail">${escapeHtml(d.detail)}</span><span class="night-drink-macros">${d.kcal} kcal · C ${Math.round(d.carbs)}g · ~${d.units.toFixed(1)} unit</span></button>`).join('')}</div></section>`).join('')}<button class="secondary night-out-other" id="night-out-other">+ OTHER DRINK</button><p class="science-note">Amounts are practical estimates, not lab measurements. Norwegian standard: about 12 g alcohol per unit. No scores or rewards for drinking more.</p>`);
 $$('[data-drink]').forEach(b=>b.onclick=()=>{const d=NIGHT_OUT_DRINKS.find(x=>x.id===b.dataset.drink);if(!d)return;logNightOutDrink(d,1,date);refreshUnderlyingView();openNightOut(date);toast(`${d.name} logged`)});
 $$('[data-multi-drink]').forEach(b=>b.onclick=()=>{const d=NIGHT_OUT_DRINKS.find(x=>x.id===b.dataset.multiDrink),qty=Math.max(1,Math.min(4,Number(b.dataset.qty)||1));if(!d||!d.multiShot)return;logNightOutDrink(d,qty,date);refreshUnderlyingView();openNightOut(date);toast(`${qty} × ${d.name} logged`)});
 $$('[data-remove-drink]').forEach(b=>b.onclick=()=>undoNightOutDrink(b.dataset.removeDrink,date));
 const other=$('#night-out-other');if(other)other.onclick=()=>{const name=(prompt('Drink name')||'').trim();if(!name)return;const units=Math.max(0,Math.min(10,Number(prompt('Approx. alcohol units for this drink (1 = about 12 g alcohol)')||0)));const kcal=Math.max(0,Math.min(2000,Number(prompt('Approx. calories for this drink')||0)));if(!units&&!kcal)return toast('Add units or calories');removeNightEstimate(date);data.nutrition.push({id:uid(),date,name,kcal,protein:0,carbs:0,fat:0,fiber:0,fiberProvided:false,alcohol:true,alcoholUnits:+units.toFixed(1),alcoholGrams:+(units*12).toFixed(1),drinkPresetId:'other',quantity:1});save();refreshUnderlyingView();openNightOut(date);toast(`${name} logged`)};
}
function recentAlcoholContext(){
 const y=dateOffsetKey(1),today=alcoholSummary(isoToday()),yday=alcoholSummary(y);
 return {today,yday};
}
function bottomHomeMarkup(){const check=latestBottomCheckin(),result=check?bottomAssessment(check):null;const status=result?`<span class="bottom-home-status ${result.level}">${escapeHtml(result.title)}</span>`:'<span class="bottom-home-status">QUICK CHECK</span>';return `<button class="card bottom-home-card" id="bottom-check" type="button"><span class="bottom-home-icon">🍑</span><span class="grow"><span class="bottom-home-kicker">BOTTOM CHECK</span><strong>Want to bottom?</strong><small>${result?escapeHtml(result.subtitle):'Check your gut + the food you actually logged.'}</small></span><span class="bottom-home-right">${status}<span class="chev">›</span></span></button>`}

const BOTTOM_GAS_TERMS=[
 'bean','beans','black bean','kidney bean','lentil','lentils','chickpea','chickpeas','onion','onions','garlic','broccoli','cauliflower','cabbage','brussels sprout','edamame','peas',
 'böna','bönor','svarta bönor','kidneybönor','lins','linser','kikärta','kikärter','lök','gul lök','rödlök','vitlök','broccoli','blomkål','kål','rosenkål','ärtor',
 'bønne','bønner','svarte bønner','kidneybønner','linse','linser','kikerter','løk','gul løk','rødløk','hvitløk','brokkoli','blomkål','kål','rosenkål','erter',
 'carbonated','sparkling water','soda','fizzy','kolsyrad','kullsyre','brus'
];
const BOTTOM_SPICY_TERMS=['chili','chilli','chili flakes','chiliflakes','jalapeño','jalapeno','hot sauce','sriracha','cayenne','tabasco','habanero','spicy','stark sås','stark salsa','stark mat','sterk saus','sterk salsa','sterk mat'];
function dateOffsetKey(daysBack){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-daysBack);return isoToday(d)}
function normalizedFoodText(value=''){return String(value||'').toLocaleLowerCase('sv-SE').normalize('NFKC')}
function trustedLoggedRecipe(n){
 if(!n?.recipeId)return null;
 const r=findRecipe(n.recipeId);if(!r)return null;
 // Never scan a random recipe just because an old/stale recipeId happens to exist.
 return normalizedFoodText(r.name)===normalizedFoodText(n.name)?r:null;
}
function bottomMealText(n){
 const snapshot=Array.isArray(n?.ingredientsSnapshot)?n.ingredientsSnapshot:[];
 const r=snapshot.length?null:trustedLoggedRecipe(n);
 const ingredients=snapshot.length?snapshot:(r?.ingredients||[]);
 return normalizedFoodText(`${n?.name||''} ${ingredients.join(' ')}`);
}
function matchedTermsForEntry(n,terms){const text=bottomMealText(n);return terms.filter(t=>text.includes(normalizedFoodText(t)))}
function uniqueTriggerLabels(entries,terms){const found=[];entries.forEach(n=>{if(matchedTermsForEntry(n,terms).length&&!found.includes(n.name))found.push(n.name)});return found.slice(0,6)}
function hasReliableFiber(n){
 if(!n)return false;
 if(n.fiberProvided===true)return true;
 if(Array.isArray(n.ingredientsSnapshot)&&n.recipeId)return Number.isFinite(Number(n.fiber));
 if(trustedLoggedRecipe(n))return Number.isFinite(Number(n.fiber));
 // Legacy custom food entries stored 0 even when the field was left blank, so only positive values are trustworthy.
 return Number(n.fiber)>0;
}
function bottomNutritionAnalysis(){
 const days=[0,1,2,3].map(dateOffsetKey),entries=(data.nutrition||[]).filter(n=>days.includes(n.date));
 const loggedDays=days.filter(date=>entries.some(n=>n.date===date)).length;
 const fiberDays=days.map(date=>{const dayEntries=entries.filter(n=>n.date===date),known=dayEntries.filter(hasReliableFiber);return {date,hasFood:dayEntries.length>0,known:known.length>0,total:known.reduce((sum,n)=>sum+(Number(n.fiber)||0),0),knownEntries:known.length,totalEntries:dayEntries.length}});
 const knownFiberDays=fiberDays.filter(x=>x.known),fiberValues=knownFiberDays.map(x=>x.total);
 const avgFiber=fiberValues.length?fiberValues.reduce((a,b)=>a+b,0)/fiberValues.length:0;
 const spread=fiberValues.length>1?Math.max(...fiberValues)-Math.min(...fiberValues):0;
 const fiberConsistent=fiberValues.length>=2&&spread<=Math.max(10,avgFiber*.45);
 const fiberCoverage=knownFiberDays.length;
 const gasFoods=uniqueTriggerLabels(entries,BOTTOM_GAS_TERMS),spicyFoods=uniqueTriggerLabels(entries,BOTTOM_SPICY_TERMS),alcoholItems=entries.filter(n=>n.alcohol===true),alcoholUnits=alcoholItems.reduce((a,n)=>a+(Number(n.alcoholUnits)||0),0);
 return {days,entries,loggedDays,fiberDays,fiberCoverage,avgFiber,fiberConsistent,gasFoods,spicyFoods,alcoholItems,alcoholUnits};
}
function latestBottomCheckin(){return (data.bottomCheckins||[]).filter(x=>x.date===isoToday()).at(-1)||null}
function bottomAssessment(check=latestBottomCheckin()){
 const nutrition=bottomNutritionAnalysis();
 if(!check)return {level:'unknown',title:'CHECK IN FIRST',subtitle:'Tell GAYM how your stomach is behaving right now.',checks:[],nutrition};
 const severe=check.bowel==='loose'||check.stomach==='upset'||check.urgency==='yes';
 const caution=check.bowel==='hard'||check.bowel==='notyet'||check.stomach==='bloated'||check.stomach==='gassy'||check.urgency==='little';
 const level=severe?'wait':caution?'maybe':'good';
 const title=level==='good'?'LOOKING GOOD':level==='maybe'?'MAYBE LATER':'NOT A GREAT DAY';
 const subtitle=level==='good'?'No obvious digestive red flags.':level==='maybe'?'Your digestion seems a little less predictable today.':'Your current gut symptoms suggest giving it some time.';
 const checks=[];
 if(check.bowel==='normal')checks.push({ok:true,text:'Normal bowel movement'});
 else if(check.bowel==='notyet')checks.push({ok:false,text:'No bowel movement yet'});
 else if(check.bowel==='hard')checks.push({ok:false,text:'Bowel movement felt hard / constipated'});
 else if(check.bowel==='loose')checks.push({ok:false,text:'Loose bowel movement'});
 if(check.stomach==='calm')checks.push({ok:true,text:'Stomach feels calm'});else checks.push({ok:false,text:`Stomach feels ${check.stomach}`});
 if(check.urgency==='no')checks.push({ok:true,text:'No urgency'});else checks.push({ok:false,text:check.urgency==='little'?'Some urgency':'Urgency reported'});
 if(nutrition.fiberCoverage>=2)checks.push({ok:nutrition.fiberConsistent,text:nutrition.fiberConsistent?'Fiber has been consistent':'Fiber intake has varied recently',support:true});
 else checks.push({ok:null,text:'Not enough logged fiber data',support:true,neutral:true});
 if(nutrition.gasFoods.length||nutrition.spicyFoods.length||nutrition.alcoholUnits>0)checks.push({ok:level==='good',text:'Possible digestive triggers in foods or drinks you logged',support:true});
 else if(nutrition.loggedDays>=1)checks.push({ok:true,text:'No obvious food or drink triggers in logged meals',support:true});
 else checks.push({ok:null,text:'No recent food logs to analyse',support:true,neutral:true});
 return {level,title,subtitle,checks,nutrition};
}
function bottomUnicorn(result){
 if(result.level==='good')return {image:UNICORN_STATES.default.image,label:'UNICORN VERDICT',text:'The runway looks calm. Air traffic control has no further comments.'};
 if(result.level==='maybe')return {image:UNICORN_STATES.judging.image,label:'UNICORN VERDICT',text:'The runway is experiencing weather. Patience is still hot.'};
 return {image:UNICORN_STATES.rest.image,label:'UNICORN VERDICT',text:'Give your gut some time. Even icons reschedule.'};
}
function bottomResultMarkup(result){
 const cls=result.level==='good'?'good':result.level==='maybe'?'maybe':'wait',u=bottomUnicorn(result);
 return `<section class="bottom-result ${cls} bottom-result-reveal"><p class="eyebrow">BOTTOM CHECK</p><h2><span>🍑</span> ${escapeHtml(result.title)}</h2><p>${escapeHtml(result.subtitle)}</p><div class="bottom-result-list">${result.checks.map(x=>`<div class="${x.neutral?'neutral':x.ok?'ok':'flag'}"><span>${x.neutral?'·':x.ok?'✓':'!'}</span><strong>${escapeHtml(x.text)}</strong></div>`).join('')}</div><button class="text-btn" id="bottom-why">WHY?</button></section><aside class="bottom-unicorn-card"><img src="${u.image}" alt=""><div><span>${escapeHtml(u.label)}</span><p>${escapeHtml(u.text)}</p></div></aside>`;
}
function openBottomCheck(){
 const existing=latestBottomCheckin(),result=existing?bottomAssessment(existing):null;
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">GAYM Coach</p><h2>Want to bottom?</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">A quick digestive comfort check using how you feel now plus only the food you actually logged in the last 4 days.</p>${result?bottomResultMarkup(result):''}<section class="section bottom-check-form"><p class="eyebrow">Bathroom today?</p><div class="bottom-choice-grid four">${[['normal','NORMAL'],['hard','HARD'],['loose','LOOSE'],['notyet','NOT YET']].map(([v,l])=>`<button class="small-btn ${existing?.bowel===v?'active':''}" data-bottom-bowel="${v}">${l}</button>`).join('')}</div><p class="eyebrow">Stomach right now?</p><div class="bottom-choice-grid four">${[['calm','CALM'],['bloated','BLOATED'],['gassy','GASSY'],['upset','UPSET']].map(([v,l])=>`<button class="small-btn ${existing?.stomach===v?'active':''}" data-bottom-stomach="${v}">${l}</button>`).join('')}</div><p class="eyebrow">Any urgency?</p><div class="bottom-choice-grid three">${[['no','NO'],['little','A LITTLE'],['yes','YES']].map(([v,l])=>`<button class="small-btn ${existing?.urgency===v?'active':''}" data-bottom-urgency="${v}">${l}</button>`).join('')}</div><button class="primary bottom-check-save" id="bottom-check-save">CHECK ME</button></section><p class="science-note">This estimates digestive comfort, not certainty. Your current symptoms matter more than food-pattern signals.</p>`);
 const state={bowel:existing?.bowel||'',stomach:existing?.stomach||'',urgency:existing?.urgency||''};
 function choose(attr,val,selector){state[attr]=val;$$(selector).forEach(b=>b.classList.toggle('active',b.dataset[selector.includes('bowel')?'bottomBowel':selector.includes('stomach')?'bottomStomach':'bottomUrgency']===val))}
 $$('[data-bottom-bowel]').forEach(b=>b.onclick=()=>choose('bowel',b.dataset.bottomBowel,'[data-bottom-bowel]'));
 $$('[data-bottom-stomach]').forEach(b=>b.onclick=()=>choose('stomach',b.dataset.bottomStomach,'[data-bottom-stomach]'));
 $$('[data-bottom-urgency]').forEach(b=>b.onclick=()=>choose('urgency',b.dataset.bottomUrgency,'[data-bottom-urgency]'));
 $('#bottom-check-save').onclick=()=>{if(!state.bowel||!state.stomach||!state.urgency)return toast('Answer all three first');data.bottomCheckins=(data.bottomCheckins||[]).filter(x=>x.date!==isoToday());data.bottomCheckins.push({id:uid(),date:isoToday(),createdAt:Date.now(),...state});save();refreshUnderlyingView();openBottomCheck()};
 const why=$('#bottom-why');if(why)why.onclick=openBottomWhy;
}
function openBottomWhy(){
 const r=bottomAssessment(),n=r.nutrition;
 const gas=n.gasFoods.length?n.gasFoods.join(' · '):n.loggedDays?'None detected':'No logged food',spicy=n.spicyFoods.length?n.spicyFoods.join(' · '):n.loggedDays?'None detected':'No logged food',alcohol=n.alcoholUnits>0?`~${n.alcoholUnits.toFixed(1)} units across logged drinks`:(n.loggedDays?'None logged':'No logged food');
 const fiber=n.fiberCoverage>=1?`${Math.round(n.avgFiber)} g/day avg across ${n.fiberCoverage} day${n.fiberCoverage===1?'':'s'}${n.fiberCoverage>=2?` · ${n.fiberConsistent?'CONSISTENT':'VARIABLE'}`:''}`:'Not enough logged fiber data';
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Bottom Check</p><h2>Why this result?</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">Today’s check-in carries the most weight. Nutrition analysis uses only meals and foods actually present in your log.</p><div class="bottom-why-card"><p class="eyebrow">CURRENT CHECK-IN</p>${r.checks.filter(x=>!x.support).slice(0,4).map(x=>`<div><span>${x.ok?'✓':'!'}</span><strong>${escapeHtml(x.text)}</strong></div>`).join('')}</div><div class="bottom-why-card"><p class="eyebrow">LAST 4 DAYS · LOGGED FOOD ONLY</p><div><span>FIBER</span><strong>${escapeHtml(fiber)}</strong></div><div><span>POSSIBLE GAS TRIGGERS</span><strong>${escapeHtml(gas)}</strong></div><div><span>SPICY FOOD</span><strong>${escapeHtml(spicy)}</strong></div><div><span>ALCOHOL</span><strong>${escapeHtml(alcohol)}</strong></div><div><span>FOOD LOG COVERAGE</span><strong>${n.loggedDays}/4 days</strong></div></div><p class="science-note">Trigger matching understands common English, Swedish and Norwegian ingredient words. Recipe ingredients are analysed only when that recipe was actually logged. A calm stomach and normal bowel movement still outweigh possible food triggers.</p>`);
}
function openCoachWhy(){
 const c=getCoachInsight(),check=latestCoachCheckin(),n=c.nutrition,w=c.weight,t=c.training;
 const weightLine=w.trend?.enough?`${w.trend.pctWeek>=0?'+':''}${w.trend.pctWeek.toFixed(2)}%/week · ${w.trend.rows} weigh-ins`:'Not enough trend data yet';
 const volume=t.loads?.length?t.loads.map(x=>`<div><span>${escapeHtml(x.muscle)}</span><strong>${x.sets} sets / 7d</strong></div>`):'<p class="subtle">No planned strength muscles to analyse today.</p>';
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">GAYM Coach · Evidence mode</p><h2>${escapeHtml(c.headline)}</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">This coach is deterministic: it reads your own logs and applies conservative evidence-based rules. It does not invent recovery percentages, diagnose injuries or pretend incomplete food logs are complete.</p><div class="coach-reasons"><div><span>PRIORITY</span><strong>${escapeHtml(c.topic)} · ${c.status.toUpperCase()}</strong></div><p>${escapeHtml(c.reason)}</p></div><section class="section"><p class="eyebrow">TRAINING</p><div class="bottom-why-card">${volume}</div><p>${escapeHtml(t.message)}</p></section><section class="section"><p class="eyebrow">NUTRITION</p><div class="bottom-why-card"><div><span>7-DAY LOG COVERAGE</span><strong>${n.week.loggedDays}/7 days</strong></div><div><span>AVG PROTEIN</span><strong>${n.week.loggedDays?`${Math.round(n.week.avgProtein)} g/day`:'—'}</strong></div><div><span>AVG ENERGY</span><strong>${n.week.loggedDays?`${Math.round(n.week.avgKcal)} kcal/day`:'—'}</strong></div><div><span>PROTEIN REFERENCE</span><strong>${n.proteinFloor}–${n.proteinUpper} g/day</strong></div></div><p>${escapeHtml(n.message)}</p></section><section class="section"><p class="eyebrow">BODY-WEIGHT TREND</p><div class="bottom-why-card"><div><span>TREND</span><strong>${escapeHtml(weightLine)}</strong></div><div><span>GOAL</span><strong>${escapeHtml(goalLabel(data.profile.goal))}</strong></div></div><p>${escapeHtml(w.message)}</p></section><section class="section"><p class="eyebrow">QUICK CHECK-IN</p><div class="coach-check-grid"><button data-feeling="great" class="small-btn ${check?.feeling==='great'?'active':''}">GREAT</button><button data-feeling="normal" class="small-btn ${check?.feeling==='normal'?'active':''}">NORMAL</button><button data-feeling="rough" class="small-btn ${check?.feeling==='rough'?'active':''}">ROUGH</button></div><div class="coach-check-grid soreness"><button data-soreness="none" class="small-btn ${check?.soreness==='none'?'active':''}">NO SORENESS</button><button data-soreness="some" class="small-btn ${check?.soreness==='some'?'active':''}">SOME</button><button data-soreness="a lot" class="small-btn ${check?.soreness==='a lot'?'active':''}">A LOT</button></div></section><section class="section"><p class="eyebrow">SCIENCE BASE</p><div class="coach-reasons"><p>• ${escapeHtml(COACH_EVIDENCE.training)}</p><p>• ${escapeHtml(COACH_EVIDENCE.protein)}</p><p>• ${escapeHtml(data.profile.goal==='lose'?COACH_EVIDENCE.loss:COACH_EVIDENCE.gain)}</p><p>• ${escapeHtml(COACH_EVIDENCE.effort)}</p></div><p class="science-note">Population research gives ranges, not guarantees. Individual response is judged from your multi-week weight and performance trends. Pain, illness, injury or persistent unusual fatigue belongs outside this algorithm and may need a qualified clinician or coach.</p></section>`);
 let feeling=check?.feeling||'normal',soreness=check?.soreness||'none';function commit(){data.coachCheckins=(data.coachCheckins||[]).filter(x=>x.date!==isoToday());data.coachCheckins.push({date:isoToday(),feeling,soreness,at:Date.now()});save();openCoachWhy()}$$('[data-feeling]').forEach(b=>b.onclick=()=>{feeling=b.dataset.feeling;commit()});$$('[data-soreness]').forEach(b=>b.onclick=()=>{soreness=b.dataset.soreness;commit()})
}
function weekCoachReview(){
 const week=thisWeekSessions(),strength=week.filter(s=>s.type!=='cardio'&&s.type!=='group'),cardio=week.filter(s=>s.type==='cardio'),group=week.filter(s=>s.type==='group'),sets=strength.reduce((n,s)=>n+(s.doneSets||0),0),prs=strength.reduce((n,s)=>n+(s.prs?.length||0),0),vol=coachRecentMuscleVolume(7),entries=Object.entries(vol).sort((a,b)=>a[1]-b[1]),nut=coachNutritionWindow(7),wt=coachWeightRate();
 const win=prs?`${prs} new PB${prs===1?'':'s'} this week.`:strength.length?`${strength.length} strength session${strength.length===1?'':'s'} logged.`:'No strength sessions logged yet.';
 let watch=nut.loggedDays<3?'Nutrition trend needs more complete log days.':nut.avgProtein<Math.max(1.6*(Number(data.profile.weight)||70),(Number(data.profile.proteinTarget)||0)*.9)?`Protein averaged ${Math.round(nut.avgProtein)} g on logged days.`:entries.length?`${entries[0][0]} has ${entries[0][1]} direct sets across the last 7 days.`:'Keep logging sessions to build a volume picture.';
 let next=wt.enough?`Weight trend: ${wt.pctWeek>=0?'+':''}${wt.pctWeek.toFixed(2)}%/week. Judge calories from this multi-week direction, not one weigh-in.`:'Add regular weigh-ins so the coach can judge whether calories match your goal.';
 return {summary:`${week.length} workouts · ${sets} sets · ${cardio.length} cardio · ${prs} PB${prs===1?'':'s'}`,win,watch,next};
}
function sessionCoachSummary(session){
 if(session.type==='cardio')return ['Cardio logged. The coach records it, but does not invent calorie burn from duration alone.'];
 const tips=[];(session.items||[]).forEach(item=>{const p=progressionInfo(item,session.id),best=bestCompletedSet(item);if(best&&p.previous){const now=estimated1RM(best.weight,best.reps),old=estimated1RM(p.previous.weight,p.previous.reps);if(now>old*1.01)tips.push(`${item.name}: estimated performance improved versus the previous logged session.`)}});
 return tips.slice(0,2).length?tips.slice(0,2):['Session logged. Progress will be judged across repeated performances, not from one workout alone.'];
}

function lastExerciseSession(name,excludeSessionId=''){
 const key=String(name||'').trim().toLowerCase();return sortedSessionsDesc().find(s=>s.id!==excludeSessionId&&s.completed!==false&&s.type!=='cardio'&&(s.items||[]).some(x=>String(x.name||'').trim().toLowerCase()===key))||null;
}
function exerciseItemInSession(session,name){const key=String(name||'').trim().toLowerCase();return (session?.items||[]).find(x=>String(x.name||'').trim().toLowerCase()===key)||null}
function isTimedExercise(itemOrName){const name=String(typeof itemOrName==='string'?itemOrName:itemOrName?.name||'').trim().toLowerCase();return name==='plank'||name==='dead hang'||name==='isometric hold'||name==='single-leg balance'||name==='calf isometric'||name==='hip mobility flow'}
function timedPerSide(itemOrName){const name=String(typeof itemOrName==='string'?itemOrName:itemOrName?.name||'').trim().toLowerCase();return name==='single-leg balance'||name==='hip mobility flow'}
function formatTimedSeconds(value){const sec=Math.max(0,Number(value)||0);if(sec<60)return `${sec} sec`;const m=Math.floor(sec/60),s=Math.round(sec%60);return `${m}:${String(s).padStart(2,'0')}`}
function bestCompletedSet(item){return (item?.sets||[]).filter(z=>z.done!==false&&Number(z.weight)>0&&Number(z.reps)>0).sort((a,b)=>estimated1RM(Number(b.weight),Number(b.reps))-estimated1RM(Number(a.weight),Number(a.reps)))[0]||null}
function targetRepTop(target=''){const nums=String(target).match(/\d+/g)||[];return nums.length?Number(nums.at(-1)):null}
function progressionInfo(item,excludeSessionId=''){
 const previous=lastExerciseSession(item.name,excludeSessionId);if(!previous)return {previous:null,hint:'First logged session. Build a clean baseline.'};
 const prevItem=exerciseItemInSession(previous,item.name),best=bestCompletedSet(prevItem);if(!best)return {previous:null,hint:'Log working-set weight and reps to unlock progression.'};
 const top=targetRepTop(item.targetReps),done=(prevItem.sets||[]).filter(z=>z.done!==false&&Number(z.weight)>0&&Number(z.reps)>0),sameWeight=done.length&&done.every(z=>Math.abs(Number(z.weight)-Number(best.weight))<.001),hitTop=top&&done.length&&done.every(z=>Number(z.reps)>=top),base=Number(best.weight);
 const rawStep=Math.max(.5,base*.025),step=Math.max(.5,Math.round(rawStep*2)/2),suggested=hitTop&&sameWeight?Math.round((base+step)*2)/2:null;
 return {previous:{weight:base,reps:Number(best.reps),date:previous.date},hint:suggested?`Top of rep range reached: try ${suggested} kg with clean reps`:`Match ${base} kg and add a rep where technique stays solid`};
}
function nextTimeSummary(session){
 if(!session||session.type==='cardio')return [];
 return (session.items||[]).map(item=>{const best=bestCompletedSet(item);if(!best)return null;const top=targetRepTop(item.targetReps),done=(item.sets||[]).filter(z=>z.done&&Number(z.weight)>0&&Number(z.reps)>0),allTop=top&&done.length&&done.every(z=>Number(z.reps)>=top&&Number(z.weight)===Number(best.weight)),step=Number(best.weight)>=40?2.5:1;return {name:item.name,current:`${Number(best.weight)} kg × ${Number(best.reps)}`,next:allTop?`Try ${Math.round((Number(best.weight)+step)*2)/2} kg`:`Beat ${Number(best.weight)} kg × ${Number(best.reps)}`}}).filter(Boolean).slice(0,3);
}
function actionToast(message,label,onAction,duration=5200){
 const t=$('#toast');clearTimeout(toast._t);t.innerHTML=`<span>${escapeHtml(message)}</span><button type="button" class="toast-action">${escapeHtml(label)}</button>`;t.classList.add('show','actionable');const btn=$('.toast-action',t);if(btn)btn.onclick=()=>{t.classList.remove('show','actionable');t.textContent='';onAction?.()};toast._t=setTimeout(()=>{t.classList.remove('show','actionable');t.textContent=''},duration);
}
function startWorkoutTemplate(w){activeExerciseOpen=0;data.activeSession={id:uid(),workoutId:w.id||'',name:w.name,type:w.type||'strength',program:w.program||'',programDay:w.programDay||null,beginner:!!w.beginner,startedAt:Date.now(),date:isoToday(),notes:w.notes||'',duration:w.duration||0,distance:w.distance||0,mode:w.mode||'',items:(w.items||[]).map(x=>({name:x.name,muscle:x.muscle||'',equipment:x.equipment||'',targetReps:x.reps||'',beginnerGuideKey:x.beginnerGuideKey||'',note:x.note||'',sets:Array.from({length:x.sets||3},()=>({weight:'',reps:'',done:false}))}))};save();go('active')}
function startWorkout(id){const w=data.customWorkouts.find(w=>w.id===id);if(!w)return go('workout');if(w.type==='cardio')return openLogCardio({activity:w.mode||w.name,duration:w.duration||'',distance:w.distance||'',notes:w.notes||''});startWorkoutTemplate(w)}
let activeExerciseOpen=0;
let timedSetTimer=null;
function timedSetKey(i,j){return `${i}:${j}`}
function timedSetTarget(item,set){
 const manual=Number(set?.reps)||0;
 return Math.max(1,Math.round(manual||targetRepTop(item?.targetReps)||60));
}
function timedSetElapsed(timer,now=Date.now()){
 return Math.max(0,Math.min(timer.targetSeconds,Math.floor((now-timer.startedAt)/1000)));
}
function clearTimedSetInterval(){
 if(timedSetTimer?.intervalId){clearInterval(timedSetTimer.intervalId);timedSetTimer.intervalId=null}
}
function paintTimedSetTimer(){
 const timer=timedSetTimer;if(!timer)return;
 if(!data.activeSession||data.activeSession.id!==timer.sessionId){clearTimedSetInterval();timedSetTimer=null;return}
 const item=data.activeSession.items?.[timer.itemIndex],set=item?.sets?.[timer.setIndex];
 if(!item||!set||!isTimedExercise(item)){clearTimedSetInterval();timedSetTimer=null;return}
 const elapsed=timedSetElapsed(timer),remaining=Math.max(0,timer.targetSeconds-elapsed);
 set.reps=String(elapsed);
 const key=timedSetKey(timer.itemIndex,timer.setIndex);
 const input=document.querySelector(`[data-reps="${key}"]`);
 if(input&&document.activeElement!==input)input.value=String(elapsed);
 const button=document.querySelector(`[data-timed-timer="${key}"]`);
 if(button){
  button.classList.add('running');
  button.setAttribute('aria-label',`Stop timer. ${remaining} seconds remaining`);
  button.innerHTML=`<span aria-hidden="true">■</span><small>${remaining}s</small>`;
 }
 if(remaining<=0){
  set.reps=String(timer.targetSeconds);save();clearTimedSetInterval();timedSetTimer=null;
  if(input)input.value=String(timer.targetSeconds);
  if(button){button.classList.remove('running');button.setAttribute('aria-label','Start timer');button.innerHTML='<span aria-hidden="true">⏱</span>'}
  toast(`${timer.targetSeconds} sec complete`);
 }
}
function stopTimedSetTimer({saveElapsed=true}={}){
 const timer=timedSetTimer;if(!timer)return;
 const elapsed=timedSetElapsed(timer);
 clearTimedSetInterval();
 if(saveElapsed&&data.activeSession?.id===timer.sessionId){
  const set=data.activeSession.items?.[timer.itemIndex]?.sets?.[timer.setIndex];
  if(set){set.reps=String(elapsed);save()}
 }
 timedSetTimer=null;
}
function startTimedSetTimer(i,j){
 const s=data.activeSession,item=s?.items?.[i],set=item?.sets?.[j];
 if(!s||!item||!set||!isTimedExercise(item))return;
 if(timedSetTimer){
  if(timedSetTimer.sessionId===s.id&&timedSetTimer.itemIndex===i&&timedSetTimer.setIndex===j){stopTimedSetTimer({saveElapsed:true});activeExerciseOpen=i;active();return}
  stopTimedSetTimer({saveElapsed:true});
 }
 const targetSeconds=timedSetTarget(item,set);
 set.reps='0';save();
 timedSetTimer={sessionId:s.id,itemIndex:i,setIndex:j,targetSeconds,startedAt:Date.now(),intervalId:null};
 paintTimedSetTimer();
 timedSetTimer.intervalId=setInterval(paintTimedSetTimer,250);
}

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
function updateActiveProgressUI(s){
 const total=s.items.reduce((sum,item)=>sum+(item.sets?.length||0),0),done=s.items.reduce((sum,item)=>sum+(item.sets||[]).filter(set=>set.done).length,0),count=$('#active-set-count'),bar=$('#active-progress-bar');if(count)count.textContent=`${done} of ${total} sets completed`;if(bar)bar.style.width=`${total?done/total*100:0}%`;
}
function active(){
 const s=data.activeSession;if(!s){go('workout');return}if(s.type==='cardio'){const legacy=structuredClone(s);data.activeSession=null;save();go('workout');setTimeout(()=>openLogCardio({activity:legacy.mode||legacy.name||'Cardio',duration:legacy.duration||'',distance:legacy.distance||'',notes:legacy.notes||''}),0);return}const mins=sessionElapsedMinutes(s);
 const total=s.items.reduce((sum,item)=>sum+(item.sets?.length||0),0),done=s.items.reduce((sum,item)=>sum+(item.sets||[]).filter(set=>set.done).length,0);
 shell(`${header('Workout',true)}<div class="workout-header"><p class="eyebrow">${escapeHtml(s.type)} · <span id="workout-elapsed-min">${mins}</span> min</p><h1 class="page-title">${escapeHtml(s.name)}</h1><p class="subtle"><span id="active-set-count">${done} of ${total} sets completed</span> · changes save automatically</p><div class="progress-line"><span id="active-progress-bar" style="width:${total?done/total*100:0}%"></span></div></div>${s.beginner?`<article class="beginner-active-tip"><span class="eyebrow">BEGINNER MODE</span><strong>Need help? Open HOW TO before the set.</strong><small>Start light. A controlled rep is more useful than a heavier ugly one.</small></article>`:''}
  <div id="active-session-list">${s.items.map((x,i)=>{const prog=progressionInfo(x,s.id),timed=isTimedExercise(x),perSide=timedPerSide(x);return `<details class="session-exercise" data-exercise-index="${i}" ${i===activeExerciseOpen?'open':''}><summary><span class="exercise-num">${i+1}</span><strong>${escapeHtml(x.name)}</strong><span class="chev">⌄</span></summary><div class="sets"><div class="exercise-order-controls"><button type="button" class="small-btn ghost" data-move-exercise-up="${i}" ${i===0?'disabled':''} aria-label="Move ${escapeHtml(x.name)} up">↑ MOVE UP</button><button type="button" class="small-btn ghost" data-move-exercise-down="${i}" ${i===s.items.length-1?'disabled':''} aria-label="Move ${escapeHtml(x.name)} down">↓ MOVE DOWN</button></div>${muscleMap(x.muscle)}<div class="previous-performance">${prog.previous?`<span><small>LAST</small><strong>${prog.previous.weight} kg × ${prog.previous.reps}</strong></span>`:`<span><small>LAST</small><strong>NO DATA YET</strong></span>`}<span class="progression-hint">${escapeHtml(prog.hint)}</span></div><div class="exercise-coach-line"><span>COACH</span><strong>${escapeHtml(prog.hint)}</strong></div><button type="button" class="beginner-howto" data-howto="${i}"><span>HOW TO</span><small>Animated demo · movement · muscles · tips</small><span class="chev">›</span></button><div class="set-head"><span>Set</span><span>${timed?'time':'kg'}</span><span>${timed?(perSide?'sec / side':'seconds'):'reps'}</span><span>done</span></div>${(x.sets||[]).map((z,j)=>`<div class="set-row ${z.done?'set-done':''}" data-set-row="${i}:${j}"><span>${j+1}</span>${timed?`<button type="button" class="timed-set-icon" data-timed-timer="${i}:${j}" aria-label="Start timer"><span aria-hidden="true">⏱</span></button>`:`<input inputmode="decimal" value="${escapeHtml(z.weight)}" data-weight="${i}:${j}" placeholder="0">`}<input inputmode="numeric" value="${escapeHtml(z.reps)}" data-reps="${i}:${j}" placeholder="${timed?'sec':'0'}"><button type="button" class="set-check ${z.done?'done':''}" data-check="${i}:${j}" aria-pressed="${z.done?'true':'false'}">${z.done?'✓':'○'}</button></div>`).join('')}<div class="set-actions"><button type="button" class="small-btn pink" data-addset="${i}">+ ADD SET</button><button type="button" class="small-btn danger" data-removeset="${i}" ${(x.sets||[]).length<=1?'disabled':''}>− REMOVE SET</button></div><div class="session-note"><textarea data-note="${i}" rows="2" placeholder="Exercise note...">${escapeHtml(x.note||'')}</textarea></div><button type="button" class="text-btn danger-text" data-removeexercise="${i}">REMOVE EXERCISE</button></div></details>`}).join('')}</div>
  <section class="section active-workout-actions"><button type="button" class="secondary" data-active-action="add-exercise">+ ADD EXERCISE</button><button type="button" class="primary" data-active-action="finish">FINISH WORKOUT</button></section>`);
 const screen=$('.screen');if(!screen)return;startStrengthClock(s);if(timedSetTimer?.sessionId===s.id)paintTimedSetTimer();const back=$('[data-back]');if(back)back.onclick=()=>go('home');
 screen.oninput=e=>{const target=e.target;if(target.matches('[data-weight]')){const[i,j]=target.dataset.weight.split(':').map(Number);if(s.items[i]?.sets?.[j]){s.items[i].sets[j].weight=target.value;save()}}else if(target.matches('[data-reps]')){const[i,j]=target.dataset.reps.split(':').map(Number);if(timedSetTimer&&timedSetTimer.sessionId===s.id&&timedSetTimer.itemIndex===i&&timedSetTimer.setIndex===j)stopTimedSetTimer({saveElapsed:false});if(s.items[i]?.sets?.[j]){s.items[i].sets[j].reps=target.value;save()}}else if(target.matches('[data-note]')){const i=+target.dataset.note;if(s.items[i]){s.items[i].note=target.value;save()}}};
 screen.onclick=e=>{const button=e.target.closest('button');if(!button)return;
  if(button.dataset.timedTimer!==undefined){const[i,j]=button.dataset.timedTimer.split(':').map(Number);activeExerciseOpen=i;startTimedSetTimer(i,j);return}
  if(button.dataset.howto!==undefined){const i=+button.dataset.howto,item=s.items[i];if(item)openExerciseGuideByName(item.name,i,item.beginnerGuideKey||'',item);return}
  if(button.dataset.moveExerciseUp!==undefined||button.dataset.moveExerciseDown!==undefined){const from=Number(button.dataset.moveExerciseUp??button.dataset.moveExerciseDown),direction=button.dataset.moveExerciseUp!==undefined?-1:1,to=from+direction;if(!Number.isInteger(from)||to<0||to>=s.items.length)return;if(timedSetTimer?.sessionId===s.id)stopTimedSetTimer({saveElapsed:true});const [moved]=s.items.splice(from,1);s.items.splice(to,0,moved);activeExerciseOpen=to;save();active();requestAnimationFrame(()=>document.querySelector(`[data-exercise-index="${to}"]`)?.scrollIntoView({block:'center'}));return}
  if(button.dataset.activeAction==='finish'){if(timedSetTimer?.sessionId===s.id)stopTimedSetTimer({saveElapsed:true});button.disabled=true;button.textContent='FINISHING…';finishSession();return}
  if(button.dataset.activeAction==='add-exercise'){openExercisePicker(s.type,ex=>{const rx=defaultExercisePrescription(ex,s.type),newIndex=s.items.length;s.items.push({name:ex.name,muscle:ex.muscle||'',equipment:ex.equipment||'',targetReps:rx.reps,beginnerGuideKey:ex.beginnerGuideKey||'',note:'',sets:Array.from({length:rx.sets},()=>({weight:'',reps:'',done:false}))});activeExerciseOpen=newIndex;save();active();requestAnimationFrame(()=>document.querySelector(`[data-exercise-index="${newIndex}"]`)?.scrollIntoView({block:'center'}))});return}
  if(button.dataset.check){const[i,j]=button.dataset.check.split(':').map(Number),item=s.items[i],set=item?.sets?.[j];if(set){if(timedSetTimer&&timedSetTimer.sessionId===s.id&&timedSetTimer.itemIndex===i&&timedSetTimer.setIndex===j)stopTimedSetTimer({saveElapsed:true});activeExerciseOpen=i;const wasDone=set.done;set.done=!set.done;save();button.classList.toggle('done',set.done);button.textContent=set.done?'✓':'○';button.setAttribute('aria-pressed',set.done?'true':'false');const row=button.closest('.set-row');row?.classList.toggle('set-done',set.done);if(set.done&&!wasDone){button.classList.remove('set-pop');void button.offsetWidth;button.classList.add('set-pop');const allDone=(item.sets||[]).length&&(item.sets||[]).every(x=>x.done);if(allDone){const card=button.closest('.exercise-card');card?.classList.add('exercise-complete-flash');setTimeout(()=>card?.classList.remove('exercise-complete-flash'),850);toast(voicePick(GAYM_VOICE.exerciseDone,`${s.id}-${i}-${Date.now()}`))}}updateActiveProgressUI(s)}return}
  if(button.dataset.addset!==undefined){const i=+button.dataset.addset;if(s.items[i]){activeExerciseOpen=i;s.items[i].sets.push({weight:'',reps:'',done:false});const count=s.items[i].sets.length;save();active();if(count>=6)setTimeout(()=>toast(voicePick(GAYM_VOICE.extraSet,`${s.id}-${i}-${count}`)),120)}return}
  if(button.dataset.removeset!==undefined){const i=+button.dataset.removeset,x=s.items[i];if(x&&x.sets.length>1){activeExerciseOpen=i;const removed=x.sets.pop();save();active();actionToast('Set removed','UNDO',()=>{if(data.activeSession?.id===s.id&&data.activeSession.items[i]){data.activeSession.items[i].sets.push(removed);save();active()}})}return}
  if(button.dataset.removeexercise!==undefined){const i=+button.dataset.removeexercise;if(s.items.length<=1){toast('Keep at least one exercise');return}if(timedSetTimer?.sessionId===s.id)stopTimedSetTimer({saveElapsed:true});const removed=s.items.splice(i,1)[0];activeExerciseOpen=Math.max(0,Math.min(activeExerciseOpen,s.items.length-1));save();active();actionToast(`${removed.name} removed`,'UNDO',()=>{if(data.activeSession?.id===s.id){data.activeSession.items.splice(i,0,removed);save();active()}})}
 };
 $$('.session-exercise').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)activeExerciseOpen=+details.dataset.exerciseIndex}));
}
function finishSession(){const s=data.activeSession;if(!s)return;finalizeSession()}
async function undoFinishedSession(finished){
 if(data.activeSession||!(data.sessions||[]).some(x=>x.id===finished.id))return toast('Workout can no longer be reopened');
 const userId=activeDataUserId;data.sessions=data.sessions.filter(x=>x.id!==finished.id);await deleteActivityForSession(finished.id,userId);const restored=structuredClone(finished);delete restored.finishedAt;delete restored.durationMin;delete restored.doneSets;delete restored.totalSets;delete restored.completed;delete restored.prs;data.activeSession=restored;recomputePRHistory({notifyNew:false});save();go('active');toast('Workout reopened');
}
function finalizeSession(overrides={}){const s=data.activeSession;if(!s)return;const durationMin=overrides.durationMin||sessionDurationMinutes(s);let doneSets=0,totalSets=0;if(s.type!=='cardio')s.items.forEach(x=>x.sets.forEach(z=>{totalSets++;if(z.done)doneSets++}));const comment=completionSass(s,durationMin,doneSets,totalSets);const finished={...s,...overrides,durationMin,doneSets,totalSets,finishedAt:Date.now(),completed:true};if((data.sessions||[]).some(x=>x.id===finished.id)){data.activeSession=null;save();return go('home')}data.sessions.push(finished);data.activeSession=null;recomputePRHistory({notifyNew:true});save();syncRecentActivitiesFromLocal(activeDataUserId,{notifyPrs:true});stopWorkoutClock();const savedFinished=data.sessions.find(x=>x.id===finished.id)||finished,prs=savedFinished.prs||[];const next=nextTimeSummary(savedFinished),coachTips=sessionCoachSummary(savedFinished),finishLine=prs.length?voicePick(GAYM_VOICE.pr,`finish-pr-${savedFinished.id}`):comment;openSheet(`<div class="finish-celebration ${prs.length?'has-pr':''}">${prs.length?`<div class="pb-neon-stage"><div class="pb-neon-stars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="pb-neon-kicker">NEW PERSONAL BEST</div><div class="pb-unicorn-aura"><img src="assets/unicorns_hd/unicorn_pb.webp" alt="GAYM unicorn celebrating your personal best"></div><div class="pb-lift-name">${escapeHtml(prs[0].name)}</div><div class="pb-lift-value">${Number(prs[0].weight)} KG × ${Number(prs[0].reps)}</div><div class="pb-neon-sass">${escapeHtml(finishLine)}</div>${prs.length>1?`<div class="pb-more-count">+${prs.length-1} MORE PB${prs.length-1===1?'':'S'}</div>`:''}</div>`:`<div class="finish-burst" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div><p class="eyebrow">WORKOUT COMPLETE</p><h2>${escapeHtml(savedFinished.name||'Workout')} complete</h2><p class="finish-sass">${escapeHtml(finishLine)}</p>`}<div class="finish-stats"><span><b>${durationMin}</b><small>MIN</small></span>${totalSets?`<span><b>${doneSets}/${totalSets}</b><small>SETS</small></span>`:''}<span><b>${(savedFinished.items||[]).length||0}</b><small>EXERCISES</small></span></div>${prs.length?`<div class="finish-pr-card"><span>PB RECEIPTS</span>${prs.slice(0,3).map(pr=>`<div><strong>${escapeHtml(pr.name)}</strong><b>${Number(pr.weight)} kg × ${Number(pr.reps)}</b></div>`).join('')}</div>`:''}<div class="workout-photo-add"><div class="finish-photo-heading"><p class="eyebrow">POST-WORKOUT PHOTO</p><p class="finish-photo-help">Optional. Add a photo from this workout.</p></div><label class="secondary photo-button finish-photo-picker" for="finish-workout-photo">CHOOSE PHOTO</label><input id="finish-workout-photo" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp"><img id="finish-photo-preview" class="finish-photo-preview" alt="Selected workout photo preview" hidden><label class="finish-photo-share-row"><input id="finish-photo-share" type="checkbox" checked><span><strong>Share photo with friends</strong><small>Only when this workout is shared with Friends.</small></span></label><div id="finish-photo-status" class="profile-save-status" aria-live="polite"></div></div>${next.length?`<div class="next-time-card"><p class="eyebrow">NEXT TIME</p>${next.map(x=>`<div><span><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.current)}</small></span><b>${escapeHtml(x.next)}</b></div>`).join('')}</div>`:''}<div class="post-coach-insights"><p class="eyebrow">GAYM COACH</p>${coachTips.map(x=>`<p>${escapeHtml(x)}</p>`).join('')}</div><div class="sheet-actions"><button class="primary" id="finish-home">${prs.length?'FUCK YES':'BACK TO HOME'}</button><button class="secondary" id="finish-progress">VIEW PROGRESS</button></div></div>`);const photo=$('#finish-workout-photo'),sharePhoto=$('#finish-photo-share');let photoUploadBusy=false;if(photo)photo.onchange=async e=>{const f=e.target.files?.[0];if(!f)return;const status=$('#finish-photo-status'),preview=$('#finish-photo-preview'),homeBtn=$('#finish-home'),progressBtn=$('#finish-progress');if(preview){preview.src=URL.createObjectURL(f);preview.hidden=false}photoUploadBusy=true;if(homeBtn)homeBtn.disabled=true;if(progressBtn)progressBtn.disabled=true;if(status)status.textContent='Uploading…';try{await uploadWorkoutPhoto(savedFinished.id,f,sharePhoto?.checked!==false);if(status)status.textContent='Photo saved ✓';toast('Workout photo attached.')}catch(err){console.error(err);if(status)status.textContent='Upload failed';toast(err.message||'Could not upload photo.')}finally{photoUploadBusy=false;if(homeBtn)homeBtn.disabled=false;if(progressBtn)progressBtn.disabled=false}};if(sharePhoto)sharePhoto.onchange=async()=>{if(!savedFinished.socialPhotoUrl||photoUploadBusy)return;const status=$('#finish-photo-status');if(status)status.textContent='Updating sharing…';sharePhoto.disabled=true;try{await updateWorkoutPhotoSharing(savedFinished.id,sharePhoto.checked);if(status)status.textContent=sharePhoto.checked?'Photo shared with friends ✓':'Photo kept private ✓'}catch(err){sharePhoto.checked=!sharePhoto.checked;if(status)status.textContent='Could not update sharing';toast(err.message||'Could not update photo sharing.')}finally{sharePhoto.disabled=false}};$('#finish-home').onclick=()=>{if(photoUploadBusy)return;closeSheet();go('home');actionToast('Workout completed','UNDO',()=>undoFinishedSession(finished))};$('#finish-progress').onclick=()=>{if(photoUploadBusy)return;closeSheet();go('progress')}}
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
function allPersonalBests(){
 const rows=[];for(const sess of sortedSessionsDesc())for(const pr of (sess.prs||[]))rows.push({sessionId:sess.id,date:sess.date,name:pr.name,weight:Number(pr.weight)||0,reps:Number(pr.reps)||0});return rows;
}
function progress(){
 const exercises=exerciseLog(),total=data.sessions.length,streak=calcStreak(),latest=Number(data.profile.weight)||70;
 shell(`${header()}<h1 class="page-title">Progress</h1><p class="subtle">Progress belongs to the exercise. Track what actually got stronger, rep by rep.</p><div class="tabs" style="margin-top:15px"><button class="tab active">Exercises</button><button class="tab" data-progress-history>History</button><button class="tab" data-progress-body>Body</button></div><section class="section"><div class="metric-grid"><div class="metric"><span>Workouts</span><strong>${total}</strong></div><div class="metric"><span>Streak</span><strong>${streak}</strong></div><div class="metric"><span>Exercises tracked</span><strong>${exercises.length}</strong></div><div class="metric"><span>Body weight</span><strong>${Number(latest).toFixed(1)} kg</strong></div></div></section>${(()=>{const pbs=allPersonalBests();return `<section class="section"><div class="section-head"><h2>Personal bests</h2><span class="eyebrow">PB / PR</span></div>${pbs.length?`<div class="pb-progress-list">${pbs.slice(0,5).map(pb=>`<button class="card pb-progress-card" data-pb-exercise="${escapeHtml(pb.name)}"><span><small>${escapeHtml(pb.date)}</small><strong>${escapeHtml(pb.name)}</strong></span><b>${pb.weight} kg × ${pb.reps}</b></button>`).join('')}</div>${pbs.length>5?`<button class="text-btn" id="view-all-pbs">VIEW ALL PBs</button>`:''}`:`<div class="empty"><strong>No PBs yet</strong>Finish a strength workout and your best lifts will appear here.</div>`}</section>`})()}${(()=>{const w=weekCoachReview();return `<section class="section"><article class="card weekly-coach"><div class="coach-card-head"><span class="coach-label">YOUR WEEK</span><span class="coach-status">COACH</span></div><strong>${escapeHtml(w.summary)}</strong><div class="weekly-coach-grid"><div><span>WIN</span><p>${escapeHtml(w.win)}</p></div><div><span>WATCH</span><p>${escapeHtml(w.watch)}</p></div><div><span>NEXT</span><p>${escapeHtml(w.next)}</p></div></div></article></section>`})()}<section class="section"><div class="section-head"><h2>Exercise progress</h2><span class="eyebrow">BEST SET / SESSION</span></div><div class="field exercise-progress-search"><input id="progress-search" placeholder="Search exercise or muscle..."></div><div class="list" id="exercise-progress-list"></div></section>`);
 function paint(q=''){
  const query=q.trim().toLowerCase();
  const filtered=exercises.filter(ex=>`${ex.name} ${ex.muscle} ${ex.equipment}`.toLowerCase().includes(query));
  $('#exercise-progress-list').innerHTML=filtered.length?filtered.map(ex=>{const current=bestSetFromSession(ex.sessions.at(-1)),previous=bestSetFromSession(ex.sessions.at(-2)),delta=current&&previous?current.score-previous.score:0;return `<button class="card exercise-progress-card" data-exercise-progress="${escapeHtml(ex.name)}"><div class="exercise-progress-top"><div><span class="eyebrow">${escapeHtml(ex.muscle)}</span><h3>${escapeHtml(ex.name)}</h3><p>${escapeHtml(ex.equipment)}</p></div><span class="chev">›</span></div><div class="exercise-progress-stats"><span><small>Latest best</small><strong>${current?`${current.weight} kg × ${current.reps}`:'–'}</strong></span><span><small>Est. 1RM</small><strong>${current?`${current.score.toFixed(1)} kg`:'–'}</strong></span><span><small>Change</small><strong class="${delta>0?'positive':delta<0?'negative':''}">${previous?(delta>=0?'+':'')+delta.toFixed(1)+' kg':'New'}</strong></span></div></button>`}).join(''):`<div class="empty"><strong>No matching exercise</strong>${exercises.length?'Try another search.':'Finish a strength workout with logged weight and reps to start tracking progress.'}</div>`;
  $$('[data-exercise-progress]').forEach(b=>b.onclick=()=>openExerciseProgress(b.dataset.exerciseProgress));
 }
 $$('[data-pb-exercise]').forEach(b=>b.onclick=()=>openExerciseProgress(b.dataset.pbExercise));const allPb=$('#view-all-pbs');if(allPb)allPb.onclick=()=>{const pbs=allPersonalBests();openSheet(`<div class="sheet-head"><div><p class="eyebrow">Progress</p><h2>All personal bests</h2></div><button class="sheet-close" data-close>×</button></div><div class="pb-progress-list">${pbs.map(pb=>`<button class="card pb-progress-card" data-all-pb="${escapeHtml(pb.name)}"><span><small>${escapeHtml(pb.date)}</small><strong>${escapeHtml(pb.name)}</strong></span><b>${pb.weight} kg × ${pb.reps}</b></button>`).join('')}</div>`);$$('[data-all-pb]').forEach(b=>b.onclick=()=>{closeSheet();openExerciseProgress(b.dataset.allPb)})};paint();$('#progress-search').oninput=e=>paint(e.target.value);$$('[data-progress-history]').forEach(b=>b.onclick=openHistorySheet);$('[data-progress-body]').onclick=openBodySheet;
}
function openExerciseProgress(name){
 const ex=exerciseLog().find(x=>x.name===name);if(!ex)return toast('No exercise history yet');const current=bestSetFromSession(ex.sessions.at(-1)),previous=bestSetFromSession(ex.sessions.at(-2)),best=bestSetEver(ex),pts=exerciseTrendPoints(ex),delta=current&&previous?current.score-previous.score:null;
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Exercise progress</p><h2>${escapeHtml(ex.name)}</h2></div><button class="sheet-close" data-close>×</button></div>${muscleMap(ex.muscle)}<div class="exercise-detail-meta"><span>${escapeHtml(ex.muscle)}</span><span>${escapeHtml(ex.equipment)}</span></div><div class="metric-grid exercise-detail-metrics"><div class="metric"><span>Current</span><strong>${current?`${current.weight} kg × ${current.reps}`:'–'}</strong></div><div class="metric"><span>Previous</span><strong>${previous?`${previous.weight} kg × ${previous.reps}`:'–'}</strong></div><div class="metric"><span>Best ever</span><strong>${best?`${best.weight} kg × ${best.reps}`:'–'}</strong></div><div class="metric"><span>Est. 1RM</span><strong>${current?`${current.score.toFixed(1)} kg`:'–'}</strong></div></div>${delta!==null?`<div class="exercise-delta ${delta>=0?'up':'down'}"><strong>${delta>=0?'↑':'↓'} ${Math.abs(delta).toFixed(1)} kg estimated strength</strong><span>vs previous session</span></div>`:''}<article class="card exercise-chart"><div class="section-head"><h3>Strength trend</h3><span class="eyebrow">EST. 1RM</span></div>${pts?`<svg viewBox="0 0 120 120" preserveAspectRatio="none"><line class="grid" x1="0" y1="25" x2="120" y2="25"/><line class="grid" x1="0" y1="65" x2="120" y2="65"/><line class="grid" x1="0" y1="105" x2="120" y2="105"/><polyline class="line" points="${pts}"/></svg>`:'<div class="empty">Log another session to build the trend.</div>'}</article><section class="exercise-history-section"><div class="section-head"><h3>Recent sessions</h3><span class="eyebrow">WEIGHT × REPS</span></div><div class="exercise-history-list">${[...ex.sessions].reverse().slice(0,8).map(s=>{const b=bestSetFromSession(s);return `<div class="exercise-history-row"><span>${s.date}</span><strong>${b.weight} kg × ${b.reps}</strong><small>${b.score.toFixed(1)} kg est. 1RM</small></div>`}).join('')}</div></section>`);
}
function calcStreak(){return calcStreakFromDates(null)}
function openSessionDetail(id){
 const s=data.sessions.find(x=>x.id===id);if(!s)return;
 const groupInfo=s.type==='group'?`<article class="card group-history-detail"><span class="eyebrow">GROUP CLASS</span><h3>${escapeHtml(s.groupClass||s.name)}</h3><p>${escapeHtml(s.groupCategory||'Group training')}${s.groupCenter?` · ${escapeHtml(s.groupCenter)}`:''}${s.groupInstructor?` · ${escapeHtml(s.groupInstructor)}`:''}</p><strong>Intensity ${Number(s.intensity)||3}/5</strong>${s.notes?`<small>${escapeHtml(s.notes)}</small>`:''}</article>`:'';
 const cardioItems=s.type==='cardio'&&s.items?.length?`<div class="list history-work-list" style="margin-top:14px">${s.items.map((x,i)=>`<div class="list-card"><span class="badge-icon cardio">${i+1}</span><span class="grow"><h3>${escapeHtml(x.name||x.mode||'Cardio')}</h3><p>${x.durationMin?`${x.durationMin} min`:''}${x.durationMin&&x.distance?' · ':''}${x.distance?`${x.distance} km`:''}</p></span></div>`).join('')}</div>`:'';
 const strengthItems=s.type!=='cardio'&&s.items?.length?`<div class="list history-work-list" style="margin-top:14px">${s.items.map((x,i)=>{const done=(x.sets||[]).filter(z=>z.done);const setText=done.map(z=>isTimedExercise(x)?`${formatTimedSeconds(z.reps)}${timedPerSide(x)?' / side':''}`:`${z.weight?`${z.weight} kg × `:''}${z.reps||'—'}`).join(' · ');return `<div class="list-card history-exercise-card"><span class="badge-icon">${i+1}</span><span class="grow"><h3>${escapeHtml(x.name)}</h3><p>${done.length}/${(x.sets||[]).length} sets${setText?` · ${escapeHtml(setText)}`:''}</p></span></div>`}).join('')}</div>`:'';
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">${s.date} · ${s.type}${s.manualEntry?' · manually logged':''}</p><h2>${escapeHtml(s.name)}</h2></div><button class="sheet-close" data-close>×</button></div><div class="metric-grid" style="margin-top:14px"><div class="metric"><span>Duration</span><strong>${s.durationMin||0} min</strong></div><div class="metric"><span>${s.type==='cardio'?'Distance':s.type==='group'?'Intensity':'Sets completed'}</span><strong>${s.type==='cardio'?(s.distance?`${s.distance} km`:'–'):s.type==='group'?`${Number(s.intensity)||3}/5`:(s.doneSets||0)+' / '+(s.totalSets||0)}</strong></div>${s.type==='cardio'?`<div class="metric"><span>Intensity</span><strong>${escapeHtml(s.intensity||'–')}</strong></div><div class="metric"><span>${/cycling/i.test(s.mode||s.name)?'Speed':'Pace'}</span><strong>${escapeHtml(s.derived||cardioDerivedMeta(s.mode||s.name,s.durationMin,s.distance)||'–')}</strong></div>`:''}</div>${groupInfo}${cardioItems}${strengthItems}${s.type!=='group'&&s.notes?`<article class="card history-notes"><span class="eyebrow">Notes</span><p>${escapeHtml(s.notes)}</p></article>`:''}<div class="sheet-actions"><button class="danger-btn" id="delete-history-workout">DELETE WORKOUT</button></div>`);
 $('#delete-history-workout').onclick=()=>confirmDeleteSession(s.id);
}
function confirmDeleteSession(id){const s=data.sessions.find(x=>x.id===id);if(!s)return;openSheet(`<div class="sheet-head"><div><p class="eyebrow">Delete workout?</p><h2>${escapeHtml(s.name)}</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">This removes the workout from History, your calendar, exercise progress and Friends Activity. This cannot be undone.</p><div class="sheet-actions two"><button class="secondary" data-close>KEEP IT</button><button class="danger-btn" id="confirm-delete-session">DELETE WORKOUT</button></div>`);$('#confirm-delete-session').onclick=async()=>{const userId=activeDataUserId;data.sessions=data.sessions.filter(x=>x.id!==id);recomputePRHistory({notifyNew:false});save();const btn=$('#confirm-delete-session');if(btn){btn.disabled=true;btn.textContent='DELETING…'}const cloud=await deleteActivityForSession(id,userId);await syncRecentActivitiesFromLocal(userId);closeSheet();render();toast(cloud?.error?'Workout deleted · activity sync will retry':'Workout deleted everywhere')}}
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
 if($('#past-add-exercise'))$('#past-add-exercise').onclick=()=>{capture();openExercisePicker(state.type,ex=>{const rx=defaultExercisePrescription(ex,state.type);state.items.push({name:ex.name,muscle:ex.muscle||'',equipment:ex.equipment||'',targetReps:rx.reps,beginnerGuideKey:ex.beginnerGuideKey||'',note:'',sets:Array.from({length:Math.max(1,rx.sets||3)},()=>({weight:'',reps:'',done:true}))});openPastWorkoutSheet(state.date,state)})};
 $$('[data-past-add-set]').forEach(b=>b.onclick=()=>{capture();const i=+b.dataset.pastAddSet;state.items[i].sets.push({weight:'',reps:'',done:true});openPastWorkoutSheet(state.date,state)});
 $$('[data-past-remove-set]').forEach(b=>b.onclick=()=>{capture();const[i,j]=b.dataset.pastRemoveSet.split(':').map(Number);if(state.items[i].sets.length>1)state.items[i].sets.splice(j,1);openPastWorkoutSheet(state.date,state)});
 $$('[data-past-remove-ex]').forEach(b=>b.onclick=()=>{capture();state.items.splice(+b.dataset.pastRemoveEx,1);openPastWorkoutSheet(state.date,state)});
 if($('#past-add-cardio'))$('#past-add-cardio').onclick=()=>{capture();state.cardioActivities.push(pastEmptyCardioActivity('Cycling'));openPastWorkoutSheet(state.date,state)};
 $$('[data-past-remove-cardio]').forEach(b=>b.onclick=()=>{capture();state.cardioActivities.splice(+b.dataset.pastRemoveCardio,1);if(!state.cardioActivities.length)state.cardioActivities=[pastEmptyCardioActivity('Running')];openPastWorkoutSheet(state.date,state)});
 $('#save-past-workout').onclick=()=>{capture();const date=state.date,name=state.name.trim();if(!date||date>isoToday())return toast('Choose a valid date');if(!name)return toast('Give the workout a name');let items=[],doneSets=0,totalSets=0,distance=0,mode='',durationMin=Math.max(1,Math.round(Number(state.durationMin)||0));if(state.type==='cardio'){const acts=state.cardioActivities.filter(a=>a.mode);if(!acts.length)return toast('Add at least one cardio activity');const activityMinutes=acts.reduce((n,a)=>n+(Number(a.durationMin)||0),0);if(activityMinutes>0)durationMin=Math.round(activityMinutes);distance=Math.round(acts.reduce((n,a)=>n+(Number(a.distance)||0),0)*100)/100;mode=acts.length===1?acts[0].mode:'Mixed cardio';items=acts.map(a=>({name:a.mode,muscle:'Cardio',equipment:'',durationMin:Number(a.durationMin)||0,distance:Number(a.distance)||0,sets:[]}))}else{if(!state.items.length)return toast('Add at least one exercise');items=state.items.map(x=>({...x,sets:x.sets.map(z=>({...z,done:true}))}));totalSets=items.reduce((n,x)=>n+x.sets.length,0);doneSets=totalSets}const startedAt=new Date(`${date}T12:00:00`).getTime(),manualSession={id:uid(),workoutId:state.templateId||'',name,type:state.type,date,durationMin,distance,mode,notes:state.notes.trim(),items,doneSets,totalSets,startedAt,finishedAt:startedAt+durationMin*60000,completed:true,manualEntry:true};data.sessions.push(manualSession);recomputePRHistory({notifyNew:true});save();syncRecentActivitiesFromLocal(activeDataUserId,{notifyPrs:manualSession.date===isoToday()});closeSheet();render();toast((manualSession.prs||[]).length?'Workout added · PB history updated':'Workout added to history')};
}
function measurementValue(entry,key){const v=entry?.[key];return v===null||v===undefined||v===''?null:Number(v)}
function measurementDateLabel(date){if(!date)return 'No previous log';const d=new Date(`${date}T12:00:00`);return Number.isNaN(d.getTime())?date:d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}
function measurementDelta(current,previous,unit){if(current===null||previous===null)return '';const delta=current-previous;if(Math.abs(delta)<0.0001)return `<span class="body-measure-delta neutral">No change</span>`;const sign=delta>0?'+':'−';return `<span class="body-measure-delta ${delta>0?'positive':'negative'}">${sign}${Math.abs(delta).toFixed(unit==='%'?1:1)} ${unit}</span>`}
function weightChartMarkup(){
 const {history,current,change}=weightTrendSummary();
 const points=history.length?history:[{date:isoToday(),weight:current}];
 const first=points[0]?.weight??current,last=points.at(-1)?.weight??current,delta=last-first;
 if(points.length<2)return `<section class="body-weight-chart"><div class="body-weight-chart-head"><div><span>WEIGHT TREND</span><strong>${current.toFixed(1)} kg</strong></div><small>Log another weight to build the graph.</small></div><div class="body-weight-chart-empty">One data point logged</div></section>`;
 const weights=points.map(x=>x.weight),min=Math.min(...weights),max=Math.max(...weights),rawRange=max-min,pad=Math.max(.3,rawRange*.15),lo=min-pad,hi=max+pad,range=Math.max(.6,hi-lo),n=points.length;
 const coords=points.map((x,i)=>{const px=6+i*(108/(n-1)),py=72-((x.weight-lo)/range)*58;return `${px.toFixed(1)},${py.toFixed(1)}`}).join(' ');
 const dots=points.map((x,i)=>{const [cx,cy]=coords.split(' ')[i].split(',');return `<circle cx="${cx}" cy="${cy}" r="2.2"><title>${x.date}: ${x.weight.toFixed(1)} kg</title></circle>`}).join('');
 const signed=(delta>=0?'+':'')+delta.toFixed(1);
 return `<section class="body-weight-chart"><div class="body-weight-chart-head"><div><span>WEIGHT TREND</span><strong>${last.toFixed(1)} kg</strong></div><small class="${delta>0?'positive':delta<0?'negative':''}">${signed} kg since ${measurementDateLabel(points[0].date)}</small></div><svg viewBox="0 0 120 82" preserveAspectRatio="none" aria-label="Weight history"><line class="grid" x1="6" y1="14" x2="114" y2="14"/><line class="grid" x1="6" y1="43" x2="114" y2="43"/><line class="grid" x1="6" y1="72" x2="114" y2="72"/><polyline class="line" points="${coords}"/>${dots}</svg><div class="body-weight-chart-labels"><span>${first.toFixed(1)} kg</span><span>${last.toFixed(1)} kg</span></div></section>`;
}
function openBodySheet(){
 const logs=(data.measurements||[]).filter(Boolean).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));const latestLog=logs.at(-1)||null;const previousLog=logs.at(-2)||null;
 const current={weight:Number(data.profile.weight)||null,chest:measurementValue(latestLog,'chest'),waist:measurementValue(latestLog,'waist'),biceps:measurementValue(latestLog,'biceps'),thigh:measurementValue(latestLog,'thigh'),bodyFat:measurementValue(latestLog,'bodyFat')};
 const previous={weight:measurementValue(previousLog,'weight'),chest:measurementValue(previousLog,'chest'),waist:measurementValue(previousLog,'waist'),biceps:measurementValue(previousLog,'biceps'),thigh:measurementValue(previousLog,'thigh'),bodyFat:measurementValue(previousLog,'bodyFat')};
 const fields=[['weight','Weight','kg'],['chest','Chest','cm'],['waist','Waist','cm'],['biceps','Biceps','cm'],['thigh','Thigh','cm'],['bodyFat','Body fat','%']];
 const row=(key,label,unit,val,editable=false)=>`<div class="body-measure-row"><div class="body-measure-name"><span class="body-measure-mark">${label.slice(0,1)}</span><span>${label}</span></div><div class="body-measure-value">${val===null?'—':`${val.toFixed(key==='weight'||key==='biceps'||key==='bodyFat'?1:(Number.isInteger(val)?0:1))} <small>${unit}</small>`}</div>${editable?'<button type="button" class="body-measure-edit" data-edit-measure aria-label="Edit measurements">EDIT</button>':''}</div>`;
 const lastRows=fields.map(([key,label,unit])=>{const last=previous[key];const now=current[key];return `<div class="body-measure-row body-measure-history"><div class="body-measure-name"><span class="body-measure-mark">${label.slice(0,1)}</span><span>${label}</span></div><div class="body-measure-value">${last===null?'—':`${last.toFixed(key==='weight'||key==='biceps'||key==='bodyFat'?1:(Number.isInteger(last)?0:1))} <small>${unit}</small>`}</div>${measurementDelta(now,last,unit)}</div>`}).join('');
 openSheet(`<div class="sheet-head body-sheet-head"><div><p class="eyebrow">Body</p><h2>Body measurements</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle body-measure-intro">Track your body measurements and compare them with your previous log.</p>${weightChartMarkup()}<section class="body-measure-card"><div class="body-measure-card-head"><span>CURRENT MEASUREMENTS</span><small>${latestLog?.date?measurementDateLabel(latestLog.date):'Current'}</small></div>${fields.map(([key,label,unit])=>row(key,label,unit,current[key],true)).join('')}</section><section class="body-measure-card"><div class="body-measure-card-head"><span>LAST MEASUREMENTS</span><small>${previousLog?.date?measurementDateLabel(previousLog.date):'No previous log'}</small></div>${previousLog?lastRows:'<div class="empty"><strong>No previous measurements yet</strong>Your next log will unlock comparisons.</div>'}</section><div class="sheet-actions"><button class="primary" id="log-new-measurements">LOG NEW MEASUREMENTS</button></div>`);
 $$('[data-edit-measure]').forEach(b=>b.onclick=()=>openMeasureSheet());$('#log-new-measurements').onclick=openMeasureSheet;
}
function openMeasureSheet(){
 const last=(data.measurements||[]).filter(Boolean).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).at(-1)||{};
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Body</p><h2>Log measurements</h2></div><button class="sheet-close" data-close>×</button></div><div class="measurement-date">${measurementDateLabel(isoToday())}</div><div class="measurement-form"><div class="field"><label>Weight (kg)</label><input id="m-weight" inputmode="decimal" type="number" step="0.1" min="20" value="${Number(data.profile.weight)||''}"></div><div class="field"><label>Chest (cm)</label><input id="m-chest" inputmode="decimal" type="number" step="0.1" value="${last.chest??''}"></div><div class="field"><label>Waist (cm)</label><input id="m-waist" inputmode="decimal" type="number" step="0.1" value="${last.waist??''}"></div><div class="field"><label>Biceps (cm)</label><input id="m-biceps" inputmode="decimal" type="number" step="0.1" value="${last.biceps??''}"></div><div class="field"><label>Thigh (cm)</label><input id="m-thigh" inputmode="decimal" type="number" step="0.1" value="${last.thigh??''}"></div><div class="field"><label>Body fat (%)</label><input id="m-bodyfat" inputmode="decimal" type="number" step="0.1" min="1" max="70" value="${last.bodyFat??''}"></div></div><article class="measurement-tip"><strong>TIP</strong><p>Measure at roughly the same time of day and under similar conditions for more useful comparisons.</p></article><div class="sheet-actions"><button class="primary" id="m-save">SAVE MEASUREMENTS</button></div>`);
 $('#m-save').onclick=()=>{const weight=Number($('#m-weight').value);if(!weight||weight<20)return toast('Enter your weight');const entry={date:isoToday(),weight,chest:Number($('#m-chest').value)||null,waist:Number($('#m-waist').value)||null,biceps:Number($('#m-biceps').value)||null,thigh:Number($('#m-thigh').value)||null,bodyFat:Number($('#m-bodyfat').value)||null};const sameDayIndex=(data.measurements||[]).findIndex(m=>m?.date===entry.date);if(sameDayIndex>=0)data.measurements[sameDayIndex]={...data.measurements[sameDayIndex],...entry};else data.measurements.push(entry);data.profile.weight=weight;if(data.profile.autoTargets)applyAutoTargets();save();closeSheet();render();toast('Measurements saved')};
}
let nutritionTab='today',recipeCategory='All',recipeQuery='',recipeLibraryView='all',communityRecipeQuery='';
const RECIPE_DB='gaymRecipeImages',RECIPE_STORE='images';
const recipeImageUrls=new Map();
const RECIPE_FALLBACK=`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#10161d"/><stop offset="1" stop-color="#181018"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="600" cy="330" r="110" fill="none" stroke="#ff3f9f" stroke-width="18"/><path d="M545 330h110M600 275v110" stroke="#bfff00" stroke-width="18" stroke-linecap="round"/><text x="600" y="555" text-anchor="middle" font-family="Arial,sans-serif" font-size="70" font-weight="900" fill="#fff">GAYM RECIPE</text></svg>`)}`;
let recipeCloudState={ownedLoaded:false,ownedLoading:false,communityLoaded:false,communityLoading:false,community:[],savedIds:new Set(),error:null};
function resetRecipeCloudState(){recipeCloudState={ownedLoaded:false,ownedLoading:false,communityLoaded:false,communityLoading:false,community:[],savedIds:new Set(),error:null}}
function allRecipes(){return [...RECIPES,...(data.customRecipes||[])]}
function findRecipe(id){return allRecipes().find(r=>String(r.id)===String(id))}
function recipeImageSrc(r){if(!r)return RECIPE_FALLBACK;if(!r.custom)return r.image||RECIPE_FALLBACK;return recipeImageUrls.get(recipeImageKey(r.id))||r.image||RECIPE_FALLBACK}
function openRecipeDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(RECIPE_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(RECIPE_STORE))db.createObjectStore(RECIPE_STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function recipeImageKey(id,userId=activeDataUserId){return userId?`${userId}:${id}`:String(id)}
async function readRecipeImageBlobByKey(key){const db=await openRecipeDb();try{return await new Promise((resolve,reject)=>{const req=db.transaction(RECIPE_STORE,'readonly').objectStore(RECIPE_STORE).get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}finally{db.close()}}
async function getRecipeImageBlob(id){if(!id||!activeDataUserId)return null;try{const scopedKey=recipeImageKey(id);let blob=await readRecipeImageBlobByKey(scopedKey);if(!blob){const legacy=await readRecipeImageBlobByKey(String(id));if(legacy instanceof Blob){await putRecipeImage(id,legacy);blob=legacy}}return blob instanceof Blob?blob:null}catch(e){console.error('get recipe image blob',e);return null}}
async function putRecipeImage(id,blob){if(!activeDataUserId)throw new Error('No active account for recipe image.');if(!(blob instanceof Blob))throw new Error('Recipe image is not a valid image blob.');const key=recipeImageKey(id),db=await openRecipeDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction(RECIPE_STORE,'readwrite');tx.objectStore(RECIPE_STORE).put(blob,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}finally{db.close()}if(recipeImageUrls.has(key))URL.revokeObjectURL(recipeImageUrls.get(key));recipeImageUrls.delete(key)}
async function getRecipeImage(id){const key=recipeImageKey(id);if(recipeImageUrls.has(key))return recipeImageUrls.get(key);const blob=await getRecipeImageBlob(id);if(!blob)return null;const url=URL.createObjectURL(blob);recipeImageUrls.set(key,url);return url}
async function deleteRecipeImage(id){if(!activeDataUserId)return;const key=recipeImageKey(id);try{const db=await openRecipeDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction(RECIPE_STORE,'readwrite');tx.objectStore(RECIPE_STORE).delete(key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}finally{db.close()}}catch(e){console.error('delete recipe image',e)}if(recipeImageUrls.has(key))URL.revokeObjectURL(recipeImageUrls.get(key));recipeImageUrls.delete(key)}
async function compressRecipeImage(file){if(!file)return null;const max=2400,canvas=document.createElement('canvas');let source,w0,h0,cleanup=()=>{};if('createImageBitmap'in window){source=await createImageBitmap(file,{imageOrientation:'from-image'});w0=source.width;h0=source.height;cleanup=()=>source.close?.()}else{const url=URL.createObjectURL(file);source=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url});w0=source.naturalWidth;h0=source.naturalHeight;cleanup=()=>URL.revokeObjectURL(url)}const scale=Math.min(1,max/Math.max(w0,h0)),w=Math.max(1,Math.round(w0*scale)),h=Math.max(1,Math.round(h0*scale));canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(source,0,0,w,h);cleanup();const preferred=file.type==='image/png'?'image/png':'image/jpeg',quality=preferred==='image/jpeg'?0.94:undefined;return await new Promise(resolve=>canvas.toBlob(resolve,preferred,quality))}
async function hydrateRecipeImages(root=document){const imgs=$$('img[data-custom-image]',root);await Promise.all(imgs.map(async img=>{const url=await getRecipeImage(img.dataset.customImage);if(url&&img.isConnected)img.src=url}))}
function visibilityLabel(v){return v==='public'?'All of GAYM':v==='friends'?'Friends':'Only me'}
function cloudOwnedToLocal(r){return {id:String(r.local_id||`cloud-owned-${r.id}`),cloudRecipeId:r.id,name:r.name||'Recipe',cuisine:r.cuisine||'Other',meal:'Custom',custom:true,servings:+r.servings||1,time:+r.cook_time||0,kcal:+r.kcal||0,protein:+r.protein||0,carbs:+r.carbs||0,fat:+r.fat||0,fiber:+r.fiber||0,tags:Array.isArray(r.tags)?r.tags:[],ingredients:Array.isArray(r.ingredients)?r.ingredients:[],steps:Array.isArray(r.steps)?r.steps:[],image:r.image_url||null,visibility:r.visibility||'private',cloudUpdatedAt:r.updated_at||null}}
function cloudCommunityToApp(r,creator){return {id:`community-${r.id}`,cloudRecipeId:r.id,ownerId:r.owner_id,name:r.name||'Recipe',cuisine:r.cuisine||'Other',meal:'Community',custom:false,community:true,servings:+r.servings||1,time:+r.cook_time||0,kcal:+r.kcal||0,protein:+r.protein||0,carbs:+r.carbs||0,fat:+r.fat||0,fiber:+r.fiber||0,tags:Array.isArray(r.tags)?r.tags:[],ingredients:Array.isArray(r.ingredients)?r.ingredients:[],steps:Array.isArray(r.steps)?r.steps:[],image:r.image_url||RECIPE_FALLBACK,visibility:r.visibility||'private',creator:creator||null,createdAt:r.created_at||null}}
async function uploadRecipeImageToCloud(recipeId,blob){if(!sb||!authUser?.id||!blob)return null;const ext=blob.type==='image/png'?'png':blob.type==='image/webp'?'webp':'jpg',path=`${authUser.id}/${String(recipeId).replace(/[^a-zA-Z0-9_-]/g,'_')}-${Date.now()}.${ext}`;const {error}=await sb.storage.from('recipe-images').upload(path,blob,{upsert:false,contentType:blob.type||'image/jpeg',cacheControl:'31536000'});if(error)throw new Error(`Could not upload recipe photo: ${error.message}`);return sb.storage.from('recipe-images').getPublicUrl(path).data.publicUrl||null}
async function upsertOwnedRecipeCloud(r,{forceImage=false,removeImage=false}={}){const userId=authUser?.id;if(!sb||!userId||activeDataUserId!==userId)throw new Error('Recipe cloud sync is unavailable.');let existing=null;if(r.cloudRecipeId){const q=await sb.from('social_recipes').select('id,image_url').eq('id',r.cloudRecipeId).eq('owner_id',userId).maybeSingle();if(q.error)throw q.error;existing=q.data}else{const q=await sb.from('social_recipes').select('id,image_url').eq('owner_id',userId).eq('local_id',String(r.id)).maybeSingle();if(q.error)throw q.error;existing=q.data}let image_url=removeImage?null:(r.image||existing?.image_url||null);const blob=removeImage?null:await getRecipeImageBlob(r.id);if(blob&&(forceImage||!image_url||image_url===RECIPE_FALLBACK))image_url=await uploadRecipeImageToCloud(r.id,blob);const row={owner_id:userId,local_id:String(r.id),name:r.name,cuisine:r.cuisine||null,servings:r.servings||1,cook_time:r.time||0,kcal:r.kcal||0,protein:r.protein||0,carbs:r.carbs||0,fat:r.fat||0,fiber:r.fiber||0,ingredients:r.ingredients||[],steps:r.steps||[],tags:recipeTags(r),image_url:image_url&&image_url!==RECIPE_FALLBACK?image_url:null,visibility:['private','friends','public'].includes(r.visibility)?r.visibility:'private',updated_at:new Date().toISOString()};const {data:cloud,error}=await sb.from('social_recipes').upsert(row,{onConflict:'owner_id,local_id'}).select().single();if(error)throw error;return cloud}
async function ensureOwnedRecipesCloud(){if(recipeCloudState.ownedLoaded||recipeCloudState.ownedLoading||!sb||!authUser?.id)return;recipeCloudState.ownedLoading=true;const userId=authUser.id;try{const {data:rows,error}=await sb.from('social_recipes').select('id,owner_id,local_id,name,cuisine,servings,cook_time,kcal,protein,carbs,fat,fiber,ingredients,steps,tags,image_url,visibility,updated_at').eq('owner_id',userId).order('updated_at',{ascending:false});if(error)throw error;if(authUser?.id!==userId||activeDataUserId!==userId)return;const local=[...(data.customRecipes||[])],byId=new Map(local.map(r=>[String(r.id),r]));for(const row of rows||[]){const restored=cloudOwnedToLocal(row),existing=byId.get(String(restored.id));if(existing){existing.cloudRecipeId=row.id;existing.visibility=row.visibility||existing.visibility||'private';existing.image=existing.image||row.image_url||null;existing.cloudSyncPending=false}else{local.push(restored);byId.set(String(restored.id),restored)}}data.customRecipes=local;save();recipeCloudState.ownedLoaded=true}catch(e){console.error('ensureOwnedRecipesCloud',e)}finally{recipeCloudState.ownedLoading=false}}
async function loadCommunityRecipes(force=false){if(recipeCloudState.communityLoading||(!force&&recipeCloudState.communityLoaded)||!sb||!authUser?.id)return;recipeCloudState.communityLoading=true;recipeCloudState.error=null;const userId=authUser.id;try{const [recipesRes,favRes]=await Promise.all([sb.from('social_recipes').select('id,owner_id,local_id,name,cuisine,servings,cook_time,kcal,protein,carbs,fat,fiber,ingredients,steps,tags,image_url,visibility,created_at').neq('owner_id',userId).order('created_at',{ascending:false}).limit(100),sb.from('recipe_favorites').select('recipe_id').eq('user_id',userId)]);if(recipesRes.error)throw recipesRes.error;if(authUser?.id!==userId||activeDataUserId!==userId)return;const rows=recipesRes.data||[],ownerIds=[...new Set(rows.map(r=>r.owner_id).filter(Boolean))];let creators=[];if(ownerIds.length){const pr=await sb.from('profiles').select('id,username,display_name,avatar_url').in('id',ownerIds);if(pr.error)console.error('community creators',pr.error);creators=pr.data||[]}const byId=Object.fromEntries(creators.map(p=>[p.id,p]));recipeCloudState.community=rows.map(r=>cloudCommunityToApp(r,byId[r.owner_id]));recipeCloudState.savedIds=new Set((favRes.data||[]).map(x=>String(x.recipe_id)));recipeCloudState.communityLoaded=true}catch(e){console.error('loadCommunityRecipes',e);recipeCloudState.error=e?.message||'Could not load community recipes.'}finally{recipeCloudState.communityLoading=false}}
function requestRecipeCloudRefresh(){recipeCloudState.ownedLoaded=false;recipeCloudState.communityLoaded=false;recipeCloudState.error=null}
function renderNutritionCloudAsync(){if(route!=='nutrition')return;const active=nutritionTab;if(active==='recipes'&&!recipeCloudState.ownedLoaded&&!recipeCloudState.ownedLoading){ensureOwnedRecipesCloud().then(()=>{if(route==='nutrition'&&nutritionTab==='recipes')nutrition()}).catch(()=>{})}else if(active==='community'&&!recipeCloudState.communityLoaded&&!recipeCloudState.communityLoading){loadCommunityRecipes(false).then(()=>{if(route==='nutrition'&&nutritionTab==='community')nutrition()}).catch(()=>{})}}

// --- v100 FAST FOOD LOGGING -------------------------------------------------
// Generic foods: Norwegian Food Composition Table (Matvaretabellen / Mattilsynet).
// Packaged foods: Open Food Facts by barcode. Every calculation uses normalized
// per-100 g (or 100 ml where the product source defines it) values and lets the
// user review the matched food and amount before anything is saved.
let matvareFoodsCache=null,matvareFoodsPromise=null,nutritionSearchTimer=null,activeBarcodeScanner=null;
const MATVARE_URL='https://www.matvaretabellen.no/api/nb/foods.json';
const OFF_PRODUCT_URL='https://world.openfoodfacts.org/api/v2/product/';
const FOOD_SOURCE_LABELS={matvaretabellen:'Matvaretabellen · Mattilsynet',openfoodfacts:'Open Food Facts',manual:'Manual label values',recent:'Recent',saved:'Saved meal'};
function foodSearchNorm(v=''){return String(v||'').toLocaleLowerCase('nb-NO').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/æ/g,'ae').replace(/ø/g,'o').replace(/å/g,'a').replace(/[^a-z0-9]+/g,' ').trim()}
function n1(v){const n=Number(v);return Number.isFinite(n)?Math.round(n*10)/10:0}
function n0(v){const n=Number(v);return Number.isFinite(n)?Math.round(n):0}
function nutritionScale(per100,amount){const m=Math.max(0,Number(amount)||0)/100;return {kcal:n0((per100.kcal||0)*m),protein:n1((per100.protein||0)*m),carbs:n1((per100.carbs||0)*m),fat:n1((per100.fat||0)*m),fiber:n1((per100.fiber||0)*m)}}
function nutritionConstituent(food,id){const x=(food?.constituents||[]).find(c=>String(c?.nutrientId||'')===id);return Number(x?.quantity)||0}
function matvareToFood(food){if(!food)return null;const kcal=Number(food?.calories?.quantity);if(!Number.isFinite(kcal))return null;return {id:`mvt:${food.foodId}`,source:'matvaretabellen',sourceId:String(food.foodId||''),name:String(food.foodName||'Food'),brand:'',unit:'g',per100:{kcal:n1(kcal),protein:n1(nutritionConstituent(food,'Protein')),carbs:n1(nutritionConstituent(food,'Karbo')),fat:n1(nutritionConstituent(food,'Fett')),fiber:n1(nutritionConstituent(food,'Fiber'))},searchKeywords:Array.isArray(food.searchKeywords)?food.searchKeywords:[],portions:Array.isArray(food.portions)?food.portions:[]}}
async function loadMatvareFoods(){
 if(matvareFoodsCache)return matvareFoodsCache;if(matvareFoodsPromise)return matvareFoodsPromise;
 matvareFoodsPromise=fetch(MATVARE_URL,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(`Matvaretabellen returned ${r.status}`);return r.json()}).then(j=>{const list=Array.isArray(j)?j:(Array.isArray(j?.foods)?j.foods:[]);matvareFoodsCache=list;return list}).finally(()=>{matvareFoodsPromise=null});return matvareFoodsPromise;
}
function matvareFoodScore(food,q){const name=foodSearchNorm(food?.foodName),keywords=foodSearchNorm((food?.searchKeywords||[]).join(' ')),tokens=q.split(' ').filter(Boolean);if(!name)return -1;let score=0;if(name===q)score+=100;if(name.startsWith(q))score+=55;if(name.includes(q))score+=35;tokens.forEach(t=>{if(name.split(' ').includes(t))score+=12;else if(name.includes(t))score+=7;if(keywords.includes(t))score+=3});score-=Math.min(15,Math.max(0,name.length-q.length)/12);return score}
async function searchMatvareFoods(query,limit=12){const q=foodSearchNorm(query);if(q.length<2)return [];const foods=await loadMatvareFoods();return foods.map(f=>[matvareFoodScore(f,q),f]).filter(x=>x[0]>2).sort((a,b)=>b[0]-a[0]).slice(0,limit).map(x=>matvareToFood(x[1])).filter(Boolean)}
function foodTemplateKey(f){return String(f?.sourceId||f?.id||`${f?.source||''}:${foodSearchNorm(f?.name)}`)}
function favoriteFoodTemplate(food){const key=foodTemplateKey(food);return (data.foodFavorites||[]).some(f=>foodTemplateKey(f)===key)}
function toggleFoodFavorite(food){data.foodFavorites=data.foodFavorites||[];const key=foodTemplateKey(food),exists=data.foodFavorites.some(f=>foodTemplateKey(f)===key);data.foodFavorites=exists?data.foodFavorites.filter(f=>foodTemplateKey(f)!==key):[...data.foodFavorites,{...structuredClone(food),id:key}];save();return !exists}
function recentFoodTemplates(limit=8){const seen=new Set(),out=[];[...(data.nutrition||[])].reverse().forEach(n=>{if(out.length>=limit||!n?.per100||Array.isArray(n.components)&&n.components.length)return;const f={id:n.foodId||n.sourceId||n.id,source:n.source||'recent',sourceId:n.sourceId||n.foodId||'',name:n.name,brand:n.brand||'',unit:n.unit||'g',per100:structuredClone(n.per100)};const k=foodTemplateKey(f);if(seen.has(k))return;seen.add(k);out.push(f)});return out}
function guessMealType(){const h=new Date().getHours();return h<11?'Breakfast':h<15?'Lunch':h<20?'Dinner':'Snack'}
function mealTypes(){return ['Breakfast','Lunch','Dinner','Snack']}
function mealTypeOptions(selected=guessMealType()){return mealTypes().map(x=>`<option value="${x}" ${x===selected?'selected':''}>${x}</option>`).join('')}
function logFoodTemplate(food,amount,mealType=guessMealType(),date=isoToday()){const scaled=nutritionScale(food.per100,amount),entry={id:uid(),date,mealType,name:food.name,brand:food.brand||'',source:food.source||'manual',sourceId:food.sourceId||'',foodId:food.id||'',amount:n1(amount),unit:food.unit||'g',per100:structuredClone(food.per100),...scaled,fiberProvided:true};data.nutrition.push(entry);save();return entry}
function openFoodPortionSheet(food,{amount=100,mealType=guessMealType(),afterLog=null}={}){
 if(!food?.per100)return toast('Nutrition values are missing for this food.');const src=FOOD_SOURCE_LABELS[food.source]||food.source||'Food source',fav=favoriteFoodTemplate(food);
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">${escapeHtml(src)}</p><h2>${escapeHtml(food.name)}</h2>${food.brand?`<p class="subtle">${escapeHtml(food.brand)}</p>`:''}</div><button class="sheet-close" data-close>×</button></div><article class="nutrition-source-card"><div><span>PER 100 ${escapeHtml(food.unit||'g')}</span><strong>${n0(food.per100.kcal)} kcal</strong></div><div><span>PROTEIN</span><strong>${n1(food.per100.protein)} g</strong></div><div><span>CARBS</span><strong>${n1(food.per100.carbs)} g</strong></div><div><span>FAT</span><strong>${n1(food.per100.fat)} g</strong></div></article><div class="inline-fields"><div class="field"><label>Amount (${escapeHtml(food.unit||'g')})</label><input id="portion-amount" type="number" inputmode="decimal" min="0.1" step="1" value="${Number(amount)||100}"></div><div class="field"><label>Meal</label><select id="portion-meal">${mealTypeOptions(mealType)}</select></div></div><article class="nutrition-live-total" id="portion-total"></article><div class="food-source-note">${food.source==='openfoodfacts'?`Barcode data can be community-contributed. Values are normalized per 100 ${escapeHtml(food.unit||'g')}; compare them with the package label if anything looks wrong.`:'Values are calculated from Matvaretabellen per 100 g. Choose the amount you actually used.'}</div><div class="sheet-actions"><button class="secondary" id="portion-fav">${fav?'★ FAVORITE':'☆ ADD FAVORITE'}</button><button class="primary" id="portion-log">LOG FOOD</button></div>`);
 const amountEl=$('#portion-amount'),total=$('#portion-total');const paint=()=>{const x=nutritionScale(food.per100,+amountEl.value||0);total.innerHTML=`<strong>${x.kcal} kcal</strong><span>${x.protein} g protein · ${x.carbs} g carbs · ${x.fat} g fat · ${x.fiber} g fiber</span>`};paint();amountEl.oninput=paint;$('#portion-fav').onclick=()=>{$('#portion-fav').textContent=toggleFoodFavorite(food)?'★ FAVORITE':'☆ ADD FAVORITE'};$('#portion-log').onclick=()=>{const a=+amountEl.value;if(!a||a<=0)return toast('Enter the amount you ate.');logFoodTemplate(food,a,$('#portion-meal').value);closeSheet();nutrition();toast(`${food.name} logged`);afterLog?.()};
}
function openNutritionSearch(initial=''){
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Matvaretabellen · Mattilsynet</p><h2>Search food</h2></div><button class="sheet-close" data-close>×</button></div><div class="food-search-box"><input id="food-db-search" value="${escapeHtml(initial)}" autocomplete="off" placeholder="e.g. karbonadedeig, havregryn, ris…"><span id="food-db-status">Type at least 2 letters</span></div><div id="food-db-results" class="food-search-results"></div><p class="science-note">Generic foods use the Norwegian Food Composition Table. You always choose the exact database match and amount before logging.</p>`);
 const input=$('#food-db-search'),results=$('#food-db-results'),status=$('#food-db-status');let epoch=0;const run=async()=>{const q=input.value.trim(),my=++epoch;if(q.length<2){results.innerHTML='';status.textContent='Type at least 2 letters';return}status.textContent='Searching Matvaretabellen…';try{const items=await searchMatvareFoods(q);if(my!==epoch)return;status.textContent=items.length?`${items.length} matches`:'No match';results.innerHTML=items.length?items.map((f,i)=>`<button class="food-result-card" data-food-result="${i}"><span><strong>${escapeHtml(f.name)}</strong><small>${n0(f.per100.kcal)} kcal · ${n1(f.per100.protein)} g protein per 100 g</small></span><b>›</b></button>`).join(''):`<div class="empty"><strong>No food found</strong>Try a shorter Norwegian food name or use Manual label values.</div>`;$$('[data-food-result]').forEach(b=>b.onclick=()=>{const f=items[+b.dataset.foodResult];closeSheet();openFoodPortionSheet(f)})}catch(e){if(my!==epoch)return;status.textContent='Could not load Matvaretabellen';results.innerHTML=`<div class="empty"><strong>Food database unavailable</strong>${escapeHtml(e.message||'Check your internet connection.')}</div>`}};input.oninput=()=>{clearTimeout(nutritionSearchTimer);nutritionSearchTimer=setTimeout(run,250)};if(initial){input.focus();run()}else input.focus();
}
function offProductToFood(code,p){const n=p?.nutriments||{},kcal=Number(n['energy-kcal_100g']??n['energy-kcal']);const kj=Number(n['energy-kj_100g']??n['energy_100g']);const finalKcal=Number.isFinite(kcal)?kcal:(Number.isFinite(kj)?kj/4.184:NaN);if(!Number.isFinite(finalKcal))return null;const quantityText=String(p?.quantity||'').toLowerCase(),productUnit=String(p?.product_quantity_unit||'').toLowerCase(),unit=productUnit==='ml'||(!productUnit&&/(?:^|\s)(?:ml|cl|dl|l)(?:\s|$)/.test(quantityText))?'ml':'g';return {id:`off:${code}`,source:'openfoodfacts',sourceId:String(code),name:String(p.product_name||p.generic_name||`Barcode ${code}`),brand:String(p.brands||''),unit,per100:{kcal:n1(finalKcal),protein:n1(n.proteins_100g),carbs:n1(n.carbohydrates_100g),fat:n1(n.fat_100g),fiber:n1(n.fiber_100g)}}}
async function lookupBarcodeProduct(code){const clean=String(code||'').replace(/\D/g,'');if(clean.length<8)throw new Error('That barcode looks too short.');const fields='code,product_name,generic_name,brands,nutriments,nutrition_data_per,serving_size,quantity,product_quantity_unit';const r=await fetch(`${OFF_PRODUCT_URL}${encodeURIComponent(clean)}.json?fields=${fields}`,{cache:'no-store'});if(!r.ok)throw new Error(`Product lookup returned ${r.status}`);const j=await r.json();if(j.status!==1||!j.product)throw new Error('Product not found in Open Food Facts.');const f=offProductToFood(clean,j.product);if(!f)throw new Error('This product has no usable calories per 100 g.');return f}
async function stopBarcodeScanner(){if(!activeBarcodeScanner)return;const s=activeBarcodeScanner;activeBarcodeScanner=null;try{await s.clear()}catch{try{await s.stop()}catch{}}}
function openBarcodeScanner(){
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Barcode</p><h2>Scan package</h2></div><button class="sheet-close" data-close>×</button></div><div id="barcode-reader" class="barcode-reader"></div><div class="barcode-manual"><div class="field"><label>Or enter barcode</label><input id="barcode-code" inputmode="numeric" autocomplete="off" placeholder="EAN / UPC"></div><button class="secondary" id="barcode-lookup">LOOK UP</button></div><p class="science-note">Product nutrition comes from Open Food Facts. GAYM calculates your amount from the normalized per-100 g values and lets you inspect them before logging.</p>`);
 const lookup=async code=>{const btn=$('#barcode-lookup');if(btn){btn.disabled=true;btn.textContent='LOOKING UP…'}try{const food=await lookupBarcodeProduct(code);await stopBarcodeScanner();closeSheet();openFoodPortionSheet(food)}catch(e){toast(e.message||'Could not find product');if(btn){btn.disabled=false;btn.textContent='LOOK UP'}}};$('#barcode-lookup').onclick=()=>lookup($('#barcode-code').value);
 if(globalThis.Html5QrcodeScanner){try{const formats=globalThis.Html5QrcodeSupportedFormats?[Html5QrcodeSupportedFormats.EAN_13,Html5QrcodeSupportedFormats.EAN_8,Html5QrcodeSupportedFormats.UPC_A,Html5QrcodeSupportedFormats.UPC_E]:undefined;activeBarcodeScanner=new Html5QrcodeScanner('barcode-reader',{fps:10,qrbox:{width:250,height:120},rememberLastUsedCamera:true,formatsToSupport:formats},false);let handled=false;activeBarcodeScanner.render(code=>{if(handled)return;handled=true;lookup(code)},()=>{})}catch(e){console.error('barcode scanner',e);$('#barcode-reader').innerHTML='<div class="empty">Camera scanner could not start. Enter the barcode below.</div>'}}else $('#barcode-reader').innerHTML='<div class="empty">Camera scanner could not load. Enter the barcode below.</div>';
}
function parseQuickFoodText(text){return String(text||'').split(/\s*(?:\+|;|\n)\s*/).map(x=>x.trim()).filter(Boolean).map(raw=>{const m=raw.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(kg|g|gram(?:s)?|ml|dl|l)\b/i);if(!m)return {raw,error:'Add an amount, e.g. 200 g'};let amount=parseFloat(m[1].replace(',','.')),unit=m[2].toLowerCase();if(unit==='kg'){amount*=1000;unit='g'}else if(unit==='gram'||unit==='grams')unit='g';else if(unit==='dl'){amount*=100;unit='ml'}else if(unit==='l'){amount*=1000;unit='ml'};const name=raw.replace(m[0],' ').replace(/^\s*[-,:]+|[-,:]+\s*$/g,'').trim();return {raw,name,amount,unit,error:!name?'Add a food name':null}})}
async function buildQuickMatches(text){const parsed=parseQuickFoodText(text),out=[];for(const x of parsed){if(x.error){out.push({...x,food:null});continue}if(x.unit!=='g'){out.push({...x,error:'Use grams for generic foods so GAYM does not guess density.',food:null});continue}try{const hits=await searchMatvareFoods(x.name,5);out.push({...x,food:hits[0]||null,alternatives:hits,error:hits.length?'':`No Matvaretabellen match for ${x.name}`})}catch(e){out.push({...x,food:null,error:e.message||'Food database unavailable'})}}return out}
function openQuickLog(text=''){
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Quick Add</p><h2>Type the meal</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><label>Foods + amounts</label><textarea id="quick-food-text" rows="4" placeholder="200 g karbonadedeig + 125 g jasminris + 200 g knuste tomater">${escapeHtml(text)}</textarea><small>Separate foods with +, new line or ;. Use grams for exact generic-food calculations.</small></div><div class="field"><label>Meal</label><select id="quick-meal-type">${mealTypeOptions()}</select></div><div id="quick-food-review"></div><div class="sheet-actions"><button class="primary" id="quick-review">REVIEW MATCHES</button></div>`);
 $('#quick-review').onclick=async()=>{
  const btn=$('#quick-review'),review=$('#quick-food-review'),raw=$('#quick-food-text').value.trim();if(!raw)return toast('Type what you ate.');btn.disabled=true;btn.textContent='MATCHING…';review.innerHTML='<div class="cloud-loader"></div>';
  const matches=await buildQuickMatches(raw);btn.disabled=false;btn.textContent='REVIEW MATCHES';
  const renderReview=()=>{const valid=matches.filter(x=>x.food&&!x.error),allValid=valid.length===matches.length&&valid.length>0,totalKcal=valid.reduce((a,x)=>a+nutritionScale(x.food.per100,x.amount).kcal,0),totalProtein=n1(valid.reduce((a,x)=>a+nutritionScale(x.food.per100,x.amount).protein,0));review.innerHTML=`<div class="quick-review-list">${matches.map((x,i)=>x.food?`<article class="quick-match"><div><span>${x.amount} ${x.unit} · choose exact match</span><strong>${escapeHtml(x.food.name)}</strong><small>${nutritionScale(x.food.per100,x.amount).kcal} kcal from Matvaretabellen</small></div>${x.alternatives?.length>1?`<select class="quick-match-select" data-quick-select="${i}">${x.alternatives.map((f,j)=>`<option value="${j}" ${foodTemplateKey(f)===foodTemplateKey(x.food)?'selected':''}>${escapeHtml(f.name)} · ${n0(f.per100.kcal)} kcal/100 g</option>`).join('')}</select>`:''}</article>`:`<article class="quick-match error"><div><span>NEEDS ATTENTION</span><strong>${escapeHtml(x.raw)}</strong><small>${escapeHtml(x.error||'No match')}</small></div></article>`).join('')}</div>${allValid?`<article class="nutrition-live-total"><strong>${totalKcal} kcal</strong><span>${totalProtein} g protein · confirm every database match before saving</span></article><button class="primary" id="quick-log-all">LOG ${valid.length} FOOD${valid.length===1?'':'S'}</button>`:''}`;
   $$('[data-quick-select]').forEach(sel=>sel.onchange=()=>{const x=matches[+sel.dataset.quickSelect],next=x.alternatives?.[+sel.value];if(next){x.food=next;renderReview()}});
   const log=$('#quick-log-all');if(log)log.onclick=()=>{const meal=$('#quick-meal-type').value,mealId=uid();valid.forEach(x=>{const e=logFoodTemplate(x.food,x.amount,meal);e.mealId=mealId;e.quickLog=true});save();closeSheet();nutrition();toast(`${valid.length} foods logged`)};
  };renderReview();
 };
 if(text)$('#quick-review').click();
}
function saveMealTemplate(mealType,date=isoToday()){const items=(data.nutrition||[]).filter(n=>n.date===date&&(n.mealType||'Snack')===mealType);if(!items.length)return toast(`No ${mealType.toLowerCase()} to save.`);const existing=(data.savedMeals||[]).find(x=>x.mealType===mealType&&x.sourceDate===date);const template={id:existing?.id||uid(),name:`${mealType} · ${new Date(date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}`,mealType,sourceDate:date,items:items.map(n=>({name:n.name,brand:n.brand||'',source:n.source||'manual',sourceId:n.sourceId||'',foodId:n.foodId||'',amount:n.amount||100,unit:n.unit||'g',per100:n.per100?structuredClone(n.per100):null,kcal:n.kcal,protein:n.protein,carbs:n.carbs,fat:n.fat,fiber:n.fiber}))};data.savedMeals=existing?data.savedMeals.map(x=>x.id===existing.id?template:x):[...(data.savedMeals||[]),template];save();toast(`${mealType} saved`);nutrition()}
function logSavedMeal(meal){if(!meal?.items?.length)return toast('Saved meal is empty.');const mealId=uid();meal.items.forEach(item=>{if(item.per100){const e=logFoodTemplate(item,item.amount,meal.mealType||guessMealType());e.mealId=mealId;e.savedMealId=meal.id}else data.nutrition.push({id:uid(),date:isoToday(),mealType:meal.mealType||guessMealType(),name:item.name,kcal:item.kcal||0,protein:item.protein||0,carbs:item.carbs||0,fat:item.fat||0,fiber:item.fiber||0,fiberProvided:true,mealId,savedMealId:meal.id})});save();nutrition();toast(`${meal.name} logged`)}
function copyNutritionDay(fromDate,toDate=isoToday()){const items=(data.nutrition||[]).filter(n=>n.date===fromDate);if(!items.length)return toast('Nothing was logged that day.');const mealIds=new Map();items.forEach(n=>{const copy=structuredClone(n);copy.id=uid();copy.date=toDate;if(copy.mealId){if(!mealIds.has(copy.mealId))mealIds.set(copy.mealId,uid());copy.mealId=mealIds.get(copy.mealId)}data.nutrition.push(copy)});save();nutrition();toast(`${items.length} foods copied`)}
function yesterdayKey(){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-1);return isoToday(d)}
function openManualFoodSheet(){openSheet(`<div class="sheet-head"><div><p class="eyebrow">Manual label</p><h2>Add product values</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">Enter exactly what the package says per 100 g. Then choose how many grams you used.</p><div class="field"><label>Product name</label><input id="mf-name" placeholder="e.g. Mutti crushed tomatoes"></div><div class="inline-fields"><div class="field"><label>kcal / 100 g</label><input id="mf-kcal" type="number" step="0.1"></div><div class="field"><label>Protein / 100 g</label><input id="mf-protein" type="number" step="0.1"></div></div><div class="inline-fields"><div class="field"><label>Carbs / 100 g</label><input id="mf-carbs" type="number" step="0.1"></div><div class="field"><label>Fat / 100 g</label><input id="mf-fat" type="number" step="0.1"></div></div><div class="field"><label>Fiber / 100 g</label><input id="mf-fiber" type="number" step="0.1" value="0"></div><button class="primary" id="mf-next">CHOOSE AMOUNT</button>`);$('#mf-next').onclick=()=>{const name=$('#mf-name').value.trim(),kcal=+$('#mf-kcal').value;if(!name||!Number.isFinite(kcal)||kcal<0)return toast('Add a name and kcal per 100 g.');const food={id:`manual:${uid()}`,source:'manual',sourceId:'',name,brand:'',unit:'g',per100:{kcal:n1(kcal),protein:n1($('#mf-protein').value),carbs:n1($('#mf-carbs').value),fat:n1($('#mf-fat').value),fiber:n1($('#mf-fiber').value)}};closeSheet();openFoodPortionSheet(food)}}
function nutritionMealCard(n){return `<div class="list-card nutrition-entry"><span class="badge-icon cardio">F</span><span class="grow"><h3>${escapeHtml(n.name)}</h3><p>${n.kcal} kcal · ${n1(n.protein||0)} g protein${n.amount?` · ${n1(n.amount)} ${escapeHtml(n.unit||'g')}`:''}</p><small>${escapeHtml(FOOD_SOURCE_LABELS[n.source]||n.source||'Logged food')}</small></span>${n.per100?`<button class="small-btn" data-food-edit="${n.id}">EDIT</button>`:''}<button class="small-btn danger" data-food-remove="${n.id}">REMOVE</button></div>`}
function openNutritionEntryEdit(id){const n=(data.nutrition||[]).find(x=>String(x.id)===String(id));if(!n?.per100)return;const food={id:n.foodId||n.sourceId||n.id,source:n.source,sourceId:n.sourceId,name:n.name,brand:n.brand||'',unit:n.unit||'g',per100:structuredClone(n.per100)};openSheet(`<div class="sheet-head"><div><p class="eyebrow">Edit amount</p><h2>${escapeHtml(n.name)}</h2></div><button class="sheet-close" data-close>×</button></div><div class="inline-fields"><div class="field"><label>Amount (${escapeHtml(n.unit||'g')})</label><input id="edit-food-amount" type="number" step="1" value="${n.amount||100}"></div><div class="field"><label>Meal</label><select id="edit-food-meal">${mealTypeOptions(n.mealType||guessMealType())}</select></div></div><article class="nutrition-live-total" id="edit-food-total"></article><button class="primary" id="edit-food-save">SAVE CHANGES</button>`);const a=$('#edit-food-amount'),t=$('#edit-food-total'),paint=()=>{const x=nutritionScale(food.per100,+a.value||0);t.innerHTML=`<strong>${x.kcal} kcal</strong><span>${x.protein} g protein · ${x.carbs} g carbs · ${x.fat} g fat</span>`};paint();a.oninput=paint;$('#edit-food-save').onclick=()=>{const amount=+a.value;if(!amount||amount<=0)return toast('Enter an amount.');Object.assign(n,{amount:n1(amount),mealType:$('#edit-food-meal').value,...nutritionScale(food.per100,amount)});save();closeSheet();nutrition();toast('Food updated')}}
// ---------------------------------------------------------------------------
function nutrition(){
 const f=data.nutrition.filter(n=>n.date===isoToday()),k=f.reduce((a,n)=>a+(+n.kcal||0),0),p=f.reduce((a,n)=>a+(+n.protein||0),0),c=f.reduce((a,n)=>a+(+n.carbs||0),0),fat=f.reduce((a,n)=>a+(+n.fat||0),0),fiber=f.reduce((a,n)=>a+(+n.fiber||0),0),ft=fiberTarget(),perc=Math.min(100,k/data.profile.calorieTarget*100),leftK=Math.max(0,data.profile.calorieTarget-k),leftP=Math.max(0,data.profile.proteinTarget-p);
 const tabs=`<div class="nutrition-tabs nutrition-tabs-three"><button data-ntab="today" class="${nutritionTab==='today'?'active':''}">TODAY</button><button data-ntab="recipes" class="${nutritionTab==='recipes'?'active':''}">RECIPES</button><button data-ntab="community" class="${nutritionTab==='community'?'active':''}">COMMUNITY</button></div>`;
 if(nutritionTab==='community'){
  const q=communityRecipeQuery.trim().toLowerCase(),items=(recipeCloudState.community||[]).filter(r=>!q||`${r.name} ${r.cuisine} ${r.creator?.display_name||''} ${r.creator?.username||''}`.toLowerCase().includes(q));
  const body=recipeCloudState.error?`<div class="empty"><strong>Community could not load</strong>${escapeHtml(recipeCloudState.error)}<button class="secondary compact" id="community-retry">TRY AGAIN</button></div>`:recipeCloudState.communityLoading&&!recipeCloudState.communityLoaded?`<article class="card loading-card"><div class="cloud-loader"></div><p>Loading community recipes…</p></article>`:items.length?`<div class="recipe-grid community-recipe-grid">${items.map(communityRecipeCard).join('')}</div>`:`<div class="empty"><strong>No community recipes yet</strong>Recipes shared with Friends or All of GAYM will appear here.</div>`;
  shell(`${header()}<h1 class="page-title">Nutrition</h1>${tabs}<section class="section"><div class="section-head"><div><p class="eyebrow">FROM GAYM USERS</p><h2>Community recipes</h2></div></div><p class="subtle">Open a recipe to see every ingredient and instruction before you decide to save it.</p><div class="recipe-search"><input id="community-recipe-search" value="${escapeHtml(communityRecipeQuery)}" placeholder="Search community recipes..."></div>${body}</section>`);
  bindNutritionTabs();const search=$('#community-recipe-search');if(search)search.oninput=e=>{communityRecipeQuery=e.target.value;nutrition()};$$('[data-community-recipe]').forEach(b=>b.onclick=()=>openCommunityRecipe(b.dataset.communityRecipe));const retry=$('#community-retry');if(retry)retry.onclick=()=>{recipeCloudState.communityLoaded=false;recipeCloudState.error=null;loadCommunityRecipes(true).then(nutrition)};renderNutritionCloudAsync();return;
 }
 if(nutritionTab==='recipes'){
  const source=recipeLibraryView==='mine'?(data.customRecipes||[]):recipeLibraryView==='favorites'?allRecipes().filter(r=>(data.recipeFavorites||[]).includes(r.id)):allRecipes();
  const matches=sortedRecipes(source.filter(r=>(recipeCategory==='All'||r.cuisine===recipeCategory||recipeTags(r).includes(recipeCategory))&&(!recipeQuery||(`${r.name} ${r.cuisine} ${recipeTags(r).join(' ')}`).toLowerCase().includes(recipeQuery.toLowerCase()))));
  shell(`${header()}<h1 class="page-title">Nutrition</h1>${tabs}<section class="section"><p class="eyebrow">Smart picks for today</p><article class="card recipe-need-card"><div><span>You have left</span><strong>${Math.round(leftK).toLocaleString()} kcal</strong></div><div><span>Protein left</span><strong>${Math.round(leftP)} g</strong></div><div><span>Fiber</span><strong>${Math.round(fiber)} / ${ft} g</strong></div></article></section><section class="section"><div class="recipe-library-head"><div class="recipe-library-tabs"><button data-rview="all" class="${recipeLibraryView==='all'?'active':''}">ALL</button><button data-rview="favorites" class="${recipeLibraryView==='favorites'?'active':''}">FAVORITES</button><button data-rview="mine" class="${recipeLibraryView==='mine'?'active':''}">MY RECIPES</button></div><button class="primary compact" id="create-recipe">+ CREATE</button></div><div class="recipe-search"><input id="recipe-search" value="${escapeHtml(recipeQuery)}" placeholder="Search recipes or cuisines..."></div><div class="recipe-cats">${RECIPE_CATEGORIES.map(x=>`<button data-rcat="${escapeHtml(x)}" class="${recipeCategory===x?'active':''}">${escapeHtml(x)}</button>`).join('')}</div><p class="bottom-note"><strong>Bottom-friendly</strong> is only shown on recipes that provide at least 10 g fiber per serving and meet the 14 g fiber / 1,000 kcal benchmark.</p>${!matches.length?`<div class="empty"><strong>${recipeLibraryView==='mine'?'No custom recipes yet':recipeLibraryView==='favorites'?'No favorites yet':'No recipes found'}</strong>${recipeLibraryView==='mine'?'Create your own recipe with a photo, ingredients, instructions and sharing visibility.':recipeLibraryView==='favorites'?'Tap the heart on any recipe to save it here.':'Try another search or category.'}</div>`:`<div class="recipe-grid">${matches.map(recipeCard).join('')}</div>`}</section>`);
  bindNutritionTabs();$('#recipe-search').oninput=e=>{recipeQuery=e.target.value;nutrition()};$$('[data-rcat]').forEach(b=>b.onclick=()=>{recipeCategory=b.dataset.rcat;nutrition()});$$('[data-rview]').forEach(b=>b.onclick=()=>{recipeLibraryView=b.dataset.rview;recipeCategory='All';recipeQuery='';nutrition()});$('#create-recipe').onclick=()=>openRecipeBuilder();bindRecipeCards();hydrateRecipeImages();renderNutritionCloudAsync();return;
 }
 const recents=recentFoodTemplates(6),favs=(data.foodFavorites||[]).slice(-6).reverse(),saved=(data.savedMeals||[]).slice(-6).reverse(),yesterday=(data.nutrition||[]).filter(n=>n.date===yesterdayKey());
 const groups=mealTypes().map(type=>[type,f.filter(n=>(n.mealType||'Snack')===type)]).filter(x=>x[1].length);
 shell(`${header()}<h1 class="page-title">Nutrition</h1>${tabs}<p class="subtle">Daily targets adapt to your goal: <strong style="color:var(--text)">${goalLabel(data.profile.goal)}</strong>.</p>
 <section class="section"><article class="card" style="padding:18px"><div class="food-ring" style="--p:${perc}"><div><strong>${Math.round(k).toLocaleString()}</strong><small>/ ${data.profile.calorieTarget.toLocaleString()} kcal</small></div></div>${macro('Protein',p,data.profile.proteinTarget,'g','cyan')}${macro('Carbs',c,data.profile.carbTarget,'g','yellow')}${macro('Fat',fat,data.profile.fatTarget,'g','orange')}${macro('Fiber',fiber,ft,'g','lime')}</article></section>
 <section class="section nutrition-fastlog"><p class="eyebrow">FAST LOG</p><button class="quick-log-hero" id="quick-log"><span>What did you eat?</span><strong>“200 g beef + 125 g rice…”</strong><b>›</b></button><div class="nutrition-action-grid"><button class="secondary" id="search-food">SEARCH FOOD</button><button class="secondary" id="scan-food">SCAN BARCODE</button><button class="secondary" id="manual-food">LABEL VALUES</button><button class="secondary" id="copy-yesterday" ${yesterday.length?'':'disabled'}>COPY YESTERDAY</button></div></section>
 ${recents.length?`<section class="section"><div class="section-head"><h2>Recent</h2></div><div class="nutrition-chip-scroll">${recents.map((x,i)=>`<button class="nutrition-quick-card" data-recent-food="${i}"><strong>${escapeHtml(x.name)}</strong><small>${n0(x.per100.kcal)} kcal / 100 g</small><b>+</b></button>`).join('')}</div></section>`:''}
 ${favs.length?`<section class="section"><div class="section-head"><h2>Favorites</h2></div><div class="nutrition-chip-scroll">${favs.map((x,i)=>`<button class="nutrition-quick-card" data-favorite-food="${i}"><strong>${escapeHtml(x.name)}</strong><small>${n0(x.per100?.kcal)} kcal / 100 g</small><b>★</b></button>`).join('')}</div></section>`:''}
 ${saved.length?`<section class="section"><div class="section-head"><h2>Saved meals</h2></div><div class="nutrition-chip-scroll">${saved.map((x,i)=>`<button class="nutrition-quick-card saved" data-saved-meal="${i}"><strong>${escapeHtml(x.name)}</strong><small>${x.items?.length||0} foods</small><b>+</b></button>`).join('')}</div></section>`:''}
 <section class="section"><div class="section-head"><h2>Today's meals</h2></div>${groups.length?groups.map(([type,items])=>`<div class="nutrition-meal-group"><div class="nutrition-meal-head"><h3>${type}</h3><button class="text-btn" data-save-meal="${type}">SAVE MEAL</button></div><div class="list">${items.map(nutritionMealCard).join('')}</div></div>`).join(''):`<div class="empty"><strong>No food logged today</strong>Search Matvaretabellen, scan a package or use Quick Add.</div>`}</section>
 <section class="section"><div class="section-head"><h2>Recipes for your goal</h2><button class="text-btn" id="see-recipes">SEE ALL</button></div><div class="quick-recipe-row">${sortedRecipes(allRecipes()).slice(0,3).map(recipeCard).join('')}</div></section>`);
 bindNutritionTabs();$('#quick-log').onclick=()=>openQuickLog();$('#search-food').onclick=()=>openNutritionSearch();$('#scan-food').onclick=openBarcodeScanner;$('#manual-food').onclick=openManualFoodSheet;$('#copy-yesterday').onclick=()=>copyNutritionDay(yesterdayKey());$('#see-recipes').onclick=()=>{nutritionTab='recipes';nutrition()};$$('[data-recent-food]').forEach(b=>b.onclick=()=>openFoodPortionSheet(recents[+b.dataset.recentFood]));$$('[data-favorite-food]').forEach(b=>b.onclick=()=>openFoodPortionSheet(favs[+b.dataset.favoriteFood]));$$('[data-saved-meal]').forEach(b=>b.onclick=()=>logSavedMeal(saved[+b.dataset.savedMeal]));$$('[data-save-meal]').forEach(b=>b.onclick=()=>saveMealTemplate(b.dataset.saveMeal));$$('[data-food-edit]').forEach(b=>b.onclick=()=>openNutritionEntryEdit(b.dataset.foodEdit));$$('[data-food-remove]').forEach(b=>b.onclick=()=>{if(removeNutritionWhere(n=>String(n.id)===String(b.dataset.foodRemove))){save();nutrition()}});bindRecipeCards();hydrateRecipeImages();
}
function bindNutritionTabs(){$$('[data-ntab]').forEach(b=>b.onclick=()=>{nutritionTab=b.dataset.ntab;nutrition()})}
function bindRecipeCards(){$$('[data-recipe]').forEach(b=>b.onclick=()=>openRecipe(b.dataset.recipe));$$('[data-recipe-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleRecipeFavorite(b.dataset.recipeFav);nutrition()})}
function recipeCard(r){const fav=(data.recipeFavorites||[]).includes(r.id),src=recipeImageSrc(r),customAttr=r.custom?`data-custom-image="${r.id}"`:'';return `<article class="recipe-card" data-recipe="${r.id}"><img src="${src}" ${customAttr} alt="${escapeHtml(r.name)}"><div class="recipe-card-body"><div class="recipe-title-row"><h3>${escapeHtml(r.name)}</h3><button class="recipe-heart ${fav?'active':''}" data-recipe-fav="${r.id}" aria-label="Favorite">${fav?'♥':'♡'}</button></div><p>${r.kcal} kcal · ${r.protein} g protein · ${r.fiber||0} g fiber</p>${r.custom?`<p class="recipe-visibility-mini">${escapeHtml(visibilityLabel(r.visibility||'private'))}</p>`:''}<div class="recipe-tags">${recipeTags(r).slice(0,3).map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div></div></article>`}
function communityRecipeCard(r){const creator=r.creator||{},saved=recipeCloudState.savedIds.has(String(r.cloudRecipeId))||data.customRecipes.some(x=>String(x.sourceCloudRecipeId||'')===String(r.cloudRecipeId));return `<article class="recipe-card community-recipe-card" data-community-recipe="${r.cloudRecipeId}"><img src="${r.image||RECIPE_FALLBACK}" alt="${escapeHtml(r.name)}"><div class="recipe-card-body"><p class="eyebrow">${r.visibility==='friends'?'FROM A FRIEND':'ALL OF GAYM'}</p><h3>${escapeHtml(r.name)}</h3><p>${r.kcal} kcal · ${r.protein} g protein · ${r.fiber||0} g fiber</p><small>by ${escapeHtml(creator.display_name||creator.username||'GAYM user')}${saved?' · Saved':''}</small></div></article>`}
function toggleRecipeFavorite(id){data.recipeFavorites=data.recipeFavorites||[];data.recipeFavorites=data.recipeFavorites.includes(id)?data.recipeFavorites.filter(x=>x!==id):[...data.recipeFavorites,id];save()}
async function openRecipe(id){const r=findRecipe(id);if(!r)return;let img=recipeImageSrc(r);if(r.custom)img=await getRecipeImage(r.id)||r.image||RECIPE_FALLBACK;const fit=recipeFit(r)<.75?'GOOD MATCH TODAY':'RECIPE',customActions=r.custom?`<p class="recipe-owner-visibility">Visible to: <strong>${escapeHtml(visibilityLabel(r.visibility||'private'))}</strong></p><div class="recipe-owner-actions"><button class="secondary" id="recipe-edit">EDIT RECIPE</button><button class="secondary danger-outline" id="recipe-delete">DELETE</button></div>`:'';openSheet(`<div class="recipe-hero"><img src="${img}" alt="${escapeHtml(r.name)}"></div><div class="sheet-head recipe-sheet-head"><div><p class="eyebrow">${fit}</p><h2>${escapeHtml(r.name)}</h2></div><button class="sheet-close" data-close>×</button></div><div class="recipe-tags big">${recipeTags(r).map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div><div class="recipe-macros"><div><strong>${r.kcal}</strong><span>kcal</span></div><div><strong>${r.protein}g</strong><span>protein</span></div><div><strong>${r.carbs}g</strong><span>carbs</span></div><div><strong>${r.fat}g</strong><span>fat</span></div><div><strong>${r.fiber||0}g</strong><span>fiber</span></div></div><p class="recipe-time">~${r.time||0} min · ${r.servings||1} serving${(r.servings||1)===1?'':'s'} · macros per serving</p><h3 class="recipe-section-title">Ingredients</h3><ul class="ingredient-list">${(r.ingredients||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><h3 class="recipe-section-title">Instructions</h3><ol class="step-list">${(r.steps||[]).map(x=>`<li><span>${escapeHtml(x)}</span></li>`).join('')}</ol>${customActions}<div class="sheet-actions"><button class="primary" id="recipe-add">ADD TO TODAY</button></div>`);$('#recipe-add').onclick=()=>{data.nutrition.push({id:uid(),date:isoToday(),name:r.name,kcal:r.kcal,protein:r.protein,carbs:r.carbs,fat:r.fat,fiber:r.fiber||0,fiberProvided:true,recipeId:r.id,ingredientsSnapshot:[...(r.ingredients||[])]});save();closeSheet();nutritionTab='today';nutrition();toast('Recipe added to today')};if(r.custom){$('#recipe-edit').onclick=()=>openRecipeBuilder(r.id);$('#recipe-delete').onclick=()=>confirmDeleteRecipe(r.id)}}
async function openCommunityRecipe(cloudId){const r=recipeCloudState.community.find(x=>String(x.cloudRecipeId)===String(cloudId));if(!r)return toast('Recipe is no longer available.');const creator=r.creator||{},saved=recipeCloudState.savedIds.has(String(cloudId))||data.customRecipes.some(x=>String(x.sourceCloudRecipeId||'')===String(cloudId));openSheet(`<div class="recipe-hero"><img src="${r.image||RECIPE_FALLBACK}" alt="${escapeHtml(r.name)}"></div><div class="sheet-head recipe-sheet-head"><div><p class="eyebrow">${r.visibility==='friends'?'SHARED WITH FRIENDS':'ALL OF GAYM'}</p><h2>${escapeHtml(r.name)}</h2><p class="subtle">by ${escapeHtml(creator.display_name||creator.username||'GAYM user')}</p></div><button class="sheet-close" data-close>×</button></div><div class="recipe-tags big">${recipeTags(r).map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div><div class="recipe-macros"><div><strong>${r.kcal}</strong><span>kcal</span></div><div><strong>${r.protein}g</strong><span>protein</span></div><div><strong>${r.carbs}g</strong><span>carbs</span></div><div><strong>${r.fat}g</strong><span>fat</span></div><div><strong>${r.fiber||0}g</strong><span>fiber</span></div></div><p class="recipe-time">~${r.time||0} min · ${r.servings||1} serving${(r.servings||1)===1?'':'s'} · macros per serving</p><h3 class="recipe-section-title">Ingredients</h3><ul class="ingredient-list">${(r.ingredients||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul><h3 class="recipe-section-title">Instructions</h3><ol class="step-list">${(r.steps||[]).map(x=>`<li><span>${escapeHtml(x)}</span></li>`).join('')}</ol><div class="sheet-actions"><button class="primary" id="save-community-recipe" ${saved?'disabled':''}>${saved?'SAVED TO MY RECIPES':'SAVE TO MY RECIPES'}</button></div>`);const btn=$('#save-community-recipe');if(btn&&!saved)btn.onclick=()=>saveCommunityRecipe(r,btn)}
async function saveCommunityRecipe(r,btn){if(data.customRecipes.some(x=>String(x.sourceCloudRecipeId||'')===String(r.cloudRecipeId)))return toast('Recipe already saved.');const id=`saved-recipe-${uid()}`,copy={id,name:r.name,cuisine:r.cuisine,meal:'Saved',custom:true,servings:r.servings,time:r.time,kcal:r.kcal,protein:r.protein,carbs:r.carbs,fat:r.fat,fiber:r.fiber,tags:[...(r.tags||[])],ingredients:[...(r.ingredients||[])],steps:[...(r.steps||[])],image:r.image&&r.image!==RECIPE_FALLBACK?r.image:null,visibility:'private',sourceCloudRecipeId:r.cloudRecipeId,sourceOwnerId:r.ownerId};btn.disabled=true;btn.textContent='SAVING…';data.customRecipes.push(copy);if(!save()){data.customRecipes=data.customRecipes.filter(x=>x.id!==id);btn.disabled=false;btn.textContent='SAVE TO MY RECIPES';return toast('Could not save recipe.')}try{const cloud=await upsertOwnedRecipeCloud(copy);copy.cloudRecipeId=cloud.id;copy.image=cloud.image_url||copy.image;data.customRecipes=data.customRecipes.map(x=>x.id===id?copy:x);save();const fav=await sb.from('recipe_favorites').insert({user_id:authUser.id,recipe_id:r.cloudRecipeId});if(fav.error&&fav.error.code!=='23505')console.error('recipe favorite sync',fav.error);recipeCloudState.savedIds.add(String(r.cloudRecipeId));btn.textContent='SAVED TO MY RECIPES';toast('Recipe saved to My Recipes.')}catch(e){console.error('saveCommunityRecipe cloud',e);copy.cloudSyncPending=true;data.customRecipes=data.customRecipes.map(x=>x.id===id?copy:x);save();btn.textContent='SAVED ON THIS DEVICE';toast('Saved locally. Cloud backup could not sync yet.')}}
function confirmDeleteRecipe(id){const r=findRecipe(id);if(!r?.custom)return;openSheet(`<div class="sheet-head"><div><p class="eyebrow">My Recipes</p><h2>Delete recipe?</h2></div><button class="sheet-close" data-close>×</button></div><p class="subtle">${escapeHtml(r.name)} will be removed from My Recipes. Meals already logged today stay in your history.</p><div class="sheet-actions two"><button class="secondary" data-close>CANCEL</button><button class="primary danger-fill" id="confirm-recipe-delete">DELETE RECIPE</button></div>`);$('#confirm-recipe-delete').onclick=async()=>{const beforeRecipes=[...(data.customRecipes||[])],beforeFav=[...(data.recipeFavorites||[])];data.customRecipes=data.customRecipes.filter(x=>x.id!==id);data.recipeFavorites=data.recipeFavorites.filter(x=>x!==id);if(!save()){data.customRecipes=beforeRecipes;data.recipeFavorites=beforeFav;return toast('Could not delete recipe. Try again.')}await deleteRecipeImage(id);if(sb&&authUser?.id){try{const q=await sb.from('social_recipes').delete().eq('owner_id',authUser.id).eq('local_id',String(id));if(q.error)console.error('delete cloud recipe',q.error)}catch(e){console.error('delete cloud recipe',e)}}requestRecipeCloudRefresh();closeSheet();nutritionTab='recipes';recipeLibraryView='mine';nutrition();toast('Recipe deleted')}}
async function openRecipeBuilder(editId=null){const existing=editId?findRecipe(editId):null;if(existing&&!existing.custom)return;let selectedFile=null,removeExistingImage=false,previewUrl=existing?recipeImageSrc(existing):RECIPE_FALLBACK;if(existing)previewUrl=await getRecipeImage(existing.id)||existing.image||RECIPE_FALLBACK;openSheet(`<div class="sheet-head"><div><p class="eyebrow">My Recipes</p><h2>${existing?'Edit recipe':'Create recipe'}</h2></div><button class="sheet-close" data-close>×</button></div><div class="recipe-photo-editor"><img id="custom-recipe-preview" src="${previewUrl}" alt="Recipe photo preview"><label class="secondary photo-button" for="custom-recipe-photo">CHOOSE / TAKE PHOTO</label><input id="custom-recipe-photo" class="visually-hidden" type="file" accept="image/*"><button class="text-btn" id="remove-recipe-photo" type="button">REMOVE PHOTO</button><small>Your photo uses the same crop as every other recipe card.</small></div><div class="field"><label>Recipe name</label><input id="cr-name" value="${escapeHtml(existing?.name||'')}" placeholder="e.g. High Protein Lasagna"></div><div class="inline-fields"><div class="field"><label>Servings</label><input id="cr-servings" type="number" min="1" max="20" value="${existing?.servings||1}"></div><div class="field"><label>Time (min)</label><input id="cr-time" type="number" min="1" value="${existing?.time||30}"></div></div><div class="field"><label>Category</label><select id="cr-cuisine">${RECIPE_CATEGORIES.filter(x=>x!=='All'&&x!=='Bottom-friendly').map(x=>`<option value="${escapeHtml(x)}" ${existing?.cuisine===x?'selected':''}>${escapeHtml(x)}</option>`).join('')}<option value="Other" ${existing?.cuisine==='Other'?'selected':''}>Other</option></select></div><p class="eyebrow form-divider">Macros per serving</p><div class="inline-fields"><div class="field"><label>Calories</label><input id="cr-kcal" type="number" min="0" value="${existing?.kcal||''}"></div><div class="field"><label>Protein (g)</label><input id="cr-protein" type="number" min="0" step="0.1" value="${existing?.protein||''}"></div></div><div class="inline-fields"><div class="field"><label>Carbs (g)</label><input id="cr-carbs" type="number" min="0" step="0.1" value="${existing?.carbs||''}"></div><div class="field"><label>Fat (g)</label><input id="cr-fat" type="number" min="0" step="0.1" value="${existing?.fat||''}"></div></div><div class="field"><label>Fiber (g)</label><input id="cr-fiber" type="number" min="0" step="0.1" value="${existing?.fiber||''}"></div><div class="field"><label>Ingredients · one per line</label><textarea id="cr-ingredients" rows="7" placeholder="200 g lean ground beef&#10;90 g whole-wheat pasta&#10;100 g crushed tomatoes">${escapeHtml((existing?.ingredients||[]).join('\n'))}</textarea></div><div class="field"><label>Instructions · one step per line</label><textarea id="cr-steps" rows="7" placeholder="Cook the pasta.&#10;Brown the beef.&#10;Combine and serve.">${escapeHtml((existing?.steps||[]).join('\n'))}</textarea></div><div class="field"><label>Extra tags · comma separated</label><input id="cr-tags" value="${escapeHtml((existing?.tags||[]).filter(x=>x!==existing?.cuisine&&x!=='Bottom-friendly').join(', '))}" placeholder="High protein, Vegetarian"></div><p class="eyebrow form-divider">Who can see this recipe?</p><div class="recipe-visibility-picker"><label><input type="radio" name="cr-visibility" value="private" ${(existing?.visibility||'private')==='private'?'checked':''}><span><strong>Only me</strong><small>Private recipe</small></span></label><label><input type="radio" name="cr-visibility" value="friends" ${existing?.visibility==='friends'?'checked':''}><span><strong>Friends</strong><small>Your accepted GAYM friends can find it</small></span></label><label><input type="radio" name="cr-visibility" value="public" ${existing?.visibility==='public'?'checked':''}><span><strong>All of GAYM</strong><small>Visible to the GAYM community</small></span></label></div><div class="sheet-actions"><button class="primary" id="save-custom-recipe">${existing?'SAVE CHANGES':'CREATE RECIPE'}</button></div>`);const input=$('#custom-recipe-photo'),preview=$('#custom-recipe-preview');input.onchange=()=>{const file=input.files?.[0];if(!file)return;selectedFile=file;removeExistingImage=false;const u=URL.createObjectURL(file);preview.src=u;preview.onload=()=>URL.revokeObjectURL(u)};$('#remove-recipe-photo').onclick=()=>{selectedFile=null;removeExistingImage=true;preview.src=RECIPE_FALLBACK};$('#save-custom-recipe').onclick=async()=>{const btn=$('#save-custom-recipe'),name=$('#cr-name').value.trim(),kcal=+$('#cr-kcal').value,protein=+$('#cr-protein').value,ingredients=$('#cr-ingredients').value.split('\n').map(x=>x.trim()).filter(Boolean),steps=$('#cr-steps').value.split('\n').map(x=>x.trim()).filter(Boolean);if(!name||!kcal||!ingredients.length||!steps.length)return toast('Add name, calories, ingredients and steps');const id=existing?.id||`custom-recipe-${uid()}`,cuisine=$('#cr-cuisine').value,extraTags=$('#cr-tags').value.split(',').map(x=>x.trim()).filter(x=>x&&x!=='Bottom-friendly'),tags=[...new Set([cuisine,...extraTags])],visibility=$('input[name="cr-visibility"]:checked')?.value||'private',recipe={...existing,id,name,cuisine,meal:'Custom',custom:true,servings:Math.max(1,+$('#cr-servings').value||1),time:Math.max(1,+$('#cr-time').value||30),kcal:Math.round(kcal),protein:Math.round(protein*10)/10,carbs:Math.round((+$('#cr-carbs').value||0)*10)/10,fat:Math.round((+$('#cr-fat').value||0)*10)/10,fiber:Math.round((+$('#cr-fiber').value||0)*10)/10,tags,ingredients,steps,visibility};btn.disabled=true;btn.textContent='SAVING…';try{if(selectedFile){const blob=await compressRecipeImage(selectedFile);if(blob)await putRecipeImage(id,blob)}else if(removeExistingImage)await deleteRecipeImage(id);const before=[...(data.customRecipes||[])];if(existing)data.customRecipes=data.customRecipes.map(x=>x.id===id?recipe:x);else data.customRecipes.push(recipe);if(!save()){data.customRecipes=before;throw new Error('Could not save recipe on this device.')}try{const cloud=await upsertOwnedRecipeCloud(recipe,{forceImage:!!selectedFile,removeImage:removeExistingImage});recipe.cloudRecipeId=cloud.id;recipe.image=cloud.image_url||recipe.image||null;recipe.cloudSyncPending=false;data.customRecipes=data.customRecipes.map(x=>x.id===id?recipe:x);save();requestRecipeCloudRefresh();closeSheet();nutritionTab='recipes';recipeLibraryView='mine';recipeCategory='All';recipeQuery='';nutrition();toast(existing?'Recipe updated':'Recipe created')}catch(cloudErr){console.error('recipe cloud save',cloudErr);recipe.cloudSyncPending=true;data.customRecipes=data.customRecipes.map(x=>x.id===id?recipe:x);save();closeSheet();nutritionTab='recipes';recipeLibraryView='mine';nutrition();toast('Recipe saved locally. Cloud backup failed; try editing and saving again.')}}catch(e){btn.disabled=false;btn.textContent=existing?'SAVE CHANGES':'CREATE RECIPE';toast(e.message||'Could not save recipe.')}}}

function macro(name,value,target,unit,tone='pink'){
 const safeValue=Math.max(0,Number(value)||0),safeTarget=Math.max(1,Number(target)||1);
 const percent=Math.max(0,Math.min(100,(safeValue/safeTarget)*100));
 return `<div class="macro macro-${tone}"><div class="macro-head"><span>${escapeHtml(name)}</span><span>${Math.round(safeValue)} / ${Math.round(safeTarget)} ${escapeHtml(unit)}</span></div><div class="macro-bar" role="progressbar" aria-label="${escapeHtml(name)}" aria-valuemin="0" aria-valuemax="${Math.round(safeTarget)}" aria-valuenow="${Math.round(safeValue)}"><span style="width:${percent.toFixed(1)}%"></span></div></div>`;
}
function openFoodSheet(){openManualFoodSheet()}

function avatarDisplayUrl(p){
 const raw=String(p?.avatar_url||'').trim();
 if(!raw)return '';
 // The database stores a stable public Storage URL. Cache-busting is display-only,
 // derived from updated_at, so refreshes always request the current avatar without
 // mutating the persisted URL.
 const stamp=p?.updated_at?new Date(p.updated_at).getTime():0;
 if(!stamp||!Number.isFinite(stamp))return raw;
 return `${raw}${raw.includes('?')?'&':'?'}gaym_avatar=${stamp}`;
}
function avatarMarkup(p,size='lg'){
 const name=(p?.display_name||p?.name||data.profile.name||'?').trim();
 const src=avatarDisplayUrl(p);
 return src?`<img class="social-avatar ${size}" src="${escapeHtml(src)}" alt="${escapeHtml(name)}" referrerpolicy="no-referrer">`:`<div class="social-avatar ${size} fallback">${escapeHtml((name[0]||'?').toUpperCase())}</div>`;
}
async function prepareAvatarImage(file){
 if(!file)return null;
 if(!file.type?.startsWith('image/'))throw new Error('Choose an image file.');
 const max=1200,canvas=document.createElement('canvas');let source,w0,h0,cleanup=()=>{};
 if('createImageBitmap' in window){
  try{source=await createImageBitmap(file,{imageOrientation:'from-image'})}catch{try{source=await createImageBitmap(file)}catch{source=null}}
  if(source){w0=source.width;h0=source.height;cleanup=()=>source.close?.()}
 }
 if(!source){
  const url=URL.createObjectURL(file);source=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Could not read that image.'));img.src=url});w0=source.naturalWidth;h0=source.naturalHeight;cleanup=()=>URL.revokeObjectURL(url);
 }
 const scale=Math.min(1,max/Math.max(w0,h0)),w=Math.max(1,Math.round(w0*scale)),h=Math.max(1,Math.round(h0*scale));
 canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(source,0,0,w,h);cleanup();
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.9));
 if(!blob)throw new Error('Could not prepare that image.');
 return blob;
}
function usernameClean(v=''){return String(v).trim().toLowerCase().replace(/[^a-z0-9._]/g,'').slice(0,30)}
async function submitAuth(){
 if(!sb)return toast('Backend could not load. Check your internet connection.');
 const email=$('#auth-email')?.value.trim(),password=$('#auth-password')?.value||'';
 if(!email||password.length<8)return toast('Add a valid email and an 8+ character password.');
 const btn=$('#auth-submit');btn.disabled=true;btn.textContent='PLEASE WAIT…';
 try{
  if(authMode==='create'){
   const displayName=$('#auth-name').value.trim(),username=usernameClean($('#auth-username').value);
   if(!displayName)return toast('Add your display name.');
   if(username.length<3)return toast('Username needs at least 3 characters.');
   const exists=await sb.from('profiles').select('id').ilike('username',username).maybeSingle();
   if(exists.data)return toast('That username is already taken.');
   const {data:res,error}=await sb.auth.signUp({email,password,options:{data:{display_name:displayName,username}}});
   if(error)throw error;
   if(res.user){
    await new Promise(r=>setTimeout(r,250));
    await sb.from('profiles').update({username,display_name:displayName,updated_at:new Date().toISOString()}).eq('id',res.user.id);
   }
   if(!res.session){authMode='login';entry();return toast('Account created. Confirm your email, then log in.');}
  }else{
   const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;
  }
 }catch(err){toast(err?.message||'Could not sign in.');}
 finally{if(btn){btn.disabled=false;btn.textContent=authMode==='create'?'CREATE ACCOUNT':'LOG IN'}}
}
async function sendPasswordReset(){
 const email=$('#auth-email')?.value.trim();if(!email)return toast('Enter your email first.');
 const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.href.split('#')[0]});
 toast(error?error.message:'Password reset email sent.');
}
async function hydrateCloudProfile(expectedUserId=authUser?.id){
 if(!sb||!expectedUserId||authUser?.id!==expectedUserId)return;
 const {data:p,error}=await sb.from('profiles').select('id,username,display_name,bio,avatar_url,selected_title,discoverable,updated_at').eq('id',expectedUserId).maybeSingle();
 if(authUser?.id!==expectedUserId||activeDataUserId!==expectedUserId)return;
 const fallback=cachedCloudProfile(expectedUserId)||{id:expectedUserId,display_name:authUser.user_metadata?.display_name||data.profile.name,username:authUser.user_metadata?.username||null,bio:null,avatar_url:null};
 if(error){console.error('hydrateCloudProfile',error);cloudProfile=fallback;return}
 cloudProfile=p||fallback;cacheCloudProfile(cloudProfile);
 if(cloudProfile.display_name){data.profile.name=cloudProfile.display_name;data.profileCreated=true;if(cloudDataHydrated)save()}
}
async function enterAuthenticatedAccount(user){
 if(!user?.id)return;
 const token=++authEpoch,userId=user.id;
 clearTimeout(cloudSyncTimer);clearTimeout(cloudSyncRetryTimer);clearTimeout(nutritionSyncTimer);cloudSyncRetryCount=0;setCloudSyncState('idle');authUser=user;entryUnlocked=false;cloudDataHydrated=false;cloudProfile=cachedCloudProfile(userId);socialTab='activity';activityPostCache.clear();socialCache={friends:[],requests:[],feed:[],nightOuts:[],sharedRecipes:[],notifications:[]};socialCacheUpdatedAt=0;socialLoadPromise=null;resetRecipeCloudState();
 switchAccountLocalData(userId);
 await hydrateCloudProfile(userId);
 await hydrateCloudAccountData(userId);
 if(token!==authEpoch||authUser?.id!==userId||activeDataUserId!==userId)return;
 entryUnlocked=true;
 await Promise.all([syncRecentActivitiesFromLocal(userId),loadSocialNotifications(userId)]);
}
function leaveAuthenticatedAccount(){
 ++authEpoch;clearTimeout(cloudSyncTimer);clearTimeout(cloudSyncRetryTimer);clearTimeout(nutritionSyncTimer);cloudSyncRetryCount=0;cloudDataHydrated=false;authUser=null;activeDataUserId=null;cloudProfile=null;cloudSyncMeta={dirty:false,lastRemoteUpdatedAt:0,lastSyncedAt:0,lastLocalHash:'',lastSyncedHash:'',lastRemoteSessionCount:0};setCloudSyncState('idle');activityPostCache.clear();socialTab='activity';data=structuredClone(defaults);normalizeLocalData();entryUnlocked=false;socialCache={friends:[],requests:[],feed:[],nightOuts:[],sharedRecipes:[],notifications:[]};socialCacheUpdatedAt=0;socialLoadPromise=null;resetRecipeCloudState();route='home';routeArgs={};
}
async function initializeCloud(){
 if(!sb){cloudBooting=false;render();return}
 try{
  const {data:r}=await sb.auth.getSession();
  if(r.session?.user)await enterAuthenticatedAccount(r.session.user);else leaveAuthenticatedAccount();
 }catch(e){console.error('initializeCloud',e);leaveAuthenticatedAccount()}finally{cloudBooting=false;render();startSocialNotificationPolling();startAccountSyncPolling()}
 sb.auth.onAuthStateChange((_event,session)=>{
  setTimeout(async()=>{
   try{if(session?.user)await enterAuthenticatedAccount(session.user);else leaveAuthenticatedAccount()}catch(e){console.error('auth state change',e)}
   finally{cloudBooting=false;render()}
  },0);
 });
}
async function signOutCloud(){
 const btn=$('#sign-out');if(btn)btn.disabled=true;
 try{if(sb)await sb.auth.signOut()}catch(e){console.error('sign out',e)}
 leaveAuthenticatedAccount();render();
}
function sessionSocialSummary(sess){
 const name=sess.name||sess.workoutName||sess.type||'Workout';
 const exCount=Array.isArray(sess.items)?sess.items.length:(Array.isArray(sess.exercises)?sess.exercises.length:0);
 const duration=Math.max(0,Math.round(Number(sess.durationMin||sess.duration||0)));
 return {title:`Completed ${name}`,body:[duration?`${duration} min`:null,sess.type==='group'?(sess.groupCategory||'Group class'):null,exCount?`${exCount} exercises`:null].filter(Boolean).join(' · ')||'Workout completed'};
}
function socialSetPayload(set){return {weight:Number(set?.weight)||0,reps:Number(set?.reps)||0,done:set?.done!==false}}
function socialWorkoutMetadata(sess,detailLevel='full',sharePrs=true,workoutVisibility='friends'){
 const items=(sess.items||[]).map(item=>({name:item.name||'Exercise',muscle:item.muscle||'',sets:detailLevel==='full'?(item.sets||[]).map(socialSetPayload):[]}));
 const meta={date:sess.date||null,type:sess.type||'strength',durationMin:Math.max(0,Math.round(Number(sess.durationMin||0))),exerciseCount:(sess.items||[]).length,detail_level:detailLevel,group_class:sess.type==='group'?(sess.groupClass||sess.name||'Group class'):null,group_category:sess.type==='group'?(sess.groupCategory||''):null,group_center:sess.type==='group'?(sess.groupCenter||''):null,group_instructor:sess.type==='group'?(sess.groupInstructor||''):null,intensity:sess.type==='group'?(Number(sess.intensity)||3):null,photo_url:(sess.photoVisibility==='friends'&&workoutVisibility==='friends')?(sess.socialPhotoUrl||null):null};
 if(detailLevel!=='summary')meta.exercises=items;
 if(sharePrs)meta.prs=(sess.prs||[]).map(pr=>({name:pr.name,weight:Number(pr.weight)||0,reps:Number(pr.reps)||0}));
 return meta;
}
async function deleteActivityForSession(sessionId,expectedUserId=activeDataUserId){
 if(!sb||!authUser||!sessionId||!expectedUserId||authUser.id!==expectedUserId||activeDataUserId!==expectedUserId)return {error:null};
 const sid=String(sessionId);
 const {data:posts}=await sb.from('activity_posts').select('id').eq('user_id',expectedUserId).or(`source_id.eq.${sid},source_id.like.${sid}::%`);
 const ids=(posts||[]).map(x=>x.id);
 if(!ids.length)return {error:null};
 return sb.from('activity_posts').delete().in('id',ids);
}
async function syncRecentActivitiesFromLocal(expectedUserId=activeDataUserId,{notifyPrs=false}={}){
 if(!sb||!authUser||!expectedUserId||authUser.id!==expectedUserId||activeDataUserId!==expectedUserId)return;
 const sessionsSnapshot=structuredClone(data.sessions||[]).filter(Boolean);
 const privacy=await sb.from('privacy_settings').select('workouts_visibility,prs_visibility,workout_details_visibility').eq('user_id',expectedUserId).maybeSingle();
 if(authUser?.id!==expectedUserId||activeDataUserId!==expectedUserId)return;
 const workoutVis=privacy.data?.workouts_visibility||'friends',prVis=privacy.data?.prs_visibility||'friends',detailLevel=privacy.data?.workout_details_visibility||'full';
 // PBs live inside their parent workout card. A PB can never be exposed to a wider audience than the workout itself.
 const sharePrs=prVis==='public'||(prVis==='friends'&&workoutVis!=='public');
 const rows=[];
 sessionsSnapshot.forEach(sess=>{
  const x=sessionSocialSummary(sess),sid=String(sess.id||`${sess.date}-${sess.name||sess.type||'workout'}`),created=sess.finishedAt?new Date(sess.finishedAt).toISOString():(sess.date?`${sess.date}T12:00:00Z`:new Date().toISOString());
  rows.push({user_id:expectedUserId,kind:'workout',source_id:sid,title:x.title,body:x.body,metadata:socialWorkoutMetadata(sess,detailLevel,sharePrs,workoutVis),visibility:workoutVis,created_at:created,updated_at:new Date().toISOString()});
 });
 const {data:before,error:beforeError}=await sb.from('activity_posts').select('id,kind,source_id,metadata').eq('user_id',expectedUserId).in('kind',['workout','pr']);
 if(beforeError)console.error('activity sync before',beforeError);
 const previousWorkouts=new Map((before||[]).filter(r=>r.kind==='workout').map(r=>[String(r.source_id),r]));
 if(rows.length){
  const up=await sb.from('activity_posts').upsert(rows,{onConflict:'user_id,kind,source_id',ignoreDuplicates:false}).select('id,kind,source_id,title,body,metadata');
  if(up.error)console.error('activity sync upsert',up.error);
  else if(notifyPrs){
   for(const post of up.data||[]){
    if(post.kind!=='workout')continue;
    const sess=sessionsSnapshot.find(x=>String(x.id)===String(post.source_id));
    if(!sess||sess.date!==isoToday())continue;
    const oldPrs=previousWorkouts.get(String(post.source_id))?.metadata?.prs||[];
    const oldKeys=new Set(oldPrs.map(pr=>`${String(pr.name||'').toLowerCase()}|${Number(pr.weight)||0}|${Number(pr.reps)||0}`));
    for(const pr of post.metadata?.prs||[]){
     const key=`${String(pr.name||'').toLowerCase()}|${Number(pr.weight)||0}|${Number(pr.reps)||0}`;
     if(oldKeys.has(key))continue;
     const r=await sb.rpc('notify_friends_pr',{p_post_id:post.id,p_exercise:String(pr.name||''),p_weight:Number(pr.weight)||0,p_reps:Number(pr.reps)||0});
     if(r.error)console.error('PR friend notification',r.error);
    }
   }
  }
 }
 if(authUser?.id!==expectedUserId||activeDataUserId!==expectedUserId)return;
 const {data:remote,error:remoteError}=await sb.from('activity_posts').select('id,kind,source_id').eq('user_id',expectedUserId).in('kind',['workout','pr']);
 if(remoteError){console.error('activity sync reconcile',remoteError);return}
 const localWorkoutIds=new Set(rows.map(r=>String(r.source_id)));
 // All legacy standalone PR cards are stale by design in v69. Workout cards are the single social source of truth.
 const staleIds=(remote||[]).filter(r=>r.kind==='pr'||(r.kind==='workout'&&!localWorkoutIds.has(String(r.source_id)))).map(r=>r.id);
 if(staleIds.length){const del=await sb.from('activity_posts').delete().in('id',staleIds);if(del.error)console.error('activity sync delete stale',del.error)}
 await syncWorkoutAchievement(expectedUserId);
}
async function loadSocialState(force=false){
 if(!sb||!authUser||!activeDataUserId||authUser.id!==activeDataUserId)return;
 const now=Date.now();
 if(!force&&socialCacheUpdatedAt&&now-socialCacheUpdatedAt<SOCIAL_CACHE_TTL)return socialCache;
 if(socialLoadPromise&&!force)return socialLoadPromise;
 const userId=authUser.id;
 socialLoadPromise=(async()=>{
  const [{data:rels,error:relsError},{data:posts,error:postsError},{data:nightOuts,error:nightOutsError},{data:notifs,error:notifError}]=await Promise.all([
   sb.from('friendships').select('*').or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
   sb.from('activity_posts').select('*,profiles:user_id(id,username,display_name,avatar_url,selected_title),activity_reactions(user_id,reaction,profiles:user_id(id,username,display_name,avatar_url)),activity_kudos(user_id,profiles:user_id(id,username,display_name,avatar_url)),activity_comments(id,user_id,body,created_at,profiles:user_id(username,display_name,avatar_url))').order('created_at',{ascending:false}).limit(30),
   sb.from('activity_posts').select('*,profiles:user_id(id,username,display_name,avatar_url,selected_title)').eq('kind','night_out').order('created_at',{ascending:false}).limit(30),
   sb.from('social_notifications').select('id,recipient_id,actor_id,kind,title,body,metadata,read_at,created_at,actor:profiles!social_notifications_actor_id_fkey(id,username,display_name,avatar_url)').eq('recipient_id',userId).order('created_at',{ascending:false}).limit(30)
  ]);
  if(relsError)console.error('friendships',relsError);if(postsError)console.error('activity',postsError);if(nightOutsError)console.error('night out radar',nightOutsError);if(notifError&&notifError.code!=='42P01')console.error('notifications',notifError);
  if(authUser?.id!==userId||activeDataUserId!==userId)return socialCache;
  const relationships=rels||[],ids=[...new Set(relationships.flatMap(r=>[r.requester_id,r.addressee_id]).filter(id=>id!==userId))];
  let profiles=[];if(ids.length){const r=await sb.from('profiles').select('id,username,display_name,avatar_url,bio,selected_title').in('id',ids);profiles=r.data||[]}
  if(authUser?.id!==userId||activeDataUserId!==userId)return socialCache;
  const byId=Object.fromEntries(profiles.map(p=>[p.id,p]));
  socialCache.friends=relationships.filter(r=>r.status==='accepted').map(r=>{const id=r.requester_id===userId?r.addressee_id:r.requester_id;return {...(byId[id]||{id}),friendship_id:r.id}});
  socialCache.requests=relationships.filter(r=>r.status==='pending'&&r.addressee_id===userId).map(r=>({...r,profile:byId[r.requester_id]}));
  socialCache.feed=posts||[];socialCache.nightOuts=nightOuts||[];socialCache.notifications=notifs||[];
  socialCacheUpdatedAt=Date.now();refreshBellBadge();return socialCache;
 })().finally(()=>{socialLoadPromise=null});
 return socialLoadPromise;
}
function hasLegacyLocalData(){try{const raw=localStorage.getItem(LEGACY_LOCAL_KEY);if(!raw)return false;const x=JSON.parse(raw);return !!((x.sessions?.length)||(x.customWorkouts?.length)||(x.nutrition?.length)||(x.customRecipes?.length)||(x.measurements?.length))}catch{return false}}
function importLegacyLocalData(){
 if(!authUser||!hasLegacyLocalData())return toast('No pre-account data found.');
 if(!confirm('Import the old pre-account GAYM data into THIS account? This will replace this account\'s current local workout data.'))return;
 try{const legacy=JSON.parse(localStorage.getItem(LEGACY_LOCAL_KEY)||'{}');data=Object.assign({},structuredClone(defaults),legacy);normalizeLocalData();save();syncRecentActivitiesFromLocal();profile();toast('Old GAYM data imported to this account.');}catch(e){toast('Could not import old local data.');}
}
async function openFriendsHub(){socialTab='friends';go('social')}
let peopleSearchSeq=0;
async function searchPeople(){
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Friends</p><h2>Find your gym people</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><label>Username or name</label><input id="people-search" autocomplete="off" placeholder="Search GAYM…"></div><div id="people-results" class="social-list"><div class="empty"><strong>Search for someone</strong>Usernames make finding the right person easier.</div></div>`);
 const input=$('#people-search');let timer;
 input.oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>runPeopleSearch(input.value),250)};input.focus();
}
async function runPeopleSearch(q){
 q=String(q||'').trim();const box=$('#people-results');if(!box)return;const seq=++peopleSearchSeq;if(q.length<2){box.innerHTML='<div class="empty"><strong>Keep typing</strong>Use at least 2 characters.</div>';return}
 const clean=q.replace(/[%(),]/g,'');const {data:people,error}=await sb.from('profiles').select('id,username,display_name,avatar_url,bio,selected_title').or(`username.ilike.%${clean}%,display_name.ilike.%${clean}%`).neq('id',authUser.id).limit(20);
 if(seq!==peopleSearchSeq||!document.body.contains(box))return;
 if(error){box.innerHTML='<div class="empty"><strong>Search failed</strong>Try again.</div>';return}
 box.innerHTML=(people||[]).length?(people||[]).map(p=>`<article class="social-person">${avatarMarkup(p,'md')}<button class="social-person-main" data-open-user="${p.id}"><strong>${escapeHtml(p.display_name||p.username||'GAYM user')}</strong><span>@${escapeHtml(p.username||'user')}</span></button><button class="small-btn" data-add-friend="${p.id}">ADD</button></article>`).join(''):'<div class="empty"><strong>No users found</strong>Try another spelling.</div>';
 $$('[data-add-friend]',box).forEach(b=>b.onclick=async()=>{const {error}=await sb.from('friendships').insert({requester_id:authUser.id,addressee_id:b.dataset.addFriend,status:'pending'});toast(error?(error.code==='23505'?'Request already exists.':error.message):'Friend request sent.');if(!error){b.textContent='SENT';await sendSocialNotification(b.dataset.addFriend,'friend_request','New friend request',`${cloudProfile?.display_name||cloudProfile?.username||'Someone'} wants to train together.`,{},null)}});
 $$('[data-open-user]',box).forEach(b=>b.onclick=()=>{closeSheet();openUserProfile(b.dataset.openUser)});
}
async function respondFriend(id,status){
 const req=await sb.from('friendships').select('requester_id,addressee_id').eq('id',id).maybeSingle();
 const {error}=await sb.rpc('respond_friend_request',{request_id:id,new_status:status});
 if(!error&&status==='accepted'&&req.data?.requester_id){await sendSocialNotification(req.data.requester_id,'friend_accept','Friend request accepted',`${cloudProfile?.display_name||cloudProfile?.username||'Your new friend'} accepted your friend request.`,{},`friend-accept:${id}`)}
 toast(error?error.message:(status==='accepted'?'Friend added.':'Request declined.'));await loadSocialState(true);socialTab='friends';go('social');
}
async function removeFriend(id){if(!confirm('Remove this friend?'))return;const {error}=await sb.from('friendships').delete().eq('id',id);if(error)return toast(error.message);socialCacheUpdatedAt=0;await loadSocialState(true);socialTab='friends';go('social');toast('Friend removed.')}
let directMessageCache={threads:[],messages:[],profiles:new Map(),unread:0};
async function loadDirectMessageThreads(){
 if(!sb||!authUser)return directMessageCache;
 const me=authUser.id;
 const {data:rows,error}=await sb.from('direct_messages').select('id,sender_id,recipient_id,body,read_at,created_at').or(`sender_id.eq.${me},recipient_id.eq.${me}`).order('created_at',{ascending:false}).limit(300);
 if(error){if(error.code!=='42P01')console.error('direct messages',error);directMessageCache={threads:[],messages:[],profiles:new Map(),unread:0};return directMessageCache}
 const messages=rows||[],ids=[...new Set(messages.flatMap(m=>[m.sender_id,m.recipient_id]).filter(id=>id&&id!==me))];
 let profiles=[];if(ids.length){const pr=await sb.from('profiles').select('id,username,display_name,avatar_url').in('id',ids);if(!pr.error)profiles=pr.data||[]}
 const profileMap=new Map(profiles.map(p=>[p.id,p])),seen=new Set(),threads=[];
 for(const m of messages){const other=m.sender_id===me?m.recipient_id:m.sender_id;if(seen.has(other))continue;seen.add(other);threads.push({userId:other,last:m,profile:profileMap.get(other)||{id:other,username:'friend'},unreadCount:messages.filter(x=>x.sender_id===other&&x.recipient_id===me&&!x.read_at).length})}
 directMessageCache={threads,messages,profiles:profileMap,unread:messages.filter(m=>m.recipient_id===me&&!m.read_at).length};return directMessageCache;
}
async function openMessagesTab(){
 const box=$('#social-tab-content');if(!box)return;
 box.innerHTML='<article class="card loading-card"><div class="cloud-loader"></div><p>Loading messages…</p></article>';
 const state=await loadDirectMessageThreads();if(!$('#social-tab-content'))return;
 box.innerHTML=`<div class="section-head"><h2>Messages</h2><button class="text-btn" id="message-new">+ NEW</button></div><div class="message-thread-list">${state.threads.length?state.threads.map(t=>{const mine=t.last.sender_id===authUser.id,unread=Number(t.unreadCount||0)>0,d=new Date(t.last.created_at),now=new Date(),sameDay=d.toDateString()===now.toDateString(),time=sameDay?d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});return `<button class="card message-thread ${unread?'unread':''}" data-message-user="${t.userId}">${avatarMarkup(t.profile,'md')}<span class="grow"><strong>${escapeHtml(t.profile.display_name||t.profile.username||'Friend')}</strong><small>${mine?'You: ':''}${escapeHtml(String(t.last.body||'').slice(0,75))}</small></span><span class="thread-meta"><time>${time}</time>${unread?`<b class="thread-unread">${Math.min(t.unreadCount,99)}</b>`:''}</span></button>`}).join(''):'<div class="empty"><strong>No messages yet</strong>Open a friend and start a conversation.</div>'}</div>`;
 $$('[data-message-user]',box).forEach(b=>b.onclick=()=>go('chat',{userId:b.dataset.messageUser}));
 const n=$('#message-new');if(n)n.onclick=openNewMessagePicker;
}
async function openNewMessagePicker(){
 await loadSocialState(true);if(!socialCache.friends.length)return toast('Add a friend first.');
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">New message</p><h2>Choose a friend</h2></div><button class="sheet-close" data-close>×</button></div><div class="social-list">${socialCache.friends.map(f=>`<button class="social-person message-friend-pick" data-chat-user="${f.id}">${avatarMarkup(f,'md')}<span class="social-person-main"><strong>${escapeHtml(f.display_name||f.username||'Friend')}</strong><span>@${escapeHtml(f.username||'friend')}</span></span><b>›</b></button>`).join('')}</div>`);
 $$('[data-chat-user]').forEach(b=>b.onclick=()=>{const id=b.dataset.chatUser;closeSheet();go('chat',{userId:id})});
}
async function chatPage(){
 if(!sb||!authUser){socialTab='messages';return go('social')}
 const userId=routeArgs?.userId,profileHint=routeArgs?.profile||null;if(!userId){socialTab='messages';return go('social')}
 let p=profileHint||socialCache.friends.find(x=>x.id===userId)||directMessageCache.profiles.get(userId);
 if(!p){const r=await sb.from('profiles').select('id,username,display_name,avatar_url').eq('id',userId).maybeSingle();p=r.data||{id:userId,username:'friend'}}
 const me=authUser.id;
 shell(`${header('Messages',true)}<section class="chat-page section"><div class="chat-page-person"><button class="message-profile-link" id="chat-profile">${avatarMarkup(p,'md')}<span><small>CHAT WITH</small><strong>${escapeHtml(p.display_name||p.username||'Friend')}</strong></span></button></div><div class="chat-messages chat-page-messages" id="chat-messages"><article class="card loading-card"><div class="cloud-loader"></div><p>Loading chat…</p></article></div><div class="chat-composer chat-page-composer"><textarea id="chat-input" maxlength="1000" rows="1" placeholder="Message ${escapeHtml(p.display_name||p.username||'friend')}…"></textarea><button class="primary compact" id="chat-send">SEND</button></div></section>`);
 const back=$('[data-back]');if(back)back.onclick=()=>{socialTab='messages';go('social')};
 const profileBtn=$('#chat-profile');if(profileBtn)profileBtn.onclick=()=>openUserProfile(userId);
 const list=$('#chat-messages');
 const {data:msgs,error}=await sb.from('direct_messages').select('id,sender_id,recipient_id,body,read_at,created_at').or(`and(sender_id.eq.${me},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${me})`).order('created_at',{ascending:true}).limit(500);
 if(route!=='chat'||routeArgs?.userId!==userId)return;
 if(error){if(list)list.innerHTML='<div class="empty"><strong>Could not load chat</strong>Try again in a moment.</div>';return toast(error.message||'Could not load messages.')}
 const rows=msgs||[];
 const unread=rows.filter(m=>m.recipient_id===me&&!m.read_at).map(m=>m.id);if(unread.length)await sb.from('direct_messages').update({read_at:new Date().toISOString()}).eq('recipient_id',me).in('id',unread);
 const bubble=m=>`<div class="chat-bubble ${m.sender_id===me?'mine':'theirs'}" data-message-id="${m.id}"><span>${escapeHtml(m.body)}</span><small>${new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</small></div>`;
 if(list){list.innerHTML=rows.length?rows.map(bubble).join(''):'<div class="empty chat-empty"><strong>Start the chat</strong>Send the first message.</div>';requestAnimationFrame(()=>{list.scrollTop=list.scrollHeight})}
 const input=$('#chat-input'),sendBtn=$('#chat-send');
 const resize=()=>{if(!input)return;input.style.height='auto';input.style.height=Math.min(input.scrollHeight,110)+'px'};if(input)input.oninput=resize;
 const send=async()=>{const body=String(input?.value||'').trim();if(!body||!sendBtn)return;sendBtn.disabled=true;const optimisticId='local-'+Date.now();if(list){const empty=$('.chat-empty',list);if(empty)empty.remove();list.insertAdjacentHTML('beforeend',`<div class="chat-bubble mine sending" data-message-id="${optimisticId}"><span>${escapeHtml(body)}</span><small>Sending…</small></div>`);list.scrollTop=list.scrollHeight}input.value='';resize();const {data:newMsg,error}=await sb.from('direct_messages').insert({sender_id:me,recipient_id:userId,body}).select('id,sender_id,recipient_id,body,read_at,created_at').single();if(error){const pending=$(`[data-message-id="${optimisticId}"]`,list);if(pending){pending.classList.add('failed');const sm=$('small',pending);if(sm)sm.textContent='Failed'}sendBtn.disabled=false;return toast(error.message||'Could not send message.')}const pending=$(`[data-message-id="${optimisticId}"]`,list);if(pending&&newMsg)pending.outerHTML=bubble(newMsg);await sendSocialNotification(userId,'message',`${cloudProfile?.display_name||cloudProfile?.username||'A friend'} sent you a message`,body.slice(0,140),{sender_id:me});loadDirectMessageThreads().catch(()=>{});sendBtn.disabled=false;input?.focus();};
 if(sendBtn)sendBtn.onclick=send;if(input)input.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}};
 await loadSocialNotifications();
}
async function openDirectChat(userId,profileHint=null){go('chat',{userId,profile:profileHint})}

async function openMessageComposer(userId,p){
 if(!socialCache.friends.some(x=>x.id===userId))return toast('Add them as a friend first.');
 go('chat',{userId,profile:p});return;
}

async function openUserProfile(userId){
 shell(`${header('Profile',true)}<section class="section"><article class="card public-profile loading-card"><div class="cloud-loader"></div></article></section>`);$('[data-back]').onclick=()=>go('social');
 const [{data:p},{data:posts},{data:count}]=await Promise.all([sb.from('profiles').select('id,username,display_name,bio,avatar_url,selected_title').eq('id',userId).single(),sb.from('activity_posts').select('*,activity_reactions(user_id,reaction,profiles:user_id(id,username,display_name,avatar_url)),activity_kudos(user_id,profiles:user_id(id,username,display_name,avatar_url)),activity_comments(id,user_id,body,created_at,profiles:user_id(username,display_name,avatar_url))').eq('user_id',userId).order('created_at',{ascending:false}).limit(30),sb.rpc('friend_count',{for_user:userId})]);
 if(!p)return toast('Could not load profile.');
 const relation=socialCache.friends.find(x=>x.id===userId);const pending=socialCache.requests.find(x=>x.requester_id===userId);const workoutPosts=(posts||[]).filter(x=>x.kind==='workout'),recentWorkouts=workoutPosts.slice(0,3);
 const relationMarkup=relation?`<span class="friend-status-badge">FRIENDS</span>`:pending?`<span class="friend-status-badge pending">REQUEST RECEIVED</span>`:'';
 const actionMarkup=relation?`<button class="primary compact profile-motivate-btn" id="profile-motivate">MESSAGE</button>`:pending?`<button class="primary compact" id="profile-accept">ACCEPT</button>`:`<button class="primary compact" id="profile-add">ADD FRIEND</button>`;
 shell(`${header('Profile',true)}<section class="section"><article class="card social-profile-hero public-friend-profile">${avatarMarkup(p,'xl')}<div class="social-profile-copy"><h1>${escapeHtml(p.display_name||p.username||'GAYM user')}</h1><p>@${escapeHtml(p.username||'user')}${p.selected_title?` · ${escapeHtml(p.selected_title)}`:''}</p>${relationMarkup}${p.bio?`<span>${escapeHtml(p.bio)}</span>`:''}</div><div class="public-profile-actions">${actionMarkup}</div></article><div class="social-stats"><div><strong>${Number(count||0)}</strong><span>Friends</span></div><div><strong>${workoutPosts.length}</strong><span>Recent workouts</span></div><div><strong>${(posts||[]).reduce((n,p)=>n+(p.activity_kudos?.length||0),0)}</strong><span>Kudos</span></div></div></section><section class="section"><div class="section-head"><h2>Recent workouts</h2>${workoutPosts.length>3?`<button class="text-btn" id="profile-all-workouts">SEE ALL</button>`:''}</div><div class="recent-workout-list">${recentWorkouts.length?recentWorkouts.map(x=>`<button class="card recent-workout-row" data-profile-workout="${x.id}"><span><strong>${escapeHtml(x.title.replace(/^Completed /,''))}</strong><small>${escapeHtml(x.body||'Workout')} · ${new Date(x.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</small></span><b>›</b></button>`).join(''):'<div class="empty"><strong>No shared workouts yet</strong>Their workout privacy decides what appears here.</div>'}</div></section><section class="section"><div class="section-head"><h2>Activity</h2><span class="eyebrow">CHEER THEM ON</span></div><div class="social-feed">${(posts||[]).length?(posts||[]).map(x=>activityCard({...x,profiles:p})).join(''):'<div class="empty"><strong>No shared activity yet</strong>Their next workout or PB can land here.</div>'}</div></section>`);
 $('[data-back]').onclick=()=>go('social');bindActivityCards();$$('[data-profile-workout]').forEach(b=>b.onclick=()=>openActivityDetail(activityPostCache.get(b.dataset.profileWorkout)||posts.find(x=>x.id===b.dataset.profileWorkout)));
 const all=$('#profile-all-workouts');if(all)all.onclick=()=>{openSheet(`<div class="sheet-head"><div><p class="eyebrow">${escapeHtml(p.display_name||p.username||'Friend')}</p><h2>Shared workouts</h2></div><button class="sheet-close" data-close>×</button></div><div class="social-feed">${workoutPosts.map(x=>activityCard({...x,profiles:p})).join('')}</div>`);bindActivityCards()};
 if($('#profile-motivate'))$('#profile-motivate').onclick=()=>openMessageComposer(userId,p);
 if($('#profile-accept'))$('#profile-accept').onclick=()=>respondFriend(pending.id,'accepted');
 if($('#profile-add'))$('#profile-add').onclick=async()=>{const {error}=await sb.from('friendships').insert({requester_id:authUser.id,addressee_id:userId,status:'pending'});toast(error?error.message:'Friend request sent.');if(!error){await sendSocialNotification(userId,'friend_request','New friend request',`${cloudProfile?.display_name||cloudProfile?.username||'Someone'} wants to train together.`,{},null);$('#profile-add').textContent='REQUEST SENT';$('#profile-add').disabled=true}};
}
function kudosLabel(kudos=[]){
 const names=kudos.map(k=>k.profiles?.username||k.profiles?.display_name).filter(Boolean);
 if(!names.length)return '';
 const shown=names.slice(0,2).map(n=>`@${escapeHtml(n)}`);
 return `${shown.join(', ')}${names.length>2?` +${names.length-2}`:''}`;
}
function activityCard(post){
 activityPostCache.set(post.id,post);
 const p=post.profiles||cloudProfile||{},kudos=post.activity_kudos||[],mineKudos=kudos.some(k=>k.user_id===authUser?.id),comments=post.activity_comments||[],reactions=post.activity_reactions||[],who=kudosLabel(kudos),isWorkout=post.kind==='workout',isNight=post.kind==='night_out',isAchievement=post.kind==='achievement',prs=isWorkout?(post.metadata?.prs||[]):[];
 const clickable=isWorkout||isNight||isAchievement,reactCounts=GAY_REACTIONS.map(r=>[r,reactions.filter(x=>x.reaction===r).length]).filter(x=>x[1]);
 const prMarkup=prs.length?`<div class="feed-pr-highlights"><span>PB RECEIPTS</span>${prs.map(pr=>`<div><strong>${escapeHtml(pr.name||'Exercise')}</strong><b>${Number(pr.weight)||0} kg × ${Number(pr.reps)||0}</b></div>`).join('')}</div>`:'';
 const photo=isWorkout&&post.metadata?.photo_url?`<img class="activity-workout-photo" src="${escapeHtml(post.metadata.photo_url)}" alt="Shared workout photo" loading="lazy">`:'';
 const pump=isWorkout&&post.metadata?.pump?`<span class="pump-chip">PUMP · ${escapeHtml(String(post.metadata.pump).toUpperCase())}</span>`:'';
 return `<article class="card activity-card ${clickable?'clickable':''} ${isNight?'night-activity-card':''} ${isAchievement?'achievement-card':''}" data-post="${post.id}" ${clickable?`data-activity-detail="${post.id}"`:''}><div class="activity-head">${avatarMarkup(p,'sm')}<button data-open-user="${post.user_id}" class="activity-owner"><strong>${escapeHtml(p.display_name||p.username||'You')}</strong><span>@${escapeHtml(p.username||'you')}${p.selected_title?` · ${escapeHtml(p.selected_title)}`:''} · ${new Date(post.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span></button></div><div class="activity-body"><span class="activity-kind ${isNight?'night-kind':''}">${isWorkout?'WORKOUT':isNight?'NIGHT OUT':isAchievement?'ACHIEVEMENT':'UPDATE'}</span><h3>${escapeHtml(post.title)}</h3>${post.body?`<p>${escapeHtml(post.body)}</p>`:''}${photo}${prMarkup}${pump}${isWorkout?`<small class="activity-open-hint">Tap to view workout →</small>`:isNight||isAchievement?`<small class="activity-open-hint">Tap to react or comment →</small>`:''}</div><div class="activity-actions"><button class="${mineKudos?'active':''}" data-kudos="${post.id}">♥ <span>${kudos.length}</span> KUDOS</button><button data-react="${post.id}">REACT${reactions.length?` · ${reactions.length}`:''}</button><button data-comments="${post.id}">COMMENT <span>${comments.length}</span></button></div>${reactCounts.length?`<div class="reaction-summary">${reactCounts.map(([r,n])=>`<span>${r} <b>${n}</b></span>`).join('')}</div>`:''}${kudos.length?`<button class="kudos-people" data-kudos-list="${post.id}"><span>♥</span><span>Kudos from <strong>${who||`${kudos.length} ${kudos.length===1?'person':'people'}`}</strong></span><span class="chev">›</span></button>`:''}${comments.slice(-2).map(c=>`<div class="activity-comment"><strong>@${escapeHtml(c.profiles?.username||'friend')}</strong> ${escapeHtml(c.body)}</div>`).join('')}</article>`;
}
function bindActivityCards(){
 $$('[data-open-user]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(b.dataset.openUser!==authUser.id)openUserProfile(b.dataset.openUser)});
 $$('[data-kudos]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleKudos(b.dataset.kudos)});
 $$('[data-react]').forEach(b=>b.onclick=e=>{e.stopPropagation();openReactionSheet(b.dataset.react)});
 $$('[data-kudos-list]').forEach(b=>b.onclick=e=>{e.stopPropagation();openKudosSheet(b.dataset.kudosList)});
 $$('[data-comments]').forEach(b=>b.onclick=e=>{e.stopPropagation();openCommentSheet(b.dataset.comments)});
 $$('[data-activity-detail]').forEach(card=>card.onclick=e=>{if(e.target.closest('button'))return;openActivityDetail(activityPostCache.get(card.dataset.activityDetail)||socialCache.feed.find(p=>p.id===card.dataset.activityDetail))});
}

function openReactionSheet(postId){const post=activityPostCache.get(postId)||socialCache.feed.find(p=>p.id===postId);if(!post)return;openSheet(`<div class="sheet-head"><div><p class="eyebrow">GAYM REACTION</p><h2>Choose your verdict</h2></div><button class="sheet-close" data-close>×</button></div><div class="gay-reaction-grid">${GAY_REACTIONS.map(r=>`<button data-gay-reaction="${r}">${r}</button>`).join('')}</div>`);$$('[data-gay-reaction]').forEach(b=>b.onclick=()=>setGayReaction(postId,b.dataset.gayReaction));}
async function setGayReaction(postId,reaction){const post=activityPostCache.get(postId)||socialCache.feed.find(p=>p.id===postId);if(!GAY_REACTIONS.includes(reaction))return;const {error}=await sb.from('activity_reactions').upsert({post_id:postId,user_id:authUser.id,reaction},{onConflict:'post_id,user_id'});if(error)return toast(error.message);if(post?.user_id&&post.user_id!==authUser.id)await sendSocialNotification(post.user_id,'reaction',`${reaction} reaction`,`${cloudProfile?.display_name||cloudProfile?.username||'A friend'} reacted ${reaction} to your ${post.kind==='workout'?'workout':'activity'}.`,{post_id:postId,reaction},`reaction:${postId}:${authUser.id}`);closeSheet();await loadSocialState(true);const fresh=socialCache.feed.find(x=>x.id===postId);if(fresh)openActivityDetail(fresh);}

async function openActivityPostById(postId){
 if(!sb||!postId)return;
 const cached=activityPostCache.get(postId)||socialCache.feed.find(p=>p.id===postId);if(cached)return openActivityDetail(cached);
 const {data:post,error}=await sb.from('activity_posts').select('*,profiles:user_id(id,username,display_name,avatar_url,selected_title),activity_reactions(user_id,reaction,profiles:user_id(id,username,display_name,avatar_url)),activity_kudos(user_id,profiles:user_id(id,username,display_name,avatar_url)),activity_comments(id,user_id,body,created_at,profiles:user_id(username,display_name,avatar_url))').eq('id',postId).maybeSingle();
 if(error||!post)return toast('That activity is no longer available.');activityPostCache.set(post.id,post);openActivityDetail(post);
}
function workoutExerciseMarkup(meta={}){
 const level=meta.detail_level||'summary',items=meta.exercises||[];
 if(level==='summary')return `<div class="workout-detail-privacy"><strong>Summary only</strong><span>This friend chose not to share exercise details.</span></div>`;
 if(!items.length)return `<div class="empty"><strong>No exercise details</strong>This workout only has a summary.</div>`;
 return `<div class="shared-workout-exercises">${items.map((ex,i)=>`<article class="shared-exercise"><div><span>${i+1}</span><strong>${escapeHtml(ex.name||'Exercise')}</strong></div>${level==='full'&&ex.sets?.length?`<div class="shared-sets">${ex.sets.map((set,j)=>`<span><b>${j+1}</b>${Number(set.weight)||0} kg × ${Number(set.reps)||0}</span>`).join('')}</div>`:`<small>${escapeHtml(ex.muscle||'Exercise')}</small>`}</article>`).join('')}</div>`;
}
function openActivityDetail(post){
 if(!post)return toast('Could not load activity.');activityPostCache.set(post.id,post);
 const p=post.profiles||{},mine=post.user_id===authUser?.id,isWorkout=post.kind==='workout',isPr=post.kind==='pr',isNight=post.kind==='night_out',isAchievement=post.kind==='achievement',meta=post.metadata||{},kudos=post.activity_kudos||[],comments=post.activity_comments||[],reactions=post.activity_reactions||[];
 const title=isPr?'Personal best':isNight?'Night Out':isAchievement?'Achievement':(post.title||'Workout');
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">${isPr?'NEW PB':isNight?'NIGHT OUT':isAchievement?'ACHIEVEMENT':'WORKOUT DETAILS'}</p><h2>${escapeHtml(title)}</h2></div><button class="sheet-close" data-close>×</button></div><button class="activity-detail-owner" id="detail-owner">${avatarMarkup(p,'md')}<span><strong>${escapeHtml(p.display_name||p.username||'GAYM user')}</strong><small>@${escapeHtml(p.username||'user')} · ${new Date(post.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long'})}</small></span></button>${isPr?`<article class="pr-detail-card"><span>PERSONAL BEST</span><h3>${escapeHtml(meta.exercise||post.title.replace(/^New PB · /,''))}</h3><strong>${Number(meta.weight)||0} kg × ${Number(meta.reps)||0} reps</strong></article>`:isNight?`<article class="night-out-detail-card"><span>TONIGHT</span><h3>${escapeHtml(meta.place||post.title.replace(/^Night Out · /,''))}</h3><p>${meta.location_type==='home'?'Home tonight.':'Out tonight.'}</p><small>Drink amounts, nutrition and alcohol logging are private.</small></article>`:isAchievement?`<article class="achievement-detail-card"><span>ACHIEVEMENT UNLOCKED</span><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.body||'Milestone reached.')}</p></article>`:`<div class="workout-detail-summary"><span><b>${Number(meta.durationMin)||0}</b><small>MIN</small></span><span><b>${Number(meta.exerciseCount)||(meta.exercises||[]).length||'—'}</b><small>EXERCISES</small></span><span><b>${meta.detail_level==='full'?'FULL':meta.detail_level==='exercises'?'EXERCISES':'SUMMARY'}</b><small>SHARING</small></span></div>${meta.photo_url?`<img class="activity-workout-photo detail" src="${escapeHtml(meta.photo_url)}" alt="Shared workout photo">`:''}${meta.type==='group'?`<article class="group-social-detail"><span>GROUP CLASS</span><h3>${escapeHtml(meta.group_class||title.replace(/^Completed /,''))}</h3><p>${escapeHtml(meta.group_category||'Group training')}${meta.group_center?` · ${escapeHtml(meta.group_center)}`:''}</p><strong>Intensity ${Number(meta.intensity)||3}/5</strong></article>`:''}${workoutExerciseMarkup(meta)}${meta.prs?.length?`<div class="shared-prs"><p class="eyebrow">PBs IN THIS WORKOUT</p>${meta.prs.map(pr=>`<div><strong>${escapeHtml(pr.name)}</strong><span>${Number(pr.weight)||0} kg × ${Number(pr.reps)||0}</span></div>`).join('')}</div>`:''}`}<div class="activity-detail-actions"><button class="secondary ${kudos.some(k=>k.user_id===authUser?.id)?'active':''}" id="detail-kudos">♥ ${kudos.length} KUDOS</button><button class="secondary" id="detail-react">REACT · ${reactions.length}</button><button class="secondary" id="detail-comment">COMMENT · ${comments.length}</button>${!mine&&socialCache.friends.some(f=>f.id===post.user_id)?`<button class="secondary" id="detail-motivate">MESSAGE</button>`:''}</div>${comments.length?`<div class="detail-comments"><p class="eyebrow">COMMENTS</p>${comments.map(c=>`<div><strong>@${escapeHtml(c.profiles?.username||'friend')}</strong><span>${escapeHtml(c.body)}</span></div>`).join('')}</div>`:''}`);
 $('#detail-owner').onclick=()=>{if(!mine){closeSheet();openUserProfile(post.user_id)}};$('#detail-kudos').onclick=async()=>{closeSheet();await toggleKudos(post.id)};const dr=$('#detail-react');if(dr)dr.onclick=()=>{closeSheet();openReactionSheet(post.id)};$('#detail-comment').onclick=()=>{closeSheet();openCommentSheet(post.id)};const mot=$('#detail-motivate');if(mot)mot.onclick=()=>{closeSheet();openMessageComposer(post.user_id,p)};
}
function openKudosSheet(postId){
 const post=activityPostCache.get(postId)||socialCache.feed.find(p=>p.id===postId),kudos=post?.activity_kudos||[];
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Kudos</p><h2>${kudos.length} ${kudos.length===1?'person':'people'} cheered this on</h2></div><button class="sheet-close" data-close>×</button></div><div class="social-list kudos-list">${kudos.length?kudos.map(k=>{const p=k.profiles||{};return `<article class="social-person">${avatarMarkup(p,'md')}<button class="social-person-main" data-kudos-user="${k.user_id}"><strong>${escapeHtml(p.display_name||p.username||'GAYM user')}</strong><span>@${escapeHtml(p.username||'user')}</span></button></article>`}).join(''):'<div class="empty"><strong>No kudos yet</strong>Be the first one.</div>'}</div>`);
 $$('[data-kudos-user]').forEach(b=>b.onclick=()=>{if(b.dataset.kudosUser===authUser?.id)return;closeSheet();openUserProfile(b.dataset.kudosUser)});
}
async function toggleKudos(postId){
 const post=activityPostCache.get(postId)||socialCache.feed.find(p=>p.id===postId);const has=post?.activity_kudos?.some(k=>k.user_id===authUser.id);
 const q=has?sb.from('activity_kudos').delete().eq('post_id',postId).eq('user_id',authUser.id):sb.from('activity_kudos').insert({post_id:postId,user_id:authUser.id});const {error}=await q;if(error)return toast(error.message);if(!has&&post?.user_id&&post.user_id!==authUser.id)await sendSocialNotification(post.user_id,'kudos','New Kudos',`${cloudProfile?.display_name||cloudProfile?.username||'A friend'} gave Kudos to your ${post.kind==='pr'?'PB':post.kind==='night_out'?'Night Out':'workout'}.`,{post_id:postId},`kudos:${postId}:${authUser.id}`);await loadSocialState(true);const fresh=socialCache.feed.find(x=>x.id===postId);if(fresh)openActivityDetail(fresh);else if(post?.user_id&&post.user_id!==authUser.id)await openUserProfile(post.user_id);else {socialTab='activity';go('social');}
}
function openCommentSheet(postId){
 const post=activityPostCache.get(postId)||socialCache.feed.find(p=>p.id===postId);openSheet(`<div class="sheet-head"><div><p class="eyebrow">Comment</p><h2>${escapeHtml(post?.title||'Activity')}</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><label>Comment</label><textarea id="social-comment" maxlength="300" rows="4" placeholder="Strong work. Keep going."></textarea></div><div class="sheet-actions"><button class="primary" id="send-comment">POST COMMENT</button></div>`);$('#send-comment').onclick=async()=>{const body=$('#social-comment').value.trim();if(!body)return;const {error}=await sb.from('activity_comments').insert({post_id:postId,user_id:authUser.id,body});if(error)return toast(error.message);if(post?.user_id&&post.user_id!==authUser.id)await sendSocialNotification(post.user_id,'comment','New comment',`${cloudProfile?.display_name||cloudProfile?.username||'A friend'} commented on your ${post.kind==='pr'?'PB':post.kind==='night_out'?'Night Out':'workout'}: “${body.slice(0,120)}”`,{post_id:postId,target_type:post?.kind||'activity'});closeSheet();await loadSocialState(true);const fresh=socialCache.feed.find(x=>x.id===postId);if(fresh)openActivityDetail(fresh);else toast('Comment posted.')};
}
async function openPrivacySettings(){
 const [{data:settings},{data:p}]=await Promise.all([sb.from('privacy_settings').select('*').eq('user_id',authUser.id).single(),sb.from('profiles').select('discoverable').eq('id',authUser.id).single()]);
 const option=(value,current,label)=>`<option value="${value}" ${current===value?'selected':''}>${label}</option>`;
 const row=(id,label,current)=>`<div class="field"><label>${label}</label><select id="${id}">${option('private',current,'Only me')}${option('friends',current,'Friends')}${option('public',current,'Everyone on GAYM')}</select></div>`;
 const details=settings?.workout_details_visibility||'full';
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Privacy</p><h2>You decide what leaves the locker room</h2></div><button class="sheet-close" data-close>×</button></div><label class="auto-target-row"><input id="privacy-discoverable" type="checkbox" ${p?.discoverable!==false?'checked':''}><span><strong>Let people find my profile</strong><small>Allows other GAYM users to search your name or username.</small></span></label>${row('privacy-workouts','Who can see workouts',settings?.workouts_visibility||'friends')}<div class="field"><label>Workout details</label><select id="privacy-workout-details">${option('summary',details,'Summary only · name, time, exercise count')}${option('exercises',details,'Exercises · names, no weights/reps')}${option('full',details,'Full sets & weights')}</select><small class="field-help">This controls what is actually uploaded into shared workout activity.</small></div>${row('privacy-prs','Personal bests inside shared workouts',settings?.prs_visibility||'friends')}${row('privacy-streak','Training streak',settings?.streak_visibility||'friends')}<p class="science-note">PBs appear inside the workout card and never get a separate feed post. Their audience can never be wider than the workout itself. Weight, body measurements, calories, drink amounts, nutrition logs and BottomCheck stay private. Night Out sharing is chosen each time you activate it.</p><div class="sheet-actions"><button class="primary" id="save-privacy">SAVE PRIVACY</button></div>`);
 $('#save-privacy').onclick=async()=>{const update={workouts_visibility:$('#privacy-workouts').value,workout_history_visibility:$('#privacy-workouts').value,workout_details_visibility:$('#privacy-workout-details').value,prs_visibility:$('#privacy-prs').value,streak_visibility:$('#privacy-streak').value,updated_at:new Date().toISOString()};const [a,b]=await Promise.all([sb.from('privacy_settings').update(update).eq('user_id',authUser.id),sb.from('profiles').update({discoverable:$('#privacy-discoverable').checked,updated_at:new Date().toISOString()}).eq('id',authUser.id)]);if(a.error||b.error)return toast(a.error?.message||b.error?.message);await syncRecentActivitiesFromLocal();socialCacheUpdatedAt=0;closeSheet();toast('Privacy updated. Shared workouts were refreshed.');};
}
function openPrideModeSettings(){openSheet(`<div class="sheet-head"><div><p class="eyebrow">PRIDE MODE</p><h2>A little extra rainbow electricity</h2></div><button class="sheet-close" data-close>×</button></div><div class="tabs"><button data-pride-mode="auto" class="tab ${data.prideMode==='auto'?'active':''}">AUTO</button><button data-pride-mode="on" class="tab ${data.prideMode==='on'?'active':''}">ON</button><button data-pride-mode="off" class="tab ${data.prideMode==='off'?'active':''}">OFF</button></div><p class="science-note">Auto turns Pride Mode on during June. It changes small accents and GAYM copy, not your workout data.</p>`);$$('[data-pride-mode]').forEach(b=>b.onclick=()=>{data.prideMode=b.dataset.prideMode;save();closeSheet();profile();toast(`Pride Mode: ${data.prideMode.toUpperCase()}`)});}

async function openSocialProfileEditor(){
 const p=cloudProfile||{};
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Social profile</p><h2>Make it yours</h2></div><button class="sheet-close" data-close>×</button></div><div class="avatar-editor">${avatarMarkup(p,'xl')}<label class="secondary photo-button" for="social-avatar-file">CHANGE PHOTO</label><input id="social-avatar-file" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp"></div><div class="field"><label>Display name</label><input id="social-name" value="${escapeHtml(p.display_name||data.profile.name||'')}"></div><div class="field"><label>Username</label><input id="social-username" autocapitalize="none" value="${escapeHtml(p.username||'')}"></div><div class="field"><label>Bio</label><textarea id="social-bio" maxlength="160" rows="3" placeholder="Training for something, or just dangerously consistent.">${escapeHtml(p.bio||'')}</textarea></div><div class="field"><label>Title</label><select id="social-title"><option value="">No title</option>${unlockedTitles().map(t=>`<option value="${escapeHtml(t)}" ${(p.selected_title||data.selectedTitle)===t?'selected':''}>${escapeHtml(t)}</option>`).join('')}</select><small class="field-help">Titles unlock from your actual GAYM activity.</small></div><div class="profile-save-status" id="profile-save-status" aria-live="polite"></div><div class="sheet-actions"><button type="button" class="primary" id="save-social-profile">SAVE PROFILE</button></div>`);
 let avatarFile=null;$('#social-avatar-file').onchange=e=>{avatarFile=e.target.files?.[0]||null;if(avatarFile){const u=URL.createObjectURL(avatarFile);const old=$('.social-avatar.xl');if(old?.tagName==='IMG')old.src=u;else if(old){const img=document.createElement('img');img.className=old.className;img.src=u;old.replaceWith(img)}}};
 $('#save-social-profile').onclick=async()=>{
  const userId=authUser?.id;if(!userId||activeDataUserId!==userId)return toast('Your account changed. Open profile again.');
  const display_name=$('#social-name').value.trim(),username=usernameClean($('#social-username').value),bio=$('#social-bio').value.trim(),selected_title=$('#social-title')?.value||'';data.selectedTitle=selected_title;if(!display_name||username.length<3)return toast('Add a name and a valid username.');
  const btn=$('#save-social-profile'),status=$('#profile-save-status');if(status){status.className='profile-save-status working';status.textContent=avatarFile?'Uploading photo and saving profile…':'Saving profile…'}if(btn){btn.disabled=true;btn.textContent='SAVING…'}
  let avatar_url=p.avatar_url||null;
  try{
   if(avatarFile){
    const blob=await prepareAvatarImage(avatarFile);
    if(authUser?.id!==userId||activeDataUserId!==userId)throw new Error('Your account changed. Open profile again.');
    // Never overwrite the same Storage object. A unique immutable filename avoids
    // stale CDN/browser cache after refresh and account switching.
    const path=`${userId}/avatar-${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
    const {error:uploadError}=await sb.storage.from('avatars').upload(path,blob,{upsert:false,contentType:'image/jpeg',cacheControl:'31536000'});
    if(uploadError)throw uploadError;
    avatar_url=sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    if(!avatar_url)throw new Error('Could not create the profile image URL.');
   }
   const updated_at=new Date().toISOString();
   const {data:updated,error}=await sb.from('profiles').update({display_name,username,bio,avatar_url,selected_title,updated_at}).eq('id',userId).select('id,username,display_name,bio,avatar_url,selected_title,discoverable,updated_at').single();
   if(error)throw error;
   if(authUser?.id!==userId||activeDataUserId!==userId)return;
   // Read the row back once more. Supabase is the source of truth for the avatar.
   const {data:fresh,error:freshError}=await sb.from('profiles').select('id,username,display_name,bio,avatar_url,selected_title,discoverable,updated_at').eq('id',userId).single();
   if(freshError)throw freshError;
   if(authUser?.id!==userId||activeDataUserId!==userId)return;
   cloudProfile=fresh||updated;cacheCloudProfile(cloudProfile);data.profile.name=display_name;if(!save())console.warn('Cloud profile saved, but local profile cache could not persist.');if(status){status.className='profile-save-status success';status.textContent='Saved ✓'}toast('Profile updated.');setTimeout(()=>{closeSheet();profile()},350);
  }catch(err){console.error('save social profile',err);if(status){status.className='profile-save-status error';status.textContent=err?.message||'Could not save profile.'}toast(err?.message||'Could not save profile photo.');}
  finally{if(btn){btn.disabled=false;btn.textContent='SAVE PROFILE'}}
 };
}
function social(){
 const tabBar=`<div class="social-tabs"><button data-social-tab="activity" class="${socialTab==='activity'?'active':''}">ACTIVITY</button><button data-social-tab="messages" class="${socialTab==='messages'?'active':''}">MESSAGES<span id="message-unread-tab"></span></button><button data-social-tab="friends" class="${socialTab==='friends'?'active':''}">FRIENDS${socialCache.requests.length?` <b>${socialCache.requests.length}</b>`:''}</button></div>`;
 shell(`${header()}<div class="social-page-head"><div><p class="eyebrow">YOUR GYM PEOPLE</p><h1 class="page-title">Social</h1></div></div>${tabBar}<section class="section" id="social-tab-content"><article class="card loading-card"><div class="cloud-loader"></div><p>Loading your GAYM circle…</p></article></section>`);
 $$('[data-social-tab]').forEach(b=>b.onclick=()=>{socialTab=b.dataset.socialTab;social()});
 renderSocialTab();loadSocialState(false).then(renderSocialTab).catch(()=>{});loadDirectMessageThreads().then(st=>{const el=$('#message-unread-tab');if(el&&st.unread)el.innerHTML=` <b>${Math.min(st.unread,9)}${st.unread>9?'+':''}</b>`}).catch(()=>{});
}
function profile(){
 const p=cloudProfile||{display_name:data.profile.name,username:'',bio:'',avatar_url:null};
 const goalLabel=data.profile.goal==='gain'?'Build muscle':data.profile.goal==='lose'?'Lose weight':'Maintain';
 const weight=Number(data.profile.weight||0),syncView=syncStatusView();
 shell(`${header()}<h1 class="page-title">Profile</h1><section class="section profile-personal-section"><article class="card social-profile-hero own profile-personal-hero">${avatarMarkup(p,'xl')}<div class="social-profile-copy"><p class="eyebrow profile-kicker">YOUR PROFILE</p><h2>${escapeHtml(p.display_name||data.profile.name)}</h2><p>${p.username?`@${escapeHtml(p.username)}`:'Choose a username'}${p.selected_title?` · ${escapeHtml(p.selected_title)}`:''}</p>${p.bio?`<span>${escapeHtml(p.bio)}</span>`:'<span class="subtle">Add a bio, profile photo and title.</span>'}</div><button class="icon-btn social-edit-btn" id="edit-social-profile">EDIT</button></article><div class="profile-personal-stats"><div><span>WEIGHT</span><strong>${weight?`${weight.toFixed(1)} kg`:'—'}</strong></div><div><span>GOAL</span><strong>${escapeHtml(goalLabel)}</strong></div><div><span>WORKOUTS</span><strong>${(data.sessions||[]).length}</strong></div><div><span>STREAK</span><strong>${calcStreak()} days</strong></div></div><button class="secondary profile-body-btn" id="edit-body-profile">BODY & GOAL</button></section><section class="section"><p class="eyebrow">Settings</p><article class="card" style="padding:0 14px"><button class="settings-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="privacy-settings"><span>Privacy & sharing</span><small>Who sees what ›</small></button><button class="settings-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="notification-settings"><span>Notifications</span><small>GAYM sass ›</small></button><button class="settings-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="pride-mode-settings"><span>Pride Mode</span><small>${data.prideMode==='on'?'ON':data.prideMode==='off'?'OFF':'AUTO'} ›</small></button>${hasLegacyLocalData()?`<button class="settings-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="import-legacy-data"><span>Import pre-account data</span><small>ONE TIME ›</small></button>`:''}<button class="settings-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="export-data"><span>Export local data</span><small>JSON ›</small></button><button class="settings-row danger-text" style="width:100%;background:none;border:0;text-align:left" id="sign-out"><span>Log out</span><small>›</small></button></article></section>`);
 const settings=$('#privacy-settings')?.parentElement;if(settings){settings.insertAdjacentHTML('afterbegin',`<div class="account-sync-status ${syncView.cls}" id="account-sync-status"><i></i><span><strong>ACCOUNT DATA</strong><small data-sync-detail>${escapeHtml(syncView.detail)}</small></span><b data-sync-label>${escapeHtml(syncView.label)}</b></div><button class="settings-row account-sync-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="account-sync-now"><span>Back up this device<small>Manual upload only · never automatic</small></span><small>BACK UP</small></button><button class="settings-row account-sync-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="account-repair-history"><span>Recover workout history<small>Merge this device with the cloud · deletes nothing</small></span><small>REPAIR</small></button><button class="settings-row account-sync-row" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;color:inherit;text-align:left" id="account-load-now"><span>Restore from cloud<small>Manual only · replaces this device after confirmation</small></span><small>RESTORE</small></button>`);$('#account-sync-now').onclick=forceCloudAccountSync;$('#account-repair-history').onclick=repairCloudWorkoutHistory;$('#account-load-now').onclick=forceCloudAccountLoad;if(cloudSyncState.status==='conflict')$('#account-sync-status').onclick=()=>openCloudSyncConflict()}$('#edit-social-profile').onclick=openSocialProfileEditor;$('#edit-body-profile').onclick=openProfileSheet;$('#privacy-settings').onclick=openPrivacySettings;$('#notification-settings').onclick=openNotificationSettings;$('#pride-mode-settings').onclick=openPrideModeSettings;const importLegacy=$('#import-legacy-data');if(importLegacy)importLegacy.onclick=importLegacyLocalData;$('#export-data').onclick=exportData;$('#sign-out').onclick=signOutCloud;
}
function renderSocialTab(){
 const box=$('#social-tab-content');if(!box)return;const fc=$('#social-friend-count');if(fc)fc.textContent=String(socialCache.friends.length);
 if(socialTab==='messages'){openMessagesTab();return}
 if(socialTab==='activity'){
  box.innerHTML=`${nightOutRadarMarkup()}<div class="section-head"><h2>Friends activity</h2><span class="eyebrow">REACTIONS + COMMENTS</span></div><div class="social-feed">${socialCache.feed.length?socialCache.feed.map(activityCard).join(''):'<div class="empty"><strong>Your feed is quiet</strong>Add friends and their shared workouts will appear here.</div>'}</div>`;bindNightOutRadar();bindActivityCards();
 }else if(socialTab==='friends'){
  box.innerHTML=`${nightOutRadarMarkup()}<div class="section-head friends-head-after-radar"><h2>Friends</h2><button class="text-btn" id="friends-search-inline">+ FIND PEOPLE</button></div>${socialCache.requests.length?`<p class="eyebrow">Requests</p><div class="social-list">${socialCache.requests.map(r=>`<article class="social-person">${avatarMarkup(r.profile,'md')}<button class="social-person-main" data-open-user="${r.requester_id}"><strong>${escapeHtml(r.profile?.display_name||r.profile?.username||'GAYM user')}</strong><span>@${escapeHtml(r.profile?.username||'user')}</span></button><div class="friend-request-actions"><button class="small-btn" data-accept-request="${r.id}">ACCEPT</button><button class="small-btn ghost" data-decline-request="${r.id}">DECLINE</button></div></article>`).join('')}</div>`:''}<p class="eyebrow">Your people</p><div class="social-list">${socialCache.friends.length?socialCache.friends.map(f=>`<article class="social-person">${avatarMarkup(f,'md')}<button class="social-person-main" data-open-user="${f.id}"><strong>${escapeHtml(f.display_name||f.username||'Friend')}</strong><span>@${escapeHtml(f.username||'friend')}</span></button><button class="small-btn ghost" data-remove-friend="${f.friendship_id}">REMOVE</button></article>`).join(''):'<div class="empty"><strong>No friends yet</strong>Find someone and make the feed less lonely.</div>'}</div>`;
  bindNightOutRadar();$('#friends-search-inline').onclick=searchPeople;$$('[data-open-user]').forEach(b=>b.onclick=()=>openUserProfile(b.dataset.openUser));$$('[data-accept-request]').forEach(b=>b.onclick=()=>respondFriend(b.dataset.acceptRequest,'accepted'));$$('[data-decline-request]').forEach(b=>b.onclick=()=>respondFriend(b.dataset.declineRequest,'declined'));$$('[data-remove-friend]').forEach(b=>b.onclick=()=>removeFriend(b.dataset.removeFriend));
 }
}

function openNotificationSettings(){
 const s=notificationSettings();
 const row=(key,label,desc)=>`<label class="notification-setting"><span><strong>${label}</strong><small>${desc}</small></span><input type="checkbox" data-notify-setting="${key}" ${s[key]?'checked':''}></label>`;
 openSheet(`<div class="sheet-head"><div><p class="eyebrow">Profile · Notifications</p><h2>Choose your chaos</h2></div><button class="sheet-close" data-close>×</button></div><div class="notification-settings">${row('workout','Workout reminders','Planned workouts and gentle harassment after a few quiet days.')}${row('nutrition','Nutrition reminders','A late-day nudge when calories or protein are lagging.')}${row('progress','Progress & PRs','Celebrate new exercise PRs and link straight to the exercise.')}${row('dailySass','Daily Sass','Maximum one daily GAYM message.')}${row('unhinged','Unhinged GAYM language','Turn the brutal gay commentary on or off.')}</div><div class="inline-fields notification-times"><div class="field"><label>Daily Sass time</label><input id="notify-daily-time" type="time" value="${escapeHtml(s.dailyTime)}"></div><div class="field"><label>Nutrition check</label><input id="notify-nutrition-time" type="time" value="${escapeHtml(s.nutritionTime)}"></div></div><p class="science-note">This GitHub Pages version stores notifications locally. Reliable push alerts while the app is fully closed will need a push/backend service later.</p><div class="sheet-actions"><button class="primary" id="save-notifications">SAVE SETTINGS</button></div>`);
 $('#save-notifications').onclick=()=>{const next={...s};$$('[data-notify-setting]').forEach(x=>next[x.dataset.notifySetting]=x.checked);next.dailyTime=$('#notify-daily-time').value||'09:00';next.nutritionTime=$('#notify-nutrition-time').value||'19:00';data.notificationSettings=next;save();closeSheet();profile();toast('Notification settings saved')};
}

function openProfileSheet(){const p=data.profile;openSheet(`<div class="sheet-head"><div><p class="eyebrow">Profile</p><h2>Your body & goal</h2></div><button class="sheet-close" data-close>×</button></div><div class="field"><label>Name</label><input id="p-name" value="${escapeHtml(p.name)}"></div><div class="inline-fields"><div class="field"><label>Weight (kg)</label><input id="p-weight" type="number" step="0.1" min="35" value="${p.weight}"></div><div class="field"><label>Height (cm)</label><input id="p-height" type="number" min="130" max="230" value="${p.height||183}"></div></div><div class="inline-fields"><div class="field"><label>Age</label><input id="p-age" type="number" min="18" max="100" value="${p.age||28}"></div><div class="field"><label>Calculation sex</label><select id="p-sex"><option value="male" ${p.sex==='male'?'selected':''}>Male</option><option value="female" ${p.sex==='female'?'selected':''}>Female</option></select></div></div><div class="field"><label>Activity level</label><select id="p-activity"><option value="sedentary" ${p.activity==='sedentary'?'selected':''}>Sedentary · mostly daily living</option><option value="low" ${p.activity==='low'?'selected':''}>Low active · some walking / training</option><option value="active" ${p.activity==='active'?'selected':''}>Active · regular training</option><option value="very" ${p.activity==='very'?'selected':''}>Very active · high daily activity</option></select></div><p class="eyebrow" style="margin-top:18px">Primary goal</p><div class="goal-picker"><button data-goal="lose" class="goal-choice ${p.goal==='lose'?'active':''}"><strong>Lose weight</strong><small>Moderate calorie deficit</small></button><button data-goal="maintain" class="goal-choice ${p.goal==='maintain'?'active':''}"><strong>Maintain</strong><small>Around estimated maintenance</small></button><button data-goal="gain" class="goal-choice ${p.goal==='gain'?'active':''}"><strong>Build muscle</strong><small>Practical calorie surplus · 2.0 g protein/kg</small></button></div><label class="auto-target-row"><input id="p-auto" type="checkbox" ${p.autoTargets!==false?'checked':''}><span><strong>Automatic nutrition targets</strong><small>Calories and macros update when weight, activity or goal changes.</small></span></label><div id="target-preview" class="target-preview"></div><div class="sheet-actions"><button class="primary" id="p-save">SAVE PROFILE</button></div>`);let selectedGoal=p.goal||'gain';function preview(){const temp={...p,weight:+$('#p-weight').value||p.weight,height:+$('#p-height').value||p.height,age:+$('#p-age').value||p.age,sex:$('#p-sex').value,activity:$('#p-activity').value,goal:selectedGoal};const t=calcTargets(temp);$('#target-preview').innerHTML=`<span>Estimated target</span><strong>${t.calories.toLocaleString()} kcal</strong><small>${t.protein} g protein · ${t.carbs} g carbs · ${t.fat} g fat</small>`}$$('[data-goal]').forEach(b=>b.onclick=()=>{selectedGoal=b.dataset.goal;$$('[data-goal]').forEach(x=>x.classList.toggle('active',x===b));preview()});['p-weight','p-height','p-age','p-sex','p-activity'].forEach(id=>$('#'+id).addEventListener('input',preview));preview();$('#p-save').onclick=()=>{const nextWeight=+$('#p-weight').value||70;data.profile={...data.profile,name:$('#p-name').value.trim()||'Jocke',weight:nextWeight,height:+$('#p-height').value||175,age:+$('#p-age').value||30,sex:$('#p-sex').value,activity:$('#p-activity').value,goal:selectedGoal,autoTargets:$('#p-auto').checked};const weightChanged=Math.abs(nextWeight-(Number(p.weight)||0))>0.0001;if(weightChanged){const today=isoToday(),todayMeasurement=(data.measurements||[]).filter(Boolean).find(m=>m.date===today);if(todayMeasurement)todayMeasurement.weight=nextWeight;else data.measurements.push({date:today,weight:nextWeight,chest:null,waist:null,biceps:null,thigh:null,bodyFat:null})}if(data.profile.autoTargets)applyAutoTargets();data.profileCreated=true;save();closeSheet();render();toast(pickSass(data.profile.goal||'welcome'))}}
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
 if(sheet?.querySelector('.finish-celebration'))sheet.classList.add('finish-workout-sheet');
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

let socialNotificationPoll=null,accountSyncPoll=null;
function startSocialNotificationPolling(){if(socialNotificationPoll)clearInterval(socialNotificationPoll);socialNotificationPoll=setInterval(()=>{if(authUser&&activeDataUserId===authUser.id)loadSocialNotifications(authUser.id)},30000)}
function startAccountSyncPolling(){if(accountSyncPoll)clearInterval(accountSyncPoll);accountSyncPoll=null}

function render(){evaluateNotifications();stopWorkoutClock();if(!entryUnlocked)return entry();if(route==='home')home();else if(route==='plan')plan();else if(route==='workout')workout();else if(route==='active')active();else if(route==='progress')progress();else if(route==='nutrition')nutrition();else if(route==='social')social();else if(route==='chat')chatPage();else if(route==='profile')profile();else home();}
migrateProfile();if('scrollRestoration'in history)history.scrollRestoration='manual';window.addEventListener('beforeunload',persistActiveSession);window.addEventListener('pagehide',persistActiveSession);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistActiveSession();else if(route==='active'&&data.activeSession)render()});window.addEventListener('offline',()=>{if(authUser)setCloudSyncState('local')});window.addEventListener('online',()=>{if(authUser)setCloudSyncState('local')});if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=97-local-first',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{}));render();initializeCloud();
})();
