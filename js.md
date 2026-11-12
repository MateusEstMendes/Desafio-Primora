SPRINT 5 | Modelagem de domínio, encapsulamento e
DAOs
Empresa parceira: Primora | Desafio: Painel de Inteligência Multi-tenant
Projeto: Projeto Integrador — Bolsa Futuro Digital | Etapa: 5 de 7 sprints
Início: 09/11/2026 (segunda-feira) | Entrega: 12/11/2026 (quinta-feira)
1. Objetivo didático
Organizar a camada de dados do protótipo ReactJS com classes de domínio orientadas a objetos, atributos privados e
métodos de acesso; implementar DAOs que centralizem as consultas e preparem a futura comunicação com backend,
sem exigir um servidor nesta entrega.
2. Continuidade das Sprints 1 a 4
Preservar as três telas, a navegação, os componentes Ant Design, a leitura de JSON e as seleções implementadas
anteriormente. Nesta sprint, a prioridade é construir e demonstrar a camada de modelos e DAOs; a substituição
completa do acesso a dados nas telas fica para a Sprint 6.
3. Classes de domínio obrigatórias
Classe Atributos e responsabilidades
Unidade id, nome, porte, carteiraTotalClientes, receitaCarteira90d, engagementEvents7d,
activeUsers7d, engagementTrend30d, funnel90d, funnelTrend30d, healthDistribution,
riscoAbsoluto e riscoDrivers.

Cliente id, nome, tenantId, tenantNome, healthSeries e eventos. Preservar o vínculo com Unidade por

tenantId.

Evento data, tipo, titulo e valor (opcional); não criar id obrigatório ausente do dataset.
RegistroSaude data e score, conforme cada item de healthSeries.
Regras: usar atributos privados (#), getters e validações pertinentes. Não expor referências mutáveis internas sem
proteção; manter nomes e formatos dos campos de origem ao converter os registros.
4. Classes DAO e contrato de consulta
DAO Método obrigatório Resultado esperado / fonte
UnidadeDAO listar() Array de instâncias de Unidade a partir de tenants.
UnidadeDAO buscarPorId(id) Instância de Unidade ou null.
ClienteDAO listar() Array de instâncias de Cliente a partir de clientes.
ClienteDAO buscarPorId(id) Instância de Cliente ou null.
ClienteDAO listarPorUnidade(tenantId) Array de clientes cujo tenantId corresponde ao informado.
Os métodos devem ser assíncronos (async/Promise). Quando aplicável, converter os registros consultados em
instâncias das classes de domínio; retornar null para busca sem correspondência e array vazio para listagem sem
registros.
5. Atividades e entregáveis
• Implementar quatro classes de domínio: Unidade, Cliente, Evento e RegistroSaude.

Sprint 5 de 7 | Primora | Projeto Integrador — Bolsa Futuro Digital 2
• Implementar UnidadeDAO e ClienteDAO com os cinco métodos previstos no contrato pedagógico.
• Converter eventos e healthSeries de cada cliente em objetos encapsulados; fornecer métodos getEventos() e
getHistoricoSaude().
• Demonstrar consultas das quatro unidades e dos três clientes, incluindo clientes vinculados a uma unidade.
• Atualizar README com exemplo de consulta e esclarecimento de que o contrato DAO é acadêmico.
6. Limites e decisões de arquitetura
• Não existe contrato HTTP fornecido pela Primora: os métodos DAO são definidos pedagogicamente com base no
dataset.
• Nesta sprint, consultar o JSON local; não exigir API REST, backend, banco de dados ou persistência de alterações.
• Não criar DAOs independentes para Evento e RegistroSaude: são coleções aninhadas em Cliente.
• Não exigir salvar(), atualizar(), excluir(), ranking ou indicadores proporcionais nesta etapa.
• Preservar dados e nomes de campos existentes; não inventar novos registros ou indicadores.
7. Critérios de aceite
• Os quatro modelos usam atributos privados e acesso controlado.
• UnidadeDAO recupera quatro unidades e busca por identificador.
• ClienteDAO recupera três clientes, busca por identificador e filtra por tenantId.
• Cliente permite recuperar seus eventos e histórico de saúde como objetos, sem exposição mutável indevida.
• Métodos assíncronos, documentação e demonstração funcional concluídos.
8. Avaliação — 100 pontos
Critério Pontos
Classes de modelo e coerência com o domínio 20
Encapsulamento, getters e validações 25
DAOs e consultas assíncronas 30
Separação de responsabilidades e organização do código 15
README, testes demonstrativos e apresentação 10
TOTAL 100
9. Entrega e demonstração
Até 12/11/2026, atualizar o repositório GitHub e o README com a estrutura de pastas, instruções de execução, classes
criadas, métodos dos DAOs e exemplos de uso. Na demonstração, instanciar os DAOs, executar consultas e comprovar
que os resultados são objetos das classes de domínio.
Observações específicas
• Fonte: dataset_painel_multitenant.json disponibilizado pela Primora.
• Contrato pedagógico de DAOs: não constitui API oficial da empresa.
• As coleções do JSON são tenants e clientes; os eventos ficam aninhados em cada cliente.