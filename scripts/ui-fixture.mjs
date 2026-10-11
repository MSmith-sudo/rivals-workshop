// Local UI test fixture only. Never calls an external provider or accepts a real key.
import {createServer} from '../server/service.mjs';
const port=8792;
const transport=async(url,options)=>{
 if(!url.startsWith('https://generativelanguage.googleapis.com/'))return new Response('{}',{status:503});
 const context=JSON.parse(JSON.parse(options.body).contents.at(-1).parts[0].text).context;
 await new Promise(r=>setTimeout(r,400));
 let text='Let’s find your vibe. What part feels most like you?',citations=[];
 if(!context.task&&context.evidence?.length){text='[UI TEST FIXTURE — NO LIVE AI]\nYour selected answer gives this reflection a starting point [E1].\n\nExperiment: describe one alternative you considered. This fixture checks review and acceptance only.';citations=['E1'];}
 if(context.task==='writing')text='[UI TEST FIXTURE] '+(context.draft||'An imagined entrance, with a little dramatic lighting.');
 if(context.task==='titles'){text=JSON.stringify(Object.fromEntries(['archetype','secondary','social','team'].map(k=>[k,{title:'[TEST] The Lantern Crew',explanation:'Test title inspired by the selected answer [E1]'}])));citations=['E1'];}
 return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({text,citations})}]}}]}));
};
createServer({AI_PROVIDER:'gemini',GEMINI_API_KEY:'ui-test-fixture-only',APP_ORIGIN:'http://127.0.0.1:'+port},transport).listen(port,'127.0.0.1',()=>console.log('ISOLATED MOCK UI FIXTURE http://127.0.0.1:'+port));
