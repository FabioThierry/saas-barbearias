# Prompt Otimizado para IA de Frontend no Replit

## Instruções para a IA de Criação de Frontend

Você está criando a interface do usuário para um SaaS de agendamento de barbearias com arquitetura multi-tenant. Siga este plano detalhado para implementar todos os componentes da interface.

## Contexto do Projeto

- **Nome do Projeto**: SaaS de Agendamento de Barbearias
- **Arquitetura**: Multi-tenant com 4 roles de usuário
- **Objetivo**: Permitir que barbearias gerenciem seus serviços, barbeiros e agendamentos de forma eficiente

## Roles de Usuário e Acessos

1. **Super Admin**: Acesso global a todos os tenants
2. **Admin**: Acesso total a um tenant específico (barbearia)
3. **Barber**: Acesso limitado a seus próprios agendamentos
4. **Customer**: Acesso apenas aos próprios agendamentos

## Stack Tecnológica

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI
- Lucide React (ícones)
- React Hook Form + Zod (formulários e validação)
- Sonner (notificações)
- React Day Picker (calendários)
- Better Auth (autenticação)

## Estrutura de Implementação

### 1. Componentes UI Base (já implementados)

- Botões, cards, inputs, tabelas, formulários, dropdowns, dialogs, alerts
- Localizados em: `components/ui/`
- Siga os padrões existentes para consistência

### 2. Layouts

#### Layout Principal

- Local: `app/layout.tsx`
- Componentes: Header com informações do usuário, sidebar de navegação adaptável, área de conteúdo

#### Layout de Autenticação

- Local: `app/(auth)/layout.tsx`
- Componentes: Sem navegação lateral, apenas conteúdo principal

#### Layouts de Dashboard

- Local: `app/(dashboard)/layout.tsx`
- Componentes: Navegação específica por role, área de conteúdo

### 3. Páginas de Autenticação

#### Login

- Local: `app/(auth)/login/page.tsx`
- Componentes: Formulário de login com validação, botão de login com Google (TODO), link para cadastro

#### Cadastro (apenas para Super Admin criar outros usuários)

- Local: `app/(auth)/signup/page.tsx`
- Componentes: Formulários específicos por role (não aberto ao público)

### 4. Dashboards por Role

#### Dashboard Geral

- Local: `app/(dashboard)/page.tsx`
- Componente: Redirecionamento baseado na role do usuário

#### Dashboard de Super Admin

- Local: `app/(dashboard)/admin/page.tsx` (ou criar novo grupo)
- Componentes:
  - Visão geral do sistema com métricas globais
  - Gerenciamento de tenants
  - Gerenciamento de admins
  - Relatórios globais

#### Dashboard de Admin

- Local: `app/(dashboard)/admin/page.tsx`
- Componentes:
- Visão geral da barbearia
- Gerenciamento de barbeiros
- Gerenciamento de serviços
- Calendário de agendamentos
- Relatórios da barbearia

#### Dashboard de Barber

- Local: `app/(dashboard)/barber/page.tsx`
- Componentes:
  - Agenda diária
  - Lista de agendamentos atribuídos
  - Atualização de status
  - Definição de disponibilidade

#### Dashboard de Customer

- Local: `app/(dashboard)/customer/page.tsx`
- Componentes:
  - Histórico de agendamentos
- Sistema de agendamento
- Confirmação de agendamentos

### 5. Componentes Específicos

#### Calendário de Agendamentos

- Componente reutilizável para visualização e gerenciamento de agendamentos
- Funcionalidades: Visualização diária/semanal, drag and drop, seleção de horários

#### Seletor de Serviços

- Componente para exibição e seleção de serviços disponíveis
- Informações: Nome, duração, preço

#### Seletor de Barbeiros

- Componente para exibição e seleção de barbeiros disponíveis
- Informações: Nome, especializações, avaliações

#### Formulário de Agendamento

- Componente para criação de novos agendamentos
- Funcionalidades: Seleção de serviço, barbeiro e data/hora, confirmação

## Instruções de Implementação

### 1. Comece pelos layouts

- Implemente os layouts base para autenticação e dashboard
- Crie uma sidebar adaptável que muda conforme a role do usuário
- Implemente o header com informações do usuário e notificações

### 2. Implemente os dashboards por role

- Comece com o dashboard de admin, pois é o mais completo
- Adapte para as outras roles removendo funcionalidades não relevantes
- Use o sistema de permissões para controlar o que é exibido

### 3. Crie os componentes específicos

- Implemente o calendário de agendamentos com diferentes visualizações
- Crie os seletores de serviços e barbeiros
- Desenvolva o formulário de agendamento com validação

### 4. Integre com o backend

- Conecte os formulários com as ações do backend
- Implemente chamadas API para carregar e salvar dados
- Adicione tratamento de erros e feedback visual

### 5. Implemente controle de acesso

- Verifique as permissões do usuário antes de renderizar componentes sensíveis
- Proteja as rotas com base na role e no tenant
- Implemente filtragem automática de dados por tenant

## Recursos para Consulta

Durante a implementação, consulte estes arquivos para entender o contexto:

- `lib/user-roles.ts` - Definições de roles e permissões
- `lib/db/schema.ts` - Estrutura de dados
- `ARCHITECTURE_PLAN.md` - Arquitetura geral do sistema
- `UI_PLAN.md` - Plano detalhado da interface
- `components/ui/` - Componentes UI existentes para referência

## Validação Final

Antes de considerar completa a implementação, verifique:

- [ ] Todos os dashboards estão implementados e funcionando
- [ ] A navegação é intuitiva e adaptável por role
- [ ] O sistema de agendamento está completo (seleção de serviço, barbeiro, data/hora)
- [ ] O calendário de agendamentos está funcional
- [ ] O controle de acesso está funcionando corretamente
- [ ] A interface é responsiva e acessível
- [ ] Os componentes reutilizáveis seguem os padrões estabelecidos
- [ ] A integração com o backend está completa

## Observações Importantes

1. O sistema é multi-tenant - garanta que os dados de um tenant não sejam acessíveis por outro
2. O sistema tem cadastro fechado - apenas super admins podem criar admins, e admins/super admins podem criar barbeiros
3. Use os componentes ShadCN para manter consistência visual
4. Implemente feedback visual adequado para todas as ações do usuário
5. Mantenha o design profissional e adequado para o ambiente de uma barbearia

Comece implementando o layout principal e o dashboard de admin, pois eles contêm a maioria das funcionalidades que podem ser adaptadas para as outras roles.
