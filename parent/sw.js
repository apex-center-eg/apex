/* Parent page service worker: shows the notification. The text arrives encrypted inside the push itself; if a phone has no keys yet, it falls back to fetching its own text from the server. */
const SRV=new URL(self.location).searchParams.get('srv')||'https://apex-parent-api.goo2182009.workers.dev';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>e.waitUntil((async()=>{let msgs=[];
 try{if(e.data){const j=e.data.json();if(j&&Array.isArray(j.m))msgs=j.m.filter(x=>typeof x==='string')}}catch(x){}
 if(!msgs.length){try{const sub=await self.registration.pushManager.getSubscription();if(sub){const r=await fetch(SRV+'/push-poll',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({endpoint:sub.endpoint})});const j=await r.json();if(j&&j.ok)msgs=j.msgs||[]}}catch(x){}}
 if(!msgs.length)msgs=['فيه تحديث جديد عن ابنك. افتح الصفحة'];
 let i=0;for(const m of msgs.slice(0,6))await self.registration.showNotification('Ms.Samar',{body:m,tag:'ms-p-'+Date.now()+'-'+(i++),lang:'ar',dir:'rtl',vibrate:[250,120,250],silent:false,renotify:true,requireInteraction:false,timestamp:Date.now(),icon:'icon-192.png',badge:'badge-96.png'})})()));
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l)if('focus' in c)return c.focus();return self.clients.openWindow('./')}))});
