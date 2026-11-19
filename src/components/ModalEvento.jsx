import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col } from 'antd';
import { TagOutlined, CalendarOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const CATEGORIAS_EVENTO = [
  { value: 'sucesso', label: 'Sucesso (Renovação, Expansão, Conquista)' },
  { value: 'operacional', label: 'Operacional (Deploy, Treinamento, Integração)' },
  { value: 'comercial', label: 'Comercial (Reunião, Proposta, Alinhamento)' },
  { value: 'alerta', label: 'Alerta (Atraso pontual, Queda de engajamento)' },
  { value: 'critico', label: 'Crítico (Chamado gravíssimo, Risco de cancelamento)' },
  { value: 'relacionamento', label: 'Relacionamento (Check-in, Pesquisa NPS)' }
];

export default function ModalEvento({
  open,
  mode = 'create', // 'create' | 'edit'
  initialValues = null,
  clienteNome = '',
  onClose,
  onSubmit
}) {
  const [form] = Form.useForm();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      if (isEdit && initialValues) {
        form.setFieldsValue({
          tipo: initialValues.tipo || initialValues.titulo || '',
          categoria: initialValues.categoria || 'comercial',
          data: initialValues.data ? dayjs(initialValues.data) : dayjs(),
          descricao: initialValues.descricao || '',
          valor: initialValues.valor || ''
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          categoria: 'comercial',
          data: dayjs(),
          tipo: 'Reunião de Alinhamento Trimestral',
          descricao: 'Reunião executiva de alinhamento com a diretoria do cliente para avaliação de resultados.'
        });
      }
    }
  }, [open, isEdit, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        ...values,
        data: values.data ? values.data.toISOString() : new Date().toISOString()
      });
      onClose();
    } catch (err) {
      // Validação falhou
    }
  };

  return (
    <Modal
      title={isEdit ? `Editar Evento: ${initialValues?.tipo || 'Evento'}` : `Novo Evento na Jornada — ${clienteNome}`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText={isEdit ? 'Salvar Evento' : 'Registrar Evento'}
      cancelText="Cancelar"
      destroyOnClose
      width={580}
      okButtonProps={{ style: { fontWeight: 600 } }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="tipo"
          label="Título ou Tipo do Evento"
          rules={[
            { required: true, message: 'Informe o título do evento.' },
            { min: 3, message: 'O título deve ter pelo menos 3 caracteres.' }
          ]}
        >
          <Input
            prefix={<TagOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="Ex: Expansão de Licenças / Renovação"
            maxLength={120}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="categoria"
              label="Categoria Semântica"
              rules={[{ required: true, message: 'Selecione a categoria do evento.' }]}
            >
              <Select
                placeholder="Selecione a categoria"
                options={CATEGORIAS_EVENTO}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="data"
              label="Data e Horário do Evento"
              rules={[{ required: true, message: 'Informe a data do evento.' }]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: '100%' }}
                placeholder="Selecione data e hora"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="valor"
          label="Valor Financeiro ou Impacto (Opcional)"
        >
          <Input
            prefix={<DollarOutlined style={{ color: 'var(--text-muted)' }} />}
            placeholder="Ex: R$ 45.000 / ano (ou deixe em branco se não aplicável)"
          />
        </Form.Item>

        <Form.Item
          name="descricao"
          label="Descrição Detalhada do Evento"
          rules={[
            { required: true, message: 'Descreva os detalhes da ocorrência.' },
            { min: 5, message: 'A descrição deve ter pelo menos 5 caracteres.' }
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Detalhes, apontamentos e encaminhamentos acordados com o cliente..."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
