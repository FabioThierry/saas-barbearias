/**
 * Exemplo de script para operações de banco de dados
 *
 * Para executar este script:
 * npx tsx scripts/db/example-db-script.ts
 */

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { count } from "drizzle-orm";

async function exampleDbScript() {
  console.log("Executando script de exemplo de banco de dados...");

  try {
    // Exemplo: contar número de usuários
    const totalUsers = await db.select().from(user);
    console.log(`Total de usuários: ${totalUsers.length}`);

    console.log("Script executado com sucesso!");
  } catch (error) {
    console.error("Erro ao executar script:", error);
    throw error;
  }
}

// Executar o script se este arquivo for chamado diretamente
if (require.main === module) {
  exampleDbScript().catch(console.error);
}

export default exampleDbScript;
