import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'standard',
    permissions: { can_create: 1, can_edit: 0, can_delete: 0, can_manage_users: 0 },
  });

  const submit = async (e) => {
    e.preventDefault();
    await register(form);
    navigate('/');
  };

  return (
    <div className="centered">
      <form onSubmit={submit} className="panel">
        <h1>Cadastro</h1>
        <input placeholder="Nome" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="E-mail" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Senha" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="admin">Administrador</option>
          <option value="management">Gerência</option>
          <option value="standard">Usuário padrão</option>
        </select>
        <button>Cadastrar</button>
      </form>
    </div>
  );
}
