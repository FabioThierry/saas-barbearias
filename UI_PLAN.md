# Plano de UI para o SaaS de Agendamento de Barbearia

## Visão Geral

Este documento descreve o plano de interface do usuário para o sistema de agendamento de barbearias multi-tenant, levando em consideração as diferentes roles de usuário e suas permissões.

## Arquitetura da Interface

### 1. Estrutura Geral

- Layout responsivo com sidebar de navegação
- Header com informações do usuário logado e notificações
- Conteúdo principal adaptável conforme a role do usuário
- Sistema de autenticação integrado com Better Auth
- Design consistente usando Tailwind CSS e ShadCN UI

### 2. Componentes Comuns

- Componentes de formulário reutilizáveis
- Tabelas com paginação e filtros
- Cards para visualização de informações
- Calendários e seletores de data/hora
- Modais e dialogs para ações específicas
- Notificações com Sonner

## Interfaces por Role

### 1. Super Admin

#### Dashboard Global

- Visão geral do sistema com métricas globais
- Gráficos de desempenho por tenant
- Alertas e notificações importantes
- Acesso rápido às funções administrativas

#### Gerenciamento de Tenants

- Lista de todos os tenants com informações básicas
- Formulário para criar/editar tenants
- Opções para visualizar/editar/excluir tenants
- Filtros e busca avançada

#### Gerenciamento de Admins

- Lista de todos os admins do sistema
- Formulário para criar/editar admins
- Associação de admins a tenants
- Controles de permissão

#### Relatórios Globais

- Métricas de uso por tenant
- Relatórios financeiros consolidados
- Análise de desempenho do sistema

### 2. Admin (Administrador de Barbearia)

#### Dashboard da Barbearia

- Visão geral do negócio
- Métricas de agendamentos e receita
- Alertas e notificações
- Calendário de agendamentos do dia

#### Gerenciamento de Barbeiros

- Lista de barbeiros da barbearia
- Formulário para adicionar/editar barbeiros
- Atribuição de especializações
- Gerenciamento de horários e disponibilidade

#### Gerenciamento de Serviços

- Catálogo de serviços oferecidos
- Formulário para adicionar/editar serviços
- Definição de duração e preço
- Categorização de serviços

#### Gerenciamento de Agendamentos

- Calendário com visualização de todos os agendamentos
- Lista detalhada de agendamentos
- Filtros por status, barbeiro, data
- Opções para editar/cancelar agendamentos

#### Relatórios da Barbearia

- Relatórios financeiros
- Análise de desempenho por barbeiro
- Métricas de satisfação do cliente
- Análise de horários de pico

### 3. Barber (Barbeiro)

#### Dashboard Pessoal

- Agenda diária com compromissos
- Informações pessoais e especializações
- Estatísticas de desempenho
- Notificações de agendamentos

#### Gerenciamento de Agendamentos

- Visualização de agendamentos atribuídos
- Atualização de status (concluído, cancelado, etc.)
- Comunicação com clientes
- Histórico de serviços prestados

#### Disponibilidade

- Definição de horários disponíveis
- Configuração de pausas e férias
- Bloqueio de horários específicos

### 4. Customer (Cliente)

#### Dashboard de Cliente

- Histórico de agendamentos
- Informações de perfil
- Preferências e histórico de serviços
- Notificações e lembretes

#### Sistema de Agendamento

- Seleção de serviço
- Escolha de barbeiro disponível
- Seleção de data e horário
- Confirmação de agendamento
- Sistema de lembretes

## Componentes Específicos

### 1. Calendário de Agendamentos

- Visualização diária/semanal/mensal
- Drag and drop para reagendamento
- Indicadores de disponibilidade
- Sobreposição de agendamentos

### 2. Seleção de Serviços

- Catálogo visual de serviços
- Filtros por tipo de serviço
- Informações de duração e preço
- Avaliações e recomendações

### 3. Seleção de Barbeiros

- Perfis com especializações
- Avaliações e histórico
- Disponibilidade em tempo real
- Preferências do cliente

### 4. Gestão de Disponibilidade

- Grade horária personalizável
- Bloqueio de horários
- Configuração de intervalos
- Integração com calendários externos

## Considerações de UX

### 1. Navegação Intuitiva

- Menu lateral com opções relevantes para cada role
- Breadcumbs para navegação hierárquica
- Acesso rápido às funções mais utilizadas
- Busca global por funcionalidades

### 2. Feedback Visual

- Indicadores de carregamento
- Mensagens de sucesso/erro/aviso
- Animações sutis para transições
- Estados de loading para ações assíncronas

### 3. Responsividade

- Layout adaptável para dispositivos móveis
- Componentes touch-friendly
- Design otimizado para diferentes tamanhos de tela
- Experiência consistente em todos os dispositivos

### 4. Acessibilidade

- Contraste adequado de cores
- Navegação por teclado
- Labels e descrições adequadas
- Compatibilidade com leitores de tela

## Segurança e Controle de Acesso

### 1. Validação de Permissões

- Verificação de role antes de renderizar componentes
- Proteção de rotas baseada em permissões
- Controle de acesso granular

### 2. Isolamento de Dados

- Filtragem automática por tenant
- Impedimento de acesso a dados de outros tenants
- Auditoria de ações sensíveis

## Tecnologias e Componentes

### 1. Componentes de UI

- ShadCN UI para componentes acessíveis
- Tailwind CSS para estilização
- Lucide React para ícones
- React Hook Form para formulários
- Zod para validação

### 2. Componentes Específicos

- Calendário: React Day Picker
- Gráficos: Componentes personalizados com Tailwind
- Tabelas: Componentes ShadCN com paginação
- Formulários: ShadCN com validação Zod
- Notificações: Sonner
