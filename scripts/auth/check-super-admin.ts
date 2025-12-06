import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function checkSuperAdmin() {
  console.log("Verificando se o super admin existe...");

  try {
    // Consultar todos os usuários com role super_admin
    const superAdmins = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.role, "super_admin"));

    console.log(`Encontrados ${superAdmins.length} super admins:`);
    superAdmins.forEach((admin) => {
      console.log("- ID:", admin.id);
      console.log("  Nome:", admin.name);
      console.log("  Email:", admin.email);
      console.log("  Role:", admin.role);
      console.log("  Tenant ID:", admin.tenantId);
      console.log("  Criado em:", admin.createdAt);
      console.log("");
    });

    if (superAdmins.length > 0) {
      // Verificar as contas associadas
      for (const admin of superAdmins) {
        const accounts = await db
          .select({
            id: account.id,
            userId: account.userId,
            providerId: account.providerId,
            accountId: account.accountId,
            hasPassword: account.password,
          })
          .from(account)
          .where(eq(account.userId, admin.id));

        console.log(`Contas associadas ao super admin ${admin.email}:`);
        accounts.forEach((acc) => {
          console.log("- ID da conta:", acc.id);
          console.log("  Provider ID:", acc.providerId);
          console.log("  Account ID:", acc.accountId);
          console.log("  Tem senha?", acc.hasPassword !== null);
          console.log("");
        });
      }
    } else {
      // Verificar se existe algum usuário com o ID específico do super admin
      const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID || "super-admin-id";
      const specificAdmin = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.id, SUPER_ADMIN_ID));

      if (specificAdmin.length > 0) {
        console.log(
          `Usuário encontrado com ID de super admin (${SUPER_ADMIN_ID}) mas role diferente:`
        );
        specificAdmin.forEach((admin) => {
          console.log("- ID:", admin.id);
          console.log("  Nome:", admin.name);
          console.log("  Email:", admin.email);
          console.log("  Role:", admin.role);
          console.log("  Tenant ID:", admin.tenantId);
          console.log("  Criado em:", admin.createdAt);
        });
      } else {
        console.log("Nenhum usuário com ID de super admin encontrado.");
      }
    }
  } catch (error) {
    console.error("Erro ao verificar super admin:", error);
  }
}

checkSuperAdmin().catch(console.error);
