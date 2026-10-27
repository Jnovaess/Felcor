# Marquiori Barber Club

Loja em português com identidade preta/dourada e logo fornecido pelo cliente. Referência: https://www.usebaboon.com.br/.

## Funcionalidades
- Catálogo, categorias, busca, ordenação, detalhes e sacola persistente neste navegador.
- `/admin`: produtos, preços em centavos, estoque, imagens por URL e visibilidade; consulta de clientes e inscrições.
- `/conta`: cadastro persistente de nome e telefone vinculado à identidade autenticada.
- Cloudflare D1: products, profiles e interests. Migrações em drizzle/.
- Login gerenciado pelo Sites; `ADMIN_EMAIL` configurado no ambiente de produção. Somente esse e-mail pode administrar. Os clientes só podem acessar e atualizar o próprio perfil.

## Estado da primeira versão
O site nasce privado para revisão. Catálogo vazio mostra exemplos claramente identificados, sem criar registros automaticamente. Use Importar produtos de demonstração para gravá-los no banco e editar. Desmarque Exibir produto para ocultar um item.

Imagens e preços de produtos de referência são demonstrativos. A marca de fabricante dos produtos foi preservada. Fotos reais, catálogo definitivo e contatos comerciais precisam ser definidos antes do lançamento público. Não foram copiados avaliações de clientes, CNPJ, contatos nem promessas comerciais da referência.

Pagamentos, pedidos, frete, envio de newsletters e domínio próprio não estão ativados. A sacola não gera pedidos nem cobra valores. Estoque é editável, mas não é reservado pela sacola.

## Desenvolvimento
Instale dependências com o helper Sites; `npm run db:generate` gera migrações. Faça build com o helper build-site.mjs. Aplique migrações locais pelo comando D1 descrito em README.md. `npm run dev` inicia a prévia. Para testar administração local, use ADMIN_EMAIL=seedy@sites.test em .dev.vars (ignorado pelo Git); nunca use esse valor na produção.

Antes de abrir acesso público, revisar conteúdo comercial, privacidade, contatos, domínio e integrações de venda. A autorização do administrador é verificada no servidor e permanece restrita mesmo se o site se tornar público.
