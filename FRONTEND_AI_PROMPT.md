# Prompt para IA de Criação de Frontend - SaaS de Agendamento de Barbearia

## Descrição Geral do Projeto

Você está desenvolvendo a interface do usuário para um SaaS de agendamento de barbearias com arquitetura multi-tenant. O sistema tem 4 tipos de usuários com diferentes níveis de acesso e funcionalidades: Super Admin, Admin, Barber e Customer.

## Tecnologias e Stack

- **Framework**: Next.js 16 (com App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: ShadCN UI
- **Ícones**: Lucide React
- **Formulários**: React Hook Form + Zod
- **Notificações**: Sonner
- **Calendário**: React Day Picker
- **Autenticação**: Better Auth

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
├── proxy.ts                    # Middleware para proteção de rotas
├── auth.config.ts              # Configuração do Better Auth
```

## Modelos de Dados Relevantes

### Entidades Principais:

1. **Users**: Com campos para role (super_admin, admin, barber, customer) e tenantId
2. **Tenants**: Representam cada barbearia no sistema multi-tenant
3. **Services**: Serviços oferecidos pelas barbearias (nome, duração, preço)
4. **Barbers**: Perfil de barbeiro associado a um usuário
5. **Appointments**: Agendamentos com data, status, serviço, barbeiro e cliente

## Roles e Permissões

### 1. Super Admin

- Acesso global a todos os tenants e funcionalidades
- Pode gerenciar tenants e admins
- Visualiza métricas globais

### 2. Admin (de Barbearia)

- Acesso total apenas ao tenant específico (sua barbearia)
- Pode gerenciar barbeiros, serviços e agendamentos
- Visualiza relatórios da barbearia

### 3. Barber (Barbeiro)

- Acesso limitado a funcionalidades relacionadas a seus agendamentos
- Pode visualizar e gerenciar seus próprios agendamentos
- Define disponibilidade

### 4. Customer (Cliente)

- Acesso apenas aos próprios dados e agendamentos
- Pode agendar serviços

## Requisitos de UI/UX

### Componentes Comuns

- Botões, cards, inputs, tabelas, formulários, dropdowns, dialogs, alerts (ShadCN UI)
- Seletor de tenant para super admins
- Calendário de agendamentos
- Lista de serviços
- Painel de controle

### Layout Geral

- Sidebar de navegação adaptável conforme a role do usuário
- Header com informações do usuário logado e notificações
- Conteúdo principal responsivo
- Sistema de autenticação integrado

### Componentes Específicos

1. **Calendário de Agendamentos**: Visualização diária/semanal com drag and drop
2. **Seleção de Serviços**: Catálogo visual com duração e preço
3. **Seleção de Barbeiros**: Perfis com especializações e disponibilidade
4. **Gestão de Disponibilidade**: Grade horária personalizável

## Requisitos Funcionais por Role

### Super Admin Interface

1. Dashboard global com métricas de todos os tenants
2. Gerenciamento de tenants (criar, editar, excluir)
3. Gerenciamento de admins (criar, editar, associar a tenants)
4. Relatórios e métricas globais
5. Configurações do sistema

### Admin Interface

1. Dashboard específico do tenant com métricas da barbearia
2. Gerenciamento de barbeiros (criar, editar, excluir)
3. Gerenciamento de serviços (criar, editar, definir preço/duração)
4. Visualização e gerenciamento de todos os agendamentos do tenant
5. Relatórios financeiros e de desempenho
6. Configurações da barbearia

### Barber Interface

1. Dashboard pessoal com agenda do dia
2. Visualização e gerenciamento de seus próprios agendamentos
3. Atualização de status de agendamentos
4. Definição de disponibilidade e horários
5. Histórico de serviços prestados

### Customer Interface

1. Dashboard de cliente com histórico de agendamentos
2. Sistema de agendamento (escolher serviço, barbeiro, data/hora)
3. Confirmação e visualização de agendamentos
4. Histórico de serviços
5. Sistema de lembretes

## Diretrizes de Design

### Estilo Visual

- Design limpo e profissional, adequado para ambiente de barbearia
- Paleta de cores sóbrias e elegantes (tons de preto, cinza, azul escuro)
- Tipografia clara e legível
- Espaçamento consistente e hierarquia visual clara

### Experiência do Usuário

- Navegação intuitiva com menu adaptável por role
- Feedback visual imediato para ações do usuário
- Carregamento e transições suaves
- Design responsivo para desktop e mobile
- Acessibilidade (contraste adequado, navegação por teclado)

## Segurança e Controle de Acesso

- Componentes devem verificar permissões antes de renderizar funcionalidades sensíveis
- Rotas protegidas devem ser implementadas com verificação de role e tenant
- Dados devem ser filtrados automaticamente por tenant
- Impedir acesso a dados de outros tenants

## Componentes de Exemplo para Implementação

### 1. Dashboard Base

```tsx
// Componente base para todos os dashboards
// Deve incluir sidebar adaptável, header e área de conteúdo
// Sidebar deve mostrar apenas opções relevantes para a role do usuário
```

### 2. Calendário de Agendamentos

```tsx
// Componente de calendário que mostra agendamentos
// Deve permitir diferentes visualizações (dia, semana, mês)
// Funcionalidades de drag and drop para reagendamento
// Disponibilidade baseada na role do usuário
```

### 3. Formulário de Agendamento

```tsx
// Formulário para criação de novos agendamentos
// Seleção de serviço, barbeiro e data/hora
// Validação de disponibilidade em tempo real
```

## Considerações Técnicas

### Performance

- Implementar lazy loading para componentes pesados
- Otimizar renderização de listas e tabelas grandes
- Usar cache de dados no cliente onde apropriado

### Responsividade

- Garantir que todos os componentes funcionem em dispositivos móveis
- Adaptar layouts para diferentes tamanhos de tela
- Garantir usabilidade em dispositivos touch

### Internacionalização

- Preparar componentes para suporte a múltiplos idiomas
- Uso de termos claros e consistentes

## Instruções para Implementação

1. Comece criando os componentes base (botões, cards, formulários) seguindo os estilos do ShadCN
2. Implemente os layouts específicos para cada role (auth, dashboard, admin, barber, customer)
3. Crie os componentes específicos para cada funcionalidade (calendário, seleção de serviços, etc.)
4. Implemente a lógica de controle de acesso nos componentes
5. Integre com o sistema de autenticação Better Auth
6. Teste a responsividade e acessibilidade de todos os componentes
7. Verifique o isolamento de dados por tenant em todas as interfaces

## Critérios de Aceitação

- [ ] Interface intuitiva e profissional
- [ ] Design responsivo para desktop e mobile
- [ ] Componentes reutilizáveis e bem estruturados
- [ ] Controle de acesso adequado por role
- [ ] Isolamento de dados por tenant
- [ ] Integração com o sistema de autenticação
- [ ] Feedback visual adequado para ações do usuário
- [ ] Componentes acessíveis e com bom contraste
- [ ] Performance otimizada para listas e tabelas grandes
- [ ] Código bem tipado com TypeScript

## Recursos Adicionais

Ao implementar, consulte os seguintes documentos e arquivos:

- ARCHITECTURE_PLAN.md: Para entender a arquitetura geral do sistema
- lib/user-roles.ts: Para entender as roles e permissões
- lib/db/schema.ts: Para entender a estrutura de dados
- UI_PLAN.md: Para detalhes sobre a interface planejada
- components/ui/: Para exemplos de componentes ShadCN já implementados

Siga os padrões estabelecidos nos componentes existentes e mantenha a consistência visual e funcional com o restante da aplicação.
