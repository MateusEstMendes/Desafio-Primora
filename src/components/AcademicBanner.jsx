import React from 'react';
import { Alert, Tag, Space, Typography } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function AcademicBanner({ isMobile = false }) {
  return (
    <Alert
      style={{
        marginBottom: isMobile ? 14 : 20,
        borderRadius: 10,
        border: '1px solid rgba(104, 76, 177, 0.3)',
        background: 'linear-gradient(135deg, rgba(104, 76, 177, 0.07) 0%, rgba(14, 213, 250, 0.07) 100%)',
        padding: isMobile ? '10px 14px' : '12px 18px',
        boxShadow: '0 2px 8px rgba(104, 76, 177, 0.04)'
      }}
      message={
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 8, alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between' }}>
          <Space size="small" align="center">
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: 'linear-gradient(135deg, #684cb1 0%, #0ed5fa 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 13
              }}
            >
              <ExperimentOutlined />
            </div>
            <Text strong style={{ color: '#533898', fontSize: isMobile ? 13 : 14 }}>
              Protótipo Acadêmico — Desafio Técnico Primora & Vetor
            </Text>
          </Space>
          <Space wrap size={[6, 6]}>
            <Tag color="purple" style={{ margin: 0, fontWeight: 600 }}>Bolsa Futuro Digital</Tag>
            <Tag color="cyan" style={{ margin: 0, fontWeight: 600 }}>Dados Fictícios</Tag>
            {!isMobile && (
              <Tag style={{ margin: 0, background: '#141f2b', color: '#0ed5fa', border: 'none', fontWeight: 600 }}>
                Primora Tech
              </Tag>
            )}
          </Space>
        </div>
      }
      description={
        <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12, color: '#475569', display: 'block', marginTop: 6, lineHeight: '18px' }}>
          Painel desenvolvido para demonstração de frontend com <strong>ReactJS</strong> e <strong>Ant Design</strong>. Os dados de unidades (tenants) e clientes simulam a operação da Distribuidora Vetor.
        </Text>
      }
      type="info"
      showIcon={false}
      closable
    />
  );
}
