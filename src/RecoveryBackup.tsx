import { downloadText } from './saveRecovery';
export default function RecoveryBackup({storageKey}:{storageKey:string}){
 let raw=null;try{raw=localStorage.getItem(`${storageKey}.recovery`);}catch{/* no storage */}
 return raw?<div><p className="ch-muted">An unreadable older save was preserved for recovery.</p><button className="ch-quiet" onClick={()=>downloadText('rivals-workshop-preserved-save.json',raw!)}>Download preserved original</button></div>:null;
}
