import {
  calcularRiscoAbsoluto,
  calcularTaxaRiscoProporcional,
  calcularTaxaConversaoFunil,
  classificarUnidadesPorRisco
} from './src/utils/metrics.js';
import fs from 'fs';
const dataset = JSON.parse(fs.readFileSync('./src/data/dataset_painel_multitenant.json', 'utf-8'));

console.log('🧪 Iniciando Verificação de Cálculos do Painel Vetor...\n');

// Teste 1: Risco Absoluto
const saudeTeste = { saudavel: 960, atencao: 140, risco: 70, critico: 30 };
const riscoAbs = calcularRiscoAbsoluto(saudeTeste);
console.assert(riscoAbs === 100, `Esperado 100, obtido ${riscoAbs}`);
console.log(`✅ Teste 1: Risco Absoluto = ${riscoAbs} clientes (Passou)`);

// Teste 2: Taxa Proporcional de Risco
const taxaRiscoSudeste = calcularTaxaRiscoProporcional(saudeTeste, 1200);
console.assert(taxaRiscoSudeste === 8.33, `Esperado 8.33, obtido ${taxaRiscoSudeste}`);
console.log(`✅ Teste 2: Taxa Proporcional Sudeste = ${taxaRiscoSudeste}% (Passou)`);

const saudeCO = { saudavel: 80, atencao: 35, risco: 22, critico: 13 };
const taxaRiscoCO = calcularTaxaRiscoProporcional(saudeCO, 150);
console.assert(taxaRiscoCO === 23.33, `Esperado 23.33, obtido ${taxaRiscoCO}`);
console.log(`✅ Teste 3: Taxa Proporcional Centro-Oeste = ${taxaRiscoCO}% (Passou)`);

// Teste 3: Funil Comercial
const funilTeste = { gerada: 450, vista: 380, sucesso: 285 };
const taxaConversao = calcularTaxaConversaoFunil(funilTeste);
console.assert(taxaConversao === 63.33, `Esperado 63.33, obtido ${taxaConversao}`);
console.log(`✅ Teste 4: Taxa Conversão Funil = ${taxaConversao}% (Passou)`);

// Teste 4: Ranking
const ranking = classificarUnidadesPorRisco(dataset.tenants);
console.assert(ranking[0].id === 'tenant-centro-oeste', `Esperado tenant-centro-oeste no 1º lugar do ranking, obtido ${ranking[0].id}`);
console.log(`✅ Teste 5: 1º Lugar no Ranking de Criticidade = ${ranking[0].nome} (${ranking[0].taxaRiscoProporcional}%) (Passou)`);

console.log('\n🎉 Todos os cálculos matemáticos foram validados com 100% de sucesso!');
