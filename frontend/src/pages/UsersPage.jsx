import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import s from './SettingsPage.module.css';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', role: 'VIEWER' });
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.username || !form.password || !form.fullName || !form.email) {
      setError('All fields required');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create user');
      }

      toast.success('User created successfully');
      setForm({ username: '', password: '', fullName: '', email: '', role: 'VIEWER' });
      setShowForm(false);
      setError('');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user?')) return;
    
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!res.ok) throw new Error('Failed to delete user');
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>User Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #d1dce6',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '600' }}>Create New User</h2>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,.08)',
              border: '1px solid rgba(239,68,68,.2)',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '500', color: '#6b7280' }}>Full Name</label>
                <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Enter full name" style={{
                    width: '100%', border: '1px solid #d1dce6', borderRadius: '8px', padding: '8px 12px', fontSize: '0.9rem'
                  }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '500', color: '#6b7280' }}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Enter email" style={{
                    width: '100%', border: '1px solid #d1dce6', borderRadius: '8px', padding: '8px 12px', fontSize: '0.9rem'
                  }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '500', color: '#6b7280' }}>Username</label>
                <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Enter username" style={{
                    width: '100%', border: '1px solid #d1dce6', borderRadius: '8px', padding: '8px 12px', fontSize: '0.9rem'
                  }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '500', color: '#6b7280' }}>Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  style={{
                    width: '100%', border: '1px solid #d1dce6', borderRadius: '8px', padding: '8px 12px', fontSize: '0.9rem'
                  }}>
                  <option value="VIEWER">Viewer</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: '500', color: '#6b7280' }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 6 characters" style={{
                  width: '100%', border: '1px solid #d1dce6', borderRadius: '8px', padding: '8px 12px', fontSize: '0.9rem'
                }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button type="submit" disabled={loading} style={{
                background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
              }}>
                {loading ? 'Creating...' : 'Create User'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                background: '#f3f7fb', color: '#1f2937', border: '1px solid #d1dce6', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: '#ffffff', border: '1px solid #d1dce6', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f7fb', borderBottom: '1px solid #d1dce6' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#1f2937' }}>Username</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#1f2937' }}>Full Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#1f2937' }}>Email</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600', color: '#1f2937' }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#1f2937' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #d1dce6' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{user.username}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{user.fullName}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{user.email}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>
                  <span style={{
                    background: user.role === 'ADMIN' ? 'rgba(37,99,235,.1)' : user.role === 'TEACHER' ? 'rgba(16,185,129,.1)' : 'rgba(107,114,128,.1)',
                    color: user.role === 'ADMIN' ? '#2563eb' : user.role === 'TEACHER' ? '#10b981' : '#6b7280',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(user.id)}
                    style={{
                      background: 'rgba(239,68,68,.08)',
                      border: 'none',
                      color: '#dc2626',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
