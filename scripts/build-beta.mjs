import {spawnSync} from 'node:child_process';
const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run','build'],{stdio:'inherit',shell:process.platform==='win32',env:{...process.env,VITE_CLOSED_BETA:'true'}});
process.exit(result.status ?? 1);
