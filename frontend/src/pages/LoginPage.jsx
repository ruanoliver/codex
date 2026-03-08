import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch {
      setError('Falha no login');
    }
  };

  return (
    <div className="centered">
      <form onSubmit={submit} className="panel">
        <h1>Login</h1>
        {error && <p className="error">{error}</p>}
        <input placeholder="E-mail" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Senha" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button>Entrar</button>
        <Link to="/register">Criar conta</Link>
      </form>
    </div>
  );
}
