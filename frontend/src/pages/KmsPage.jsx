import { useEffect, useState } from 'react';
import api from '../api';

const initial = { date: '', time: '', destination: '', address: '', route_description: '', kilometers: '', origin_address: '' };

export default function KmsPage() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const { data } = await api.get('/api/kms-records');
    setRecords(data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.put(`/api/kms-records/${editingId}`, form);
    else await api.post('/api/kms-records', { ...form, kilometers: Number(form.kilometers) });

    setForm(initial);
    setEditingId(null);
    load();
  };

  const remove = async (id) => {
    await api.delete(`/api/kms-records/${id}`);
    load();
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm(row);
  };

  return (
    <div>
      <h1>KMS-M - Quilometragem diária</h1>
      <form className="panel" onSubmit={submit}>
        <div className="grid-2">
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
          <input placeholder="Destino" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
          <input placeholder="Endereço" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <input placeholder="Origem (opcional)" value={form.origin_address} onChange={(e) => setForm({ ...form, origin_address: e.target.value })} />
          <input placeholder="KM" type="number" step="0.1" value={form.kilometers} onChange={(e) => setForm({ ...form, kilometers: e.target.value })} required />
        </div>
        <textarea placeholder="Descrição do percurso" value={form.route_description} onChange={(e) => setForm({ ...form, route_description: e.target.value })} />
        <button>{editingId ? 'Salvar edição' : 'Criar registro'}</button>
      </form>

      <table>
        <thead>
          <tr><th>Data</th><th>Hora</th><th>Destino</th><th>KM</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td>{r.time}</td>
              <td>{r.destination}</td>
              <td>{r.kilometers}</td>
              <td>
                <button onClick={() => startEdit(r)}>Editar</button>
                <button onClick={() => remove(r.id)}>Excluir</button>
                {r.google_maps_url ? <a href={r.google_maps_url} target="_blank">Visualizar Rota</a> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
