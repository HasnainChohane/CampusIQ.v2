import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  GraduationCap, 
  Package, 
  FileText, 
  DollarSign, 
  FileBarChart2, 
  Sparkles, 
  Activity, 
  LogOut, 
  User, 
  ChevronDown, 
  Menu, 
  X,
  Shield,
  Layers
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'officer', 'faculty', 'staff'] },
  { id: 'academic', label: 'Academic', icon: GraduationCap, roles: ['admin', 'officer', 'faculty', 'staff'] },
  { id: 'inventory', label: 'Operations & Inventory', icon: Package, roles: ['admin', 'officer', 'faculty', 'staff'] },
  { id: 'requests', label: 'Requests & Approvals', icon: FileText, roles: ['admin', 'officer', 'faculty', 'staff'] },
  { id: 'finance', label: 'Finance & Budget', icon: DollarSign, roles: ['admin', 'officer'] },
  { id: 'reports', label: 'PDF Reports', icon: FileBarChart2, roles: ['admin', 'officer'] },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, roles: ['admin', 'officer', 'faculty', 'staff'] },
  { id: 'health', label: 'System Health', icon: Activity, roles: ['admin', 'officer', 'faculty', 'staff'] },
];

const ROLE_OPTIONS = [
  { email: 'admin@departmenthub.edu', label: 'Admin (Dr. Vance)', role: 'admin' },
  { email: 'officer@departmenthub.edu', label: 'Officer (Marcus)', role: 'officer' },
  { email: 'faculty@departmenthub.edu', label: 'Faculty (Dr. Turing)', role: 'faculty' },
  { email: 'staff@departmenthub.edu', label: 'Staff (Sarah)', role: 'staff' },
];

export default function AppLayout({ currentView, onNavigate, children }) {
  const { user, role, logout, switchUserFast } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(role || 'faculty'));

  const getRoleBadgeStyle = (userRole) => {
    switch(userRole) {
      case 'admin': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', label: 'Administrator' };
      case 'officer': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: 'Officer / Manager' };
      case 'faculty': return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', label: 'Faculty / Chair' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: 'Staff' };
    }
  };

  const roleStyle = getRoleBadgeStyle(role);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        background: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid #1e293b',
        zIndex: 50,
        transition: 'all 0.2s ease'
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-icon" style={{ width: '38px', height: '38px' }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              DepartmentHub
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Computer Science & Eng.
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ padding: '0 0.5rem 0.5rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>
            Workspace Modules
          </div>

          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#1e293b';
                    e.currentTarget.style.color = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', background: '#090d16' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
              alt={user?.name}
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #334155' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                {roleStyle.label}
              </div>
            </div>
            <button 
              onClick={logout}
              title="Sign Out"
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <header style={{
          height: '64px',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          {/* Left: Current Active Title & Dept */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span className="badge badge-primary" style={{ fontWeight: 600 }}>
                {user?.department_code || 'CSE'} Department
              </span>
              <span style={{ color: 'var(--text-subtle)' }}>•</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                {user?.department_name || 'Department of Computer Science & Engineering'}
              </span>
            </div>
          </div>

          {/* Right: Quick Demo Role Switcher & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Quick Role Switcher (Crucial for live Hackathon evaluation!) */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: roleStyle.bg,
                  color: roleStyle.text,
                  border: `1px solid ${roleStyle.border}`,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Shield size={14} />
                <span>Role: {roleStyle.label}</span>
                <ChevronDown size={14} />
              </button>

              {roleMenuOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  background: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  width: '230px',
                  padding: '0.5rem',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Switch Demo Role
                  </div>
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.email}
                      onClick={() => {
                        switchUserFast(opt.email);
                        setRoleMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.6rem',
                        background: user?.email === opt.email ? 'var(--primary-light)' : 'transparent',
                        color: user?.email === opt.email ? 'var(--primary)' : 'var(--text-main)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textAlign: 'left'
                      }}
                    >
                      <span>{opt.label}</span>
                      {user?.email === opt.email && <span style={{ fontSize: '0.7rem' }}>✓ Active</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={logout}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main style={{ flex: 1, padding: '1.75rem 2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
