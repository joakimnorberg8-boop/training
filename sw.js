const CACHE='gaym-mobile-v111-direct-auth-rest';
const ASSETS=["./","./index.html","./styles.css?v=110-direct-auth-rest","./app.js?v=110-direct-auth-rest","./manifest.webmanifest?v=110-direct-auth-rest","./assets/beef_burrito_bowl.jpg","./assets/beef_chili.jpg","./assets/creamy_beef_pasta.jpg","./assets/korean_beef_bowl.jpg","./assets/lentil_power_bowl.jpg","./assets/protein_oats.jpg","./assets/skyr_berry_bowl.jpg","./assets/stuffed_peppers.jpg","./assets/thai_noodles.jpg","./assets/fonts/Bangers/Bangers-Regular.ttf","./assets/fonts/Oswald/Oswald-VariableFont_wght.ttf","./assets/unicorns_hd/unicorn_afternoon.webp","./assets/unicorns_hd/unicorn_default.webp","./assets/unicorns_hd/unicorn_evening.webp","./assets/unicorns_hd/unicorn_fed.webp","./assets/unicorns_hd/unicorn_judging.webp","./assets/unicorns_hd/unicorn_late_night.webp","./assets/unicorns_hd/unicorn_low_calories.webp","./assets/unicorns_hd/unicorn_low_nutrition.webp","./assets/unicorns_hd/unicorn_low_protein.webp","./assets/unicorns_hd/unicorn_morning.webp","./assets/unicorns_hd/unicorn_night_out.webp","./assets/unicorns_hd/unicorn_pb.webp","./assets/unicorns_hd/unicorn_rest_day.webp","./assets/unicorns_hd/unicorn_streak.webp","./assets/unicorns_hd/unicorn_workout_active.webp","./assets/unicorns_hd/unicorn_workout_ready.webp"];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  const isNavigate=event.request.mode==='navigate';
  const fresh=isNavigate||['script','style','worker'].includes(event.request.destination);
  event.respondWith(fetch(event.request,fresh?{cache:'no-store'}:undefined).then(response=>{
    if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(async()=>{
    const hit=await caches.match(event.request);
    if(hit)return hit;
    if(isNavigate)return caches.match('./index.html');
    return Response.error();
  }));
});
