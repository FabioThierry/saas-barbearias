import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db"; // sua instância do drizzle
import { schema } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

const super_admin_id = process.env.SUPER_ADMIN_ID?.toString() || "";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    password: {
      // Configuração personalizada para trabalhar com senhas já existentes no banco de dados
      hash: async (password: string) => {
        // Esta função é usada ao criar novos usuários via API do Better Auth
        return await bcrypt.hash(password, 10);
      },
      verify: async (data: { hash: string; password: string }) => {
        // Esta função é usada para verificar senhas durante o login
        // Ela verifica tanto senhas criadas pelo Better Auth quanto pelo seeding
        return await bcrypt.compare(data.password, data.hash);
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg", // ou "mysql", "sqlite"
    schema,
  }),
  plugins: [
    admin({
      adminUserIds: [
        ...(super_admin_id ? [super_admin_id] : []), // ID do super admin que criaremos via seed
      ],
      adminRoles: ["super_admin", "admin"], // Definindo quais papéis são considerados administrativos
    }),
    nextCookies(), // certifique-se de que este seja o último plugin no array
  ],
});
