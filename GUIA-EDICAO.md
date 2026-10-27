# Guia de edição — Marquiori

## Editar produtos e enviar fotos
Abra /admin com a conta administrativa. Clique em Editar ou Novo produto. Preencha nome, valor, estoque, categoria e descrição. Em Imagem do produto, escolha uma foto do computador (PNG, JPEG ou WebP, até 5 MB), aguarde a prévia e clique em Salvar produto. A gravação no banco é imediata; atualize a loja para conferir. O endereço manual da imagem continua disponível.

O upload é restrito ao administrador e verifica origem da requisição, tamanho, tipo e assinatura do arquivo. O arquivo é armazenado primeiro; só é vinculado ao produto ao salvar. Arquivos enviados e não salvos não são apagados automaticamente. A imagem anterior também é preservada ao trocar a foto.

## Abas, páginas e visual
O painel edita dados do catálogo; não é um construtor visual de páginas. Peça alterações neste chat ou edite o código e publique nova versão pelo fluxo Sites.

- Menu e conteúdo inicial: app/storefront.tsx.
- Estilos e celular: app/globals.css.
- Painel: app/admin/panel.tsx.
- Nova página de exemplo: app/sobre/page.tsx, acessível em /sobre. Acrescente o link no menu de app/storefront.tsx.
- Guia no próprio site: /admin/ajuda.

## Banco e arquivos
Cloudflare D1 (SQL baseado em SQLite) guarda products, profiles e interests. O esquema está em db/schema.ts; migrações em drizzle/; conexão em db/index.ts. Cloudflare R2 guarda os novos arquivos de imagem, acessíveis pela rota /api/images/[key]. O endereço fica no registro do produto no D1. As imagens originais continuam em public/assets.

Sites provisiona os recursos e injeta DB e BUCKET conforme .openai/hosting.json. Produção e testes locais usam bancos e arquivos separados. O painel não fornece um console SQL nem credenciais para o painel Cloudflare. A sacola continua no navegador do visitante.

Não há planos de assinatura nesta versão, conforme solicitado. Pagamentos e pedidos continuam fora do escopo atual.
