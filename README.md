# Sistema de Orçamentos — Refrigeração

V2 em React + Vite + Supabase, preparada para publicação na Vercel.

## Stack
- React
- Vite
- Supabase Auth
- Supabase Postgres
- Vercel

## Variáveis da Vercel
```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

## Desenvolvimento local
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Banco
A V2 usa as tabelas isoladas criadas no projeto Supabase:
- refrig_company
- refrig_clients
- refrig_equipment
- refrig_quotes
- refrig_quote_items
- refrig_service_calls

As tabelas existentes do projeto financeiro não são utilizadas pelo sistema de refrigeração.
