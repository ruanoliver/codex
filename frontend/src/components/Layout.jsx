import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>KMS-M</h2>
        <p>{user?.name}</p>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/kms">KMS-M</NavLink>
          <NavLink to="/reports">Relatórios</NavLink>
          {user?.permissions?.can_manage_users || user?.role === 'admin' ? <NavLink to="/users">Usuários</NavLink> : null}
        </nav>
        <button onClick={logout}>Sair</button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
