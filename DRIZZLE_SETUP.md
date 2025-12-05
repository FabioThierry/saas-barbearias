# Configuração do Drizzle ORM

Este documento descreve a configuração do Drizzle ORM no projeto.

## Arquivos criados

- `drizzle.config.ts` - Arquivo de configuração do Drizzle Kit
- `lib/db/index.ts` - Arquivo de conexão com o banco de dados
- `lib/db/schema.ts` - Arquivo de definição de esquemas
- `drizzle/` - Diretório contendo as migrações SQL

## Comandos disponíveis

- `npm run db:generate` - Gera novas migrações
- `npm run db:migrate` - Aplica migrações ao banco de dados
- `npm run db:push` - Aplica mudanças diretas ao banco de dados (modo desenvolvimento)
- `npm run db:studio` - Inicia o Drizzle Studio para visualização do banco de dados

## Estrutura do banco de dados

A configuração atual inclui uma tabela de exemplo `users` com os campos:

- id (integer, primary key, auto-generated)
- name (varchar, 255 chars, not null)
- age (integer, not null)
- email (varchar, 255 chars, not null, unique)

## Uso no código

Para usar o banco de dados em seus módulos:

```typescript
import { db } from "./lib/db";
import { usersTable } from "./lib/db/schema";

// Exemplo de consulta
const users = await db.select().from(usersTable);
```
