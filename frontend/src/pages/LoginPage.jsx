import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.identifier, form.password);
      navigate('/');
    } catch {
      setError('Credenciais inválidas. Verifique e tente novamente.');
    } finally {
      setSubmitting(false);
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
    <div className="centered auth-bg">
      <form onSubmit={submit} className="panel auth-card">
        <h1>KMS-M</h1>
        <p className="muted">Controle de quilometragem com precisão orbital.</p>
        {error && <p className="error">{error}</p>}
        <input
          placeholder="Usuário ou e-mail"
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button disabled={submitting}>{submitting ? 'Entrando...' : 'Entrar'}</button>
        <div className="auth-links">
          <Link to="/register" className="muted-link">Criar conta</Link>
          <Link to="/forgot-password" className="muted-link">Redefinir senha</Link>
        </div>
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
