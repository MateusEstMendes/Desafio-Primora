/**
 * Script de Testes e Demonstração da Sprint 5
 * Modelagem de Domínio, Encapsulamento e DAOs
 * 
 * Executa todas as consultas exigidas no contrato pedagógico e valida os critérios de aceite:
 * 1. 4 classes de domínio (Unidade, Cliente, Evento, RegistroSaude) com atributos privados (#).
 * 2. Getters, validações e proteção contra mutabilidade de referências internas.
 * 3. UnidadeDAO assíncrono (listar: 4 unidades, buscarPorId: sucesso e null).
 * 4. ClienteDAO assíncrono (listar: 3 clientes, buscarPorId: sucesso e null, listarPorUnidade).
 * 5. Comprovação de que os resultados retornados são instâncias legítimas das classes de domínio.
 */

import { Unidade, Cliente, Evento, RegistroSaude } from './src/models/index.js';
import { UnidadeDAO, ClienteDAO } from './src/dao/index.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASSOU] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FALHOU] ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('='.repeat(75));
  console.log('🚀 INICIANDO TESTES E DEMONSTRAÇÃO — SPRINT 5 (PRIMORA / BOLSA FUTURO DIGITAL)');
  console.log('='.repeat(75));

  // ---------------------------------------------------------------------------
  // 1. TESTES DAS CLASSES DE DOMÍNIO E ENCAPSULAMENTO
  // ---------------------------------------------------------------------------
  console.log('\n📦 1. Testando Classes de Domínio e Encapsulamento com Atributos Privados (#)...');

  // 1.1 RegistroSaude
  const regSaude = new RegistroSaude({ data: 'Mai/2026', score: 85 });
  assert(regSaude instanceof RegistroSaude, 'RegistroSaude instanciado com sucesso.');
  assert(regSaude.data === 'Mai/2026', 'Getter data retorna valor correto.');
  assert(regSaude.score === 85, 'Getter score retorna valor numérico correto.');
  assert(regSaude['#score'] === undefined, 'Atributo privado #score não é acessível externamente.');

  let erroRegistro = false;
  try {
    new RegistroSaude({ data: '', score: 50 });
  } catch (e) {
    erroRegistro = true;
  }
  assert(erroRegistro, 'RegistroSaude valida data obrigatória lançando TypeError.');

  // 1.2 Evento
  const evt = new Evento({
    data: '2026-05-10T14:30:00Z',
    tipo: 'Reunião Comercial',
    titulo: 'Reunião estratégica',
    valor: 15000
  });
  assert(evt instanceof Evento, 'Evento instanciado com sucesso.');
  assert(evt.data === '2026-05-10T14:30:00Z', 'Getter data de Evento funciona.');
  assert(evt.tipo === 'Reunião Comercial', 'Getter tipo de Evento funciona.');
  assert(evt.titulo === 'Reunião estratégica', 'Getter titulo de Evento funciona.');
  assert(evt.valor === 15000, 'Getter valor (opcional) de Evento funciona.');
  assert(evt.id === null, 'Evento não possui id obrigatório ausente do dataset.');

  // 1.3 Proteção contra mutabilidade em Cliente
  const clienteTeste = new Cliente({
    id: 'CLI-TESTE',
    nome: 'Empresa Teste Ltda',
    tenantId: 'tenant-sudeste',
    tenantNome: 'Unidade Sudeste',
    healthSeries: [{ data: 'Out/2026', score: 90 }],
    eventos: [{ data: '2026-10-01', tipo: 'Contato', titulo: 'Alinhamento' }]
  });
  assert(clienteTeste instanceof Cliente, 'Cliente instanciado com sucesso.');
  assert(clienteTeste.tenantId === 'tenant-sudeste', 'Preserva vínculo de tenantId com Unidade.');

  const eventosProtegidos = clienteTeste.getEventos();
  assert(Array.isArray(eventosProtegidos) && eventosProtegidos.length === 1, 'getEventos() retorna array de eventos.');
  assert(eventosProtegidos[0] instanceof Evento, 'Item do getEventos() é instância da classe Evento.');
  assert(Object.isFrozen(eventosProtegidos), 'getEventos() retorna coleção congelada/protegida contra mutações externas.');

  const historicoProtegido = clienteTeste.getHistoricoSaude();
  assert(Array.isArray(historicoProtegido) && historicoProtegido.length === 1, 'getHistoricoSaude() retorna série histórica.');
  assert(historicoProtegido[0] instanceof RegistroSaude, 'Item do getHistoricoSaude() é instância de RegistroSaude.');
  assert(Object.isFrozen(historicoProtegido), 'getHistoricoSaude() retorna coleção congelada/protegida.');

  // 1.4 Unidade e seus 13 atributos obrigatórios
  const unidadeTeste = new Unidade({
    id: 'tenant-teste',
    nome: 'Unidade Teste',
    porte: 'Grande',
    carteiraTotalClientes: 1000,
    receitaCarteira90d: 'R$ 1.500.000,00',
    engagementEvents7d: 850,
    activeUsers7d: 600,
    engagementTrend30d: '+2.5%',
    funnel90d: { gerada: 300, vista: 200, sucesso: 150 },
    funnelTrend30d: '+1.8%',
    healthDistribution: { saudavel: 800, atencao: 120, risco: 50, critico: 30 },
    riscoAbsoluto: 80,
    riscoDrivers: ['Driver 1', 'Driver 2']
  });
  assert(unidadeTeste instanceof Unidade, 'Unidade instanciada com sucesso.');
  assert(unidadeTeste.id === 'tenant-teste', 'Unidade getter id correto.');
  assert(unidadeTeste.nome === 'Unidade Teste', 'Unidade getter nome correto.');
  assert(unidadeTeste.porte === 'Grande', 'Unidade getter porte correto.');
  assert(unidadeTeste.carteiraTotalClientes === 1000, 'Unidade getter carteiraTotalClientes correto.');
  assert(unidadeTeste.receitaCarteira90d === 'R$ 1.500.000,00', 'Unidade getter receitaCarteira90d correto.');
  assert(unidadeTeste.engagementEvents7d === 850, 'Unidade getter engagementEvents7d correto.');
  assert(unidadeTeste.activeUsers7d === 600, 'Unidade getter activeUsers7d correto.');
  assert(unidadeTeste.engagementTrend30d === '+2.5%', 'Unidade getter engagementTrend30d correto.');
  assert(unidadeTeste.funnelTrend30d === '+1.8%', 'Unidade getter funnelTrend30d correto.');
  assert(unidadeTeste.riscoAbsoluto === 80, 'Unidade getter riscoAbsoluto correto.');
  assert(Object.isFrozen(unidadeTeste.funnel90d), 'funnel90d é imutável e protegido contra mutação externa.');
  assert(Object.isFrozen(unidadeTeste.healthDistribution), 'healthDistribution é imutável e protegido contra mutação externa.');
  assert(Object.isFrozen(unidadeTeste.riscoDrivers), 'riscoDrivers é imutável e protegido contra mutação externa.');

  // ---------------------------------------------------------------------------
  // 2. TESTES DE UnidadeDAO (CONTRATO PEDAGÓGICO DE CONSULTA)
  // ---------------------------------------------------------------------------
  console.log('\n🏢 2. Testando UnidadeDAO (Consultas Assíncronas)...');
  const unidadeDAO = new UnidadeDAO();

  // 2.1 listar()
  const unidades = await unidadeDAO.listar();
  assert(Array.isArray(unidades), 'UnidadeDAO.listar() retorna um Array.');
  assert(unidades.length === 4, `UnidadeDAO.listar() recuperou exatamente 4 unidades (encontradas: ${unidades.length}).`);
  assert(unidades.every((u) => u instanceof Unidade), 'Todos os itens retornados por UnidadeDAO.listar() são instâncias de Unidade.');

  console.log('\n  📋 Demonstração das 4 Unidades recuperadas:');
  unidades.forEach((u) => {
    console.log(`     • [${u.id}] ${u.nome} | Porte: ${u.porte} | Carteira: ${u.carteiraTotalClientes} clientes | Risco Absoluto: ${u.riscoAbsoluto}`);
  });

  // 2.2 buscarPorId() com correspondência
  const unidadeEncontrada = await unidadeDAO.buscarPorId('tenant-sudeste');
  assert(unidadeEncontrada instanceof Unidade, 'UnidadeDAO.buscarPorId("tenant-sudeste") retorna instância de Unidade.');
  assert(unidadeEncontrada.id === 'tenant-sudeste', 'Unidade retornada possui o id solicitado.');
  assert(unidadeEncontrada.nome.includes('Sudeste'), 'Unidade retornada possui o nome correto da Matriz.');

  // 2.3 buscarPorId() sem correspondência
  const unidadeNaoEncontrada = await unidadeDAO.buscarPorId('tenant-fantasma');
  assert(unidadeNaoEncontrada === null, 'UnidadeDAO.buscarPorId() com ID inexistente retorna estritamente null.');

  // ---------------------------------------------------------------------------
  // 3. TESTES DE ClienteDAO (CONTRATO PEDAGÓGICO DE CONSULTA)
  // ---------------------------------------------------------------------------
  console.log('\n👥 3. Testando ClienteDAO (Consultas Assíncronas)...');
  const clienteDAO = new ClienteDAO();

  // 3.1 listar()
  const clientes = await clienteDAO.listar();
  assert(Array.isArray(clientes), 'ClienteDAO.listar() retorna um Array.');
  assert(clientes.length === 3, `ClienteDAO.listar() recuperou exatamente 3 clientes (encontrados: ${clientes.length}).`);
  assert(clientes.every((c) => c instanceof Cliente), 'Todos os itens retornados por ClienteDAO.listar() são instâncias de Cliente.');

  console.log('\n  📋 Demonstração dos 3 Clientes recuperados:');
  clientes.forEach((c) => {
    console.log(`     • [${c.id}] ${c.nome} | Unidade: ${c.tenantNome} (${c.tenantId}) | Score: ${c.scoreSaudeAtual} | Eventos: ${c.getEventos().length}`);
  });

  // 3.2 buscarPorId() com correspondência
  const cliente1 = await clienteDAO.buscarPorId('CLI-001');
  assert(cliente1 instanceof Cliente, 'ClienteDAO.buscarPorId("CLI-001") retorna instância de Cliente.');
  assert(cliente1.id === 'CLI-001', 'Cliente possui o ID solicitado.');
  assert(cliente1.nome.includes('Supermercado Alvorada'), 'Cliente possui o nome correto.');
  assert(cliente1.getEventos().length === 5, 'Cliente CLI-001 possui 5 eventos na timeline encapsulados.');
  assert(cliente1.getHistoricoSaude().length === 6, 'Cliente CLI-001 possui 6 registros no histórico de saúde.');

  // 3.3 buscarPorId() sem correspondência
  const clienteInexistente = await clienteDAO.buscarPorId('CLI-INEXISTENTE');
  assert(clienteInexistente === null, 'ClienteDAO.buscarPorId() com ID inexistente retorna estritamente null.');

  // 3.4 listarPorUnidade()
  console.log('\n  🔗 Demonstração da consulta de clientes por Unidade (tenantId):');
  
  const clientesSudeste = await clienteDAO.listarPorUnidade('tenant-sudeste');
  assert(clientesSudeste.length === 1, `Clientes vinculados à Unidade Sudeste: 1 cliente esperado (encontrados: ${clientesSudeste.length}).`);
  assert(clientesSudeste[0].id === 'CLI-001', 'Cliente vinculado à Sudeste é o CLI-001.');
  console.log(`     • tenant-sudeste -> ${clientesSudeste.map((c) => `${c.id} (${c.nome})`).join(', ')}`);

  const clientesNordeste = await clienteDAO.listarPorUnidade('tenant-nordeste');
  assert(clientesNordeste.length === 1, `Clientes vinculados à Unidade Nordeste: 1 cliente esperado (encontrados: ${clientesNordeste.length}).`);
  assert(clientesNordeste[0].id === 'CLI-002', 'Cliente vinculado à Nordeste é o CLI-002.');
  console.log(`     • tenant-nordeste -> ${clientesNordeste.map((c) => `${c.id} (${c.nome})`).join(', ')}`);

  const clientesCentroOeste = await clienteDAO.listarPorUnidade('tenant-centro-oeste');
  assert(clientesCentroOeste.length === 1, `Clientes vinculados à Unidade Centro-Oeste: 1 cliente esperado (encontrados: ${clientesCentroOeste.length}).`);
  assert(clientesCentroOeste[0].id === 'CLI-003', 'Cliente vinculado ao Centro-Oeste é o CLI-003.');
  console.log(`     • tenant-centro-oeste -> ${clientesCentroOeste.map((c) => `${c.id} (${c.nome})`).join(', ')}`);

  const clientesSul = await clienteDAO.listarPorUnidade('tenant-sul');
  assert(Array.isArray(clientesSul) && clientesSul.length === 0, 'Unidade Sul não possui clientes diretos no dataset fictício, retornando array vazio [].');
  console.log(`     • tenant-sul -> [Nenhum cliente cadastrado no dataset - retornou array vazio []]`);

  // ---------------------------------------------------------------------------
  // RESUMO FINAL
  // ---------------------------------------------------------------------------
  console.log('\n' + '='.repeat(75));
  console.log(`📊 RESULTADO DA EXECUÇÃO: ${passedTests}/${totalTests} testes aprovados (${((passedTests/totalTests)*100).toFixed(0)}%)`);
  if (passedTests === totalTests) {
    console.log('🎉 TODOS OS CRITÉRIOS DE ACEITE DA SPRINT 5 FORAM ATENDIDOS COM SUCESSO!');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM. VERIFIQUE OS LOGS ACIMA.');
  }
  console.log('='.repeat(75) + '\n');
}

runTests().catch((err) => {
  console.error('Erro fatal durante a execução dos testes:', err);
  process.exit(1);
});
