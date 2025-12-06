"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { canCreateAdmin, canCreateBarber } from "@/lib/user-roles";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: string;
  tenantId: string;
}

export async function createAdmin(input: CreateUserInput) {
  try {
    // Obter headers para obter a sessão
    const headersList = await import("next/headers");
    const nextHeaders = await headersList.headers();
    const cookiesHeader = nextHeaders.get("cookie") || "";

    // Obter a sessão do usuário
    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: cookiesHeader,
      }),
    });

    if (!session) {
      return {
        success: false,
        error: "Acesso negado: Usuário não autenticado.",
      };
    }

    // Verificar se o usuário tem permissão para criar admins
    // Buscar o papel do usuário no banco de dados
    const userRecord = await db
      .select({ role: user.role, tenantId: user.tenantId })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (userRecord.length === 0) {
      return { success: false, error: "Usuário não encontrado." };
    }

    const userRole = userRecord[0].role;
    const userTenantId = userRecord[0].tenantId;

    if (!canCreateAdmin(userRole)) {
      return {
        success: false,
        error:
          "Acesso negado: Apenas super admins podem criar administradores.",
      };
    }

    // Verificar se o email já existe
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, input.email));

    if (existingUser.length > 0) {
      return { success: false, error: "Email já está em uso." };
    }

    // Verificar se o tenant existe e o usuário tem permissão para criar nesse tenant
    if (userRole !== "super_admin" && userTenantId !== input.tenantId) {
      return {
        success: false,
        error: "Acesso negado: Permissão insuficiente para este tenant.",
      };
    }

    const userId = randomUUID();
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Criar o usuário
    await db.insert(user).values({
      id: userId,
      name: input.name,
      email: input.email,
      emailVerified: true,
      role: input.role,
      tenantId: input.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Criar a conta associada
    await db.insert(account).values({
      id: randomUUID(),
      userId: userId,
      providerId: "credentials",
      accountId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, message: "Admin criado com sucesso." };
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return { success: false, error: "Erro ao criar admin." };
  }
}

export async function createBarber(input: CreateUserInput) {
  try {
    // Obter headers para obter a sessão
    const headersList = await import("next/headers");
    const nextHeaders = await headersList.headers();
    const cookiesHeader = nextHeaders.get("cookie") || "";

    // Obter a sessão do usuário
    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: cookiesHeader,
      }),
    });

    if (!session) {
      return {
        success: false,
        error: "Acesso negado: Usuário não autenticado.",
      };
    }

    // Verificar se o usuário tem permissão para criar barbers
    const userRecord = await db
      .select({ role: user.role, tenantId: user.tenantId })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (userRecord.length === 0) {
      return { success: false, error: "Usuário não encontrado." };
    }

    const userRole = userRecord[0].role;
    const userTenantId = userRecord[0].tenantId;

    if (!canCreateBarber(userRole)) {
      return {
        success: false,
        error:
          "Acesso negado: Apenas super admins e admins podem criar barbeiros.",
      };
    }

    // Verificar se o email já existe
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, input.email));

    if (existingUser.length > 0) {
      return { success: false, error: "Email já está em uso." };
    }

    // Verificar se o tenant existe e o usuário tem permissão para criar nesse tenant
    if (userRole !== "super_admin" && userTenantId !== input.tenantId) {
      return {
        success: false,
        error: "Acesso negado: Permissão insuficiente para este tenant.",
      };
    }

    const userId = randomUUID();
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Criar o usuário
    await db.insert(user).values({
      id: userId,
      name: input.name,
      email: input.email,
      emailVerified: true,
      role: input.role,
      tenantId: input.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Criar a conta associada
    await db.insert(account).values({
      id: randomUUID(),
      userId: userId,
      providerId: "credentials",
      accountId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, message: "Barber criado com sucesso." };
  } catch (error) {
    console.error("Erro ao criar barber:", error);
    return { success: false, error: "Erro ao criar barber." };
  }
}
