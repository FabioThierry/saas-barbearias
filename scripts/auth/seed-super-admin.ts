import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

async function seedSuperAdmin() {
  console.log("Iniciando script de seed para super admin...");

  try {
    // Verificar se já existe um super admin
    const existingSuperAdmin = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.role, "super_admin"));

    if (existingSuperAdmin.length > 0) {
      console.log("Super admin já existe:", existingSuperAdmin[0].email);
      return;
    }

    // Usar ID fixo para o super admin para que o plugin de admin possa reconhecer este usuário
    const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID || "super-admin-id";
    const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@empresa.com";
    const password =
      process.env.SUPER_ADMIN_PASSWORD || "senha-padrao-super-admin";
    const name = "Super Admin";

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o super admin diretamente no banco de dados
    await db.insert(user).values({
      id: SUPER_ADMIN_ID.toString(),
      name: "Super Admin",
      email: email,
      emailVerified: true,
      role: "super_admin",
      tenantId: null, // Super admin não está associado a nenhum tenant
      banned: false, // Garantir que o super admin não esteja banido
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Criar a conta associada
    await db.insert(account).values({
      id: randomUUID(),
      userId: SUPER_ADMIN_ID.toString(), // Garantir que é string
      providerId: "credential", // Autenticação por email/senha - deve ser "credential" e não "credentials"
      accountId: SUPER_ADMIN_ID.toString(), // Para contas de credenciais, o accountId deve ser o mesmo que o userId
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Super admin criado com sucesso");
    console.log("Email:", email);
    console.log(
      "Senha padrão: 'senha-padrao-super-admin' (ou a definida pela variável SUPER_ADMIN_PASSWORD)"
    );
  } catch (error) {
    console.error("Erro ao criar super admin:", error);
    throw error;
  }
}

seedSuperAdmin().catch(console.error);
