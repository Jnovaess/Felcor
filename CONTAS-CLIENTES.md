# Contas de clientes

Em /conta, clientes podem criar conta usando nome, e-mail e senha exclusiva de 14 a 128 caracteres. O endereço pode ser Gmail, Outlook ou outro provedor; isso não é autenticação com Google.

Senhas são protegidas por scrypt com salt aleatório. Sessões duram oito horas, com token aleatório cujo hash fica no D1, cookie HttpOnly/Secure/SameSite Strict e verificação de origem nas escritas. Cadastro e login têm limite de dez tentativas por IP a cada quinze minutos. Contas de clientes não concedem privilégios administrativos, mesmo que usem o e-mail do proprietário. Perfis são identificados pelo ID da sessão, nunca por um ID fornecido pelo visitante.

Migração 0002_customer_accounts.sql adiciona duas tabelas sem alterar produtos e perfis existentes. Backup autorizado: outputs/d1-before-customers-2026-10-28.sql (ignorado pelo Git).

O e-mail informado ainda não é verificado. Não use esses registros como comprovação de identidade ou titularidade de endereço. Não existe associação automática de contas com o mesmo e-mail a outros provedores. A confirmação de endereço e a recuperação de senha precisam de serviço de e-mail transacional. Não há reset por simples informação de e-mail.

Google e outros logins sociais dependem do cadastro de uma aplicação OAuth da marca, credenciais privadas no Cloudflare e URLs autorizadas. Ainda não foram habilitados. Não adicionar botão social antes de implementar e validar o provedor.
