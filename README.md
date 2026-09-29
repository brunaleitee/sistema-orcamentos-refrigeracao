# Frios&Clima — V1

V1 frontend responsivo para gestão de orçamentos, financeiro e chamados de uma empresa de refrigeração.

## O que já funciona
- Layout desktop e mobile
- Sidebar responsiva
- Navegação entre Início, Orçamentos, Financeiro, Chamados e Configurações
- Busca global de orçamentos
- Listagem e filtros visuais de status
- Detalhe de orçamento
- Cards de acompanhamento
- Dashboard financeiro demonstrativo
- Chamados derivados de orçamentos aprovados

## Importante
Esta V1 é uma base de interface. Os dados são demonstrativos e ainda não ficam salvos em banco.
A V2 deve conectar Supabase para autenticação, clientes, equipamentos, serviços, orçamentos, status e chamados.

## Rodar localmente
Requer Node.js 18+.

```bash
npm install
npm run dev
```

## Publicar na Vercel
1. Crie um repositório NOVO no GitHub, separado dos seus outros projetos.
2. Envie todos os arquivos desta pasta para o repositório.
3. Na Vercel, clique em Add New → Project.
4. Importe somente esse novo repositório.
5. Framework: Vite (a Vercel normalmente detecta automaticamente).
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Clique em Deploy.

Não são necessárias variáveis de ambiente na V1.
