import registry from './hero-media.json';
export type Media = {src:string;alt:string;credit:string;rights:string};
export function safeMediaPath(src:unknown):src is string {return typeof src==='string' && /^\.\/media\/[a-zA-Z0-9/_-]+\.(svg|png|webp|jpe?g)$/.test(src) && !src.includes('..');}
export function mediaFor(id:string,role='duelist',entries:Record<string,Media>=registry):Media {
 const item=entries[id];
 if(item&&safeMediaPath(item.src)&&item.credit?.trim()&&item.rights?.trim()&&item.alt?.trim())return item;
 const lane=['vanguard','duelist','strategist'].includes(role)?role:'duelist';
 return {src:`./media/${lane}-portrait.svg`,alt:`Original illustrated ${lane} role mascot`,credit:'Rivals Workshop original geometric illustration',rights:'Original project artwork'};
}
