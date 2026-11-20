/**
 * Utilitário de persistência local para Clientes, Eventos e Histórico de Saúde.
 * Permite que adições, edições e exclusões persistam mesmo após recarregar a página (F5)
 * ou caso a API local não esteja em execução.
 */

const STORAGE_KEY = 'primora_painel_clientes_v1';

export function carregarClientesLocais() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Falha ao carregar clientes do localStorage:', err);
  }
  return null;
}

export function salvarClientesLocais(clientes) {
  try {
    if (Array.isArray(clientes)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
    }
  } catch (err) {
    console.warn('Falha ao salvar clientes no localStorage:', err);
  }
}

export function limparClientesLocais() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Falha ao limpar clientes do localStorage:', err);
  }
}

/**
 * Deriva a classificação de saúde a partir do score numérico
 */
export function classificarSaudePorScore(score) {
  const num = Number(score);
  if (num >= 70) return 'Saudável';
  if (num >= 40) return 'Atenção';
  return 'Crítico';
}

/**
 * Gera um novo ID sequencial para cliente (ex: CLI-004, CLI-005)
 */
export function gerarProximoIdCliente(clientesExistentes = []) {
  let maiorNumero = 0;
  for (const c of clientesExistentes) {
    const match = String(c.id).match(/^CLI-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maiorNumero) maiorNumero = num;
    }
  }
  const proximo = maiorNumero + 1;
  return `CLI-${String(proximo).padStart(3, '0')}`;
}

/**
 * Gera um ID único para eventos (ex: EVT-170000000)
 */
export function gerarIdEvento() {
  return `EVT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
}

/** Prazo regulamentar de carência para exclusão definitiva (15 dias) */
export const DIAS_CARENCIA_EXCLUSAO = 15;

/**
 * Calcula a data limite para expurgo definitivo somando 15 dias corridos
 */
export function calcularDataExclusao(dataBase = new Date()) {
  const data = new Date(dataBase);
  data.setDate(data.getDate() + DIAS_CARENCIA_EXCLUSAO);
  return data.toISOString();
}

/**
 * Calcula quantos dias inteiros restam até o expurgo definitivo
 */
export function calcularDiasRestantes(excluirEm) {
  if (!excluirEm) return 0;
  const agora = new Date().getTime();
  const limite = new Date(excluirEm).getTime();
  const diffMs = limite - agora;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Analisa os clientes e expurga os que já ultrapassaram o período de carência de 15 dias.
 * @returns {{ clientesRestantes: Array, clientesExpurgados: Array }}
 */
export function expurgarClientesExpirados(clientes = []) {
  const agora = new Date().getTime();
  const clientesRestantes = [];
  const clientesExpurgados = [];

  for (const c of clientes) {
    if (c.ativo === false && c.excluirEm) {
      const dataLimite = new Date(c.excluirEm).getTime();
      if (agora >= dataLimite) {
        clientesExpurgados.push(c);
        continue;
      }
    }
    clientesRestantes.push(c);
  }

  return { clientesRestantes, clientesExpurgados };
}
