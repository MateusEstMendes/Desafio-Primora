# Configuração do Banco de Dados no Supabase + Bot Anti-Pausa (Keep-Alive)

Este guia orienta a criação do banco de dados na nuvem com **PostgreSQL** no Supabase e a ativação do bot para impedir que o banco entre em pausa por inatividade (regra de 7 dias do plano gratuito).

---

## 🚀 Passo 1: Criar o Projeto no Supabase

1. Acesse **[supabase.com](https://supabase.com)** e crie ou faça login na sua conta.
2. Clique no botão **"New Project"**.
3. Preencha as informações:
   * **Name:** `desafio-primora` (ou o nome que preferir)
   * **Database Password:** Escolha uma senha forte e guarde-a
   * **Region:** Escolha `São Paulo (sa-east-1)` para menor latência
4. Clique em **"Create new project"** e aguarde cerca de 1 a 2 minutos para o provisionamento.

---

## 🗄️ Passo 2: Criar as Tabelas e Povoar os Dados (Seed)

1. No menu lateral esquerdo do painel do Supabase, clique no ícone **"SQL Editor"** (ícone `>_`).
2. Clique em **"New Query"**.
3. Abra o arquivo [`supabase/schema_completo.sql`](./schema_completo.sql) deste projeto, copie todo o conteúdo e cole no editor do Supabase.
4. Clique no botão verde **"RUN"** (ou aperte `Ctrl + Enter`).
5. Pronto! Todas as tabelas (`tenants`, `clientes`, `cliente_historico_saude`, `cliente_eventos`), índices, políticas RLS e os dados oficiais foram criados com sucesso.
   * Você pode conferir os dados clicando em **"Table Editor"** no menu lateral.

---

## 🔑 Passo 3: Obter as Credenciais da API

1. No menu lateral esquerdo do Supabase, clique no ícone de engrenagem **"Project Settings"**.
2. Clique no menu **"API"**.
3. Copie os seguintes valores:
   * **Project URL:** `https://xxxxxxxxxxxxxxxx.supabase.co`
   * **Project API keys (anon / public):** `eyJhbGciOiJIUzI1NiIsIn...`
4. Crie ou edite o arquivo `.env` na raiz do projeto:
   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

---

## 🤖 Passo 4: Ativar o Bot Anti-Pausa (Keep-Alive)

O Supabase pausa automaticamente bancos no plano gratuito após **7 dias sem requisições**. Criamos duas soluções para evitar isso:

### Método A: 100% Automático na Nuvem via GitHub Actions (Recomendado)
Não precisa do seu computador estar ligado! O GitHub executa uma requisição a cada 3 dias para renovar o banco.

1. No seu repositório no GitHub (`MateusEstMendes/Desafio-Primora` ou no seu fork):
2. Vá em **Settings** > **Secrets and variables** > **Actions**.
3. Clique em **"New repository secret"** e crie os 2 segredos:
   * Nome: `SUPABASE_URL` | Valor: sua URL do Supabase
   * Nome: `SUPABASE_ANON_KEY` | Valor: sua chave `anon` do Supabase
4. Pronto! O workflow `.github/workflows/supabase-keepalive.yml` rodará a cada 3 dias e manterá seu banco acordado para sempre.

### Método B: Rodar o Bot Localmente
Para testar o bot ou disparar uma requisição manual pelo terminal:

```bash
# Executa um ping único
npm run keepalive

# Executa em modo contínuo (ping a cada 48 horas)
npm run keepalive:watch
```
