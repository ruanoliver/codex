import { useEffect, useState } from 'react';
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
  const [editingId, setEditingId] = useState(null);
  const [cepStatus, setCepStatus] = useState('');

  const load = async () => {
    const { data } = await api.get('/api/kms-records');
    setRecords(data);
  };

  useEffect(() => {
    load();
  }, []);

  const lookupCep = async (rawCep) => {
    const cep = normalizeCep(rawCep || form.cep);

    if (cep.length !== 8) {
      setCepStatus('Digite um CEP com 8 números para buscar o endereço.');
      return;
    }

    try {
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
      ]
        .filter(Boolean)
        .join(', ');

      setForm((prev) => ({
        ...prev,
        cep,
        address: fullAddress,
        destination: prev.destination || `${data.localidade}/${data.uf}`,
      }));
      setCepStatus('Endereço preenchido automaticamente.');
    } catch {
      setCepStatus('Não foi possível consultar o CEP no momento.');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.put(`/api/kms-records/${editingId}`, form);
    else await api.post('/api/kms-records', { ...form, kilometers: Number(form.kilometers) });

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

  return (
    <div>
      <h1>KMS-M - Quilometragem diária</h1>
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
            <button type="button" onClick={() => lookupCep(form.cep)}>Buscar CEP</button>
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
                {r.google_maps_url ? <a href={r.google_maps_url} target="_blank" rel="noreferrer">Visualizar Rota</a> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
