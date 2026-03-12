import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'standard',
    permissions: { can_create: 1, can_edit: 0, can_delete: 0, can_manage_users: 0 },
  });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível criar sua conta.');
    }
  };

  return (
    <div className="centered auth-bg">
      <form onSubmit={submit} className="panel auth-card">
        <h1>Novo usuário</h1>
        {error && <p className="error">{error}</p>}
        <input placeholder="Nome" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="E-mail" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" minLength={6} placeholder="Senha" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
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
        <Link to="/login" className="muted-link">Voltar ao login</Link>
      </form>
    </div>
  );
}
