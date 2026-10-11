import {Children,useEffect,useRef,useState,type ReactNode} from 'react';
/** Presentation only: chapter scoring and answers stay owned by the original chapter. */
export default function FocusDeck({children,id}:{children:ReactNode;id:string}){
 const items=Children.toArray(children),[index,setIndex]=useState(()=>{try{return Math.max(0,Number(sessionStorage.getItem('rivals-focus.'+id))||0);}catch{return 0;}}),heading=useRef<HTMLDivElement>(null),active=Math.min(index,Math.max(0,items.length-1));
 useEffect(()=>{try{sessionStorage.setItem('rivals-focus.'+id,String(active));}catch{}},[active,id]);
 function move(n:number){setIndex(n);requestAnimationFrame(()=>{heading.current?.focus();heading.current?.scrollIntoView({block:'start',behavior:'instant'});});}
 return <div className="focus-deck"><div ref={heading} tabIndex={-1} className="focus-progress"><span>QUESTION {active+1} / {items.length}</span><progress value={active+1} max={items.length} aria-label="Question position"/></div>{items.map((item,i)=><div key={i} hidden={i!==active}>{item}</div>)}<div className="focus-controls"><button type="button" disabled={active===0} onClick={()=>move(active-1)}>← Previous question</button><button type="button" disabled={active===items.length-1} onClick={()=>move(active+1)}>Next question →</button></div><p className="ch-muted">Answers save as you go. Use chapter Next below when you’re ready to move on.</p></div>;
}
