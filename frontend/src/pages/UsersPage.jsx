import { useEffect, useState } from 'react';
import api from '../api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/api/users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Sem permissão para visualizar usuários.');
    }

  const load = async () => {
    const { data } = await api.get('/api/users');
    setUsers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (user) => {
    await api.put(`/api/users/${user.id}/permissions`, {
      role: user.role,
      permissions: {
        can_create: user.can_create,
        can_edit: user.can_edit,
        can_delete: user.can_delete,
        can_manage_users: user.can_manage_users,
      },
    });
    load();
  };

  if (error) return <div className="panel"><p className="error">{error}</p></div>;

  return (
    <div>
      <h1>Gestão de Usuários e Permissões</h1>
      <table>
        <thead>
          <tr><th>Nome</th><th>Perfil</th><th>Criar</th><th>Editar</th><th>Excluir</th><th>Gerenciar</th><th /></tr>
          <tr><th>Nome</th><th>Perfil</th><th>Criar</th><th>Editar</th><th>Excluir</th><th>Gerenciar</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>
                <select value={u.role} onChange={(e) => setUsers(users.map((x) => (x.id === u.id ? { ...x, role: e.target.value } : x)))}>
                <select value={u.role} onChange={(e) => setUsers(users.map((x) => x.id === u.id ? { ...x, role: e.target.value } : x))}>
                  <option value="admin">Administrador</option>
                  <option value="management">Gerência</option>
                  <option value="standard">Padrão</option>
                </select>
              </td>
              {['can_create', 'can_edit', 'can_delete', 'can_manage_users'].map((key) => (
                <td key={key}>
                  <input
                    type="checkbox"
                    checked={Boolean(u[key])}
                    onChange={(e) => setUsers(users.map((x) => (x.id === u.id ? { ...x, [key]: e.target.checked ? 1 : 0 } : x)))}
                    onChange={(e) => setUsers(users.map((x) => x.id === u.id ? { ...x, [key]: e.target.checked ? 1 : 0 } : x))}
                  />
                </td>
              ))}
              <td><button onClick={() => update(u)}>Salvar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
