export type Message={role:'user'|'assistant';content:string};
export const conversationKey=(id:string)=>`rivals-workshop.conversation.v1.${id}`;
export function validateMessages(value:unknown):Message[]{
 if(!Array.isArray(value)||value.length>12||value.length%2||value.some((m,i)=>!m||m.role!==(i%2?'assistant':'user')||typeof m.content!=='string'||!m.content.trim()||m.content.length>(i%2?15000:2000)))throw Error('Unsupported conversation history. Delete it to start fresh.');
 return value.map(({role,content})=>({role,content}));
}
export function loadConversation(storage:Storage,id:string,scope:string){
 const raw=storage.getItem(conversationKey(id));if(!raw)return [];
 if(raw.length>250000)throw Error('Conversation exceeds local storage limit.');
 const d=JSON.parse(raw);if(d?.version!==1||typeof d.scope!=='string')throw Error('Unsupported conversation history.');
 return d.scope===scope?validateMessages(d.messages):[];
}
export function saveConversation(storage:Storage,id:string,scope:string,messages:Message[]){storage.setItem(conversationKey(id),JSON.stringify({version:1,scope,messages:validateMessages(messages)}));}
export function deleteConversation(storage:Storage,id:string){storage.removeItem(conversationKey(id));}
