# Painel Vetor — Sprint 6

Painel de consulta das unidades e contas B2B da Distribuidora Vetor. Frontend React/Vite e Ant Design, API própria Node.js/Express 5 em JavaScript ES Modules. Requer Node.js 22.12+ e npm.

## Instalação e execução

```bash
npm install
```

Em um terminal, inicie o backend:

```bash
npm run dev:server
```

Em outro terminal, inicie o frontend:

```bash
npm run dev
```

Abra http://localhost:5173 ou http://127.0.0.1:5173. A API usa http://localhost:3001/api/v1. O frontend consulta os dois endpoints em paralelo e só apresenta o painel quando ambos concluem. Falhas exibem mensagem e botão **Tentar novamente**, sem fallback local. Apenas a preferência de tema é persistida no navegador.

## Configuração

Veja [.env.example](.env.example). O Vite lê `VITE_API_BASE_URL` de `.env.local`; a URL deve incluir `/api/v1`. A variável é incorporada durante o build, portanto reinicie o Vite após alterá-la.

| Variável | Padrão | Uso |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:3001/api/v1` | Endereço HTTP da API acessível pelo navegador |
| `PORT` | `3001` | Porta do backend |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Origens do frontend separadas por vírgulas |

O backend lê variáveis do ambiente do processo. `localhost` e `127.0.0.1` são origens diferentes; ambas são permitidas por padrão. Se definir `CORS_ORIGINS`, inclua todos os endereços usados para abrir o frontend e reinicie o backend. Exemplo em Bash:

```bash
PORT=3001 CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173 npm run start:server
```

Para carregar um arquivo de ambiente no backend com Node:

```bash
node --env-file=.env.example server/index.js
```

## Contrato HTTP

| Método | Caminho | Resposta 200 |
| --- | --- | --- |
| GET | `/api/v1/unidades` | Array com as 4 unidades completas |
| GET | `/api/v1/clientes` | Array com os 3 clientes completos, eventos e históricos |

```bash
curl http://localhost:3001/api/v1/unidades
curl http://localhost:3001/api/v1/clientes
```

As respostas são arrays diretos, sem envelope, paginação ou filtros. Os registros preservam todos os campos e aliases de `server/data/dataset_painel_multitenant.json`. A API valida a estrutura na inicialização. Rotas de escrita não existem. Não há banco de dados, autenticação ou dependência do n8n; CORS controla as origens permitidas no navegador e não substitui autenticação.

## Organização

- `server/app.js`: criação do aplicativo Express e rotas de consulta.
- `server/index.js`: escuta HTTP em `0.0.0.0`.
- `server/dataset.js`: leitura e validação do dataset estático.
- `src/config/api.js`: cliente HTTP compartilhado, configuração e tratamento de erros.
- `src/dao/`: cinco consultas assíncronas; o transporte HTTP pode ser injetado nos testes.
- `src/models/`: quatro classes com encapsulamento, associações e normalização de aliases.
- `src/App.jsx`: carregamento conjunto, tentativa após falha e descarte de respostas obsoletas.
- `src/pages/`: Visão Geral, Comparativo e Histórico de Clientes, somente consulta.

As buscas por ID retornam modelo ou `null`; o filtro de clientes por unidade retorna array. O frontend transforma os modelos com `toJSON()` e mantém os cálculos, filtros e indicadores. Campos ausentes permanecem ausentes nos modelos. Os históricos exibidos usam amostras do dataset, sem estimar a evolução da carteira.

## Verificação

```bash
npm test
npm run build
```

Também disponíveis: `npm run test:metrics`, `npm run test:dao` e `npm run test:api`.

Os testes de API iniciam HTTP local em uma porta livre, comparam registros completos, verificam CORS e ausência de escrita. Os testes de domínio e DAO verificam instâncias, encapsulamento, associações, IDs inexistentes e filtros vazios. O cliente HTTP é verificado com falha de conexão, status de erro, JSON inválido, formato diferente de array e configuração inválida.

Evidência obtida nesta implementação: testes de métricas, 77 verificações de domínio/DAO e 6 testes de API aprovados; build Vite concluído. No Chromium, as três telas foram verificadas com sucesso, erro e arrays vazios; também foram confirmados carregamento conjunto, nova tentativa, ausência de ações de escrita e descarte dos clientes antigos do localStorage, sem erros JavaScript. O Vite emite aviso sobre chunks acima de 500 kB.

## Roteiro de demonstração

1. Inicie backend e frontend. Abra a aba Network do navegador e confirme GETs a `/api/v1/unidades` e `/api/v1/clientes`.
2. Navegue por Visão Geral, Comparativo e Histórico de Clientes. Selecione uma unidade, consulte gráficos, filtros e linha do tempo.
3. Selecione Sul e confirme a ausência de clientes vinculados.
4. Recarregue com rede lenta para observar o carregamento; o painel aguarda ambas as consultas.
5. Pare a API e recarregue para observar o erro. Reinicie-a e clique em **Tentar novamente**.
6. Para demonstrar arrays vazios, use interceptação de respostas no navegador ou um servidor de teste que retorne `[]` nos dois endpoints. O painel apresenta ausência de resultados.
7. Confirme que registros antigos em `painel_vetor_clientes` no localStorage não alteram os dados exibidos e que não existem ações de cadastro, edição ou exclusão.

## Produção

```bash
npm run build
npm run start:server
```

Sirva `dist/` em hospedagem estática e execute o backend em serviço Node separado. Configure `VITE_API_BASE_URL` antes do build e `PORT`/`CORS_ORIGINS` no ambiente do backend. `npm run preview` serve apenas para conferir o build localmente. Esta entrega não inclui contratação nem publicação em hospedagem.
