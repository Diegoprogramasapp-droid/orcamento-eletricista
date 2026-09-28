# Orçamento Rápido — Eletricista

MVP do SaaS de orçamentos: cadastro do eletricista com PIN de acesso e
métricas de cobrança, criação de orçamento em poucos minutos, cálculo
automático e geração de PDF profissional.

## Estrutura

```
backend/     API (Node/Express + Postgres) — cálculo, PDF, autenticação
frontend/    React + Vite — telas de cadastro, login, nova proposta, lista
```

## Como rodar

### Backend
```bash
cd backend
npm install
export DATABASE_URL="postgres://usuario:senha@host:5432/banco"
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Fluxo implementado

1. **Cadastro** (`/cadastro`): nome, telefone, PIN de acesso (4-6 números),
   e-mail, cidade, logomarca e métricas de cobrança (valor/hora, diária,
   ponto, margem sobre material, valor/km). PIN salvo com hash (bcrypt),
   nunca em texto puro.
2. **Entrar** (`/entrar`): telefone + PIN — recupera a conta em qualquer
   dispositivo/navegador.
3. **Nova proposta**: modelo de cobrança único por orçamento (hora/diária/
   ponto), itens de serviço, materiais marcados como do eletricista (com
   margem) ou do cliente (referência, sem cobrança), deslocamento.
4. **PDF**: não expõe a métrica interna (horas/pontos/diária) ao cliente
   final, só valores. Logomarca no cabeçalho, títulos com sublinhado,
   moeda em padrão brasileiro (vírgula decimal).
5. **Lista de orçamentos**: status (pendente → enviada → aceita →
   concluída), acesso ao PDF, botão Sair.

## Persistência

Postgres, com tabelas criadas/migradas automaticamente na primeira
execução (`initDB()` em `server.js`).

## Próximos passos sugeridos

- Editar perfil e editar/duplicar orçamento já criado.
- Controle de status de assinatura (trial/ativo/bloqueado) e vencimento.
- Termos de uso / política de privacidade básica.
