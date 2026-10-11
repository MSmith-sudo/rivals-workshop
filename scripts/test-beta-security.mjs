import assert from 'node:assert/strict';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {createServer} from '../server/service.mjs';
const hash = token => createHash('sha256').update(token).digest('hex');
const auth = (user='alice',token='test-token') => 'Basic '+Buffer.from(user+':'+token).toString('base64');
const origin='https://beta.example.test';
const env={NODE_ENV:'production',APP_ORIGIN:origin,BETA_USERS:JSON.stringify({alice:hash('test-token'),bob:hash('other-token')}),AI_PROVIDER:'offline'};
assert.throws(()=>createServer({NODE_ENV:'production',APP_ORIGIN:origin}),/BETA_USERS/);
assert.throws(()=>createServer({...env,BETA_ENABLED:'false',BETA_USERS:''}),/BETA_USERS/);
assert.throws(()=>createServer({...env,APP_ORIGIN:'http://beta.example.test'}),/HTTPS/);
assert.throws(()=>createServer({...env,BETA_USERS:'{"alice":"plain-password"}'}),/BETA_USERS/);
assert.throws(()=>createServer({...env,BETA_MAX_CONCURRENT:'NaN'}),/Invalid/);
async function using(options,transport,run){
 const server=createServer(options,transport);await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const request=(path='/',headers={},body,method=body===undefined?'GET':'POST')=>new Promise((resolve,reject)=>{
  const req=http.request({hostname:'127.0.0.1',port:server.address().port,path,method,headers:{Host:'beta.example.test',...headers}},res=>{let text='';res.on('data',chunk=>text+=chunk);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,text}));});
  req.on('error',reject);req.end(body);
 });
 try{await run(request);}finally{await new Promise(r=>server.close(r));}
}
const postHeaders={Authorization:auth(),Origin:origin,'Content-Type':'application/json'};
const payload=JSON.stringify({consent:true,tone:'mentor',question:'Hi',evidence:[]});
await using(env,undefined,async request=>{
 assert.equal((await request('/healthz')).status,200);
 for(const path of ['/','/api/config','/sw.js','/flame.svg','/manifest.webmanifest','/icons/app-192.png','/api/companion','/api/music']){
  const response=await request(path);assert.equal(response.status,401);assert.match(response.headers['www-authenticate'],/Basic/);
 }
 const manifest=await request('/manifest.webmanifest',{Authorization:auth()});assert.equal(manifest.status,200);assert.equal(manifest.headers['content-type'],'application/manifest+json');assert.equal(JSON.parse(manifest.text).display,'standalone');
 assert.equal((await request('/',{Authorization:auth('alice','wrong')})).status,401);
 assert.equal((await request('/',{Authorization:auth('unknown')})).status,401);
 assert.equal((await request('/',{Authorization:'Basic '+ 'x'.repeat(1025)})).status,401);
 const page=await request('/',{Authorization:auth()});assert.equal(page.status,200);assert.match(page.text,/<div id="root">/);
 assert.match(page.headers['cache-control'],/no-store/);assert.equal(page.headers['x-frame-options'],'DENY');assert.match(page.headers['content-security-policy'],/script-src 'self'/);assert.ok(page.headers['strict-transport-security']);
 const asset= /src="([^"]+\.js)"/.exec(page.text)[1];assert.equal((await request('/'+asset.replace(/^\.\//,''),{Authorization:auth()})).status,200);
 assert.equal((await request('/api/config',{Authorization:auth()})).status,200);
 assert.equal((await request('/api/config',{Authorization:auth(),Host:'evil.test'})).status,403);
 assert.equal((await request('/api/config',{Authorization:auth(),Host:'127.0.0.1'})).status,403);
 assert.equal((await request('/api/config',{Authorization:auth(),Origin:'https://evil.test'})).status,403);
 assert.equal((await request('/',{Authorization:auth(),'Sec-Fetch-Site':'cross-site'})).status,403);
 assert.equal((await request('/',{Authorization:auth(),'Sec-Fetch-Site':'cross-site','Sec-Fetch-Mode':'navigate'})).status,200);
 for(const path of ['/env.example','/.env.server','/server/service.mjs','/%2e%2e/package.json'])assert.equal((await request(path,{Authorization:auth()})).status,404);
 assert.equal((await request('/api/companion',{Authorization:auth(),'Content-Type':'application/json'},payload)).status,403);
 assert.equal((await request('/api/companion',{...postHeaders,'Content-Type':'text/plain'},payload)).status,415);
 assert.equal((await request('/api/companion',postHeaders,'{bad')).status,400);
 assert.equal((await request('/api/companion',postHeaders,' '.repeat(256001))).status,413);
 assert.equal((await request('/api/companion',postHeaders,payload)).status,503);
});
await using({...env,BETA_REQUESTS_PER_MINUTE:'1'},undefined,async request=>{
 assert.equal((await request('/api/companion',postHeaders,payload)).status,503);
 const blocked=await request('/api/music',{...postHeaders,'X-Forwarded-For':'spoofed'},'{}');assert.equal(blocked.status,429);assert.ok(Number(blocked.headers['retry-after'])>0);
 assert.equal((await request('/api/companion',{...postHeaders,Authorization:auth('bob','other-token')},payload)).status,503);
});
await using({...env,BETA_GLOBAL_REQUESTS_PER_DAY:'1'},undefined,async request=>{
 await request('/api/companion',postHeaders,payload);
 assert.equal((await request('/api/companion',{...postHeaders,Authorization:auth('bob','other-token')},payload)).status,429);
});
await using({...env,BETA_REQUESTS_PER_DAY:'1'},undefined,async request=>{
 await request('/api/companion',postHeaders,payload);
 assert.equal((await request('/api/companion',postHeaders,payload)).status,429);
});
let finish,started;const pending=new Promise(r=>started=r);
await using({...env,BETA_MAX_CONCURRENT:'1'},async()=>{started();await new Promise(r=>finish=r);return {ok:true,json:async()=>({title:'Song',author_name:'Artist'})};},async request=>{
 const first=request('/api/music',postHeaders,JSON.stringify({consent:true,url:'https://youtu.be/abcdefghijk'}));await pending;
 assert.equal((await request('/api/companion',postHeaders,payload)).status,429);
 finish();assert.equal((await first).status,200);
 assert.equal((await request('/api/companion',postHeaders,payload)).status,503);
});
await using(env,undefined,async request=>{
 for(let i=0;i<100;i++)assert.equal((await request('/api/config')).status,401);
 const blocked=await request('/api/config',{Authorization:auth()});assert.equal(blocked.status,429);assert.ok(blocked.headers['retry-after']);
});
const worker=await readFile('dist/sw.js','utf8');assert.ok(!worker.includes('cache.addAll'));assert.match(worker,/clients.claim/);assert.match(worker,/caches.delete/);assert.ok(!/respondWith|cache\.put|caches.open|addEventListener\('fetch'/.test(worker),'Beta worker must never intercept or persist authenticated requests');
console.log('Beta security checks passed: fail-closed production, per-user access to app/assets/APIs, hosted host/origin boundaries, headers, secret/traversal rejection, body limit, independent tester quotas, spoofed forwarding headers, daily/global/concurrent limits, login failure cap and uncached beta worker. No live provider calls.');
