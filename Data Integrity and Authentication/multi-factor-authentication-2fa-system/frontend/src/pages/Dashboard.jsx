import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard({ jwtToken, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleViewAllUsers = async () => {
    if (user?.role !== 'Admin') {
      alert('Only admins can view all users');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      setAllUsers(response.data.users);
      setActiveTab('users');
    } catch (err) {
      alert('Failed to load users: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: 'var(--spacing-xl) var(--spacing-md)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-xl)' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em', color: 'var(--accent-secondary)', marginBottom: '4px' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Welcome back, <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{user?.name}</span></p>
          </div>
          <button onClick={onLogout} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1.25rem' }}>
            Logout
          </button>
        </header>

        {/* Navigation Bar */}
        <nav style={{ display: 'flex', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-lg)', backgroundColor: 'var(--white)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-light)', width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : ''}`}
            style={{ width: 'auto', border: 'none', background: activeTab === 'profile' ? 'var(--accent-secondary)' : 'transparent', color: activeTab === 'profile' ? 'var(--white)' : 'var(--text-muted)', padding: '0.5rem 1.5rem' }}
          >
            Profile
          </button>
          
          {/* Fixed role logic grouping */}
          {(user?.role === 'Manager' || user?.role === 'Admin') && (
            <button
              onClick={() => setActiveTab('manager')}
              className={`btn ${activeTab === 'manager' ? 'btn-primary' : ''}`}
              style={{ width: 'auto', border: 'none', background: activeTab === 'manager' ? 'var(--accent-secondary)' : 'transparent', color: activeTab === 'manager' ? 'var(--white)' : 'var(--text-muted)', padding: '0.5rem 1.5rem' }}
            >
              Manager
            </button>
          )}
          
          {user?.role === 'Admin' && (
            <button
              onClick={handleViewAllUsers}
              className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`}
              style={{ width: 'auto', border: 'none', background: activeTab === 'users' ? 'var(--accent-secondary)' : 'transparent', color: activeTab === 'users' ? 'var(--white)' : 'var(--text-muted)', padding: '0.5rem 1.5rem' }}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Users List'}
            </button>
          )}
        </nav>

        <main>
          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)' }}>
              <div className="auth-card" style={{ maxWidth: 'none', margin: '0' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: 'var(--spacing-lg)' }}>Profile Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Full Name</label>
                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user?.name}</p>
                  </div>
                  <div style={{ height: '1px', background: 'var(--border-light)' }} />
                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Email Address</label>
                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user?.email}</p>
                  </div>
                  <div style={{ height: '1px', background: 'var(--border-light)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Role</label>
                      <p style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{user?.role}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>User ID</label>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>#{user?.user_id}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="auth-card" style={{ maxWidth: 'none', margin: '0' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: 'var(--spacing-lg)' }}>Security Status</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  {['Password Protected', 'Two-Factor Authentication', 'JWT Token Active'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.03)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                      <span style={{ color: '#059669', fontWeight: 'bold' }}>✓</span>
                      <span style={{ fontWeight: '500' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Manager Tab Content - Ensuring this renders if activeTab is 'manager' */}
          {activeTab === 'manager' && (user?.role === 'Manager' || user?.role === 'Admin') && (
            <div className="auth-card" style={{ maxWidth: 'none', margin: '0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: 'var(--spacing-lg)' }}>Manager Panel</h3>
              <div style={{ padding: 'var(--spacing-lg)', background: 'rgba(15, 23, 42, 0.02)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.1rem' }}>Welcome to the Management Console</p>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                  You are viewing this as a: <strong style={{ color: 'var(--accent-primary)' }}>{user?.role}</strong>. 
                  This section is restricted to administrative and management roles.
                </p>
              </div>
            </div>
          )}

          {/* Admin Users Tab Content */}
          {activeTab === 'users' && user?.role === 'Admin' && (
            <div className="auth-card" style={{ maxWidth: 'none', margin: '0', padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>System User Directory</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                    <th style={{ padding: '1rem var(--spacing-lg)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ID</th>
                    <th style={{ padding: '1rem var(--spacing-lg)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>USER</th>
                    <th style={{ padding: '1rem var(--spacing-lg)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ROLE</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem var(--spacing-lg)', fontFamily: 'var(--font-mono)' }}>#{u.id}</td>
                      <td style={{ padding: '1rem var(--spacing-lg)', fontWeight: '600' }}>{u.name}</td>
                      <td style={{ padding: '1rem var(--spacing-lg)' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-primary)' }}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}