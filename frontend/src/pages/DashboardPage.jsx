import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import KmsPage from './KmsPage';
import ReportsPage from './ReportsPage';
import UsersPage from './UsersPage';
import api from '../api';

function Home() {
  const [summary, setSummary] = useState({ todayTotal: 0, monthlyTotal: 0, totalRecords: 0 });

  useEffect(() => {
    api.get('/api/reports/summary').then(({ data }) => setSummary(data)).catch(() => {});
  }, []);


function Home() {
  return (
    <div>
      <h1>Painel Principal</h1>
      <div className="grid-cards">
        <div className="card"><span className="muted">KM hoje</span><strong>{summary.todayTotal} km</strong></div>
        <div className="card"><span className="muted">KM no mês</span><strong>{summary.monthlyTotal} km</strong></div>
        <div className="card"><span className="muted">Registros</span><strong>{summary.totalRecords}</strong></div>
      </div>

      <div className="grid-cards">
        <Link className="card card-link" to="/kms">Novo registro</Link>
        <Link className="card card-link" to="/reports">Ver relatórios</Link>
        <Link className="card card-link" to="/users">Gerenciar usuários</Link>
        <Link className="card" to="/kms">KMS-M</Link>
        <Link className="card" to="/reports">Relatórios</Link>
        <Link className="card" to="/users">Gerenciar Usuários</Link>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="panel">
      <h1>Configurações</h1>
      <p className="muted">Preferências gerais e opções de conta ficarão aqui.</p>
      <p className="muted">// Teoricamente tudo sob controle. Na prática, sempre há um bug quântico observando você.</p>
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
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
