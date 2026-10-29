export default function AdminNav() {
  return <nav className="admin-nav" aria-label="Navegação administrativa"><a href="/admin">Produtos e clientes</a><a href="/admin/relatorios">Relatórios</a><a href="/admin/ajuda">Como editar o site</a><a href="/">Ver loja ↗</a><form action="/api/auth/logout" method="post"><button className="table-button">Sair</button></form></nav>;
}
