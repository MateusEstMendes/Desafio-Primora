// Centraliza o contrato HTTP e evita usar dados locais em caso de falha.
export function criarClienteHttp({ urlBase = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1', executarFetch = globalThis.fetch } = {}) {
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
