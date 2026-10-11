// Preserve unreadable/unknown saves before existing chapters write a fresh draft.
export function protectedRead(key:string,versions:number[]):string|null {
 const raw=localStorage.getItem(key);if(!raw)return null;
 try{const data=JSON.parse(raw);if(data&&versions.includes(data.version))return raw;}catch{/* archive below */}
 const archive=`${key}.recovery`;
 if(localStorage.getItem(archive)!==raw)localStorage.setItem(archive,raw);
 return null;
}
export function protectedWrite(key:string,value:string,versions:number[]){
 // If archiving fails (quota/blocked storage), this throws BEFORE replacing raw data.
 protectedRead(key,versions);localStorage.setItem(key,value);
}
export function downloadJson(name:string,value:unknown){downloadText(name,JSON.stringify(value,null,2));}
export function downloadText(name:string,value:string){const url=URL.createObjectURL(new Blob([value],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
