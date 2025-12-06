# Scripts

Esta pasta contém scripts utilitários para gerenciamento da aplicação.

## Estrutura de diretórios

- `auth/` - Scripts relacionados à autenticação e gerenciamento de usuários
- `db/` - Scripts relacionados ao banco de dados
- `test/` - Scripts de teste e verificação

## Scripts disponíveis

### Autenticação (`auth/`)

- `seed-super-admin.ts` - Cria o usuário super admin no banco de dados
- `check-super-admin.ts` - Verifica se o super admin existe e exibe informações
- `clear-super-admin.ts` - Remove o super admin do banco de dados

### Banco de dados (`db/`)

- `example-db-script.ts` - Script de exemplo para operações de banco de dados

### Testes (`test/`)

- `create-test-user.ts` - Cria um usuário de teste via API do Better Auth
- `test-login.ts` - Testa o login do super admin
