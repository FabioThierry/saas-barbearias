# Sistema de Autorizações Fechado

## Visão Geral

Este documento descreve as mudanças implementadas para transformar o sistema de autenticação de aberto para fechado, onde:

- O super-admin é criado via seed no banco de dados
- Apenas o super-admin pode cadastrar admins
- O super-admin e admins podem cadastrar barbers
- Nenhuma pessoa pode se cadastrar livremente no sistema

## Arquitetura do Sistema de Autorizações

### 1. Super Admin (Seed)

- **Criação**: Apenas via script de seed no banco de dados
- **Acesso**: Acesso global a todos os tenants e funcionalidades
- **Permissões**: Pode gerenciar todos os outros usuários e tenants
- **Identificação**: Tem role "super_admin" e tenantId nulo (não associado a nenhum tenant)

### 2. Admin

- **Criação**: Apenas pelo super-admin
- **Acesso**: Acesso total a um tenant específico
- **Permissões**: Pode gerenciar usuários (barbers), serviços e agendamentos do seu tenant
- **Identificação**: Tem role "admin" e tenantId associado a um tenant específico

### 3. Barber

- **Criação**: Pelo super-admin ou admin
- **Acesso**: Acesso limitado a funcionalidades relacionadas a seus agendamentos
- **Permissões**: Pode visualizar e gerenciar seus próprios agendamentos
- **Identificação**: Tem role "barber" e tenantId associado a um tenant específico

### 4. Customer

- **Criação**: Não se aplica (não teremos cadastro público de customers)
- **Acesso**: Acesso somente para clientes que já tenham agendamentos
- **Permissões**: Acesso limitado a seus próprios agendamentos

## Processo de Cadastro

### 1. Cadastro de Admin pelo Super Admin

```
Super Admin -> Formulário de Cadastro de Admin -> Validação de Permissão -> Criação de Usuário com Role Admin
```

**Requisitos:**

- Usuário logado deve ser super_admin
- Novo admin deve estar associado a um tenant específico
- Email do novo admin deve ser único no sistema

### 2. Cadastro de Barber pelo Super Admin ou Admin

```
Super Admin/Admin -> Formulário de Cadastro de Barber -> Validação de Permissão -> Criação de Usuário com Role Barber -> Criação de Perfil de Barber
```

**Requisitos:**

- Usuário logado deve ser super_admin ou admin do tenant
- Novo barber deve estar associado a um tenant específico
- Email do novo barber deve ser único no sistema
- Criação de perfil de barber associado ao usuário

## Implementação Técnica

### 1. Script de Seed para Super Admin

```typescript
// scripts/seed-super-admin.ts
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seedSuperAdmin() {
  const existingSuperAdmin = await db
    .select()
    .from(user)
    .where(eq(user.role, "super_admin"));

  if (existingSuperAdmin.length > 0) {
    console.log("Super admin já existe");
    return;
  }

  const hashedPassword = await bcrypt.hash("senha-padrao-super-admin", 10);

  await db.insert(user).values({
    id: "super-admin-id",
    name: "Super Admin",
    email: "superadmin@empresa.com",
    emailVerified: true,
    role: "super_admin",
    tenantId: null, // Super admin não está associado a nenhum tenant
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Super admin criado com sucesso");
}

seedSuperAdmin();
```

### 2. Middleware de Proteção de Rotas

```typescript
// lib/middleware.ts
import { auth } from "@/lib/auth";
import { UserRole } from "@/lib/user-roles";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function requireRole(allowedRoles: UserRole[], request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!allowedRoles.includes(session.user.role as UserRole)) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function requireTenantAccess(request: Request, tenantId: string) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Super admin pode acessar qualquer tenant
  if (session.user.role === UserRole.SuperAdmin) {
    return session;
  }

  // Outros usuários só podem acessar seu próprio tenant
  if (session.user.tenantId !== tenantId) {
    throw new Error("Forbidden");
  }

  return session;
}
```

### 3. Funções de Autorização Atualizadas

```typescript
// lib/user-roles.ts (atualizado)
export enum UserRole {
  SuperAdmin = "super_admin", // Acesso global ao sistema, gerencia tenants
  Admin = "admin", // Administrador de um tenant específico (barbearia)
  Barber = "barber", // Barbeiro associado a uma barbearia
  Customer = "customer", // Cliente que agenda serviços
}

// Funções auxiliares para verificação de papéis
export const isAdmin = (role: string): boolean => {
  return role === UserRole.Admin || role === UserRole.SuperAdmin;
};

export const isSuperAdmin = (role: string): boolean => {
  return role === UserRole.SuperAdmin;
};

export const isBarber = (role: string): boolean => {
  return (
    role === UserRole.Barber ||
    role === UserRole.Admin ||
    role === UserRole.SuperAdmin
  );
};

export const isCustomer = (role: string): boolean => {
  return (
    role === UserRole.Customer ||
    role === UserRole.Barber ||
    role === UserRole.Admin ||
    role === UserRole.SuperAdmin
  );
};

// Funções específicas para o sistema fechado
export const canCreateAdmin = (role: string): boolean => {
  return role === UserRole.SuperAdmin;
};

export const canCreateBarber = (role: string): boolean => {
  return role === UserRole.SuperAdmin || role === UserRole.Admin;
};

// Definições de permissões por papel
export interface Permissions {
  canManageUsers: boolean;
  canCreateAdmins: boolean;
  canCreateBarbers: boolean;
  canManageServices: boolean;
  canManageAppointments: boolean;
  canViewReports: boolean;
  canManageTenant: boolean;
}

export const getPermissions = (role: UserRole): Permissions => {
  switch (role) {
    case UserRole.SuperAdmin:
      return {
        canManageUsers: true,
        canCreateAdmins: true,
        canCreateBarbers: true,
        canManageServices: true,
        canManageAppointments: true,
        canViewReports: true,
        canManageTenant: true,
      };
    case UserRole.Admin:
      return {
        canManageUsers: true,
        canCreateAdmins: false, // Apenas super admin pode criar admins
        canCreateBarbers: true,
        canManageServices: true,
        canManageAppointments: true,
        canViewReports: true,
        canManageTenant: false, // Admin não pode gerenciar o tenant em nível global
      };
    case UserRole.Barber:
      return {
        canManageUsers: false,
        canCreateAdmins: false,
        canCreateBarbers: false,
        canManageServices: false,
        canManageAppointments: true, // Apenas seus próprios agendamentos
        canViewReports: false,
        canManageTenant: false,
      };
    case UserRole.Customer:
      return {
        canManageUsers: false,
        canCreateAdmins: false,
        canCreateBarbers: false,
        canManageServices: false,
        canManageAppointments: true, // Apenas seus próprios agendamentos
        canViewReports: false,
        canManageTenant: false,
      };
    default:
      return {
        canManageUsers: false,
        canCreateAdmins: false,
        canCreateBarbers: false,
        canManageServices: false,
        canManageAppointments: false,
        canViewReports: false,
        canManageTenant: false,
      };
  }
};
```

### 4. Formulários de Cadastro Restritos

```typescript
// components/admin-create-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createAdmin } from "@/app/actions/users";

const adminSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  tenantId: z.string().min(1, "Tenant é obrigatório"),
});

export function AdminCreateForm() {
  const form = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      tenantId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof adminSchema>) {
    try {
      // Apenas super admin pode criar admins
      const result = await createAdmin(values);
      if (result.success) {
        // Redirecionar ou mostrar mensagem de sucesso
      }
    } catch (error) {
      // Tratar erro
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Outros campos... */}
        <Button type="submit" disabled={!form.formState.isValid}>
          Criar Admin
        </Button>
      </form>
    </Form>
  );
}
```

## Considerações de Segurança

### 1. Validação de Permissões

- Todas as operações críticas devem verificar as permissões do usuário
- Middleware de proteção deve ser aplicado a todas as rotas sensíveis
- Verificação de acesso ao tenant deve ser feita em todas as operações de dados

### 2. Prevenção de Enumeração de Usuários

- Não expor informações sobre existência de emails durante cadastro
- Mensagens genéricas para falhas de autenticação

### 3. Registro de Auditoria

- Registrar todas as operações de criação de usuários
- Manter logs de acesso para fins de auditoria

## Implementação Gradual

### Fase 1: Desativação do Cadastro Público

- Remover ou desativar a rota de signup
- Atualizar o Better Auth para não permitir cadastro externo

### Fase 2: Implementação do Sistema de Cadastro Restrito

- Criar formulários para cadastro de admins e barbers
- Implementar validação de permissões

### Fase 3: Script de Seed

- Criar script para inicializar o super admin
- Documentar o processo de inicialização do sistema

## Conclusão

O sistema de autorizações fechado implementa um modelo de controle de acesso rígido onde:

1. O super admin é o único ponto de entrada para novos usuários
2. O acesso é estritamente controlado por papéis e tenants
3. A segurança é mantida através de validações rigorosas
4. A auditoria é possível através de logs de operações
