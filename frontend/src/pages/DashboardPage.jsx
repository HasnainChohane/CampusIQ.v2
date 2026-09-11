import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Package, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  RefreshCw,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';

const COLORS = ['#2563eb', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

export default function DashboardPage({ onNavigate }) {
  const { formatCurrency, settings } = useSettings();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch live dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem' }}>
        <div className="pulse-dot" style={{ width: '16px', height: '16px', color: 'var(--primary)' }}></div>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading live department metrics from database...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#991b1b' }}>
          <AlertTriangle size={20} />
          <strong>Error loading dashboard:</strong> {error}
        </div>
        <button onClick={loadDashboardData} className="btn btn-outline" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const { kpis, charts, recentRequests, aiInsights } = stats || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Title & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Department Executive Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Live departmental intelligence calculated directly from MySQL records.
          </p>
        </div>

        <button 
          onClick={loadDashboardData} 
          disabled={loading}
          className="btn btn-outline"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* 6 Key KPI Cards */}
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {/* Students */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('academic')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Students</span>
            <div style={{ padding: '0.35rem', background: '#eff6ff', borderRadius: 'var(--radius-sm)', color: '#2563eb' }}>
              <GraduationCap size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--text-main)' }}>
            {kpis?.students?.total || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Avg GPA: <strong style={{ color: 'var(--primary)' }}>{kpis?.students?.avgGpa}</strong> across 3 programs
          </div>
        </div>

        {/* Faculty */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('academic')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faculty</span>
            <div style={{ padding: '0.35rem', background: '#eef2ff', borderRadius: 'var(--radius-sm)', color: '#6366f1' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--text-main)' }}>
            {kpis?.faculty?.total || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Avg Workload: <strong style={{ color: '#6366f1' }}>{kpis?.faculty?.avgWorkload} / 12 hrs</strong>
          </div>
        </div>

        {/* Courses */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('academic')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Courses</span>
            <div style={{ padding: '0.35rem', background: '#f5f3ff', borderRadius: 'var(--radius-sm)', color: '#8b5cf6' }}>
              <BookOpen size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--text-main)' }}>
            {kpis?.courses?.total || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total Seats Enrolled: <strong style={{ color: '#8b5cf6' }}>{kpis?.courses?.totalEnrollments}</strong>
          </div>
        </div>

        {/* Inventory */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('inventory')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inventory Assets</span>
            <div style={{ padding: '0.35rem', background: '#ecfdf5', borderRadius: 'var(--radius-sm)', color: '#10b981' }}>
              <Package size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--text-main)' }}>
            {kpis?.inventory?.totalUnits || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Asset Value: <strong style={{ color: '#059669' }}>{formatCurrency(kpis?.inventory?.totalValue)}</strong>
          </div>
        </div>

        {/* Requests */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('requests')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Requests</span>
            <div style={{ padding: '0.35rem', background: '#fffbeb', borderRadius: 'var(--radius-sm)', color: '#f59e0b' }}>
              <FileText size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: '#d97706' }}>
            {kpis?.requests?.pending || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {kpis?.requests?.total || 0} total requests recorded
          </div>
        </div>

        {/* Revenue */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('finance')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</span>
            <div style={{ padding: '0.35rem', background: '#ecfdf5', borderRadius: 'var(--radius-sm)', color: '#10b981' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: '#047857' }}>
            {formatCurrency(kpis?.finance?.totalRevenue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Target: <strong>{formatCurrency(kpis?.finance?.revenueGoal)}</strong> ({kpis?.finance?.revenueGoalProgressPct}%)
          </div>
        </div>
      </div>


      {/* AI Department Insights Feed */}
      <div className="card" style={{ background: '#0f172a', color: '#f8fafc', borderColor: '#1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>AI Department Intelligence & Live Alerts</h3>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Synthesized from live academic, operational, and financial telemetry</div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('ai-assistant')}
            className="btn" 
            style={{ background: 'rgba(255,255,255,0.1)', color: '#93c5fd', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            <span>Ask AI Assistant</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {aiInsights?.map((insight, idx) => {
            const isAlert = insight.type === 'alert';
            const isWarning = insight.type === 'warning';
            return (
              <div 
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: isAlert ? '1px solid rgba(239, 68, 68, 0.3)' : isWarning ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    color: isAlert ? '#fca5a5' : isWarning ? '#fde68a' : '#93c5fd'
                  }}>
                    {insight.category}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Live Trigger</span>
                </div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                  {insight.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {insight.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid-2">
        {/* Monthly Revenue vs Expenses Trend */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} className="text-blue-600" />
              <span>Monthly Financial Overview</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue vs Expenses</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.financialTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <DollarSign size={18} className="text-emerald-600" />
              <span>Expense Categories Breakdown</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By Allocation</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.expenseCategories || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {charts?.expenseCategories?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts: Top Enrolled Courses & Request Distribution */}
      <div className="grid-2">
        {/* Highest Enrollment Courses */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BookOpen size={18} className="text-purple-600" />
              <span>Course Enrollment & Capacity</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top Enrolled Courses</span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.topCourses || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="course_code" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(val, name, item) => [
                    `${val} students (${item.payload.fill_rate}% of ${item.payload.max_enrollment} max)`,
                    item.payload.name
                  ]} 
                />
                <Bar dataKey="enrollment_count" name="Enrolled Students" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Operational Requests Feed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FileText size={18} className="text-amber-600" />
              <span>Recent Request Activity</span>
            </div>
            <button 
              onClick={() => onNavigate('requests')}
              className="btn btn-outline" 
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              <span>View All</span>
              <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {recentRequests?.map((req) => (
              <div 
                key={req.id}
                style={{
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  background: '#ffffff'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span className={`badge ${
                      req.status === 'approved' ? 'badge-success' :
                      req.status === 'under_review' ? 'badge-primary' :
                      req.status === 'pending' ? 'badge-warning' : 'badge-danger'
                    }`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', textTransform: 'capitalize' }}>
                      {req.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {req.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {req.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    by {req.requester_name}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: req.priority === 'urgent' ? '#dc2626' : req.priority === 'high' ? '#ea580c' : '#64748b'
                  }}>
                    {req.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
