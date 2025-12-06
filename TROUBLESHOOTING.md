# Guia de Solução de Problemas

## Problemas comuns de login

### Não consigo fazer login com o super admin criado pelo seed

#### Possíveis causas e soluções:

1. **Senha incorreta**

   - Verifique se você está usando a senha correta
   - Senha padrão: `senha-padrao-super-admin`
   - Se você definiu a variável de ambiente `SUPER_ADMIN_PASSWORD`, use esse valor

2. **Email incorreto**

   - Email padrão: `superadmin@empresa.com`
   - Se você definiu a variável de ambiente `SUPER_ADMIN_EMAIL`, use esse valor

3. **Dados não foram gravados corretamente**
   - Execute o script novamente para garantir que o super admin foi criado:
   ```bash
   npm run seed:super-admin
   ```
4. **Banco de dados não está sincronizado**

   - Verifique se as migrações foram aplicadas:

   ```bash
   npm run db:migrate
   ```

5. **Conexão com o banco de dados**
   - Confirme que o `DATABASE_URL` no arquivo `.env` está correto
   - Verifique se o banco de dados está rodando (no nosso caso, com Docker)

#### Como verificar se o super admin existe no banco de dados:

Execute o script de verificação:

```bash
npx tsx scripts/check-super-admin.ts
```

Isso mostrará:

- Se o super admin está registrado no banco de dados
- O email e nome do usuário
- Se a conta tem senha definida

#### Caso precise recriar o super admin:

Se por algum motivo os dados estiverem corrompidos, você pode deletar o usuário existente e rodar o seed novamente. Para isso, você pode:

1. Acessar o banco de dados via Drizzle Studio:

   ```bash
   npx drizzle-kit studio
   ```

2. Ou executar uma query direta para remover o super admin existente (em um script temporário)
