// A criação é separada da escuta HTTP para permitir testes com portas temporárias.
import express from 'express';
import cors from 'cors';
import { dataset, validarDataset } from './dataset.js';

export function criarAplicativo({ dados = dataset, origens = process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173' } = {}) {
  validarDataset(dados);
  const aplicativo = express();
  // localhost e 127.0.0.1 são origens distintas para o navegador.
  // Uma configuração explícita em CORS_ORIGINS substitui os padrões locais.
  const origensPermitidas = origens.split(',').map(origem => origem.trim()).filter(Boolean);
  aplicativo.use(cors({ origin: origensPermitidas, methods: ['GET'] }));
  aplicativo.get('/api/v1/unidades', (_requisicao, resposta) => resposta.json(dados.tenants));
  aplicativo.get('/api/v1/clientes', (_requisicao, resposta) => resposta.json(dados.clientes));
  return aplicativo;
}
