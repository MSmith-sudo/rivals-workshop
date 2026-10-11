// Only canonical public YouTube video URLs reach a fixed metadata endpoint.
export function youtubeURL(raw){
 try{const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
 const hosts=['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be'];if(!hosts.includes(u.hostname))return null;
 const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.pathname==='/watch'?u.searchParams.get('v'): /^\/(shorts|embed)\/([^/]+)$/.exec(u.pathname)?.[2];
 return /^[\w-]{11}$/.test(id||'')?`https://www.youtube.com/watch?v=${id}`:null;
 }catch{return null;}
}
export function thumbnail(raw){try{const u=new URL(raw);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&['i.ytimg.com','img.youtube.com'].includes(u.hostname)&&/^\/vi(?:_webp)?\/[\w-]{11}\/[\w.-]+$/.test(u.pathname)?u.href:null;}catch{return null;}}
export async function musicMetadata(d,transport=fetch){
 if(d?.consent!==true)throw Object.assign(Error('Consent required to send the video link to YouTube.'),{status:400});
 const url=typeof d.url==='string'&&d.url.length<=2000?youtubeURL(d.url):null;
 if(!url)throw Object.assign(Error('Preview supports HTTPS YouTube video links only. Other songs keep their safe external link.'),{status:400});
 try{const r=await transport('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(url),{redirect:'error',signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw Error();const reader=r.body?.getReader();let raw='';if(reader){const decoder=new TextDecoder();let bytes=0;while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>32000){await reader.cancel();throw Error();}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();}else raw=JSON.stringify(await r.json());
 if(raw.length>32000)throw Error();const v=JSON.parse(raw);if(typeof v.title!=='string'||!v.title.trim()||typeof v.author_name!=='string')throw Error();
 return {url,title:v.title.slice(0,300),author:v.author_name.slice(0,200),thumbnail:thumbnail(v.thumbnail_url),provider:'YouTube',fetchedAt:new Date().toISOString()};
 }catch{throw Object.assign(Error('YouTube metadata unavailable. Keep your own song credits; no preview was invented.'),{status:503});}
}
