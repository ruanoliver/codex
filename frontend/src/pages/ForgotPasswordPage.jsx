import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (form.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/api/auth/reset-password', {
        identifier: form.identifier,
        newPassword: form.newPassword,
      });
      setMessage(data.message || 'Senha redefinida com sucesso.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Não foi possível redefinir a senha agora.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="centered auth-bg">
      <form onSubmit={submit} className="panel auth-card">
        <h1>Redefinir senha</h1>
        <p className="muted">Informe usuário ou e-mail e escolha uma nova senha.</p>
        {error && <p className="error">{error}</p>}
        {message && <p className="hint">{message}</p>}
        <input
          placeholder="Usuário ou e-mail"
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Nova senha"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
        />
        <button disabled={submitting}>{submitting ? 'Redefinindo...' : 'Salvar nova senha'}</button>
        <Link to="/login" className="muted-link">Voltar ao login</Link>
      </form>
    </div>
  );
}
