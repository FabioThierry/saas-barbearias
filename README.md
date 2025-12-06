# Sistema de Agendamento para Barbearias

Este é um sistema SaaS de agendamento para barbearias com modelo multi-tenant, construído com Next.js 16, TypeScript, PostgreSQL, Drizzle ORM, Better Auth, Tailwind CSS e ShadCN UI.

## Configuração do Projeto

### Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente no arquivo `.env`

### Banco de Dados

Configure o banco de dados PostgreSQL:

```bash
# Execute as migrações
npm run db:migrate
```

### Autenticação

O sistema utiliza Better Auth para autenticação. Para criar o super admin inicial:

```bash
npm run seed:super-admin
```

Este comando criará um super admin com as credenciais padrão, a menos que já exista um super admin no sistema.

## Sistema de Autorizações Fechado

Este sistema implementa um modelo de autorizações fechado onde:

- O super admin é criado via script de seed
- Apenas o super admin pode criar admins
- Super admin e admins podem criar barbers
- O cadastro público está desativado
- O acesso é estritamente controlado por papéis e tenants

## Rodando a Aplicação

Desenvolvimento:

```bash
npm run dev
```

Produção:

```bash
npm run build
npm run start
```

## Variáveis de Ambiente

- `DATABASE_URL`: String de conexão com o banco de dados PostgreSQL
- `SUPER_ADMIN_EMAIL`: Email do super admin (opcional, padrão: superadmin@empresa.com)
- `SUPER_ADMIN_PASSWORD`: Senha do super admin (opcional, padrão: senha-padrao-super-admin)

## Credenciais de Login

Após rodar o script de seed, você pode fazer login com:

- Email: `superadmin@empresa.com`
- Senha: `senha-padrao-super-admin` (a menos que tenha sido alterado via variável de ambiente `SUPER_ADMIN_PASSWORD`)

## Solução de Problemas Comuns

Se ainda estiver tendo problemas para fazer login com o super admin:

1. **Certifique-se de que o banco de dados está atualizado**: Execute `npm run db:migrate` para garantir que todas as migrações estejam aplicadas.

2. **Execute novamente o script de seed**: Às vezes, pode ser necessário recriar o super admin:

   ```bash
   npm run seed:super-admin
   ```

3. **Verifique os dados no banco de dados**: Você pode usar o Drizzle Studio para inspecionar diretamente os dados:

   ```bash
   npx drizzle-kit studio
   ```

4. **Problemas com autenticação por credenciais**: Verifique se o campo `accountId` na tabela `account` para o super admin tem o mesmo valor do campo `email` na tabela `user`. Para provedores de credenciais (email/senha), o `accountId` deve ser o email do usuário.

5. **Problemas com autenticação por credenciais**: Verifique se o campo `accountId` na tabela `account` para o super admin tem o mesmo valor do campo `id` na tabela `user`. Para provedores de credenciais (email/senha), o `accountId` deve ser o ID do usuário.

## Gerenciamento de Super Admin

O sistema inclui scripts para gerenciar o super admin:

- `npx tsx scripts/seed-super-admin.ts` - Cria o super admin no banco de dados
- `npx tsx scripts/check-super-admin.ts` - Verifica se o super admin existe
- `npx tsx scripts/clear-super-admin.ts` - Remove o super admin do banco de dados

### Configuração do Super Admin

O super admin é configurado usando o plugin admin do Better Auth:

1. O ID do super admin é definido na variável de ambiente `SUPER_ADMIN_ID`
2. O email é definido na variável de ambiente `SUPER_ADMIN_EMAIL`
3. A senha é definida na variável de ambiente `SUPER_ADMIN_PASSWORD`

O super admin tem acesso total ao sistema e pode gerenciar todos os tenants e usuários.

### Como Funciona

O sistema implementa um modelo de autenticação fechado onde:

- O super admin é criado via script de seed
- Apenas o super admin pode criar novos administradores
- Administradores podem gerenciar barbeiros em seus tenants
- O acesso é controlado por papéis (roles) e IDs de tenant
