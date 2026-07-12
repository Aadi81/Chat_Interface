import { useState } from 'react';
import { login as loginRequest } from '../api/http';

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a username');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { user } = await loginRequest(trimmed);
      onLogin(user.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Welcome to Chat</h1>
        <p className="login-subtitle">Pick a username to join the conversation</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. anshul"
          maxLength={30}
          autoFocus
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Joining...' : 'Join chat'}
        </button>
      </form>
    </div>
  );
}
