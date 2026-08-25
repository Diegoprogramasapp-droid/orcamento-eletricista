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

1. **Cadastro** (`/cadastro`): nome, telefone, e-mail, cidade, foto e as
   métricas — valor/hora, valor/diária, valor/ponto, margem sobre material (%),
   valor/km.
2. **Nova proposta** (`/propostas/nova`): dados do cliente, escolha do modelo
   de cobrança (hora, diária ou ponto — mutuamente exclusivos), itens de
   serviço, itens de material (cada um marcado como "do eletricista" ou "do
   cliente" — só os do eletricista entram no total, com margem aplicada),
   km de deslocamento. Cálculo automático do total.
3. **PDF**: gerado no backend (`pdfkit`), com seção separada para materiais do
   eletricista (com valor) e materiais do cliente (lista de referência, sem
   valor). Botão para abrir/enviar por WhatsApp.
4. **Lista de orçamentos** (`/propostas`): status (pendente → enviada →
   aceita → concluída), acesso rápido ao PDF.

## Persistência

Os dados agora são salvos em `backend/data/db.json`, gerado automaticamente
na primeira gravação (não precisa criar manualmente). Reiniciar o servidor
não apaga mais os orçamentos e perfis. Esse arquivo fica de fora do git
(veja `.gitignore`), então cada instalação começa com sua própria base local.

Se for testar com vários eletricistas ao mesmo tempo em produção, esse
arquivo único não escala bem (risco de duas escritas simultâneas se
sobrescreverem) — nesse ponto vale migrar para SQLite ou Postgres.

## O que falta para produção (próximos passos sugeridos)

- Migrar de `db.json` para um banco real (Postgres/SQLite) quando o número
  de usuários simultâneos crescer.
- Autenticação de verdade (hoje o "login" é só o cadastro criando um ID salvo
  no navegador).
- Envio automático via WhatsApp Business API / e-mail (hoje é um link
  `wa.me` manual).
- Deploy do backend e frontend (mesma lógica que você já usou no Ligado).
- Editar/duplicar orçamento já criado.
