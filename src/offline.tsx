import { useEffect, useState } from 'react';
export function OfflineNotice(){
 const [status,setStatus]=useState(''),[waiting,setWaiting]=useState<ServiceWorker|null>(null);
 const [home,setHome]=useState(()=>!location.hash.startsWith('#chapter-'));
 useEffect(()=>{const change=()=>setHome(!location.hash.startsWith('#chapter-'));window.addEventListener('hashchange',change);return ()=>window.removeEventListener('hashchange',change);},[]);
 useEffect(()=>{
  if(!import.meta.env.PROD||!('serviceWorker' in navigator))return;
  let alive=true;let reloading=false;
  const controller=()=>{if(reloading)location.reload();};navigator.serviceWorker.addEventListener('controllerchange',controller);
  navigator.serviceWorker.register('./sw.js').then(reg=>{
   if(!alive)return;
   const update=()=>{if(reg.waiting&&navigator.serviceWorker.controller){setWaiting(reg.waiting);setStatus('A workshop update is ready. Finish your run and download a backup before updating.');}else if(reg.active){setStatus(import.meta.env.VITE_CLOSED_BETA==='true'?'Private beta ready. Online login required; profiles stay on this browser.':'Offline workshop ready. Gemini needs internet; profiles stay on this browser.');}};
   update();reg.addEventListener('updatefound',()=>{setStatus('Preparing the offline workshop…');reg.installing?.addEventListener('statechange',update);});
   navigator.serviceWorker.ready.then(()=>{if(alive)update();});
  }).catch(()=>{if(alive)setStatus('Offline installation unavailable. Keep a downloaded backup and use this loaded visit.');});
  const apply=()=>{if(waiting){reloading=true;waiting.postMessage({type:'ACTIVATE_UPDATE'});}};
  window.addEventListener('apply-workshop-update',apply);
  return ()=>{alive=false;navigator.serviceWorker.removeEventListener('controllerchange',controller);window.removeEventListener('apply-workshop-update',apply);};
 },[waiting]);
 if(!status)return null;
 return <aside className="offline-notice" aria-label="Offline availability"><span role="status">{status}</span>{waiting&&(home?<button onClick={()=>window.dispatchEvent(new Event('apply-workshop-update'))}>Apply update & reload</button>:<a href="#main">Return to workshop to update</a>)}</aside>;
}
