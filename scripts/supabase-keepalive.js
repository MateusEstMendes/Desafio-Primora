/**
 * Bot Keep-Alive para Supabase
 * Evita que o projeto gratuito do Supabase entre em pausa por inatividade (regra de 7 dias).
 * 
 * Uso:
 *   node scripts/supabase-keepalive.js
 * 
 * Variáveis necessárias no arquivo .env ou ambiente:
 *   SUPABASE_URL=https://sua-url.supabase.co
 *   SUPABASE_ANON_KEY=sua-chave-anonima
 */

// Carrega .env de forma nativa caso exista no Node 20+
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch (e) {
  // Ignora se o arquivo .env não existir (variáveis podem vir do ambiente)
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function pingSupabase() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🤖 Iniciando Keep-Alive ping no Supabase...`);

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error(`❌ [ERRO] SUPABASE_URL ou SUPABASE_ANON_KEY não foram informados no .env!`);
    console.log(`Configure as variáveis no seu .env:`);
    console.log(`  SUPABASE_URL=https://seu-projeto.supabase.co`);
    console.log(`  SUPABASE_ANON_KEY=eyJhbGci...`);
    process.exit(1);
  }

  // Normaliza URL e faz requisição REST leve na tabela tenants
  const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/tenants?select=id&limit=1`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ [SUCESSO] Supabase está ativo e respondeu com status ${response.status}!`);
      console.log(`   Dados recebidos:`, data);
      console.log(`   Contador de 7 dias de inatividade foi renovado.`);
    } else {
      console.warn(`⚠️ [AVISO] Resposta HTTP ${response.status}: ${response.statusText}`);
      const text = await response.text();
      console.warn(`   Detalhe: ${text}`);
    }
  } catch (error) {
    console.error(`❌ [FALHA] Não foi possível conectar ao Supabase:`, error.message);
    process.exit(1);
  }
}

// Se chamado com argumento --watch ou --loop, roda a cada 48 horas continuamente
if (process.argv.includes('--watch') || process.argv.includes('--loop')) {
  console.log(`🔄 Bot Keep-Alive rodando em modo contínuo (intervalo de 48 horas)...`);
  pingSupabase();
  const INTERVALO_MS = 48 * 60 * 60 * 1000; // 48h
  setInterval(pingSupabase, INTERVALO_MS);
} else {
  pingSupabase();
}
