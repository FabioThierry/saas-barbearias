# Arquitetura do Sistema de Agendamento para Barbearias

## Visão Geral

Este documento descreve a arquitetura do sistema de agendamento para barbearias, um sistema multi-tenant construído com Next.js 16, TypeScript, PostgreSQL, Drizzle ORM, Better Auth, Tailwind CSS e ShadCN UI.

## Tecnologias Utilizadas

- **Next.js 16**: Framework React com App Router para construção da aplicação
- **TypeScript**: Linguagem de programação com tipagem estática
- **PostgreSQL**: Banco de dados relacional para armazenamento persistente
- **Drizzle ORM**: Mapeamento objeto-relacional para interação com o banco de dados
- **Better Auth**: Solução de autenticação moderna e segura
- **Tailwind CSS**: Framework CSS utilitário para estilização
- **ShadCN UI**: Biblioteca de componentes acessíveis e customizáveis
- **Docker**: Plataforma para virtualização de containers para PostgreSQL

## Estrutura de Pastas

```
saas/
├── app/
│   ├── layout.tsx                 # Layout raiz da aplicação
│   ├── page.tsx                   # Página inicial pública
│   ├── api/                       # Rotas API
│   ├── (auth)/                    # Grupo de rotas para autenticação
│   │   ├── layout.tsx            # Layout para páginas de autenticação
│   │   └── signin/               # Página de login
│   ├── (dashboard)/              # Grupo de rotas para dashboards
│   │   ├── layout.tsx            # Layout para páginas de dashboard
│   │   ├── page.tsx              # Dashboard padrão
│   │   ├── admin/                # Dashboard específico para administradores
│   │   ├── barber/               # Dashboard específico para barbeiros
│   │   └── customer/             # Dashboard específico para clientes
│   ├── globals.css              # Estilos globais
│   └── providers/               # Provedores de contexto e estado
├── components/
│   ├── ui/                      # Componentes reutilizáveis do ShadCN
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── (seus componentes personalizados)/
├── lib/
│   ├── auth.ts                  # Funções auxiliares de autenticação
│   ├── db.ts                    # Configuração e conexão com o banco de dados
│   ├── validations/             # Esquemas de validação (Zod)
│   └── utils.ts                 # Funções utilitárias
├── schemas/                     # Esquemas do Drizzle ORM
│   ├── index.ts                 # Exportação de todos os esquemas
│   ├── users.ts                 # Esquema de usuários
│   ├── tenants.ts               # Esquema de tenants
│   ├── services.ts              # Esquema de serviços
│   ├── appointments.ts          # Esquema de agendamentos
│   └── ...
├── proxy.ts                    # Middleware para proteção de rotas
├── auth.config.ts              # Configuração do Better Auth
├── drizzle.config.ts           # Configuração do Drizzle ORM
├── docker-compose.yml          # Configuração do Docker para PostgreSQL
├── .env                        # Variáveis de ambiente
├── .gitignore                  # Arquivos e diretórios ignorados pelo Git
├── next.config.ts              # Configuração do Next.js
├── package.json                # Dependências e scripts do projeto
├── README.md                   # Documentação do projeto
└── tsconfig.json               # Configuração do TypeScript
```

## Dependências Necessárias

### Produção:

- `next`: Framework React para renderização do lado do servidor e client-side routing
- `react`, `react-dom`: Biblioteca fundamental para construção de interfaces de usuário
- `postgresql`, `drizzle-orm`, `@neondatabase/serverless`: Banco de dados PostgreSQL e ORM para interação segura com o banco
- `@better-auth/node`, `@better-auth/adapter-drizzle`: Solução completa de autenticação com suporte a múltiplos provedores e persistência
- `tailwindcss`: Framework CSS utilitário para estilização rápida e responsiva
- `@radix-ui/react-*`: Componentes primitivos acessíveis para construção de designs personalizados
- `lucide-react`: Biblioteca de ícones consistente e leve
- `class-variance-authority`, `clsx`, `tailwind-merge`: Utilitários para composição dinâmica de classes CSS
- `zod`: Biblioteca de validação de esquemas para TypeScript com inferência de tipo
- `date-fns`: Biblioteca moderna para manipulação de datas e horas
- `bcryptjs`: Biblioteca para hashing seguro de senhas
- `@hookform/resolvers`: Integração entre React Hook Form e bibliotecas de validação como Zod

### Desenvolvimento:

- `typescript`, `@types/node`, `@types/react`, `@types/react-dom`: Tipagem estática para segurança de tipo
- `drizzle-kit`: Ferramentas de migração e geração de código para Drizzle ORM
- `tailwindcss`, `postcss`, `autoprefixer`: Configuração de estilos e transformações CSS
- `eslint`, `eslint-config-next`: Linting para manter código consistente e identificar problemas
- `@types/bcryptjs`: Tipos para a biblioteca bcryptjs

## Configuração do Banco de Dados

### Docker Compose

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    container_name: barbershop_db
    environment:
      POSTGRES_DB: barbershop
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Drizzle ORM

- Arquivo de configuração: `drizzle.config.ts`
- Localização dos esquemas: `schemas/`
- Localização das migrações: `drizzle/migrations/`

#### Configuração Principal

- Driver: `pg` para PostgreSQL
- Schema: Localizado em `schemas/index.ts` para exportação centralizada
- Migrações: Geradas automaticamente com `drizzle-kit`
- Conexão: Utiliza variáveis de ambiente para string de conexão

#### Estratégia de Migrações

- Migrações declarativas definidas nos esquemas
- Geração automática de migrações com `drizzle-kit generate`
- Aplicação de migrações com `drizzle-kit up`
- Estratégia de versionamento para garantir consistência entre ambientes

## Modelo de Dados Multi-Tenant

### Tipos de Usuários

1. **super_admin**: Acesso global ao sistema, gerencia tenants
2. **admin**: Administrador de um tenant específico (barbearia)
3. **barber**: Barbeiro associado a uma barbearia
4. **customer**: Cliente que agenda serviços

### Estratégia de Isolamento de Dados

#### Tenant Identification

- Cada registro inclui um `tenant_id` para identificação do tenant
- Middleware verifica o `tenant_id` em todas as requisições protegidas
- Acesso a dados de outros tenants é estritamente proibido

#### Controle de Acesso Baseado em Papéis (RBAC)

- Cada tipo de usuário tem permissões específicas
- Super admins podem gerenciar todos os tenants
- Admins só podem gerenciar seu próprio tenant
- Barbers têm acesso limitado agendamentos e perfil
- Customers só podem ver e gerenciar seus próprios agendamentos

### Esquema Principal

```sql
-- Tenants (barbearias)
tenants: id, name, domain, created_at, updated_at

-- Usuários
users: id, name, email, password_hash, role, tenant_id, created_at, updated_at

-- Serviços
services: id, name, duration, price, tenant_id, created_at, updated_at

-- Agendamentos
appointments: id, service_id, barber_id, customer_id, scheduled_date, status, tenant_id, created_at, updated_at

-- Barbeiros
barbers: id, user_id, tenant_id, specializations, created_at, updated_at
```

### Considerações de Segurança

- Validação de tenant em todas as operações de leitura/escrita
- Verificação de papel do usuário antes de operações sensíveis
- Auditoria de acesso e modificações de dados

## Autenticação e Autorização

### Better Auth

- Provedor de credenciais (email/senha)
- Adaptador Drizzle para persistência
- Verificação de tenant em todas as requisições protegidas
- Funções auxiliares para verificação de permissões

#### Configuração Principal

- Arquivo de configuração: `auth.config.ts`
- Configuração de provedores de autenticação
- Persistência de sessão no banco de dados
- Hooks personalizados para controle de acesso
- JWT para tokens de sessão
- Persistência de sessão no banco de dados
- Hooks personalizados para controle de acesso
- JWT para tokens de sessão

#### Estratégia de Autenticação Multi-Tenant

- Identificação do tenant através de domínio ou cabeçalhos
- Verificação de associação do usuário ao tenant
- Controle de acesso baseado em papéis por tenant
- Isolamento de dados entre tenants
- Hooks personalizados para lógica de autenticação específica por tenant
- Hooks personalizados para lógica de autenticação específica por tenant

### Middleware

- Proteção de rotas baseada em autenticação e papel do usuário
- Verificação de associação ao tenant
- Redirecionamento adequado para páginas de login

## Componentes UI com ShadCN

### Componentes Básicos

- Botões (`Button`)
- Cartões (`Card`)
- Entradas (`Input`)
- Tabelas (`Table`)
- Formulários (`Form`)
- Menus Dropdown (`DropdownMenu`)
- Dialogs (`Dialog`)
- Alertas (`Alert`)

### Componentes Específicos

- Seletor de Tenant
- Calendário de Agendamentos
- Lista de Serviços
- Painel de Controle

### Estratégia de Componentes

#### Componentes Reutilizáveis

- Localização: `components/ui/`
- Estilo consistente com Tailwind CSS
- Tipagem TypeScript rigorosa
- Acessibilidade integrada desde o início

#### Componentes de Domínio

- Localização: `components/`
- Componentes específicos para agendamento, serviços e barbeiros
- Integração com validações Zod
- Componentes compostos para fluxos complexos

## Segurança

### Princípios

- Verificação de tenant em todas as operações
- Controle de acesso baseado em papéis (RBAC)
- Sanitização de entradas
- Proteção contra CSRF e XSS

### Implementação

- Middleware para verificação de tenant
- Hooks e HOCs para proteção de componentes
- Validação de esquemas com Zod
- Auditoria de ações críticas

#### Estratégia de Proteção

##### Proteção no Frontend

- Verificação de permissões antes de renderizar componentes sensíveis
- Interceptação de requisições API para adicionar contexto de tenant
- Validação de dados do usuário antes de envio para o backend

##### Proteção no Backend

- Middleware de autenticação em todas as rotas protegidas
- Verificação de propriedade do recurso antes de operações de leitura/escrita
- Validação rigorosa de parâmetros de entrada
- Registro de todas as ações críticas para auditoria

##### Segurança de Dados

- Criptografia de dados sensíveis no banco de dados
- Uso de variáveis de ambiente para segredos
- Política de acesso mínimo necessário para diferentes papéis
- Rotatividade de tokens e senhas

## Roteamento e Layouts

### App Router (Next.js 16)

- Grupos de rota para diferentes seções: `(auth)` e `(dashboard)`
- Layouts hierárquicos com provedores de contexto
- Carregamento condicional baseado em autenticação e permissões

### Estratégia de Rotas

#### Rotas Públicas

- Localização: `app/page.tsx` (página inicial)
- Acesso: Qualquer usuário (autenticado ou não)
- Conteúdo: Informações institucionais, página de login/cadastro

#### Rotas de Autenticação

- Localização: `app/(auth)/`
- Grupo: `(auth)`
- Acesso: Usuários não autenticados
- Rotas comuns: `/signin`, `/signup`, `/forgot-password`

#### Rotas de Dashboard

- Localização: `app/(dashboard)/`
- Grupo: `(dashboard)`
- Acesso: Usuários autenticados com base em papel
- Subgrupos por papel: `/admin`, `/barber`, `/customer`

### Estratégia de Layouts

- Layout raiz com provedores globais
- Layout de autenticação sem navegação lateral
- Layout de dashboard com navegação específica por tipo de usuário
- Componentes de carregamento e erro centralizados

## Estratégia de Implementação

### Fase 1: Infraestrutura

1. Configuração do projeto Next.js 16 com TypeScript
2. Configuração do Tailwind CSS e ShadCN UI
3. Configuração do Docker e PostgreSQL
4. Configuração do Drizzle ORM
5. Configuração do Better Auth

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

## Considerações de Performance

- Carregamento preguiçoso (lazy loading) de componentes
- Cache de dados no cliente
- Paginação para listagens grandes
- Otimização de consultas ao banco de dados
- Uso eficiente de SSR e CSR conforme necessário

## Escalabilidade

- Design multi-tenant desde o início
- Banco de dados otimizado para separação de dados por tenant
- Estrutura modular para fácil manutenção
- Padrões de codificação consistentes
- Monitoramento e logging adequados
