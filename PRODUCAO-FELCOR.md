# Felcor — preparação para produção

## Diagnóstico de 28/10/2026

O repositório local aponta para `https://github.com/Jnovaess/Felcor.git`. A consulta somente de leitura ao D1 `6c504523-891d-41e5-8a81-6590932cd87e` retornou apenas `_cf_KV`: nenhuma tabela da aplicação havia sido criada. O login antigo dependia de cabeçalhos fornecidos pelo proxy do ChatGPT, ausente em workers.dev. Esses cabeçalhos não são prova de identidade quando enviados diretamente por um visitante.

## Alterações preparadas

- `vite.config.ts`: Worker `felcor`, D1 real, BUCKET existente, telefone `5511943777352` e ADMIN_EMAIL já informado pelo proprietário. Preservados Vinext, scripts de build e plugin Sites. O projeto agora usa o fluxo GitHub/Cloudflare; o manifesto histórico Sites não deve ser usado para publicar esta versão pelo conector.
- `lib/access.ts`, `lib/admin-session.ts`, `lib/password.mjs`, `app/api/auth/*`, `app/admin/login`: login administrativo próprio, senha com scrypt, salt aleatório, comparação constante, cookie HttpOnly/Secure/SameSite Strict e sessão de oito horas. No D1 fica somente o hash do token de sessão. A senha fica somente como hash em um Secret Cloudflare. Rotacionar o hash invalida sessões existentes.
- Limites persistentes: dez tentativas por IP e trinta globais por janela de quinze minutos. Login, logout e APIs de escrita verificam Origin. Não existe cadastro público de administrador.
- `app/chatgpt-auth.ts`: não confia em cabeçalhos externos na hospedagem direta. O cadastro de clientes ainda precisa de um provedor de identidade próprio; `/conta` informa isso sem redirecionar para um login inexistente. Comprar via WhatsApp não exige conta.
- `app/api/products`, `app/admin/panel.tsx`: CRUD protegido, exclusão confirmada, importação que preserva registros existentes e erros de catálogo compreensíveis. A vitrine consulta apenas D1, sem substituir banco vazio por exemplos.
- Upload R2 existente preservado: PNG/JPEG/WebP até 5 MB, validação por assinatura do arquivo, gravação administrativa e leitura por rota controlada. O bucket não foi tornado público.
- Checkout revalida IDs, estoque, visibilidade e preços no servidor. Abre um rascunho para o WhatsApp do vendedor com quantidades e subtotal. O comprador precisa enviar a mensagem. Não cobra, confirma pagamento, reserva estoque ou registra um pedido.

## Configuração

No Cloudflare: Workers & Pages → `felcor` → Settings → Variables and Secrets.

| Nome | Tipo | Valor/procedimento |
|---|---|---|
| ADMIN_EMAIL | variável | joaonovaesq4@gmail.com |
| WHATSAPP_NUMBER | variável | 5511943777352 |
| ADMIN_PASSWORD_HASH | Secret | Gerado pelo procedimento abaixo; nunca use a senha diretamente |
| TRUST_SITES_IDENTITY | variável opcional | false; nunca habilitar em workers.dev |
| DB | binding D1 | site-creator-d1, ID acima |
| BUCKET | binding R2 | site-creator-r2 |

E-mail administrativo é identificador de acesso, não uma integração de envio. Newsletter/interesses e perfil apenas armazenam registros; não enviam mensagens. Nenhum provedor de e-mail transacional está configurado. Recuperação por e-mail, notificações e confirmação por e-mail continuam pendentes de escolha de provedor, credencial e domínio remetente verificado.

## Publicação — executar somente após autorização

Comandos no diretório do projeto. Os comandos remotos abaixo alteram produção e não foram executados. Não faça push para main antes da preparação, pois ela pode disparar deploy automático.

1. Reconsultar o esquema e gerar backup após aprovação explícita para copiar o D1 para `outputs/`. Guardar o arquivo em local protegido; não enviar ao GitHub. A exportação foi bloqueada pela revisão automática por precisar dessa autorização e não foi concluída.

```powershell
npx wrangler d1 execute DB --config wrangler.ops.json --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
npx wrangler d1 export DB --config wrangler.ops.json --remote --output outputs/d1-before-production.sql
```

2. Aplicar as migrações. `0000_strange_saracen.sql` cria products, profiles e interests; `0001_admin_sessions.sql` cria admin_sessions e login_attempts. Nenhuma apaga registros. Se surgirem tabelas desde a consulta inicial, comparar o esquema antes de aplicar 0000; não marcar migrações como aplicadas sem conferir as colunas.

```powershell
npx wrangler d1 migrations apply DB --config wrangler.ops.json --remote
node scripts/seed-catalog.mjs
npx wrangler d1 execute DB --config wrangler.ops.json --remote --file outputs/catalog.sql
```

A importação lê os dois produtos Felcor do código, usa IDs estáveis e `ON CONFLICT DO NOTHING`. Preço e estoque permanecem zero/a definir. Não modifica produtos já editados. É possível importar pelo painel depois do login.

3. Definir a senha em terminal privado (nunca no chat):

```powershell
node scripts/provision-admin.mjs
```

O script pede senha e confirmação sem exibi-las, calcula scrypt e envia somente o hash via stdin ao Wrangler para o Secret `ADMIN_PASSWORD_HASH` do Worker `felcor`. Requer login autorizado no Cloudflare. Para recuperar acesso, executar novamente com uma nova senha; sessões antigas deixam de ser aceitas. Não há senha padrão ou rota pública de provisionamento.

4. Validar e publicar:

```powershell
npx tsc --noEmit
npm run build
node scripts/test-production.mjs
git status --short
git diff --check
# Após revisar os arquivos, commit e push para main somente com autorização.
# Alternativa manual de deploy, também somente com autorização:
npx wrangler deploy --config dist/server/wrangler.json
```

Conferir no JSON gerado: `name=felcor`, DB com ID real, BUCKET correto, WHATSAPP_NUMBER. Não editar dist manualmente. Não executar deploy do starter antigo nem publicar pelo manifesto Sites histórico. Verificar o orçamento de CPU do plano Workers: hashing seguro consome CPU; o plano gratuito pode ser insuficiente. Não reduzir a segurança da senha para caber no limite. Validar login em produção e, se necessário, aprovar plano adequado ou usar provedor externo de identidade.

5. Abrir `/admin/login`, entrar com o e-mail acima e a senha escolhida; definir preços e estoque reais. Conferir imagens e checkout. Nenhum valor foi inventado.

## Verificação realizada

- `npm run build`: aprovado, com nome felcor e bindings esperados no artefato gerado.
- TypeScript (`tsc --noEmit`) e `git diff --check`: aprovados.
- Migrações executadas em banco local separado: aprovadas.
- `node scripts/test-production.mjs`: aprovado contra o Worker compilado em Miniflare, D1 e R2 isolados. Verificou página inicial/login, senha incorreta, e-mail não autorizado, rejeição de cabeçalhos de identidade falsos, CSRF, cookies protegidos, login/logout, importação idempotente, preservação de edição, preço inválido, edição de preço/estoque, visibilidade, exclusão, upload/leitura JPEG e bloqueio de upload sem login. Verificou também o destinatário WhatsApp, subtotal de R$ 99,80 para duas unidades de teste de R$ 49,90 e rejeição de quantidade superior ao estoque. Esses valores só existiram no banco efêmero do teste.
- A primeira tentativa via proxy HTTPS do Wrangler reiniciava durante POST. A suíte final usa o runtime Miniflare diretamente, sem esse proxy. Build ou teste local não substituem a conferência pós-deploy.
- Não houve push, deploy, alteração de banco remoto, cadastro de senha real ou envio de WhatsApp. Testes visuais de responsividade no navegador e validação final no plano Cloudflare real permanecem pendentes.

## Recuperação e limitações

Guardar versão anterior do Worker e backup antes de publicar. O rollback de código pode ser feito para a versão anterior no Cloudflare, mas ela mantém a limitação da autenticação antiga. Não restaurar banco por cima de novos pedidos/cadastros sem análise e autorização; primeiro examinar o backup em um banco separado. Migrações são aditivas e podem permanecer após rollback de código.

Os testes locais não comprovam limites de CPU do plano real, entrega de e-mails, pagamento nem entrega de mensagem no WhatsApp. Nenhuma mensagem real foi enviada. Domínio personalizado ainda depende do nome escolhido e do acesso ao DNS. Não foi comprado nem alterado domínio.
