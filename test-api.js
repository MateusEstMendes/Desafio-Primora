import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarAplicativo } from './server/app.js';
import { dataset, validarDataset } from './server/dataset.js';
import { criarClienteHttp } from './src/config/api.js';
import { UnidadeDAO, ClienteDAO } from './src/dao/index.js';
import { Unidade, Cliente, Evento, RegistroSaude } from './src/models/index.js';

// Usa HTTP real em porta livre, sem depender de um servidor iniciado manualmente.
test('contrato HTTP completo e consultas dos DAOs', async () => {
  const servidor = criarAplicativo().listen(0, '127.0.0.1');
  await new Promise(resolve => servidor.once('listening', resolve));
  try {
    const urlBase = `http://127.0.0.1:${servidor.address().port}/api/v1`;
    for (const [caminho, colecao, quantidade] of [['unidades', 'tenants', 4], ['clientes', 'clientes', 3]]) {
      // Confirma os dois endereços locais nos dois endpoints para evitar regressão de CORS.
      for (const origem of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
        const resposta = await fetch(`${urlBase}/${caminho}`, { headers: { Origin: origem } });
        assert.equal(resposta.status, 200);
        assert.equal(resposta.headers.get('access-control-allow-origin'), origem);
        const dados = await resposta.json();
        assert.ok(Array.isArray(dados));
        assert.equal(dados.length, quantidade);
        assert.deepEqual(dados, dataset[colecao]);
      }
    }
    const bloqueada = await fetch(`${urlBase}/clientes`, { headers: { Origin: 'https://outra.example' } });
    assert.equal(bloqueada.headers.get('access-control-allow-origin'), null);
    assert.equal((await fetch(`${urlBase}/clientes`, { method: 'POST' })).status, 404);
    const http = criarClienteHttp({ urlBase });
    const unidades = new UnidadeDAO(http), clientes = new ClienteDAO(http);
    assert.ok((await unidades.listar()).every(u => u instanceof Unidade));
    assert.equal((await unidades.buscarPorId(' tenant-sudeste ')).id, 'tenant-sudeste');
    assert.equal(await unidades.buscarPorId('inexistente'), null);
    assert.equal(await unidades.buscarPorId(null), null);
    const lista = await clientes.listar();
    assert.ok(lista.every(c => c instanceof Cliente));
    assert.ok(lista[0].getEventos().every(e => e instanceof Evento));
    assert.ok(lista[0].getHistoricoSaude().every(r => r instanceof RegistroSaude));
    assert.equal((await clientes.buscarPorId(` ${lista[0].id} `)).id, lista[0].id);
    assert.equal(await clientes.buscarPorId('inexistente'), null);
    assert.equal(await clientes.buscarPorId(null), null);
    assert.deepEqual((await clientes.listarPorUnidade(' tenant-sudeste ')).map(c => c.id), dataset.clientes.filter(c => c.tenantId === 'tenant-sudeste').map(c => c.id));
    assert.deepEqual(await clientes.listarPorUnidade('inexistente'), []);
    assert.deepEqual(await clientes.listarPorUnidade(null), []);
    assert.deepEqual(await new UnidadeDAO(async () => []).listar(), []);
    assert.deepEqual(await new ClienteDAO(async () => []).listar(), []);
  } finally { await new Promise(resolve => servidor.close(resolve)); }
});

// Injeta apenas o transporte para reproduzir falhas, preservando o contrato do cliente.
for (const [nome, executarFetch, mensagem] of [
  ['conexão', async () => { throw new Error('offline'); }, /conectar/],
  ['HTTP', async () => new Response('indisponível', { status: 503 }), /HTTP 503/],
  ['JSON inválido', async () => new Response('{'), /JSON inválido/],
  ['objeto em vez de array', async () => Response.json({ clientes: [] }), /array/],
]) {
  test(`propaga falha de ${nome}`, async () => {
    const http = criarClienteHttp({ executarFetch });
    await assert.rejects(new UnidadeDAO(http).listar(), mensagem);
    await assert.rejects(new ClienteDAO(http).listar(), mensagem);
  });
}
test('valida URL e estrutura do dataset antes de servir', async () => {
  await assert.rejects(criarClienteHttp({ urlBase: '' })('/clientes'), /VITE_API_BASE_URL/);
  assert.throws(() => validarDataset({}), /Dataset inválido/);
  const invalido = structuredClone(dataset);
  invalido.clientes[0].tenantId = 'inexistente';
  assert.throws(() => criarAplicativo({ dados: invalido }), /unidade inexistente/);
  const historicoInvalido = structuredClone(dataset);
  historicoInvalido.clientes[0].historicoScore[0].score = 101;
  assert.throws(() => validarDataset(historicoInvalido), /Dataset inválido/);
});
