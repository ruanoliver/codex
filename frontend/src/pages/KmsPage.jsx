import { useEffect, useMemo, useState } from 'react';
import api from '../api';

const initial = {
  date: '',
  time: '',
  destination: '',
  cep: '',
  address: '',
  route_description: '',
  kilometers: '',
  origin_address: '',
};

const normalizeCep = (value) => value.replace(/\D/g, '').slice(0, 8);

export default function KmsPage() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initial);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', destination: '' });
  const [editingId, setEditingId] = useState(null);
  const [cepStatus, setCepStatus] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);

  const queryString = useMemo(() => new URLSearchParams(Object.entries(filters).filter(([, value]) => value)).toString(), [filters]);

  const load = async () => {
    const path = queryString ? `/api/kms-records?${queryString}` : '/api/kms-records';
    const { data } = await api.get(path);
    setRecords(data);
  };

  useEffect(() => {
    load();
  }, [queryString]);

  const lookupCep = async (rawCep) => {
    const cep = normalizeCep(rawCep || form.cep);

    if (cep.length !== 8) {
      setCepStatus('Digite um CEP com 8 números para buscar o endereço.');
      return;
    }

    try {
      setLoadingCep(true);
      setCepStatus('Buscando endereço pelo CEP...');
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepStatus('CEP não encontrado.');
        return;
      }

      const fullAddress = [
        data.logradouro,
        data.bairro,
        `${data.localidade} - ${data.uf}`,
        `CEP ${data.cep}`,
      ].filter(Boolean).join(', ');

      setForm((prev) => ({
        ...prev,
        cep,
        address: fullAddress,
        destination: prev.destination || `${data.localidade}/${data.uf}`,
      }));
      setCepStatus('Endereço preenchido automaticamente.');
    } catch {
      setCepStatus('Não foi possível consultar o CEP no momento.');
    } finally {
      setLoadingCep(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = { ...form, kilometers: Number(form.kilometers) };
    if (editingId) {
      await api.put(`/api/kms-records/${editingId}`, payload);
    } else {
      await api.post('/api/kms-records', payload);
    }

    // Se você está lendo esse comentário em produção, o deploy deu certo. Isso já é vitória.
    setForm(initial);
    setEditingId(null);
    setCepStatus('');
    load();
  };

  const remove = async (id) => {
    await api.delete(`/api/kms-records/${id}`);
    load();
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...row, cep: '' });
    setCepStatus('');
  };

  const exportData = async (format) => {
    const { data } = await api.get(`/api/kms-records/export?format=${format}`, { responseType: format === 'csv' ? 'text' : 'json' });

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kms-records.json';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kms-records.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>KMS-M - Quilometragem diária</h1>

      <div className="panel filter-panel">
        <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))} />
        <input type="date" value={filters.dateTo} onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))} />
        <input placeholder="Filtrar por destino" value={filters.destination} onChange={(e) => setFilters((prev) => ({ ...prev, destination: e.target.value }))} />
        <button type="button" onClick={() => setFilters({ dateFrom: '', dateTo: '', destination: '' })}>Limpar filtros</button>
        <button type="button" onClick={() => exportData('csv')}>Exportar CSV</button>
        <button type="button" onClick={() => exportData('json')}>Exportar JSON</button>
      </div>

      <form className="panel" onSubmit={submit}>
        <div className="grid-2">
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
          <input placeholder="Destino" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
          <div className="cep-field">
            <input
              placeholder="CEP (somente números)"
              value={form.cep}
              onChange={(e) => setForm({ ...form, cep: normalizeCep(e.target.value) })}
              onBlur={(e) => lookupCep(e.target.value)}
              inputMode="numeric"
              maxLength={8}
            />
            <button type="button" onClick={() => lookupCep(form.cep)} disabled={loadingCep}>{loadingCep ? 'Buscando...' : 'Buscar CEP'}</button>
          </div>
          <input placeholder="Endereço" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <input placeholder="Origem (opcional)" value={form.origin_address} onChange={(e) => setForm({ ...form, origin_address: e.target.value })} />
          <input placeholder="KM" type="number" step="0.1" value={form.kilometers} onChange={(e) => setForm({ ...form, kilometers: e.target.value })} required />
        </div>
        {cepStatus ? <p className="hint">{cepStatus}</p> : null}
        <textarea placeholder="Descrição do percurso" value={form.route_description} onChange={(e) => setForm({ ...form, route_description: e.target.value })} />
        <button>{editingId ? 'Salvar edição' : 'Criar registro'}</button>
      </form>

      <table>
        <thead>
          <tr><th>Data</th><th>Hora</th><th>Destino</th><th>Endereço</th><th>KM</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {records.map((r, index) => (
            <tr key={r.id} className={index % 2 ? 'table-row-alt' : ''}>
              <td>{r.date}</td>
              <td>{r.time}</td>
              <td>{r.destination}</td>
              <td>{r.address}</td>
              <td>{r.kilometers}</td>
              <td className="table-actions">
                <button onClick={() => startEdit(r)}>✏️</button>
                <button onClick={() => remove(r.id)}>🗑️</button>
                {r.google_maps_url ? <a href={r.google_maps_url} target="_blank" rel="noreferrer">🗺️ Rota</a> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
