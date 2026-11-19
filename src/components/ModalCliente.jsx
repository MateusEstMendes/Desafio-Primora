import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col } from 'antd';
import { UserOutlined, ShopOutlined, DollarOutlined, ClockCircleOutlined, HeartOutlined } from '@ant-design/icons';

const SEGMENTOS_SUGERIDOS = [
  'Varejo Alimentício',
  'Atacado Distribuidor',
  'Varejo Farmacêutico',
  'Logística & Transportes',
  'Tecnologia & Serviços',
  'Indústria de Transformação',
  'Construção Civil',
  'Comércio Eletrônico',
  'Outro'
];

export default function ModalCliente({
  open,
  mode = 'create', // 'create' | 'edit'
  initialValues = null,
  tenants = [],
  onClose,
  onSubmit
}) {
  const [form] = Form.useForm();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      if (isEdit && initialValues) {
        form.setFieldsValue({
          nome: initialValues.nome || '',
          tenantId: initialValues.tenantId || tenants[0]?.id || '',
          segmento: initialValues.segmento || '',
          ticketMedioMensal: initialValues.ticketMedioMensal || '',
          tempoContratoMeses: initialValues.tempoContratoMeses ?? 12,
          scoreSaudeAtual: initialValues.scoreSaudeAtual ?? 80
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          tenantId: tenants[0]?.id || 'tenant-sudeste',
          tempoContratoMeses: 12,
          scoreSaudeAtual: 80,
          ticketMedioMensal: 'R$ 35.000 / mês',
          segmento: 'Varejo Alimentício'
        });
      }
    }
  }, [open, isEdit, initialValues, tenants, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      onClose();
    } catch (err) {
      // Validação falhou, o Form do AntD mostra os erros nos campos
    }
  };

  return (
    <Modal
      title={isEdit ? `Editar Conta: ${initialValues?.nome || 'Cliente'}` : 'Cadastrar Novo Cliente B2B'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? 'Salvar Alterações' : 'Criar Cliente'}
      cancelText="Cancelar"
      destroyOnClose
      width={600}
      okButtonProps={{ style: { fontWeight: 600 } }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="nome"
          label="Razão Social / Nome da Conta"
          rules={[
            { required: true, message: 'Por favor, informe o nome ou razão social do cliente.' },
            { min: 3, message: 'O nome deve ter pelo menos 3 caracteres.' }
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="Ex: Supermercado Progresso Ltda"
            maxLength={100}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="tenantId"
              label="Unidade Regional Vinculada"
              rules={[{ required: true, message: 'Selecione a unidade regional.' }]}
            >
              <Select placeholder="Selecione a Unidade">
                {tenants.map((t) => (
                  <Select.Option key={t.id} value={t.id}>
                    {t.nome} ({t.regiao || t.id})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="segmento"
              label="Segmento de Mercado"
              rules={[{ required: true, message: 'Informe o segmento de atuação.' }]}
            >
              <Select
                placeholder="Selecione ou digite"
                showSearch
                options={SEGMENTOS_SUGERIDOS.map((s) => ({ value: s, label: s }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="ticketMedioMensal"
              label="Ticket Médio Mensal"
              rules={[{ required: true, message: 'Informe o ticket médio.' }]}
            >
              <Input
                prefix={<DollarOutlined style={{ color: 'var(--text-muted)' }} />}
                placeholder="Ex: R$ 45.000 / mês"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="tempoContratoMeses"
              label="Tempo de Contrato (Meses)"
              rules={[{ required: true, message: 'Informe a duração do contrato em meses.' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={240}
                prefix={<ClockCircleOutlined style={{ color: 'var(--text-muted)' }} />}
                addonAfter="meses"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="scoreSaudeAtual"
          label={
            <span>
              <HeartOutlined style={{ marginRight: 6, color: 'var(--status-success)' }} />
              Score de Saúde Inicial (0 a 100 pts)
            </span>
          }
          extra="Classificação: ≥ 70 Saudável | 40 a 69 Atenção | < 40 Crítico"
          rules={[
            { required: true, message: 'Informe o score de saúde.' },
            { type: 'number', min: 0, max: 100, message: 'O score deve estar entre 0 e 100.' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={100}
            addonAfter="pts"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
