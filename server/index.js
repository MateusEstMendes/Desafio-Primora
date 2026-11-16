import { criarAplicativo } from './app.js';
const porta = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(porta) || porta < 1 || porta > 65535) throw new Error('PORT deve ser um inteiro entre 1 e 65535.');
const servidor = criarAplicativo().listen(porta, '0.0.0.0', () => console.log(`API disponível na porta ${porta}`));
servidor.on('error', error => { console.error(`Falha ao iniciar API: ${error.message}`); process.exitCode = 1; });
