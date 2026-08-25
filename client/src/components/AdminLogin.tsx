import React, { useState } from 'react';
import { PulseButton } from './ui/PulseButton';
import { API_BASE_URL } from '../config';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.token);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen app-container" style={{ justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>Admin Portal</h2>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '28px', fontSize: '0.875rem' }}>
          Server analytics and moderation telemetry.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Admin Username
            </label>
            <input
              type="text"
              className="input-minimal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoFocus
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              className="input-minimal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.8125rem' }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PulseButton type="submit" variant="primary" disabled={loading}>
              {loading ? 'AUTHENTICATING...' : 'ENTER DASHBOARD'}
            </PulseButton>
            <button
              type="button"
              className="btn-ghost"
              onClick={onCancel}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8125rem' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
