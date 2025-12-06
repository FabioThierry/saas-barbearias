import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function clearSuperAdmin() {
  console.log("Removendo super admin...");

  try {
    // Encontrar o super admin com ID específico
    const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID || "super-admin-id";
    const superAdmin = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(
        and(
          eq(user.role, "super_admin"),
          eq(user.id, SUPER_ADMIN_ID) // Usar o ID fixo para garantir que estamos removendo o super admin correto
        )
      )
      .limit(1);

    if (superAdmin.length === 0) {
      console.log("Nenhum super admin encontrado");
      return;
    }

    const admin = superAdmin[0];
    console.log(`Removendo super admin: ${admin.email} (${admin.id})`);

    // Remover as contas associadas primeiro (devido à foreign key)
    await db.delete(account).where(eq(account.userId, admin.id));

    // Remover o usuário
    await db.delete(user).where(eq(user.id, admin.id));

    console.log(`Super admin ${admin.email} removido com sucesso`);
  } catch (error) {
    console.error("Erro ao remover super admin:", error);
    throw error;
  }
}

clearSuperAdmin().catch(console.error);
