import { auth } from "@/lib/auth";

async function testLogin() {
  console.log("Testando login do super admin...");

  try {
    // Testar com as credenciais padrão do super admin
    const result = await auth.api.signInEmail({
      body: {
        email: "superadmin@empresa.com",
        password: "senha-padrao-super-admin",
      },
    });

    console.log("Login bem-sucedido:", result?.user?.email);
    console.log("Usuário:", result?.user);
  } catch (error) {
    console.error("Erro no login:", error);
  }
}

testLogin().catch(console.error);
