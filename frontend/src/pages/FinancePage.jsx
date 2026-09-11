import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  PieChart as PieChartIcon, 
  Calendar, 
  Target, 
  Layers, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  X, 
  FileText, 
  Package, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#6366f1'];
const EXPENSE_CATEGORIES = [
  'All',
  'Equipment Purchase',
  'Software Licenses',
  'Cloud Services',
  'Lab Equipment',
  'Networking Infrastructure',
  'Maintenance & Repairs',
  'Furniture',
  'Travel & Conferences',
  'Office Supplies',
  'Events & Seminars'
];

export default function FinancePage() {
  const { role } = useAuth();
  const { formatCurrency, currency } = useSettings();
  const canManage = role === 'admin' || role === 'officer';

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'revenue', 'expenses', 'budgets'
  const [overview, setOverview] = useState(null);
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [revSearch, setRevSearch] = useState('');
  const [expSearch, setExpSearch] = useState('');
  const [expCategory, setExpCategory] = useState('All');

  // Modals
  const [revModalOpen, setRevModalOpen] = useState(false);
  const [editingRev, setEditingRev] = useState(null);
  const [revForm, setRevForm] = useState({
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [expForm, setExpForm] = useState({
    category: 'Equipment Purchase',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    period_name: 'FY 2026-Q2 Operating Budget',
    allocated_amount: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
  });

  const loadAllFinanceData = async () => {
    setLoading(true);
    try {
      const [overRes, revRes, expRes, budRes, goalRes] = await Promise.all([
        api.getFinanceOverview(),
        api.getRevenues({ search: revSearch }),
        api.getExpenses({ search: expSearch, category: expCategory === 'All' ? 'all' : expCategory }),
        api.getBudgets(),
        api.getRevenueGoals()
      ]);

      if (overRes.success) setOverview(overRes.data);
      if (revRes.success) setRevenues(revRes.data.revenue);
      if (expRes.success) setExpenses(expRes.data.expenses);
      if (budRes.success) setBudgets(budRes.data.budgets);
      if (goalRes.success) setGoals(goalRes.data.goals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllFinanceData();
  }, [revSearch, expSearch, expCategory]);

  // Save Revenue
  const handleSaveRevenue = async (e) => {
    e.preventDefault();
    try {
      if (editingRev) {
        await api.updateRevenue(editingRev.id, revForm);
      } else {
        await api.createRevenue(revForm);
      }
      setRevModalOpen(false);
      setEditingRev(null);
      loadAllFinanceData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Revenue
  const handleDeleteRevenue = async (id) => {
    if (window.confirm('Delete this revenue entry?')) {
      try {
        await api.deleteRevenue(id);
        loadAllFinanceData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Save Expense
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    try {
      if (editingExp) {
        await api.updateExpense(editingExp.id, expForm);
      } else {
        await api.createExpense(expForm);
      }
      setExpModalOpen(false);
      setEditingExp(null);
      loadAllFinanceData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this expense transaction?')) {
      try {
        await api.deleteExpense(id);
        loadAllFinanceData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Save Budget
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      await api.createBudget(budgetForm);
      setBudgetModalOpen(false);
      loadAllFinanceData();
    } catch (err) {
      alert(err.message);
    }
  };

  const totals = overview?.totals || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Financial Management & Budgets
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track departmental grants, tuition allocations, operating expenses, and budget utilization.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem', background: '#e2e8f0', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'overview' ? '#ffffff' : 'transparent',
              color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Overview & Charts
          </button>

          <button
            onClick={() => setActiveTab('revenue')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'revenue' ? '#ffffff' : 'transparent',
              color: activeTab === 'revenue' ? '#059669' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Revenue ({revenues.length})
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'expenses' ? '#ffffff' : 'transparent',
              color: activeTab === 'expenses' ? '#dc2626' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Expenses ({expenses.length})
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'budgets' ? '#ffffff' : 'transparent',
              color: activeTab === 'budgets' ? '#7c3aed' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Budgets & Targets
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid-4">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Total External Revenue</span>
            <ArrowUpRight size={16} className="text-emerald-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: '#047857' }}>
            {formatCurrency(totals.totalRevenue || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Target: {formatCurrency(totals.targetRevenue || 0)} ({totals.goalProgressPct}% achieved)
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Total Operating Expenses</span>
            <ArrowDownRight size={16} className="text-red-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: '#dc2626' }}>
            {formatCurrency(totals.totalExpenses || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across {expenses.length} logged expense items
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Net Operating Balance</span>
            <DollarSign size={16} className="text-blue-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--primary)' }}>
            {formatCurrency(totals.netBalance || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
            ● Healthy Operating Surplus
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Budget Utilization</span>
            <Target size={16} className="text-purple-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: '#7c3aed' }}>
            {totals.budgetUtilizationPct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {formatCurrency(totals.remainingBudget || 0)} unallocated budget
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. OVERVIEW & CHARTS TAB */}
      {/* =================================================================== */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-2">
            {/* Monthly Trend Area Chart */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <TrendingUp size={18} className="text-blue-600" />
                  <span>Revenue vs Operating Expenses</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Trend</span>
              </div>

              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview?.charts?.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevFin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorExpFin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(v) => [formatCurrency(Number(v)), '']} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevFin)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpFin)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Allocation Donut */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <PieChartIcon size={18} className="text-emerald-600" />
                  <span>Expense Allocations by Category</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Breakdown</span>
              </div>

              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview?.charts?.categories || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {overview?.charts?.categories?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [formatCurrency(Number(v)), '']} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. REVENUE TRANSACTIONS TAB */}
      {/* =================================================================== */}
      {activeTab === 'revenue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                <input
                  type="text"
                  placeholder="Search revenue by source or description..."
                  value={revSearch}
                  onChange={(e) => setRevSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                />
              </div>

              {canManage && (
                <button
                  onClick={() => {
                    setEditingRev(null);
                    setRevForm({ source: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
                    setRevModalOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  <span>Add Revenue Entry</span>
                </button>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Revenue Source</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Amount</th>
                    {canManage && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {revenues.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{r.source}</strong>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.description || '—'}</td>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>
                        <strong style={{ color: '#047857', fontFamily: 'var(--font-mono)' }}>
                          +{formatCurrency(r.amount)}
                        </strong>
                      </td>
                      {canManage && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => {
                                setEditingRev(r);
                                setRevForm({ source: r.source, amount: r.amount, date: r.date.split('T')[0], description: r.description || '' });
                                setRevModalOpen(true);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteRevenue(r.id)}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. EXPENSES TAB */}
      {/* =================================================================== */}
      {activeTab === 'expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    placeholder="Search expenses by category or note..."
                    value={expSearch}
                    onChange={(e) => setExpSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                  />
                </div>

                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {canManage && (
                <button
                  onClick={() => {
                    setEditingExp(null);
                    setExpForm({ category: 'Equipment Purchase', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
                    setExpModalOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  <span>Record Expense</span>
                </button>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Linked Item / Request</th>
                    <th>Date</th>
                    <th>Amount</th>
                    {canManage && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span className="badge badge-primary">{e.category}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{e.description || '—'}</div>
                      </td>
                      <td>
                        {e.inventory_item_name ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--primary)' }}>
                            <Package size={13} />
                            <span>{e.inventory_item_name}</span>
                          </div>
                        ) : e.request_title ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#d97706' }}>
                            <FileText size={13} />
                            <span>Request #{e.related_request_id}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Direct Expense</span>
                        )}
                      </td>
                      <td>{new Date(e.date).toLocaleDateString()}</td>
                      <td>
                        <strong style={{ color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                          -{formatCurrency(e.amount)}
                        </strong>
                      </td>
                      {canManage && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => {
                                setEditingExp(e);
                                setExpForm({ category: e.category, amount: e.amount, date: e.date.split('T')[0], description: e.description || '' });
                                setExpModalOpen(true);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(e.id)}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. BUDGETS & REVENUE TARGETS TAB */}
      {/* =================================================================== */}
      {activeTab === 'budgets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Operating Budget Allocations</h3>
            {canManage && (
              <button
                onClick={() => setBudgetModalOpen(true)}
                className="btn btn-primary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
              >
                <Plus size={15} />
                <span>New Budget Period</span>
              </button>
            )}
          </div>

          <div className="grid-2">
            {budgets.map((b) => (
              <div key={b.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{b.period_name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(b.start_date).toLocaleDateString()} — {new Date(b.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>

                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  {formatCurrency(b.allocated_amount)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Departmental operating allocation for hardware, faculty grants, and student lab infrastructure.
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '1rem' }}>External Revenue Targets</h3>
          <div className="grid-2">
            {goals.map((g) => (
              <div key={g.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{g.period_name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(g.start_date).toLocaleDateString()} — {new Date(g.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="badge badge-primary">Target</span>
                </div>

                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#047857', marginBottom: '0.5rem' }}>
                  {formatCurrency(g.target_amount)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  External grant, corporate tech partnership, and corporate training workshop revenue benchmark.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALS */}
      {/* =================================================================== */}

      {/* Revenue Modal */}
      {revModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editingRev ? 'Edit Revenue' : 'Add Revenue Entry'}</h3>
              <button onClick={() => setRevModalOpen(false)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveRevenue} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Revenue Source</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NSF Research Grant Phase 2"
                  value={revForm.source}
                  onChange={(e) => setRevForm({ ...revForm, source: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={revForm.amount}
                    onChange={(e) => setRevForm({ ...revForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Date</label>
                  <input
                    type="date"
                    required
                    value={revForm.date}
                    onChange={(e) => setRevForm({ ...revForm, date: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Description</label>
                <textarea
                  rows="2"
                  value={revForm.description}
                  onChange={(e) => setRevForm({ ...revForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setRevModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Revenue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {expModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editingExp ? 'Edit Expense' : 'Record Expense'}</h3>
              <button onClick={() => setExpModalOpen(false)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category</label>
                <select
                  value={expForm.category}
                  onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                >
                  {EXPENSE_CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expForm.amount}
                    onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Date</label>
                  <input
                    type="date"
                    required
                    value={expForm.date}
                    onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Description</label>
                <textarea
                  rows="2"
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setExpModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {budgetModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <div className="card-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Create New Budget Period</h3>
              <button onClick={() => setBudgetModalOpen(false)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveBudget} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Period Name</label>
                <input
                  type="text"
                  required
                  value={budgetForm.period_name}
                  onChange={(e) => setBudgetForm({ ...budgetForm, period_name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Allocated Budget ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={budgetForm.allocated_amount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, allocated_amount: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={budgetForm.start_date}
                    onChange={(e) => setBudgetForm({ ...budgetForm, start_date: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>End Date</label>
                  <input
                    type="date"
                    required
                    value={budgetForm.end_date}
                    onChange={(e) => setBudgetForm({ ...budgetForm, end_date: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setBudgetModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
