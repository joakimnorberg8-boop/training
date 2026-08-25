const CACHE='gaym-mobile-v46-night-out-flow';
const ASSETS=["./","./index.html","./styles.css","./app.js","./manifest.webmanifest","./assets/beef_burrito_bowl.jpg","./assets/beef_chili.jpg","./assets/creamy_beef_pasta.jpg","./assets/korean_beef_bowl.jpg","./assets/lentil_power_bowl.jpg","./assets/protein_oats.jpg","./assets/skyr_berry_bowl.jpg","./assets/stuffed_peppers.jpg","./assets/thai_noodles.jpg","./assets/unicorns_v34/unicorn_afternoon.webp","./assets/unicorns_v34/unicorn_default.webp","./assets/unicorns_v34/unicorn_evening.webp","./assets/unicorns_v34/unicorn_fed.webp","./assets/unicorns_v34/unicorn_judging.webp","./assets/unicorns_v34/unicorn_late.webp","./assets/unicorns_v34/unicorn_low_nutrition.webp","./assets/unicorns_v34/unicorn_morning.webp","./assets/unicorns_v34/unicorn_new_workout.webp","./assets/unicorns_v34/unicorn_pr.webp","./assets/unicorns_v34/unicorn_pump.webp","./assets/unicorns_v34/unicorn_rest.webp","./assets/unicorns_v34/unicorn_streak.webp"];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
});
