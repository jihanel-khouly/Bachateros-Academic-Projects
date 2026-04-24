import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TwoFactorVerify({ sessionToken, onSuccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/2fa/verify`,
        { code },
        {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }
      );

      if (response.data.success) {
        onSuccess(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || '2FA verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card"> 
        <div className="text-center mb-lg">
          <small>Verify Your Identity</small>
          <div className="divider"></div>
          <h1>Enter Code</h1>
          <p>Enter the 6-digit code from your authenticator app</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Authentication Code</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={handleChange}
              placeholder="000000"
              maxLength="6"
              inputMode="numeric"
              style={{
                fontSize: '2rem',
                letterSpacing: '0.5rem',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
