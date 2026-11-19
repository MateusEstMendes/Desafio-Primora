import React, { useMemo, useState, useEffect, useDeferredValue } from 'react';
import { Input, Tag, Empty, Pagination, Button } from 'antd';
import { ThunderboltOutlined, ArrowRightOutlined, PlusOutlined } from '@ant-design/icons';
import SegmentedPill from './SegmentedPill';
import { getRiskSemanticTokens, getRegionalColors } from '../utils/themeTokens';
import './componentsCSS/Comparativo.css';
import './componentsCSS/ClientDirectory.css';

const BASE_CLIENT_IDS = new Set(['CLI-001', 'CLI-002', 'CLI-003']);
const normalizarBusca = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
const isClienteNovo = cli => !BASE_CLIENT_IDS.has(cli.id) || cli.isNovo;

export default function ClientDirectory({
  clientes: todosClientes,
  tenants,
  selectedTenantId,
  selectedClientId,
  themeTokens,
  onSelectClient,
  onOpenAddClient
}) {
  const [filtroTipoClientes, setFiltroTipoClientes] = useState('todos');
  const [buscaCliente, setBuscaCliente] = useState('');
  const buscaAdiada = useDeferredValue(buscaCliente);
  const [pagina, setPagina] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(6);
  useEffect(() => { setPagina(1); }, [selectedTenantId, buscaAdiada]);
  const regionalColors = useMemo(() => getRegionalColors(themeTokens), [themeTokens]);
  const clientesRegionais = useMemo(() => todosClientes.filter(cli => selectedTenantId === 'todos' || cli.tenantId === selectedTenantId), [todosClientes, selectedTenantId]);
  const indiceBusca = useMemo(() => new Map(todosClientes.map(cli => [cli.id, normalizarBusca(`${cli.id} ${cli.nome} ${cli.segmento || ''}`)])), [todosClientes]);
  const contagens = useMemo(() => ({ novos: clientesRegionais.filter(isClienteNovo).length, risco: clientesRegionais.filter(cli => cli.statusSaude === 'Risco' || cli.statusSaude === 'Crítico').length }), [clientesRegionais]);
  const clientesFiltrados = useMemo(() => {
    const query = normalizarBusca(buscaAdiada.trim());
    return clientesRegionais.filter(cli => {
      if (query && !indiceBusca.get(cli.id)?.includes(query)) return false;
      if (filtroTipoClientes === 'novos') return isClienteNovo(cli);
      if (filtroTipoClientes === 'risco') return cli.statusSaude === 'Risco' || cli.statusSaude === 'Crítico';
      return true;
    });
  }, [clientesRegionais, indiceBusca, buscaAdiada, filtroTipoClientes]);
  const totalNovosGeral = contagens.novos;

  const paginaAtual = Math.min(pagina, Math.max(1, Math.ceil(clientesFiltrados.length / tamanhoPagina)));
  const clientesPaginados = clientesFiltrados.slice((paginaAtual - 1) * tamanhoPagina, paginaAtual * tamanhoPagina);
  return (
      <section className="flat-card comparativo-clients-section" aria-busy={buscaAdiada !== buscaCliente} aria-labelledby="regional-clients-heading">
        <div className="comparativo-clients-header">
          <div>
            {totalNovosGeral > 0 && (
              <div style={{ marginBottom: 6 }}>
                <span className="badge-novo-cliente">
                  <ThunderboltOutlined /> {totalNovosGeral} {totalNovosGeral === 1 ? 'Novo Cliente Adicionado' : 'Novos Clientes Adicionados'}
                </span>
              </div>
            )}
            <h2 tabIndex={-1} id="regional-clients-heading" className="flat-card-title">
              {selectedTenantId === 'todos'
                ? 'Clientes das Unidades Regionais'
                : `Clientes Vinculados: ${tenants.find((t) => t.id === selectedTenantId)?.nome || 'Regional'}`}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              {selectedTenantId === 'todos'
                ? 'Consulte os clientes das unidades regionais.'
                : 'Exibindo os clientes desta unidade retornados pela API.'}
            </p>
          </div>

          {onOpenAddClient && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onOpenAddClient}
              style={{ fontWeight: 600, borderRadius: 8, height: 38 }}
            >
              + Novo Cliente
            </Button>
          )}
        </div>

        {/* Filtros e Busca */}
        <div className="comparativo-clients-controls-bar">
          <SegmentedPill
            size="sm"
            ariaLabel="Filtro de clientes da carteira"
            value={filtroTipoClientes}
            onChange={(value) => { setFiltroTipoClientes(value); setPagina(1); }}
            options={[
              {
                value: 'todos',
                label: `Todos (${clientesRegionais.length})`
              },
              {
                value: 'novos',
                label: `Novos (${contagens.novos})`
              },
              {
                value: 'risco',
                label: `Risco / Crítico (${contagens.risco})`
              }
            ]}
          />

          <Input.Search
            aria-label="Buscar cliente por nome, código ou segmento" placeholder="Buscar por nome, código ou segmento..."
            value={buscaCliente}
            onChange={(e) => { setBuscaCliente(e.target.value); setPagina(1); }}
            allowClear
            style={{ maxWidth: 280, width: '100%' }}
            size="small"
          />
        </div>

        {/* Grid de Cards dos Clientes */}
        {clientesFiltrados.length === 0 ? (
          <Empty
            description="Nenhum cliente encontrado com os filtros atuais."
            style={{ margin: '24px 0' }}
          >
            <button type="button" className="flat-action-btn" onClick={() => { setBuscaCliente(''); setFiltroTipoClientes('todos'); setPagina(1); }}>Limpar busca e filtros</button>
          </Empty>
        ) : (
          <div className="client-mini-card-grid">
            {clientesPaginados.map((cli) => {
              const novo = isClienteNovo(cli);
              const semTokens = getRiskSemanticTokens(cli.statusSaude, themeTokens);
              const corRegional = regionalColors[cli.tenantId] || themeTokens.brandPrimary;

              return (
                <article
                  key={cli.id}
                  onClick={() => onSelectClient?.(cli)}
                  className={`client-mini-card ${selectedClientId === cli.id ? 'client-directory-card--selected' : ''} ${novo ? 'client-mini-card--novo' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="client-mini-code">{cli.id}</span>
                        {novo && <span className="badge-novo-cliente">✨ Novo</span>}
                      </div>
                      <h4 className="client-mini-name">{cli.nome}</h4>
                      <span className="client-mini-segment">{cli.segmento}</span>
                    </div>

                    <div className="client-mini-score-box">
                      <span className="client-mini-score-val" style={{ color: semTokens.color }}>
                        {cli.scoreSaudeAtual}
                      </span>
                      <span className="client-mini-score-sub">SCORE</span>
                    </div>
                  </div>

                  <div className="client-mini-meta-row">
                    <span className="client-mini-regional-badge">
                      <span className="geo-dot" style={{ backgroundColor: corRegional }} />
                      <span>{cli.unidadeNome?.replace('Unidade ', '')}</span>
                    </span>

                    <Tag
                      color={
                        cli.statusSaude === 'Saudável'
                          ? 'success'
                          : cli.statusSaude === 'Atenção'
                          ? 'warning'
                          : 'error'
                      }
                      style={{ margin: 0, borderRadius: 6, fontSize: 11 }}
                    >
                      {cli.statusSaude}
                    </Tag>
                  </div>

                  <div className="client-mini-footer">
                    <div>
                      <span className="client-mini-finance-label">Ticket Mensal</span>
                      <strong className="client-mini-finance-val">{cli.ticketMedioMensal}</strong>
                    </div>

                    {onSelectClient && (
                      <button
                        type="button"
                        className="client-mini-inspect-btn"
                        aria-label={`Ver jornada de ${cli.nome}`} aria-current={selectedClientId === cli.id ? 'true' : undefined} title="Ver jornada deste cliente"
                      >
                        <span>{selectedClientId === cli.id ? 'Conta selecionada' : 'Ver jornada'}</span>
                        <ArrowRightOutlined />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <div className="client-directory-pagination">
          <span role="status" aria-live="polite">{clientesFiltrados.length ? `${(paginaAtual - 1) * tamanhoPagina + 1}–${Math.min(paginaAtual * tamanhoPagina, clientesFiltrados.length)} de ${clientesFiltrados.length} clientes` : '0 clientes'}</span>
          <Pagination current={paginaAtual} pageSize={tamanhoPagina} total={clientesFiltrados.length}
            showSizeChanger={false} responsive onChange={setPagina} />
          <label className="client-directory-page-size">Por página
            <select aria-label="Clientes por página" value={tamanhoPagina} onChange={event => { setTamanhoPagina(Number(event.target.value)); setPagina(1); }}>
              {[6, 12, 24].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
        </div>
      </section>

  );
}
