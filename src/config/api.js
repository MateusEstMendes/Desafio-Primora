// Centraliza o contrato HTTP e detecta automaticamente a origem em produção (ex: Vercel)
function obterUrlBasePadrao() {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    // Se estiver rodando na nuvem/produção, usa a origem da própria URL
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.origin}/api/v1`;
    }
  }
  return 'http://localhost:3001/api/v1';
}

export function criarClienteHttp({ urlBase = obterUrlBasePadrao(), executarFetch = globalThis.fetch } = {}) {
  return async function consultarArray(caminho) {
    if (typeof urlBase !== 'string' || !/^https?:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(urlBase)) {
      throw new Error('Configure VITE_API_BASE_URL com uma URL HTTP válida.');
    }
    let resposta;
    try { resposta = await executarFetch(`${urlBase.replace(/\/$/, '')}${caminho}`); }
    catch { throw new Error('Não foi possível conectar à API.'); }
    if (!resposta.ok) throw new Error(`A API retornou HTTP ${resposta.status}.`);
    let dados;
    try { dados = await resposta.json(); }
    catch { throw new Error('A API retornou JSON inválido.'); }
    if (!Array.isArray(dados)) throw new Error('A API deve retornar um array.');
    return dados;
  };
}
export const consultarArray = criarClienteHttp();
