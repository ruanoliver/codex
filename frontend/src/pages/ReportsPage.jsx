import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';

export default function ReportsPage() {
  const [summary, setSummary] = useState({
    todayTotal: 0,
    weeklyTotal: 0,
    monthlyTotal: 0,
    totalRecords: 0,
    byDestination: [],
    byPeriod: [],
  });
  const [summary, setSummary] = useState({ weeklyTotal: 0, monthlyTotal: 0, byDestination: [], byPeriod: [] });

  useEffect(() => {
    api.get('/api/reports/summary').then(({ data }) => setSummary(data));
  }, []);

  return (
    <div>
      <h1>Relatórios automáticos</h1>
      <div className="grid-cards">
        <div className="card"><span className="muted">Hoje</span><strong>{summary.todayTotal} km</strong></div>
        <div className="card"><span className="muted">Semanal</span><strong>{summary.weeklyTotal} km</strong></div>
        <div className="card"><span className="muted">Mensal</span><strong>{summary.monthlyTotal} km</strong></div>
        <div className="card"><span className="muted">Registros</span><strong>{summary.totalRecords}</strong></div>
        <div className="card">Total semanal: <strong>{summary.weeklyTotal} km</strong></div>
        <div className="card">Total mensal: <strong>{summary.monthlyTotal} km</strong></div>
      </div>

      <div className="chart-box">
        <h3>Quilometragem por região/destino</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={summary.byDestination}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="region" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <h3>Quilometragem por dia</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={summary.byPeriod}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="period" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" />
        <h3>Comparação por período</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={summary.byPeriod}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
