const CACHE='gaym-mobile-v90-account-sync-protection';
const ASSETS=["./","./index.html","./styles.css?v=90-account-sync-protection","./app.js?v=90-account-sync-protection","./manifest.webmanifest?v=90-account-sync-protection","./assets/beef_burrito_bowl.jpg","./assets/beef_chili.jpg","./assets/creamy_beef_pasta.jpg","./assets/korean_beef_bowl.jpg","./assets/lentil_power_bowl.jpg","./assets/protein_oats.jpg","./assets/skyr_berry_bowl.jpg","./assets/stuffed_peppers.jpg","./assets/thai_noodles.jpg","./assets/fonts/Bangers/Bangers-Regular.ttf","./assets/fonts/Oswald/Oswald-VariableFont_wght.ttf","./assets/unicorns_hd/unicorn_afternoon.webp","./assets/unicorns_hd/unicorn_default.webp","./assets/unicorns_hd/unicorn_evening.webp","./assets/unicorns_hd/unicorn_fed.webp","./assets/unicorns_hd/unicorn_judging.webp","./assets/unicorns_hd/unicorn_late_night.webp","./assets/unicorns_hd/unicorn_low_calories.webp","./assets/unicorns_hd/unicorn_low_nutrition.webp","./assets/unicorns_hd/unicorn_low_protein.webp","./assets/unicorns_hd/unicorn_morning.webp","./assets/unicorns_hd/unicorn_night_out.webp","./assets/unicorns_hd/unicorn_pb.webp","./assets/unicorns_hd/unicorn_rest_day.webp","./assets/unicorns_hd/unicorn_streak.webp","./assets/unicorns_hd/unicorn_workout_active.webp","./assets/unicorns_hd/unicorn_workout_ready.webp"];
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
