import {pathToFileURL} from 'node:url';
import {createServer} from './service.mjs';
export * from './service.mjs';
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const server=createServer();
 server.requestTimeout=30000;server.headersTimeout=10000;
 server.listen(Number(process.env.PORT||8787),process.env.HOST||(process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1'),()=>console.log('Rivals Workshop server listening on port '+(process.env.PORT||8787)));
 const stop=()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),25000).unref();};
 process.once('SIGTERM',stop);process.once('SIGINT',stop);
}
