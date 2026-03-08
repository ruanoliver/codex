import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';

export default function ReportsPage() {
  const [summary, setSummary] = useState({ weeklyTotal: 0, monthlyTotal: 0, byDestination: [], byPeriod: [] });

  useEffect(() => {
    api.get('/api/reports/summary').then(({ data }) => setSummary(data));
  }, []);

  return (
    <div>
      <h1>Relatórios automáticos</h1>
      <div className="grid-cards">
        <div className="card">Total semanal: <strong>{summary.weeklyTotal} km</strong></div>
        <div className="card">Total mensal: <strong>{summary.monthlyTotal} km</strong></div>
      </div>

      <div className="chart-box">
        <h3>Quilometragem por região/destino</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={summary.byDestination}>
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
