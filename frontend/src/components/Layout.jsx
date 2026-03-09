import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/kms', label: 'KMS-M' },
  { to: '/reports', label: 'Relatórios' },
  { to: '/settings', label: 'Configurações' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h2>KMS-M</h2>
          <p className="muted">{user?.name}</p>
        </div>

        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
          ))}
          {user?.permissions?.can_manage_users || user?.role === 'admin' ? <NavLink to="/users">Usuários</NavLink> : null}
        </nav>

        <button onClick={logout}>Sair</button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
