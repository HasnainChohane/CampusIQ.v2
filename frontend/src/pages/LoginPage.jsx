import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  AlertCircle,
  Check
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    title: 'Administrator / Dean',
    name: 'Dr. Khurram Nadeem',
    email: 'admin@departmenthub.edu',
    desc: 'Full administrative access, user permissions, finance & reports',
    badgeColor: 'badge-primary'
  },
  {
    role: 'officer',
    title: 'Department Officer',
    name: 'Syed Muhammad Ali',
    email: 'officer@departmenthub.edu',
    desc: 'Review & approve requests, inventory management & finance logs',
    badgeColor: 'badge-warning'
  },
  {
    role: 'faculty',
    title: 'Faculty / HoD CS',
    name: 'Dr. Ayesha Khan',
    email: 'faculty@departmenthub.edu',
    desc: 'Submit requests, monitor teaching workload & assigned courses',
    badgeColor: 'badge-success'
  },
  {
    role: 'staff',
    title: 'Staff Member',
    name: 'Muhammad Rizwan',
    email: 'staff@departmenthub.edu',
    desc: 'Submit purchase/maintenance requests & track department assets',
    badgeColor: 'badge-primary'
  }
];


export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@departmenthub.edu');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (accountEmail) => {
    setEmail(accountEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, #f1f5f9 0%, #e2e8f0 90%)',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1050px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.15)',
        overflow: 'hidden',
        border: '1px solid var(--border-light)'
      }}>
        {/* Left Side: Brand & Quick Role Switcher */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div className="brand-icon" style={{ width: '44px', height: '44px' }}>
                <Building2 size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  CampusIQ
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Academic & Dept Intelligence
                </span>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Sign in to manage academic records, review operational requests, monitor department finances, and query AI intelligence.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.75rem' }}>
                Quick Demo Role Selector (1-Click Fill)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {DEMO_ACCOUNTS.map((acc) => {
                  const isSelected = email === acc.email;
                  return (
                    <div 
                      key={acc.email}
                      onClick={() => handleQuickSelect(acc.email)}
                      style={{
                        padding: '0.75rem 1rem',
                        background: isSelected ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{acc.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({acc.name})</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{acc.email}</div>
                      </div>
                      {isSelected ? (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} color="#fff" />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <Sparkles size={14} className="text-blue-400" />
            <span>Connected to XAMPP MySQL (departmenthub_db)</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div style={{ padding: '2.5rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              Welcome Back
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Enter your credentials or use the role selector on the left.
            </p>
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#991b1b',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem 0.7rem 2.6rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit'
                  }}
                  placeholder="name@departmenthub.edu"
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Password
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Default: Password123!</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem 0.7rem 2.6rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    fontFamily: 'inherit'
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
