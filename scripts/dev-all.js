import { spawn } from 'node:child_process';

console.log('🚀 Iniciando API Backend (porta 3001) e Frontend Vite (porta 5173)...');

const server = spawn('node', ['server/index.js'], { stdio: 'inherit', shell: true });
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

function finalizar() {
  server.kill();
  vite.kill();
  process.exit();
}

process.on('SIGINT', finalizar);
process.on('SIGTERM', finalizar);
process.on('exit', finalizar);
