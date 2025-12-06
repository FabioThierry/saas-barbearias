import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function createTestUser() {
  console.log("Criando usuário de teste via API do Better Auth...");

  try {
    // Criar usuário usando a API do Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email: "testuser@example.com",
        password: "TestPassword123!",
        name: "Test User",
      },
    });

    console.log("Usuário criado via API:", result?.user?.email);

    // Agora vamos buscar as informações detalhadas no banco de dados
    const createdUser = await db
      .select()
      .from(user)
      .where(eq(user.email, "testuser@example.com"));

    console.log(
      "Usuário no banco de dados:",
      JSON.stringify(createdUser[0], null, 2)
    );

    if (createdUser.length > 0) {
      const userAccounts = await db
        .select()
        .from(account)
        .where(eq(account.userId, createdUser[0].id));

      console.log(
        "Contas associadas:",
        JSON.stringify(userAccounts[0], null, 2)
      );
    }
  } catch (error) {
    console.error("Erro ao criar usuário via API:", error);
  }
}

createTestUser().catch(console.error);
