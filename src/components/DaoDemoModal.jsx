import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Tag, Button, Alert, Card, Row, Col, Space, Typography, Spin, Badge } from 'antd';
import {
  CodeOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  UserOutlined,
  HistoryOutlined,
  LockOutlined
} from '@ant-design/icons';
import { UnidadeDAO, ClienteDAO } from '../dao/index.js';
import { Unidade, Cliente, Evento, RegistroSaude } from '../models/index.js';

const { Text, Title, Paragraph } = Typography;

export default function DaoDemoModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [dataReport, setDataReport] = useState(null);
  const [activeTab, setActiveTab] = useState('unidades');

  const runDaoDemonstration = async () => {
    setLoading(true);
    try {
      const unidadeDAO = new UnidadeDAO();
      const clienteDAO = new ClienteDAO();

      // 1. Consultas UnidadeDAO
      const t0Unidades = performance.now();
      const listaUnidades = await unidadeDAO.listar();
      const t1Unidades = performance.now();

      const buscaUnidadeSucesso = await unidadeDAO.buscarPorId('tenant-sudeste');
      const buscaUnidadeNula = await unidadeDAO.buscarPorId('tenant-inexistente');

      // 2. Consultas ClienteDAO
      const t0Clientes = performance.now();
      const listaClientes = await clienteDAO.listar();
      const t1Clientes = performance.now();

      const buscaClienteSucesso = await clienteDAO.buscarPorId('CLI-001');
      const buscaClienteNulo = await clienteDAO.buscarPorId('CLI-999');

      // 3. Filtragem por tenantId
      const clientesSudeste = await clienteDAO.listarPorUnidade('tenant-sudeste');
      const clientesNordeste = await clienteDAO.listarPorUnidade('tenant-nordeste');
      const clientesCentroOeste = await clienteDAO.listarPorUnidade('tenant-centro-oeste');
      const clientesSul = await clienteDAO.listarPorUnidade('tenant-sul');

      // 4. Testes de integridade e imutabilidade
      const primeiroCliente = listaClientes[0];
      const eventos = primeiroCliente ? primeiroCliente.getEventos() : [];
      const historicoSaude = primeiroCliente ? primeiroCliente.getHistoricoSaude() : [];

      const isEventosFrozen = Object.isFrozen(eventos);
      const isHistoricoFrozen = Object.isFrozen(historicoSaude);

      const primeiraUnidade = listaUnidades[0];
      const isFunnelFrozen = primeiraUnidade ? Object.isFrozen(primeiraUnidade.funnel90d) : false;
      const isHealthFrozen = primeiraUnidade ? Object.isFrozen(primeiraUnidade.healthDistribution) : false;
      const isDriversFrozen = primeiraUnidade ? Object.isFrozen(primeiraUnidade.riscoDrivers) : false;

      setDataReport({
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        unidades: {
          lista: listaUnidades,
          tempoMs: (t1Unidades - t0Unidades).toFixed(2),
          total: listaUnidades.length,
          todasSaoInstancias: listaUnidades.every((u) => u instanceof Unidade),
          buscaSucesso: buscaUnidadeSucesso,
          buscaNula: buscaUnidadeNula,
          isFunnelFrozen,
          isHealthFrozen,
          isDriversFrozen
        },
        clientes: {
          lista: listaClientes,
          tempoMs: (t1Clientes - t0Clientes).toFixed(2),
          total: listaClientes.length,
          todosSaoInstancias: listaClientes.every((c) => c instanceof Cliente),
          buscaSucesso: buscaClienteSucesso,
          buscaNulo: buscaClienteNulo,
          porUnidade: {
            sudeste: clientesSudeste,
            nordeste: clientesNordeste,
            centroOeste: clientesCentroOeste,
            sul: clientesSul
          },
          primeiroCliente,
          eventos,
          historicoSaude,
          isEventosFrozen,
          isHistoricoFrozen
        }
      });
    } catch (err) {
      console.error('Erro na demonstração DAO:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      runDaoDemonstration();
    }
  }, [open]);

  return (
    <Modal
      title={
        <Space direction="horizontal" size="middle">
          <SafetyCertificateOutlined style={{ color: '#1677FF', fontSize: 20 }} />
          <span>Demonstração de Domínio, Encapsulamento e DAOs (Sprint 5)</span>
          <Tag color="processing">POO + Promises</Tag>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={940}
      footer={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={runDaoDemonstration} loading={loading}>
          Reexecutar Consultas DAO
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Fechar Demonstração
        </Button>
      ]}
    >
      <Alert
        message="Contrato Pedagógico de DAOs (Sprint 5 — Primora / Bolsa Futuro Digital)"
        description="Esta camada implementa o padrão Data Access Object (DAO) e Classes de Domínio com atributos privados (#) e métodos assíncronos (async/Promise). Não constitui API REST da Primora; prepara pedagogicamente a separação de responsabilidades para a Sprint 6."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {loading && !dataReport ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" tip="Executando consultas assíncronas aos DAOs..." />
        </div>
      ) : dataReport ? (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'unidades',
              label: (
                <span>
                  <ApartmentOutlined /> UnidadeDAO &amp; Unidade ({dataReport.unidades.total})
                </span>
              ),
              children: (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card size="small" title="Método: listar()">
                        <p style={{ margin: 0 }}>
                          Total recuperado: <strong>{dataReport.unidades.total} unidades</strong>
                        </p>
                        <p style={{ margin: '4px 0 0 0' }}>
                          Tipo comprovado:{' '}
                          <Tag color="success">
                            instanceof Unidade ({dataReport.unidades.todasSaoInstancias ? '100%' : 'Falha'})
                          </Tag>
                        </p>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Tempo de resolução: {dataReport.unidades.tempoMs} ms
                        </Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small" title="buscarPorId('tenant-sudeste')">
                        <p style={{ margin: 0 }}>
                          Resultado: <strong>{dataReport.unidades.buscaSucesso?.nome || 'Não encontrado'}</strong>
                        </p>
                        <Tag color="blue">id: {dataReport.unidades.buscaSucesso?.id}</Tag>
                        <Tag color="cyan">porte: {dataReport.unidades.buscaSucesso?.porte}</Tag>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small" title="buscarPorId('inexistente')">
                        <p style={{ margin: 0 }}>Resultado sem correspondência:</p>
                        <Tag color={dataReport.unidades.buscaNula === null ? 'green' : 'red'}>
                          {dataReport.unidades.buscaNula === null ? 'null (conforme contrato)' : 'Inválido'}
                        </Tag>
                      </Card>
                    </Col>
                  </Row>

                  <Card size="small" title="Proteção contra Mutabilidade e Atributos Privados (#) em Unidade">
                    <Row gutter={[16, 8]}>
                      <Col span={8}>
                        <LockOutlined style={{ color: '#52c41a' }} />{' '}
                        <code>funnel90d</code>: {dataReport.unidades.isFunnelFrozen ? <Tag color="green">Object.freeze</Tag> : <Tag color="red">Mutável</Tag>}
                      </Col>
                      <Col span={8}>
                        <LockOutlined style={{ color: '#52c41a' }} />{' '}
                        <code>healthDistribution</code>: {dataReport.unidades.isHealthFrozen ? <Tag color="green">Object.freeze</Tag> : <Tag color="red">Mutável</Tag>}
                      </Col>
                      <Col span={8}>
                        <LockOutlined style={{ color: '#52c41a' }} />{' '}
                        <code>riscoDrivers</code>: {dataReport.unidades.isDriversFrozen ? <Tag color="green">Object.freeze</Tag> : <Tag color="red">Mutável</Tag>}
                      </Col>
                    </Row>
                  </Card>

                  <Card size="small" title="Instâncias das 4 Unidades Recuperadas">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {dataReport.unidades.lista.map((u) => (
                        <div
                          key={u.id}
                          style={{
                            padding: '8px 12px',
                            background: 'var(--bg-canvas, #fafafa)',
                            border: '1px solid var(--border-subtle, #f0f0f0)',
                            borderRadius: 6
                          }}
                        >
                          <Space wrap>
                            <Badge status="processing" />
                            <strong>{u.nome}</strong>
                            <Tag color="blue">{u.id}</Tag>
                            <Tag>Porte: {u.porte}</Tag>
                            <Tag color="purple">Carteira: {u.carteiraTotalClientes}</Tag>
                            <Tag color="gold">Receita 90d: {u.receitaCarteira90d}</Tag>
                            <Tag color="volcano">Risco Absoluto: {u.riscoAbsoluto}</Tag>
                            <Tag color="green">Engajamento 7d: {u.engagementEvents7d}</Tag>
                            <Tag color="cyan">Tendência 30d: {u.engagementTrend30d}</Tag>
                          </Space>
                          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary, #666)' }}>
                            <strong>Drivers de Risco:</strong> {u.riscoDrivers.join(' · ')}
                          </div>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Space>
              )
            },
            {
              key: 'clientes',
              label: (
                <span>
                  <UserOutlined /> ClienteDAO &amp; Cliente ({dataReport.clientes.total})
                </span>
              ),
              children: (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card size="small" title="Método: listar()">
                        <p style={{ margin: 0 }}>
                          Total recuperado: <strong>{dataReport.clientes.total} clientes</strong>
                        </p>
                        <p style={{ margin: '4px 0 0 0' }}>
                          Tipo comprovado:{' '}
                          <Tag color="success">
                            instanceof Cliente ({dataReport.clientes.todosSaoInstancias ? '100%' : 'Falha'})
                          </Tag>
                        </p>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Tempo de resolução: {dataReport.clientes.tempoMs} ms
                        </Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small" title="buscarPorId('CLI-001')">
                        <p style={{ margin: 0 }}>
                          Resultado: <strong>{dataReport.clientes.buscaSucesso?.nome || 'Não encontrado'}</strong>
                        </p>
                        <Tag color="blue">id: {dataReport.clientes.buscaSucesso?.id}</Tag>
                        <Tag color="green">Score: {dataReport.clientes.buscaSucesso?.scoreSaudeAtual}</Tag>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card size="small" title="buscarPorId('CLI-999')">
                        <p style={{ margin: 0 }}>Resultado sem correspondência:</p>
                        <Tag color={dataReport.clientes.buscaNulo === null ? 'green' : 'red'}>
                          {dataReport.clientes.buscaNulo === null ? 'null (conforme contrato)' : 'Inválido'}
                        </Tag>
                      </Card>
                    </Col>
                  </Row>

                  <Card size="small" title="Filtro por Unidade: listarPorUnidade(tenantId)">
                    <Row gutter={[12, 12]}>
                      <Col span={6}>
                        <Card size="small" type="inner" title="tenant-sudeste">
                          <Tag color="blue">{dataReport.clientes.porUnidade.sudeste.length} cliente(s)</Tag>
                          <Text style={{ fontSize: 12 }}>
                            {dataReport.clientes.porUnidade.sudeste.map((c) => c.id).join(', ')}
                          </Text>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small" type="inner" title="tenant-nordeste">
                          <Tag color="blue">{dataReport.clientes.porUnidade.nordeste.length} cliente(s)</Tag>
                          <Text style={{ fontSize: 12 }}>
                            {dataReport.clientes.porUnidade.nordeste.map((c) => c.id).join(', ')}
                          </Text>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small" type="inner" title="tenant-centro-oeste">
                          <Tag color="blue">{dataReport.clientes.porUnidade.centroOeste.length} cliente(s)</Tag>
                          <Text style={{ fontSize: 12 }}>
                            {dataReport.clientes.porUnidade.centroOeste.map((c) => c.id).join(', ')}
                          </Text>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small" type="inner" title="tenant-sul">
                          <Tag color="orange">0 clientes (retorna [])</Tag>
                          <Text style={{ fontSize: 12 }}>Array vazio</Text>
                        </Card>
                      </Col>
                    </Row>
                  </Card>

                  {dataReport.clientes.primeiroCliente && (
                    <Card
                      size="small"
                      title={
                        <span>
                          <HistoryOutlined /> Exemplo de Encapsulamento: {dataReport.clientes.primeiroCliente.nome} (
                          {dataReport.clientes.primeiroCliente.id})
                        </span>
                      }
                    >
                      <Paragraph style={{ margin: 0 }}>
                        <strong>Método <code>getEventos()</code>:</strong> Retorna {dataReport.clientes.eventos.length} objetos{' '}
                        <Tag color="cyan">instanceof Evento</Tag> protegidos com{' '}
                        <Tag color="green">
                          {dataReport.clientes.isEventosFrozen ? 'Object.freeze (Imutável)' : 'Alerta: Mutável'}
                        </Tag>
                      </Paragraph>
                      <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                        <strong>Método <code>getHistoricoSaude()</code>:</strong> Retorna{' '}
                        {dataReport.clientes.historicoSaude.length} objetos{' '}
                        <Tag color="purple">instanceof RegistroSaude</Tag> protegidos com{' '}
                        <Tag color="green">
                          {dataReport.clientes.isHistoricoFrozen ? 'Object.freeze (Imutável)' : 'Alerta: Mutável'}
                        </Tag>
                      </Paragraph>
                    </Card>
                  )}
                </Space>
              )
            }
          ]}
        />
      ) : null}
    </Modal>
  );
}
