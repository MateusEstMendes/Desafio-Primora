/**
 * Serviço de sincronização em segundo plano com o Supabase (PostgreSQL na nuvem).
 * Opera em modelo Offline-First: se o Supabase responder com sucesso, sincroniza;
 * se falhar ou estiver sem rede, a aplicação continua funcionando normalmente com LocalStorage.
 */

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

function obterHeaders() {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };
}

function supabaseConfigurado() {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('seu-projeto')
  );
}

/**
 * Registra o soft-delete (desativação e agendamento de 15 dias) no Supabase
 */
export async function sincronizarSoftDeleteSupabase(clienteId, desativadoEm, excluirEm) {
  if (!supabaseConfigurado()) return;
  try {
    const url = `${SUPABASE_URL}/rest/v1/clientes?id=eq.${encodeURIComponent(clienteId)}`;
    await fetch(url, {
      method: 'PATCH',
      headers: obterHeaders(),
      body: JSON.stringify({
        ativo: false,
        desativado_em: desativadoEm,
        excluir_em: excluirEm,
        updated_at: new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn('[SupabaseSync] Não foi possível sincronizar desativação com a nuvem:', err);
  }
}

/**
 * Reativa a conta de um cliente no Supabase
 */
export async function sincronizarReativacaoSupabase(clienteId) {
  if (!supabaseConfigurado()) return;
  try {
    const url = `${SUPABASE_URL}/rest/v1/clientes?id=eq.${encodeURIComponent(clienteId)}`;
    await fetch(url, {
      method: 'PATCH',
      headers: obterHeaders(),
      body: JSON.stringify({
        ativo: true,
        desativado_em: null,
        excluir_em: null,
        updated_at: new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn('[SupabaseSync] Não foi possível sincronizar reativação com a nuvem:', err);
  }
}

/**
 * Remove definitivamente do Supabase após a carência de 15 dias expirar
 */
export async function sincronizarExclusaoDefinitivaSupabase(clienteId) {
  if (!supabaseConfigurado()) return;
  try {
    const url = `${SUPABASE_URL}/rest/v1/clientes?id=eq.${encodeURIComponent(clienteId)}`;
    await fetch(url, {
      method: 'DELETE',
      headers: obterHeaders()
    });
  } catch (err) {
    console.warn('[SupabaseSync] Não foi possível sincronizar expurgo definitivo com a nuvem:', err);
  }
}

/**
 * Cria ou atualiza um cliente no Supabase
 */
export async function sincronizarUpsertClienteSupabase(cliente) {
  if (!supabaseConfigurado()) return;
  try {
    const url = `${SUPABASE_URL}/rest/v1/clientes?on_conflict=id`;
    await fetch(url, {
      method: 'POST',
      headers: {
        ...obterHeaders(),
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: cliente.id,
        nome: cliente.nome,
        tenant_id: cliente.tenantId,
        unidade_nome: cliente.unidadeNome || cliente.tenantNome,
        segmento: cliente.segmento,
        status_saude: cliente.statusSaude,
        score_saude_atual: cliente.scoreSaudeAtual,
        tempo_contrato_meses: cliente.tempoContratoMeses || 0,
        ticket_medio_mensal: cliente.ticketMedioMensal,
        ativo: cliente.ativo !== false,
        desativado_em: cliente.desativadoEm || null,
        excluir_em: cliente.excluirEm || null,
        updated_at: new Date().toISOString()
      })
    });
  } catch (err) {
    console.warn('[SupabaseSync] Não foi possível sincronizar cliente com a nuvem:', err);
  }
}
