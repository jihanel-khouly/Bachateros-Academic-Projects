import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TwoFactorSetup({ sessionToken, onComplete }) {
  const [qrCode, setQrCode] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setupTwoFactor();
  }, []);

  const setupTwoFactor = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/2fa/setup`,
        {},
        {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }
      );

      if (response.data.success) {
        setQrCode(response.data.qr_code);
        setTotpSecret(response.data.totp_secret);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card text-center">
          <div className="loading" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: 'var(--spacing-md)' }}>Setting up Two-Factor Authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-lg">
          <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
            Secure Your Account
          </p>
          <h1 style={{ fontSize: '1.75rem' }}>Two-Factor Authentication</h1>
          <p>Scan the QR code with your authenticator app</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="qr-container" style={{ textAlign: 'center' }}>
          {qrCode && (
            <div className="qr-code" style={{ display: 'inline-block', marginBottom: 'var(--spacing-md)' }}>
              <img src={qrCode} alt="TOTP QR Code" style={{ width: '100%', maxWidth: '200px' }} />
            </div>
          )}
          
          <p style={{ marginBottom: '0.5rem' }}>
            <small>Can't scan? Enter this code manually:</small>
          </p>
          <code style={{
            display: 'block',
            padding: 'var(--spacing-sm)',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            letterSpacing: '1px',
            wordBreak: 'break-all',
            color: 'var(--accent-secondary)'
          }}>
            {totpSecret}
          </code>
        </div>

        <div style={{ 
          marginTop: 'var(--spacing-lg)', 
          padding: 'var(--spacing-sm)', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '8px',
          border: '1px solid #e0f2fe'
        }}>
          <strong style={{ fontSize: '0.85rem', color: '#0369a1' }}>Recommended apps:</strong>
          <ul style={{ 
            marginTop: '0.5rem', 
            marginLeft: '1.2rem', 
            fontSize: '0.8rem', 
            color: '#0c4a6e',
            lineHeight: '1.4' 
          }}>
            <li>Google Authenticator</li>
            <li>Microsoft Authenticator</li>
            <li>Authy</li>
          </ul>
        </div>

        <button
          onClick={onComplete}
          className="btn btn-primary"
          style={{ marginTop: 'var(--spacing-lg)' }}
        >
          Continue to Verification
        </button>
      </div>
    </div>
  );
}