import {useState} from 'react';
type Props={title:string;subtitle:string;body:string;filename:string;portraitSelector?:string};
export default function ShareCard({title,subtitle,body,filename,portraitSelector='.final-dossier .hero-portrait img'}:Props){
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 async function make(share:boolean){
  setBusy(true);setStatus('Building your card…');
  try{
   const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image export is unavailable in this browser.');
   const gradient=ctx.createLinearGradient(0,0,1080,1440);gradient.addColorStop(0,'#213858');gradient.addColorStop(1,'#0b1020');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1440);
   ctx.strokeStyle='#ffe26a';ctx.lineWidth=8;ctx.strokeRect(32,32,1016,1376);ctx.fillStyle='#79e9ff';ctx.font='bold 26px Arial';ctx.fillText('RIVALS WORKSHOP / FIND YOUR FLAME',70,100);
   function text(value:string,y:number,font:string,color:string,limit:number){ctx!.font=font;ctx!.fillStyle=color;const words=value.replace(/\s+/g,' ').split(' ');let line='',rows=0;for(const word of words){if(ctx!.measureText(line+' '+word).width>940&&line){ctx!.fillText(line,70,y);y+=52;rows++;line='';if(rows>=limit){ctx!.fillText('…',70,y);return y+52;}}line+=(line?' ':'')+word;}if(line){ctx!.fillText(line,70,y);y+=52;}return y;}
   let y=text(title,190,'bold 58px Arial','#ffe26a',3);y=text(subtitle,y+15,'30px Arial','#f1f4ff',2);
   const images=Array.from(document.querySelectorAll<HTMLImageElement>(portraitSelector)).filter(i=>i.complete&&i.naturalWidth>0).slice(0,3);
   if(images.length){const width=940/images.length;for(let n=0;n<images.length;n++){const img=images[n],scale=Math.min(width/img.naturalWidth,370/img.naturalHeight);ctx.save();ctx.beginPath();ctx.rect(70+n*width,y+12,width-8,370);ctx.clip();ctx.drawImage(img,70+n*width+(width-img.naturalWidth*scale)/2,y+12,img.naturalWidth*scale,img.naturalHeight*scale);ctx.restore();}y+=415;}
   text(body,y+35,'30px Arial','#e0eaf8',Math.max(2,Math.floor((1260-y)/52)));ctx.fillStyle='#a9c2d9';ctx.font='22px Arial';ctx.fillText('A PLAYER PORTRAIT · PROVISIONAL, PERSONAL, YOURS',70,1320);ctx.fillText('UNOFFICIAL FAN PROJECT · V2.5',70,1360);
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Unable to create image.')),'image/png'));const file=new File([blob],filename,{type:'image/png'});
   let shared=false;if(share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title});shared=true;setStatus('Card shared.');}catch(e){if(e instanceof Error&&e.name==='AbortError')throw e;}}
   if(!shared){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);setStatus('PNG downloaded. Attach it in Discord, or open it from your downloads.');}
  }catch(e){setStatus(e instanceof Error&&e.name==='AbortError'?'Share cancelled.':e instanceof Error?e.message:'Unable to export card.');}finally{setBusy(false);}
 }
 return <div className="share-card-actions"><button disabled={busy} onClick={()=>void make(false)}>Download Discord card</button><button disabled={busy} onClick={()=>void make(true)}>Share card</button><p role="status">{status}</p></div>;
}
