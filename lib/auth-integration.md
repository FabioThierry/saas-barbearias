# Integração entre o modelo de dados e o Better Auth

## Visão Geral

Este documento descreve como o modelo de dados multi-tenant se integra com o sistema de autenticação Better Auth.

## Estratégia de Integração

### 1. Extensão do Esquema de Usuário

O esquema de usuário padrão do Better Auth foi estendido para incluir campos adicionais necessários para o modelo multi-tenant:

- `role`: Define o papel do usuário (super_admin, admin, barber, customer)
- `tenantId`: Identifica a qual tenant o usuário pertence

### 2. Identificação do Tenant

A identificação do tenant ocorre através do campo `tenantId` em cada registro. Em operações de banco de dados, sempre verificamos se o usuário tem permissão para acessar os dados do tenant específico.

### 3. Controle de Acesso Baseado em Papéis (RBAC)

Implementamos um sistema de permissões baseado em papéis definidos em `lib/user-roles.ts`:

- **Super Admin**: Acesso global a todos os tenants e funcionalidades
- **Admin**: Acesso total ao tenant específico
- **Barber**: Acesso limitado agendamentos e funcionalidades relacionadas
- **Customer**: Acesso apenas aos próprios dados e agendamentos

### 4. Middleware de Autenticação

O middleware de proteção de rotas verificará:

1. Se o usuário está autenticado
2. Qual o papel do usuário
3. Se o usuário tem permissão para acessar o tenant específico
4. Se o usuário tem permissão para executar a ação solicitada

### 5. Hooks de Autenticação

O Better Auth permite a definição de hooks personalizados para lógica de autenticação específica. Podemos usar isso para:

- Verificar associação ao tenant durante o login
- Aplicar restrições de acesso com base no papel do usuário
- Registrar auditoria de acesso

## Implementação Prática

### Proteção de Rotas

```typescript
import { auth } from "@/lib/auth";
import { isAdmin, isSuperAdmin } from "@/lib/user-roles";

// Exemplo de proteção de rota para administradores
export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verifica se o usuário é admin ou super admin
  if (!isAdmin(session.user.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  // Verifica se o usuário tem acesso ao tenant
  if (
    session.user.tenantId !== requestedTenantId &&
    !isSuperAdmin(session.user.role)
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  // Procede com a lógica da rota
}
```

### Consultas Seguras ao Banco de Dados

Todas as consultas devem incluir verificação de tenant:

```typescript
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Consulta segura que inclui verificação de tenant
const userAppointments = await db
  .select()
  .from(appointments)
  .where(
    and(
      eq(appointments.customerId, userId),
      eq(appointments.tenantId, userTenantId)
    )
  );
```

## Considerações de Segurança

1. **Validação de Tenant**: Todas as operações de leitura/escrita devem validar o tenant
2. **Verificação de Papel**: Antes de operações sensíveis, verificar o papel do usuário
3. **Auditoria**: Registrar todas as ações críticas para auditoria
4. **Sanitização de Entradas**: Validar e sanitizar todas as entradas de usuário

## Estratégia de Isolamento de Dados

Cada registro inclui um `tenantId` para identificação do tenant, e o middleware verifica o `tenantId` em todas as requisições protegidas. O acesso a dados de outros tenants é estritamente proibido.
