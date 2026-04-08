import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import s from './LoginPage.module.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    if (!form.username || !form.password || !form.fullName || !form.email) {
      setError('All fields are required');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Account created! Logging in...');
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logoWrap}>
          <div className={s.logoIcon}>🏫</div>
        </div>
        <h1 className={s.title}>Create Account</h1>
        <p className={s.sub}>Join Presidency University Scheduler</p>

        {error && <div className={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.field}>
            <label>Full Name</label>
            <input
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Enter your full name"
              autoFocus
            />
          </div>

          <div className={s.field}>
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Enter your email"
            />
          </div>

          <div className={s.field}>
            <label>Username</label>
            <input
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Choose a username"
              autoComplete="off"
            />
          </div>

          <div className={s.field}>
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min 6 characters"
              autoComplete="off"
            />
          </div>

          <button type="submit" className={s.submitBtn} disabled={loading}>
            {loading ? 'Creating Account…' : 'Sign Up →'}
          </button>
        </form>

        <div className={s.footer}>
          <p className={s.footerText}>
            Already have an account? <Link to="/login" className={s.signupLink}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
