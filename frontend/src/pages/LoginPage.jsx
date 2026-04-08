import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import s from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ username:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch(err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally { setLoading(false); }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logoWrap}>
          <div className={s.logoIcon}>🏫</div>
        </div>
        <h1 className={s.title}>Presidency University</h1>
        <p className={s.sub}>Smart Classroom & Timetable Scheduler</p>

        {error && <div className={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.field}>
            <label>Username</label>
            <input value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value}))}
              placeholder="Enter username" autoFocus autoComplete="username"/>
          </div>
          <div className={s.field}>
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))}
              placeholder="Enter password" autoComplete="current-password"/>
          </div>
          <button type="submit" className={s.submitBtn} disabled={loading}>
            {loading ? 'Logging in…' : 'Login →'}
          </button>
        </form>
      </div>
    </div>
  );
}
