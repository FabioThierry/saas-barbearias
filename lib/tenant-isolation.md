# Estratégia de Isolamento de Dados por Tenant

## Visão Geral

Este documento descreve a estratégia de isolamento de dados implementada no sistema multi-tenant para garantir que os dados de cada barbearia sejam mantidos separadamente e seguros.

## Estratégia de Isolamento

### 1. Identificação do Tenant

Cada registro no banco de dados inclui um campo `tenant_id` que identifica a qual tenant (barbearia) o dado pertence. Esta abordagem garante:

- Isolamento lógico dos dados
- Fácil identificação de propriedade dos dados
- Consultas eficientes filtrando por tenant

### 2. Validação de Tenant

Em todas as operações de leitura escrita no banco de dados, o sistema verifica:

1. Se o usuário está autenticado
2. Qual o tenant do usuário
3. Se o usuário tem permissão para acessar o tenant específico
4. Se o usuário tem papel adequado para a operação

### 3. Controle de Acesso Baseado em Papéis (RBAC)

Implementamos um sistema de permissões com diferentes níveis:

- **Super Admin**: Acesso global a todos os tenants e funcionalidades
- **Admin**: Acesso total apenas ao tenant específico
- **Barber**: Acesso limitado agendamentos e funcionalidades relacionadas ao seu tenant
- **Customer**: Acesso apenas aos próprios dados e agendamentos

### 4. Middleware de Proteção

O middleware verifica o tenant em todas as requisições protegidas:

```typescript
// Exemplo de middleware de proteção
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function protectTenantRoute(request: Request, tenantId: string) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verifica se o usuário pertence ao tenant ou é super admin
  if (
    session.user.role !== "super_admin" &&
    session.user.tenantId !== tenantId
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  return { session, authorized: true };
}
```

### 5. Consultas Seguras

Todas as consultas ao banco de dados incluem verificação de tenant:

```typescript
// Exemplo de consulta segura
import { db } from "@/lib/db";
import { appointments, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Consulta que garante isolamento de tenant
const tenantAppointments = await db
  .select()
  .from(appointments)
  .where(
    and(
      eq(appointments.tenantId, currentUserTenantId),
      eq(appointments.barberId, specificBarberId)
    )
  );
```

### 6. Hooks de Autenticação

O Better Auth permite hooks personalizados para lógica de autenticação específica:

```typescript
// Exemplo de hook de autenticação
export const auth = betterAuth({
  // ... outras configurações
  plugins: [
    nextCookies(),
    // Hook personalizado para verificação de tenant
    {
      $after: {
        signIn: async (ctx) => {
          // Verificar associação do usuário ao tenant
          if (ctx.session.user.role !== "super_admin") {
            // Lógica para garantir que o usuário só acesse seu tenant
          }
        },
      },
    },
  ],
});
```

## Implementação Técnica

### 1. Restrições de Banco de Dados

- Cada tabela (exceto tenants) tem uma coluna `tenant_id`
- As chaves estrangeiras garantem integridade referencial
- Restrições de exclusão em cascata para manter consistência

### 2. Índices de Performance

- Índices criados em campos `tenant_id` para consultas rápidas
- Índices compostos para consultas frequentes com múltiplos filtros

### 3. Auditoria

- Registro de todas as ações críticas para auditoria
- Log de acesso e modificações de dados por tenant

## Considerações de Segurança

### 1. Validação de Entrada

- Todos os dados recebidos são validados antes de serem processados
- Sanitização de entradas para prevenir injeção de SQL e XSS

### 2. Proteção contra CSRF e XSS

- Implementação de tokens CSRF para formulários
- Sanitização de saída para prevenir XSS

### 3. Criptografia

- Senhas são armazenadas com hashing seguro (bcrypt)
- Dados sensíveis podem ser criptografados adicionalmente

## Estratégia de Implementação

### Frontend

- Verificação de permissões antes de renderizar componentes sensíveis
- Interceptação de requisições API para adicionar contexto de tenant
- Validação de dados do usuário antes de envio para o backend

### Backend

- Middleware de autenticação em todas as rotas protegidas
- Verificação de propriedade do recurso antes de operações de leitura/escrita
- Validação rigorosa de parâmetros de entrada
- Registro de todas as ações críticas para auditoria

## Conclusão

A estratégia de isolamento de dados implementada garante que:

1. Dados de diferentes tenants estejam logicamente separados
2. Acesso a dados de outros tenants seja estritamente proibido
3. O sistema seja seguro e cumpra com requisitos de privacidade
4. A performance seja mantida com uso adequado de índices
5. A auditoria e rastreabilidade sejam possíveis para fins de conformidade
