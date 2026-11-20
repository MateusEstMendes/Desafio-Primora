import React from 'react';
import { Modal, Table, Button, Tag, Typography, Alert, Empty } from 'antd';
import { DeleteOutlined, UndoOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { calcularDiasRestantes } from '../utils/clienteStorage';

export default function ModalLixeira({
  open,
  clientesDesativados = [],
  onClose,
  onReativarCliente
}) {
  const columns = [
    {
      title: 'Conta / Cliente',
      key: 'nome',
      render: (_, r) => (
        <div>
          <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{r.nome}</strong>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-roboto-mono)' }}>
            {r.id} • {r.unidadeNome?.replace('Unidade ', '') || r.tenantId}
          </span>
        </div>
      )
    },
    {
      title: 'Desativado em',
      dataIndex: 'desativadoEm',
      key: 'desativadoEm',
      render: (val) => (
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '—'}
        </span>
      )
    },
    {
      title: 'Carência (15 dias)',
      key: 'prazo',
      render: (_, r) => {
        const dias = calcularDiasRestantes(r.excluirEm);
        const dataFinal = r.excluirEm ? dayjs(r.excluirEm).format('DD/MM/YYYY') : '';
        return (
          <div>
            <Tag color={dias <= 3 ? 'error' : dias <= 7 ? 'warning' : 'blue'}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {dias === 1 ? '1 dia restante' : `${dias} dias restantes`}
            </Tag>
            {dataFinal && (
              <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Expurgo em {dataFinal}
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          icon={<UndoOutlined />}
          onClick={() => onReativarCliente(r.id)}
          style={{ fontWeight: 600, borderRadius: 6 }}
        >
          Reativar Conta
        </Button>
      )
    }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DeleteOutlined style={{ color: 'var(--status-critical)' }} />
          <span>Lixeira e Contas em Desativação ({clientesDesativados.length})</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Fechar
        </Button>
      ]}
      width={720}
      destroyOnClose
    >
      <div style={{ padding: '8px 0' }}>
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message="Regra de Carência de 15 Dias"
          description="As contas desativadas ficam 100% ocultas de todas as listagens operacionais do painel. A exclusão definitiva é executada automaticamente pelo sistema após completados os 15 dias corridos. Você pode reativar a conta a qualquer momento durante este prazo."
          style={{ marginBottom: 16 }}
        />

        {clientesDesativados.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhuma conta em período de desativação."
            style={{ padding: '24px 0' }}
          />
        ) : (
          <Table
            dataSource={clientesDesativados.map((c) => ({ ...c, key: c.id }))}
            columns={columns}
            pagination={clientesDesativados.length > 5 ? { pageSize: 5, size: 'small' } : false}
            size="small"
          />
        )}
      </div>
    </Modal>
  );
}
