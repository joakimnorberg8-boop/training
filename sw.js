const CACHE='gaym-mobile-v21-retro-exercises';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/creamy_beef_pasta.jpg','./assets/lentil_power_bowl.jpg','./assets/beef_chili.jpg','./assets/stuffed_peppers.jpg','./assets/korean_beef_bowl.jpg','./assets/thai_noodles.jpg','./assets/beef_burrito_bowl.jpg','./assets/protein_oats.jpg','./assets/skyr_berry_bowl.jpg','./assets/glitter_unicorn.webp'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(
    fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html')))
  );
});
