import { challenge, evaluate } from './courtState';
import type { Case } from './courtState';
// Secure backend extension: replace this adapter with a same-origin server client.
// Never place provider credentials in VITE_* variables or browser code.
export type Evidence = { category:'official'|'community'; title:string; url:string; retrievedAt:string; excerpt:string; patchVersion?:string };
export interface CourtAI { objection(c:Case,round:number,tone:string):ReturnType<typeof challenge>; verdict(c:Case,tone:string):string }
const voice=(tone:string)=>tone==='friendly'?'You have room to strengthen this case.':tone==='petty'?'The court accepts confidence; it still requires homework.':'The court evaluates the reasoning on record.';
export const courtAI:CourtAI={
 objection(c,r,tone){const o=challenge(c,r);return {...o,objection:`${voice(tone)} On the record: “${c.proposal.slice(0,400) || c.original.slice(0,400)}”. ${o.objection}`};},
 verdict(c,tone){const scores=evaluate(c);const missing=scores.filter(d=>d.score<3).map(d=>d.name.toLowerCase());return `${voice(tone)} ${c.choices.includes('withdraw')?'Withdrawal recorded; this is reflection, not a failure.':missing.length?'Further development needed before a limited test.':'The draft contains cues for a limited test, subject to human review.'} ${missing.length?`Develop ${missing.join(', ')}.`:'Verify all factual claims and choose a rollback threshold.'} This provisional narrative cannot establish whether ${c.hero} needs a balance change.`;}
};

