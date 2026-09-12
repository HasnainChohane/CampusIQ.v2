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
  ChevronRight,
  GripVertical,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  X,
  Check,
  RotateCcw,
  Percent,
  Wallet
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

const ALL_KPI_DEFINITIONS = [
  { id: 'students', label: 'Students', icon: GraduationCap, category: 'Academic', color: '#2563eb', bg: '#eff6ff' },
  { id: 'faculty', label: 'Faculty', icon: Users, category: 'Academic', color: '#6366f1', bg: '#eef2ff' },
  { id: 'courses', label: 'Courses', icon: BookOpen, category: 'Academic', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'inventory', label: 'Inventory Assets', icon: Package, category: 'Operations', color: '#10b981', bg: '#ecfdf5' },
  { id: 'requests', label: 'Pending Requests', icon: FileText, category: 'Operations', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'revenue', label: 'Total Revenue', icon: DollarSign, category: 'Financial', color: '#047857', bg: '#ecfdf5' },
  { id: 'expenses', label: 'Annual Expenses', icon: Wallet, category: 'Financial', color: '#dc2626', bg: '#fef2f2' },
  { id: 'margin', label: 'Budget Utilization', icon: Percent, category: 'Financial', color: '#7c3aed', bg: '#f5f3ff' },
];

const DEFAULT_GRID_CARDS = ['financial', 'categories', 'courses', 'requests'];

export default function DashboardPage({ onNavigate }) {
  const { formatCurrency, settings } = useSettings();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rearrangeable 2-per-row grid cards state
  const [gridCards, setGridCards] = useState(() => {
    try {
      const saved = localStorage.getItem('dphub_dashboard_grid_cards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_GRID_CARDS;
  });

  // KPI customization state (which KPIs to view and count)
  const [activeKpis, setActiveKpis] = useState(() => {
    try {
      const saved = localStorage.getItem('dphub_kpi_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return ['students', 'faculty', 'courses', 'inventory', 'requests', 'revenue'];
  });

  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [draggedCardIndex, setDraggedCardIndex] = useState(null);
  const [dragOverCardIndex, setDragOverCardIndex] = useState(null);

  // Save grid cards order to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dphub_dashboard_grid_cards', JSON.stringify(gridCards));
    } catch (e) {}
  }, [gridCards]);

  // Save KPI preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dphub_kpi_preferences', JSON.stringify(activeKpis));
    } catch (e) {}
  }, [activeKpis]);

  const formatInsightText = (text) => {
    if (!text) return '';
    return text.replace(/(?:\$|Rs\.?\s?)([0-9,]+(?:\.[0-9]+)?)/g, (match, p1) => {
      const num = parseFloat(p1.replace(/,/g, ''));
      return formatCurrency(num);
    });
  };

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

  // Card move handlers (Swapping in grid)
  const moveCard = (index, direction) => {
    const newOrder = [...gridCards];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setGridCards(newOrder);
  };

  const handleDragStart = (e, index) => {
    setDraggedCardIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCardIndex !== index) {
      setDragOverCardIndex(index);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedCardIndex === null || draggedCardIndex === dropIndex) {
      setDraggedCardIndex(null);
      setDragOverCardIndex(null);
      return;
    }
    const newOrder = [...gridCards];
    const draggedItem = newOrder.splice(draggedCardIndex, 1)[0];
    newOrder.splice(dropIndex, 0, draggedItem);
    setGridCards(newOrder);
    setDraggedCardIndex(null);
    setDragOverCardIndex(null);
  };

  const resetCardOrder = () => {
    setGridCards(DEFAULT_GRID_CARDS);
  };

  // Toggle KPI visibility
  const toggleKpi = (kpiId) => {
    if (activeKpis.includes(kpiId)) {
      if (activeKpis.length <= 1) {
        alert('You must keep at least 1 KPI card active.');
        return;
      }
      setActiveKpis(prev => prev.filter(id => id !== kpiId));
    } else {
      setActiveKpis(prev => [...prev, kpiId]);
    }
  };

  const setKpiPreset = (count) => {
    if (count === 'all') {
      setActiveKpis(ALL_KPI_DEFINITIONS.map(k => k.id));
    } else {
      setActiveKpis(ALL_KPI_DEFINITIONS.slice(0, count).map(k => k.id));
    }
  };

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

  // Individual KPI Renderers
  const renderKpiCard = (id) => {
    switch (id) {
      case 'students':
        return (
          <div key="students" className="card" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }} onClick={() => onNavigate('academic')}>
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
              Avg GPA: <strong style={{ color: 'var(--primary)' }}>{kpis?.students?.avgGpa || '3.42'}</strong> across 3 programs
            </div>
          </div>
        );

      case 'faculty':
        return (
          <div key="faculty" className="card" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }} onClick={() => onNavigate('academic')}>
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
              Avg Workload: <strong style={{ color: '#6366f1' }}>{kpis?.faculty?.avgWorkload || '9'} / 12 hrs</strong>
            </div>
          </div>
        );

      case 'courses':
        return (
          <div key="courses" className="card" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }} onClick={() => onNavigate('academic')}>
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
              Total Seats Enrolled: <strong style={{ color: '#8b5cf6' }}>{kpis?.courses?.totalEnrollments || '245'}</strong>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div key="inventory" className="card" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }} onClick={() => onNavigate('inventory')}>
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
        );

      case 'requests':
        return (
          <div key="requests" className="card" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }} onClick={() => onNavigate('requests')}>
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
        );

      case 'revenue':
        return (
          <div key="revenue" className="card" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }} onClick={() => onNavigate('finance')}>
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
              Target: <strong>{formatCurrency(kpis?.finance?.revenueGoal)}</strong> ({kpis?.finance?.revenueGoalProgressPct || 100}%)
            </div>
          </div>
        );

      case 'expenses':
        return (
          <div key="expenses" className="card" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }} onClick={() => onNavigate('finance')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Annual Expenses</span>
              <div style={{ padding: '0.35rem', background: '#fef2f2', borderRadius: 'var(--radius-sm)', color: '#dc2626' }}>
                <Wallet size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: '#b91c1c' }}>
              {formatCurrency(kpis?.finance?.totalExpenses || 35118000)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Operating Budget: <strong>{formatCurrency(kpis?.finance?.operatingBudget || 35000000)}</strong>
            </div>
          </div>
        );

      case 'margin':
        return (
          <div key="margin" className="card" style={{ cursor: 'pointer', transition: 'all 0.15s ease' }} onClick={() => onNavigate('finance')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Budget Utilization</span>
              <div style={{ padding: '0.35rem', background: '#f5f3ff', borderRadius: 'var(--radius-sm)', color: '#7c3aed' }}>
                <Percent size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: '#6d28d9' }}>
              {kpis?.finance?.budgetUtilizationPct || 100}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Fiscal Status: <strong style={{ color: '#059669' }}>On Target</strong>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render handle holder specifically for the 2-per-row grid cards
  const createHandleHolder = (index) => (
    <div 
      draggable="true"
      onDragStart={(e) => handleDragStart(e, index)}
      onDragEnd={() => { setDraggedCardIndex(null); setDragOverCardIndex(null); }}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.2rem',
        background: '#f1f5f9',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        padding: '3px 6px',
        cursor: 'grab',
        userSelect: 'none'
      }}
      title="Hold & Drag handle to rearrange, or use arrows"
    >
      <button
        onClick={(e) => { e.stopPropagation(); moveCard(index, -1); }}
        disabled={index === 0}
        style={{ background: 'transparent', border: 'none', cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? '#cbd5e1' : '#475569', padding: '1px' }}
        title="Move Left / Previous"
      >
        <ArrowLeft size={13} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', color: '#475569', cursor: 'grab' }}>
        <GripVertical size={14} />
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); moveCard(index, 1); }}
        disabled={index === gridCards.length - 1}
        style={{ background: 'transparent', border: 'none', cursor: index === gridCards.length - 1 ? 'default' : 'pointer', color: index === gridCards.length - 1 ? '#cbd5e1' : '#475569', padding: '1px' }}
        title="Move Right / Next"
      >
        <ArrowRightIcon size={13} />
      </button>
    </div>
  );

  // Render the 2-per-row grid items
  const renderGridCard = (cardId, index) => {
    const isDragging = draggedCardIndex === index;
    const isDragOver = dragOverCardIndex === index;

    const cardWrapperStyle = {
      opacity: isDragging ? 0.35 : 1,
      border: isDragOver ? '2px dashed #2563eb' : undefined,
      transform: isDragOver ? 'scale(1.01)' : 'none',
      transition: 'all 0.18s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    };

    switch (cardId) {
      case 'financial':
        return (
          <div
            key="financial"
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className="card"
            style={cardWrapperStyle}
          >
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">
                <TrendingUp size={18} className="text-blue-600" />
                <span>Monthly Financial Overview</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue vs Expenses</span>
                {createHandleHolder(index)}
              </div>
            </div>

            <div style={{ width: '100%', height: 260, minHeight: 260 }}>
              <ResponsiveContainer width="100%" height={260}>
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
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${settings.currency === 'USD' ? '$' : 'Rs.'}${Math.round(val/1000)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'categories':
        return (
          <div
            key="categories"
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className="card"
            style={cardWrapperStyle}
          >
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">
                <DollarSign size={18} className="text-emerald-600" />
                <span>Expense Categories Breakdown</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By Allocation</span>
                {createHandleHolder(index)}
              </div>
            </div>

            <div style={{ width: '100%', height: 260, minHeight: 260 }}>
              <ResponsiveContainer width="100%" height={260}>
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
                    {charts?.expenseCategories?.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'courses':
        return (
          <div
            key="courses"
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className="card"
            style={cardWrapperStyle}
          >
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">
                <BookOpen size={18} className="text-purple-600" />
                <span>Course Enrollment & Capacity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top Enrolled Courses</span>
                {createHandleHolder(index)}
              </div>
            </div>

            <div style={{ height: '240px', width: '100%', flex: 1 }}>
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
        );

      case 'requests':
        return (
          <div
            key="requests"
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className="card"
            style={cardWrapperStyle}
          >
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">
                <FileText size={18} className="text-amber-600" />
                <span>Recent Request Activity</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  onClick={() => onNavigate('requests')}
                  className="btn btn-outline" 
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  <span>View All</span>
                  <ChevronRight size={12} />
                </button>
                {createHandleHolder(index)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
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
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Title, KPI Customizer, Layout Reset & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Department Executive Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Live departmental intelligence. Drag from the top-right handle to rearrange the 2-column cards.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Customize KPIs Button */}
          <button
            onClick={() => setIsKpiModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <SlidersHorizontal size={14} />
            <span>Customize KPIs ({activeKpis.length})</span>
          </button>

          {/* Reset Cards Order */}
          <button
            onClick={resetCardOrder}
            className="btn btn-outline btn-sm"
            title="Reset cards layout to default 2-per-row order"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
          >
            <RotateCcw size={13} />
            <span>Reset Layout</span>
          </button>

          {/* Refresh metrics */}
          <button 
            onClick={loadDashboardData} 
            disabled={loading}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Metrics'}</span>
          </button>
        </div>
      </div>

      {/* Customizable KPI Cards Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Key Performance Indicators ({activeKpis.length} visible)
          </span>
          <button
            onClick={() => setIsKpiModalOpen(true)}
            style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Edit KPI metrics →
          </button>
        </div>

        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          {activeKpis.map(kpiId => renderKpiCard(kpiId))}
        </div>
      </div>

      {/* FULL WIDTH CARD: AI Department Intelligence & Live Alerts */}
      <div
        className="card"
        style={{ background: '#0f172a', color: '#f8fafc', borderColor: '#1e293b', width: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>AI Department Intelligence & Live Alerts</h3>
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
                  {formatInsightText(insight.description)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-CARDS-PER-ROW REARRANGEABLE GRID */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Operational & Financial Charts (2 Cards Per Row • Drag Top-Right Handle to Reorder)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
          {gridCards.map((cardId, index) => renderGridCard(cardId, index))}
        </div>
      </div>

      {/* KPI CUSTOMIZATION MODAL */}
      {isKpiModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '580px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ background: '#2563eb', color: '#fff', padding: '6px', borderRadius: '8px' }}>
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Customize Dashboard KPI Cards
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                    Select which metrics you want to monitor and how many to display.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsKpiModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Count Selector */}
            <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Quick View:</span>
              {[
                { label: 'Top 3', count: 3 },
                { label: 'Top 4', count: 4 },
                { label: 'Default 6', count: 6 },
                { label: 'Show All (8)', count: 'all' }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setKpiPreset(preset.count)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Modal Body - KPI Checklist */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {ALL_KPI_DEFINITIONS.map((item) => {
                const Icon = item.icon;
                const isChecked = activeKpis.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleKpi(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: isChecked ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      background: isChecked ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ padding: '0.4rem', background: item.bg, color: item.color, borderRadius: '8px' }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                          Category: {item.category}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent click
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                {activeKpis.length} KPI cards currently active
              </span>
              <button
                onClick={() => setIsKpiModalOpen(false)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Check size={16} />
                <span>Apply Layout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
