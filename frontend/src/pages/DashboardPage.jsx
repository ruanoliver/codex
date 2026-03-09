import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import KmsPage from './KmsPage';
import ReportsPage from './ReportsPage';
import UsersPage from './UsersPage';

function Home() {
  return (
    <div>
      <h1>Painel Principal</h1>
      <div className="grid-cards">
        <Link className="card" to="/kms">KMS-M</Link>
        <Link className="card" to="/reports">Relatórios</Link>
        <Link className="card" to="/users">Gerenciar Usuários</Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kms" element={<KmsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
