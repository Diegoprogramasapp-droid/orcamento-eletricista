# Orçamento Rápido — Eletricista (protótipo)

MVP do SaaS de orçamentos: pré-cadastro do eletricista com métricas de cobrança,
criação de orçamento em poucos minutos, cálculo automático e geração de PDF.

## Estrutura

```
backend/     API (Node/Express) — cálculo, PDF, dados em memória
frontend/    React + Vite — telas de cadastro, nova proposta, lista
```

## Como rodar

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Sobe em `http://localhost:3333`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:5173`.

## Fluxo implementado

1. **Entrar** (`/entrar`): eletricista já cadastrado digita o telefone e
   recupera o acesso à sua conta em qualquer dispositivo/navegador — sem
   senha, identificação simples por telefone (único por conta).
2. **Cadastro** (`/cadastro`): nome, telefone, e-mail, cidade, foto e as
   métricas — valor/hora, valor/diária, valor/ponto, margem sobre material (%),
   valor/km. Se o telefone já estiver cadastrado, direciona para "Entrar".
3. **Nova proposta** (`/propostas/nova`): dados do cliente, escolha do modelo
   de cobrança (hora, diária ou ponto — mutuamente exclusivos), itens de
   serviço, itens de material (cada um marcado como "do eletricista" ou "do
   cliente" — só os do eletricista entram no total, com margem aplicada),
   km de deslocamento. Cálculo automático do total.
4. **PDF**: gerado no backend (`pdfkit`), com seção separada para materiais do
   eletricista (com valor) e materiais do cliente (lista de referência, sem
   valor). Botão para abrir/enviar por WhatsApp.
5. **Lista de orçamentos** (`/propostas`): status (pendente → enviada →
   aceita → concluída), acesso rápido ao PDF, botão "Sair" para trocar de
   conta/dispositivo.

## Persistência

Os dados agora ficam em um banco **Postgres** (tabelas `usuarios` e
`propostas`, criadas automaticamente na primeira execução). Isso resolve o
problema de perder dados quando o serviço reinicia — algo comum em planos
gratuitos de hospedagem.

Para rodar local, defina a variável de ambiente `DATABASE_URL` apontando
para um Postgres (local ou gratuito na nuvem) antes de `npm run dev`:

```bash
export DATABASE_URL="postgres://usuario:senha@host:5432/banco"
npm run dev
```

No Render, ao criar um banco Postgres e conectá-lo ao Web Service, a
variável `DATABASE_URL` é preenchida automaticamente — não precisa fazer
nada manual além de vincular o banco ao serviço.

## O que falta para produção (próximos passos sugeridos)

- Autenticação de verdade (hoje o "login" é só o cadastro criando um ID salvo
  no navegador).
- Envio automático via WhatsApp Business API / e-mail (hoje é um link
  `wa.me` manual).
- Deploy do backend e frontend (mesma lógica que você já usou no Ligado).
- Editar/duplicar orçamento já criado.
