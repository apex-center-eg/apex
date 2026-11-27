const V='apex-v11',FILES=['./','index.html','manifest.webmanifest','splash.jpg','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!=='apex-sched').map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c)).catch(()=>{});return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});
const SK='sched.json';
async function load(){try{const c=await caches.open('apex-sched'),r=await c.match(SK);return r?await r.json():{items:[],shown:{}}}catch(e){return{items:[],shown:{}}}}
async function save(o){const c=await caches.open('apex-sched');await c.put(SK,new Response(JSON.stringify(o)))}
async function due(){const o=await load(),now=Date.now();let ch=false;
 for(const it of o.items){if(now>=it.from&&now<it.at&&!o.shown[it.id]){o.shown[it.id]=now;ch=true;await self.registration.showNotification(it.title,{body:it.body,tag:it.id,icon:'icons/icon-192.png',badge:'icons/icon-192.png',lang:'ar',dir:'rtl',data:{page:it.page||''}})}}
 for(const k in o.shown)if(now-o.shown[k]>3*864e5){delete o.shown[k];ch=true}
 if(ch)await save(o)}
self.addEventListener('message',e=>{if(e.data&&e.data.type==='sched'){e.waitUntil((async()=>{const o=await load();o.items=e.data.items||[];await save(o)})())}});
self.addEventListener('periodicsync',e=>{if(e.tag==='apex-check')e.waitUntil(due())});
self.addEventListener('notificationclick',e=>{e.notification.close();const pg=(e.notification.data||{}).page||'';e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c){if(pg)c.postMessage({type:'go',page:pg});return c.focus()}}return self.clients.openWindow(pg?'./?go='+pg:'./')}))});
