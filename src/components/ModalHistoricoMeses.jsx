import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Table, Tag, Popconfirm, Slider, Typography, Divider, message } from 'antd';
import { PlusOutlined, DeleteOutlined, CalendarOutlined, HeartOutlined, EditOutlined } from '@ant-design/icons';

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function sugerirProximoPeriodo(historico = []) {
  if (!historico || !historico.length) return 'Nov/2026';
  const ultimo = historico[historico.length - 1]?.periodo || '';
  const partes = String(ultimo).split('/');
  if (partes.length === 2) {
    const mesIdx = MESES_ABREV.indexOf(partes[0].trim());
    let ano = parseInt(partes[1].trim(), 10);
    if (mesIdx !== -1 && !isNaN(ano)) {
      if (mesIdx === 11) {
        return `Jan/${ano + 1}`;
      } else {
        return `${MESES_ABREV[mesIdx + 1]}/${ano}`;
      }
    }
  }
  return 'Nov/2026';
}

export default function ModalHistoricoMeses({
  open,
  cliente,
  onClose,
  onAddMes,
  onUpdateMes,
  onDeleteMes
}) {
  const [form] = Form.useForm();
  const [scoreVal, setScoreVal] = useState(85);
  const [editingPeriodo, setEditingPeriodo] = useState(null);
  const [editingScore, setEditingScore] = useState(80);

  const historico = cliente?.historicoScore || [];

  const handleOpenModal = () => {
    const proximoPeriodo = sugerirProximoPeriodo(historico);
    const ultimoScore = historico.length ? historico[historico.length - 1].score : 80;
    form.setFieldsValue({
      periodo: proximoPeriodo,
      score: ultimoScore
    });
    setScoreVal(ultimoScore);
    setEditingPeriodo(null);
  };

  const handleAddSubmit = async () => {
    try {
      const values = await form.validateFields();
      onAddMes({
        periodo: values.periodo.trim(),
        score: Number(values.score)
      });
      message.success(`Mês ${values.periodo} adicionado ao histórico!`);
      // Prepara o formulário para o mês seguinte
      const novoProximo = sugerirProximoPeriodo([...historico, { periodo: values.periodo, score: values.score }]);
      form.setFieldsValue({ periodo: novoProximo });
    } catch (err) {
      // Validação falhou
    }
  };

  const handleSaveEdit = (periodo) => {
    onUpdateMes(periodo, {
      periodo,
      score: Number(editingScore)
    });
    message.success(`Score de ${periodo} atualizado para ${editingScore} pts!`);
    setEditingPeriodo(null);
  };

  const columns = [
    {
      title: 'Período',
      dataKey: 'periodo',
      key: 'periodo',
      render: (_, r) => <strong>{r.periodo}</strong>
    },
    {
      title: 'Score',
      dataKey: 'score',
      key: 'score',
      render: (_, r) => {
        if (editingPeriodo === r.periodo) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <InputNumber
                min={0}
                max={100}
                size="small"
                value={editingScore}
                onChange={setEditingScore}
                style={{ width: 70 }}
              />
              <Button size="small" type="primary" onClick={() => handleSaveEdit(r.periodo)}>
                OK
              </Button>
              <Button size="small" onClick={() => setEditingPeriodo(null)}>
                X
              </Button>
            </div>
          );
        }
        return (
          <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {r.score} pts
          </span>
        );
      }
    },
    {
      title: 'Classificação',
      key: 'status',
      render: (_, r) => {
        const s = r.score;
        const color = s >= 70 ? 'success' : s >= 40 ? 'warning' : 'error';
        const label = s >= 70 ? 'Saudável' : s >= 40 ? 'Atenção' : 'Crítico';
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {editingPeriodo !== r.periodo && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingPeriodo(r.periodo);
                setEditingScore(r.score);
              }}
              title="Editar pontuação deste mês"
            />
          )}
          <Popconfirm
            title={`Excluir o período ${r.periodo}?`}
            description="Essa ação removerá este ponto da evolução do score de saúde."
            okText="Excluir"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              onDeleteMes(r.periodo);
              message.success(`Mês ${r.periodo} removido do histórico.`);
            }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} title="Excluir período" />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined style={{ color: 'var(--brand-primary)' }} />
          <span>Evolução e Adição de Meses — {cliente?.nome || 'Cliente'}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Concluir
        </Button>
      ]}
      afterOpenChange={(isOpen) => isOpen && handleOpenModal()}
      destroyOnClose
      width={640}
    >
      <div style={{ padding: '8px 0' }}>
        <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
          Adicione novos meses ou edite pontuações históricas da conta. O gráfico de tendência e o Score de Saúde Atual serão recalculados automaticamente em tempo real.
        </Typography.Paragraph>

        {/* Formulário de Adicionar Mês */}
        <div
          style={{
            background: 'var(--bg-canvas)',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20
          }}
        >
          <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>
            <PlusOutlined style={{ marginRight: 6 }} />
            Adicionar Novo Mês / Período
          </Typography.Text>

          <Form form={form} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item
                name="periodo"
                label="Mês / Período (Ex: Nov/2026)"
                rules={[{ required: true, message: 'Informe o período (ex: Nov/2026).' }]}
              >
                <Input placeholder="Ex: Nov/2026" />
              </Form.Item>

              <Form.Item
                name="score"
                label={
                  <span>
                    <HeartOutlined style={{ marginRight: 4, color: 'var(--status-success)' }} />
                    Score de Saúde (0 a 100)
                  </span>
                }
                rules={[{ required: true, message: 'Informe a pontuação.' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  addonAfter="pts"
                  value={scoreVal}
                  onChange={(val) => setScoreVal(val ?? 0)}
                />
              </Form.Item>
            </div>

            <div style={{ marginBottom: 14 }}>
              <Slider
                min={0}
                max={100}
                value={scoreVal}
                onChange={(val) => {
                  setScoreVal(val);
                  form.setFieldsValue({ score: val });
                }}
                marks={{
                  0: '0',
                  40: { style: { color: 'var(--status-critical)' }, label: '40 (Crítico)' },
                  70: { style: { color: 'var(--status-success)' }, label: '70 (Saudável)' },
                  100: '100'
                }}
              />
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSubmit}
              style={{ fontWeight: 600 }}
            >
              Adicionar Mês à Série
            </Button>
          </Form>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Tabela de Meses Cadastrados */}
        <Typography.Text strong style={{ display: 'block', marginBottom: 10 }}>
          Meses Registrados na Série ({historico.length})
        </Typography.Text>

        <Table
          dataSource={historico.map((item, index) => ({ ...item, key: item.periodo || index }))}
          columns={columns}
          pagination={historico.length > 6 ? { pageSize: 6, size: 'small' } : false}
          size="small"
        />
      </div>
    </Modal>
  );
}
