# Diagrama de Relacionamento entre Entidades

## Visão Geral

Este documento descreve os relacionamentos entre as entidades do sistema de agendamento para barbearias com modelo multi-tenant.

## Entidades e Relacionamentos

### 1. Tenants (Barbearias)

- **Descrição**: Representa cada barbearia no sistema multi-tenant
- **Campos principais**: id, name, domain, created_at, updated_at
- **Relacionamentos**:
  - 1:N com Users (uma barbearia tem muitos usuários)
  - 1:N com Services (uma barbearia oferece muitos serviços)
  - 1:N com Appointments (uma barbearia tem muitos agendamentos)
  - 1:N com Barbers (uma barbearia tem muitos barbeiros)

### 2. Users (Usuários)

- **Descrição**: Usuários do sistema (super_admin, admin, barber, customer)
- **Campos principais**: id, name, email, role, tenant_id, created_at, updated_at
- **Relacionamentos**:
  - N:1 com Tenants (muitos usuários pertencem a um tenant)
  - 1:1 com Barbers (um usuário pode ser um barbeiro)
  - 1:N com Appointments (como cliente, pode ter muitos agendamentos)

### 3. Services (Serviços)

- **Descrição**: Serviços oferecidos pelas barbearias
- **Campos principais**: id, name, duration, price, tenant_id, created_at, updated_at
- **Relacionamentos**:
  - N:1 com Tenants (muitos serviços pertencem a um tenant)
  - 1:N com Appointments (um serviço pode estar em muitos agendamentos)

### 4. Barbers (Barbeiros)

- **Descrição**: Perfil de barbeiro associado a um usuário
- **Campos principais**: id, user_id, tenant_id, specializations, created_at, updated_at
- **Relacionamentos**:
  - N:1 com Users (muitos barbeiros podem estar associados a um usuário)
  - N:1 com Tenants (muitos barbeiros pertencem a um tenant)
  - 1:N com Appointments (um barbeiro pode ter muitos agendamentos)

### 5. Appointments (Agendamentos)

- **Descrição**: Agendamentos de serviços
- **Campos principais**: id, service_id, barber_id, customer_id, scheduled_date, status, tenant_id, created_at, updated_at
- **Relacionamentos**:
  - N:1 com Tenants (muitos agendamentos pertencem a um tenant)
  - N:1 com Services (muitos agendamentos usam um serviço)
  - N:1 com Barbers (muitos agendamentos são com um barbeiro)
  - N:1 com Users (como cliente, muitos agendamentos pertencem a um usuário)

## Diagrama de Relacionamento (Representação Textual)

```
[tenants] 1 ← → * [users] 1 ← → 1 [barbers] * ← → * [appointments]
   ↓                    ↓                   ↓           ↑
  * [services] ← → * [appointments] ← → * [users (customer)]
```

## Restrições de Integridade

1. **Tenants**:

   - Cada tenant tem um domínio único

2. **Users**:

   - Cada email é único no sistema
   - O campo role tem valores restritos: super_admin, admin, barber, customer
   - tenantId pode ser nulo para super_admin

3. **Services**:

   - Sempre associado a um tenant
   - onDelete: cascade (se tenant for removido, serviços são removidos)

4. **Barbers**:

   - Sempre associado a um usuário e a um tenant
   - onDelete: cascade (se usuário ou tenant for removido, barbeiro é removido)

5. **Appointments**:
   - Sempre associado a um tenant, serviço, barbeiro e cliente
   - onDelete: restrict para serviço e barbeiro (não apaga agendamento se serviço ou barbeiro for removido)
   - onDelete: cascade para tenant (se tenant for removido, agendamentos são removidos)

## Considerações de Segurança

- Todas as consultas devem filtrar por tenant_id para garantir isolamento de dados
- Apenas super_admins podem acessar dados de múltiplos tenants
- Admins só podem gerenciar dados do seu próprio tenant
- Barbers só podem ver e gerenciar seus próprios agendamentos
- Customers só podem ver e gerenciar seus próprios agendamentos
