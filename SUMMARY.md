# Resumo da Arquitetura - Sistema de Agendamento para Barbearias

## Visão Geral

Este projeto implementa um sistema de agendamento para barbearias com arquitetura multi-tenant, permitindo que múltiplas barbearias utilizem a mesma plataforma com dados isolados. A aplicação é construída com Next.js 16, TypeScript, PostgreSQL, Drizzle ORM, NextAuth.js, Tailwind CSS e ShadCN UI.

## Arquitetura Principal

### Tecnologias

- **Frontend**: Next.js 16 com App Router, React 19, TypeScript
- **Estilização**: Tailwind CSS, ShadCN UI, Radix UI, Lucide React
- **Backend**: Next.js API Routes
- **Autenticação**: NextAuth.js com provedor de credenciais
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Containerização**: Docker para PostgreSQL

### Estrutura de Pastas

```
saas/
├── app/                    # Rotas e layouts da aplicação
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas de dashboard protegidas
│   └── api/               # Rotas API
├── components/            # Componentes reutilizáveis
│   └── ui/                # Componentes do ShadCN
├── lib/                   # Funções utilitárias e configurações
├── schemas/               # Esquemas do Drizzle ORM
└── ...
```

## Modelo de Dados Multi-Tenant

### Tipos de Usuários

1. **super_admin**: Acesso global, gerencia todos os tenants
2. **admin**: Administrador de um tenant específico (barbearia)
3. **barber**: Barbeiro associado a uma barbearia
4. **customer**: Cliente que agenda serviços

### Isolamento de Dados

- Cada registro inclui um `tenant_id` para identificação do tenant
- Middleware verifica o `tenant_id` em todas as requisições protegidas
- Acesso a dados de outros tenants é estritamente proibido

## Segurança

### Controle de Acesso

- Controle de acesso baseado em papéis (RBAC)
- Middleware para verificação de tenant
- Validação de esquemas com Zod
- Auditoria de ações críticas

### Estratégia de Proteção

- Verificação de permissões antes de renderizar componentes
- Interceptação de requisições API para adicionar contexto de tenant
- Validação rigorosa de parâmetros de entrada
- Criptografia de dados sensíveis

## Roteamento e Layouts

### Estratégia de Rotas

- **Rotas Públicas**: `app/page.tsx` - Acessíveis a qualquer usuário
- **Rotas de Autenticação**: `app/(auth)/` - Para usuários não autenticados
- **Rotas de Dashboard**: `app/(dashboard)/` - Para usuários autenticados com base em papel

### Estratégia de Layouts

- Layout raiz com provedores globais
- Layout de autenticação sem navegação lateral
- Layout de dashboard com navegação específica por tipo de usuário

## Componentes UI

### Estratégia de Componentes

- Componentes reutilizáveis em `components/ui/`
- Componentes específicos de domínio em `components/`
- Estilo consistente com Tailwind CSS
- Acessibilidade integrada desde o início

## Estratégia de Implementação

### Fase 1: Infraestrutura

1. Configuração do projeto Next.js 16 com TypeScript
2. Configuração do Tailwind CSS e ShadCN UI
3. Configuração do Docker e PostgreSQL
4. Configuração do Drizzle ORM
5. Configuração do NextAuth.js

### Fase 2: Autenticação e Autorização

1. Implementação de cadastro/login
2. Implementação de proteção de rotas
3. Implementação de verificação de tenant
4. Implementação de diferentes níveis de acesso

### Fase 3: Funcionalidades Core

1. CRUD de serviços
2. CRUD de barbeiros
3. Sistema de agendamento
4. Dashboards específicos por tipo de usuário

### Fase 4: Recursos Avançados

1. Notificações
2. Integração com pagamentos
3. Relatórios
4. Funcionalidades móveis

## Considerações de Performance e Escalabilidade

- Carregamento preguiçoso (lazy loading) de componentes
- Cache de dados no cliente
- Paginação para listagens grandes
- Otimização de consultas ao banco de dados
- Design multi-tenant desde o início
- Banco de dados otimizado para separação de dados por tenant
- Estrutura modular para fácil manutenção
