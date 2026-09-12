import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Layers, 
  Table, 
  Cpu, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Package,
  FileText,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';

export default function HealthDashboard() {
  const [systemHealth, setSystemHealth] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sysRes, dbRes] = await Promise.all([
        api.getSystemHealth(),
        api.getDatabaseHealth()
      ]);
      setSystemHealth(sysRes);
      setDbHealth(dbRes);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Failed to reach CampusIQ backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const getTableIcon = (tableName) => {
    switch (tableName) {
      case 'departments': return <Building2 size={16} className="text-blue-500" />;
      case 'users': return <Users size={16} className="text-indigo-500" />;
      case 'students': return <GraduationCap size={16} className="text-emerald-500" />;
      case 'faculty': return <Users size={16} className="text-sky-500" />;
      case 'courses': return <BookOpen size={16} className="text-purple-500" />;
      case 'inventory': return <Package size={16} className="text-amber-500" />;
      case 'requests': return <FileText size={16} className="text-orange-500" />;
      case 'revenue':
      case 'expenses':
      case 'budgets': return <DollarSign size={16} className="text-green-600" />;
      default: return <Table size={16} className="text-slate-400" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Welcome Banner */}
      <div className="hero-banner">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-primary" style={{ background: 'rgba(37,99,235,0.3)', color: '#93c5fd', borderColor: 'rgba(147,197,253,0.3)' }}>
              Foundation & Services Online
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              XAMPP MySQL • Node.js Express • Vite React
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            CampusIQ Management & Intelligence Platform
          </h1>
          <p style={{ color: '#cbd5e1', maxWidth: '800px', fontSize: '0.95rem', lineHeight: 1.6 }}>
            CampusIQ System Architecture, MySQL database schema, 
            realistic seed datasets, environment variables, connection pools, and real-time health services are online and operational.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={fetchHealthData} 
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Pinging Services...' : 'Refresh Health Check'}
            </button>
            {lastChecked && (
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Last synced at: {lastChecked}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert if backend offline */}
      {error && (
        <div style={{ 
          background: 'var(--danger-bg)', 
          border: '1px solid var(--danger-border)', 
          borderRadius: 'var(--radius-md)', 
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          color: '#991b1b'
        }}>
          <XCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Connection Failed</h4>
            <p style={{ fontSize: '0.875rem' }}>{error}</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#b91c1c' }}>
              Ensure your backend server is running on port 5000 (<code style={{ fontFamily: 'var(--font-mono)' }}>npm run dev:backend</code>) and XAMPP MySQL is started.
            </p>
          </div>
        </div>
      )}

      {/* Health Status Cards Grid */}
      <div className="grid-2">
        {/* Backend API Service Health */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Server size={20} className="text-blue-600" />
              <span>Backend API Server</span>
            </div>
            {systemHealth?.status === 'ok' ? (
              <span className="badge badge-success">
                <span className="pulse-dot"></span> Online (HTTP 200)
              </span>
            ) : (
              <span className="badge badge-danger">Offline</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Service Name:</span>
              <strong style={{ fontWeight: 600 }}>{systemHealth?.service || 'CampusIQ Backend'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Environment:</span>
              <span className="badge badge-primary" style={{ padding: '0.15rem 0.6rem' }}>
                {systemHealth?.environment || 'development'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Node.js Runtime:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{systemHealth?.nodeVersion || 'v24.x'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Uptime:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{systemHealth?.uptime || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Database Health */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Database size={20} className="text-indigo-600" />
              <span>MySQL Database (XAMPP)</span>
            </div>
            {dbHealth?.database?.connected ? (
              <span className="badge badge-success">
                <span className="pulse-dot"></span> Connected
              </span>
            ) : (
              <span className="badge badge-danger">Disconnected</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Database Name:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                {dbHealth?.database?.name || 'departmenthub_db'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Host & Port:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                {dbHealth?.database?.host || 'localhost'}:{dbHealth?.database?.port || 3306}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Query Latency:</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                {dbHealth?.database?.latencyMs ?? 0} ms
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Tables Created:</span>
              <strong style={{ fontWeight: 700 }}>{dbHealth?.database?.tablesCount || 0} / 16 Tables</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Database Schema & Seed Data Verification Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={20} className="text-blue-600" />
            <span>Database Tables & Seeded Record Counts</span>
          </div>
          <span className="badge badge-primary">
            {dbHealth?.database?.totalRecords || 0} Total Records Seeded
          </span>
        </div>

        {dbHealth?.database?.tableStats ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Table Name</th>
                  <th>Category / Module</th>
                  <th>Seeded Records</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(dbHealth.database.tableStats).map(([tableName, count], index) => (
                  <tr key={tableName}>
                    <td style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {getTableIcon(tableName)}
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{tableName}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {tableName.includes('request') ? 'Requests Module' : 
                       tableName.includes('revenue') || tableName.includes('expense') || tableName.includes('budget') ? 'Finance Module' :
                       tableName.includes('student') || tableName.includes('faculty') || tableName.includes('course') || tableName.includes('enroll') ? 'Academic Module' :
                       tableName.includes('inventory') ? 'Operations / Inventory' : 
                       tableName === 'departments' || tableName === 'users' ? 'Core Master Data' : 'Reports'}
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 700, 
                        fontFamily: 'var(--font-mono)',
                        color: count > 0 ? 'var(--text-main)' : 'var(--text-subtle)' 
                      }}>
                        {count} records
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                        <CheckCircle2 size={12} /> Ready
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No table statistics available. Check backend connection.
          </div>
        )}
      </div>

      {/* Next Step Guidance & Seeded Credentials Callout */}
      <div className="grid-2">
        <div className="card" style={{ background: '#f8fafc', borderColor: 'var(--border-strong)' }}>
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck size={20} className="text-emerald-600" />
              <span>Seeded Test Accounts</span>
            </div>
            <span className="badge badge-primary">Password: Password123!</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            <div style={{ padding: '0.5rem', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <strong>Admin:</strong> <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>admin@departmenthub.edu</code>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Full management, approvals, reports, finance</div>
            </div>
            <div style={{ padding: '0.5rem', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <strong>Officer / Manager:</strong> <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>officer@departmenthub.edu</code>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Review requests, inventory, financial tracking</div>
            </div>
            <div style={{ padding: '0.5rem', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <strong>Faculty / Staff:</strong> <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>faculty@departmenthub.edu</code>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Submit requests, view assigned courses and assets</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div className="card-header">
            <div className="card-title" style={{ color: '#1e40af' }}>
              <ArrowRight size={20} className="text-blue-600" />
              <span>Development Sequence Status</span>
            </div>
            <span className="badge badge-success">Step 1 Complete</span>
          </div>
          <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.8, color: '#1e3a8a' }}>
            <li><strong>Step 1 (Current):</strong> Foundation & Architecture, DB schema, Seed data, Health check ✅</li>
            <li><strong>Step 2:</strong> JWT Authentication & Role-based Guard Middleware</li>
            <li><strong>Step 3:</strong> Application Shell (Sidebar, Topbar, Layout navigation)</li>
            <li><strong>Step 4:</strong> Live KPI Dashboard & Analytics Charts</li>
            <li><strong>Step 5:</strong> Academic Module (Students, Faculty, Courses, Enrollments)</li>
            <li><strong>Step 6:</strong> Operations & Inventory CRUD & Assignments</li>
            <li><strong>Step 7:</strong> AI Request Pipeline & Connected Purchase Workflow</li>
            <li><strong>Step 8:</strong> Finance, PDF Reports & Grounded AI Assistant</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
