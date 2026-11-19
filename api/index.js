import { criarAplicativo } from '../server/app.js';

// Cria a aplicação Express com suporte a Serverless na Vercel
const app = criarAplicativo({ origens: '*' });

export default app;
