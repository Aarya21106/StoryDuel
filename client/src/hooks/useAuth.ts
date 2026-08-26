import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import { setSocketAuthToken } from '../socket';

const STORAGE_KEY = 'storyduel_token';

export interface AuthUser {
  id: string;
  displayName: string;
  tier: 'free' | 'paid';
  createdAt?: string;
}

export interface PlayHistoryItem {
  sessionId: string;
  storyId: string;
  mode: string;
  status: string;
  playedAt: string;
  completedAt: string | null;
  chemistryScore: number | null;
  insight: string | null;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [history, setHistory] = useState<PlayHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSocketAuthToken(token);

    if (!token) {
      setUser(null);
      setHistory([]);
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        setUser(data.user);
        setHistory(data.history || []);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      });
  }, [token]);

  const signInWithCredential = useCallback(async (credential: string, ageConfirmed = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, ageConfirmed }),
      });

      if (res.status === 412) {
        setPendingCredential(credential);
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign-in failed');

      localStorage.setItem(STORAGE_KEY, data.token);
      setToken(data.token);
      setPendingCredential(null);
    } catch (e: any) {
      setError(e.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmAgeAndRetry = useCallback(() => {
    if (pendingCredential) signInWithCredential(pendingCredential, true);
  }, [pendingCredential, signInWithCredential]);

  const cancelAgeConfirm = useCallback(() => setPendingCredential(null), []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    signOut();
  }, [token, signOut]);

  return {
    token,
    user,
    history,
    loading,
    error,
    pendingCredential,
    signInWithCredential,
    confirmAgeAndRetry,
    cancelAgeConfirm,
    signOut,
    deleteAccount,
  };
}
