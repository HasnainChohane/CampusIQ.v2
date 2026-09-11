import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  Layers, 
  DollarSign, 
  Package, 
  Calendar, 
  User, 
  X, 
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const REQUEST_TYPES = ['All', 'purchase', 'leave', 'maintenance', 'general'];
const STATUS_OPTIONS = ['All', 'pending', 'under_review', 'approved', 'rejected', 'returned'];

export default function RequestsPage() {
  const { user, role } = useAuth();
  const { formatCurrency, currency } = useSettings();
  const isReviewer = role === 'admin' || role === 'officer';

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'mine', 'pending'
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Request Form & Live AI Preview
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('purchase');
  const [newPriority, setNewPriority] = useState('medium');
  const [aiPreview, setAiPreview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Review action remarks & comment inputs
  const [reviewerRemarks, setReviewerRemarks] = useState('');
  const [newComment, setNewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequestsData = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        type: typeFilter === 'All' ? 'all' : typeFilter,
        status: activeTab === 'pending' ? 'pending' : (statusFilter === 'All' ? 'all' : statusFilter),
        priority: priorityFilter,
        onlyMine: activeTab === 'mine' ? 'true' : 'false'
      };

      const [listRes, statRes] = await Promise.all([
        api.getRequests(params),
        api.getRequestStats()
      ]);

      if (listRes.success) setRequests(listRes.data.requests);
      if (statRes.success) setStats(statRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequestsData();
  }, [activeTab, search, typeFilter, statusFilter, priorityFilter]);

  // View request details
  const handleViewRequest = async (id) => {
    try {
      const res = await api.getRequestById(id);
      if (res.success) {
        setSelectedRequest(res.data.request);
        setReviewerRemarks('');
        setNewComment('');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Run instant AI text analysis
  const handleRunAiAnalysis = async (descText, titleText) => {
    if (!descText && !titleText) return;
    setAiLoading(true);
    try {
      const res = await api.analyzeRequest({ text: descText, title: titleText });
      if (res.success) {
        setAiPreview(res.data);
        setNewType(res.data.type);
        setNewPriority(res.data.priority);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // 1-Click Fill Hackathon Demo Prompt
  const handleFillDemoScenario = () => {
    const title = 'We need 5 new desktop computers for the AI laboratory.';
    const desc = 'We need 5 new desktop computers for the AI laboratory to support capstone research in deep learning and student projects in CS401.';
    setNewTitle(title);
    setNewDescription(desc);
    handleRunAiAnalysis(desc, title);
  };

  // Submit new request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.createRequest({
        title: newTitle,
        description: newDescription,
        type: newType,
        priority: newPriority
      });
      alert('Request submitted and AI analysis generated!');
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setAiPreview(null);
      loadRequestsData();
      if (res.data?.id) {
        handleViewRequest(res.data.id);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Status (Approve, Reject, Return, Under Review) + Connected Purchase Sync
  const handleStatusAction = async (newStatus, syncPurchase = false) => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await api.updateRequestStatus(selectedRequest.id, {
        status: newStatus,
        remarks: reviewerRemarks || (syncPurchase ? 'Approved with automated purchase recording to inventory & expenses' : `Request status changed to ${newStatus}`),
        syncPurchase
      });

      let alertMsg = `Request status updated to ${newStatus}!`;
      if (res.data?.purchaseSync) {
        alertMsg += `\n✔ Expense of ${formatCurrency(res.data.purchaseSync.amount)} recorded.\n✔ Inventory updated.`;
      }
      alert(alertMsg);

      setReviewerRemarks('');
      loadRequestsData();
      handleViewRequest(selectedRequest.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedRequest) return;
    try {
      await api.addRequestComment(selectedRequest.id, { comment: newComment });
      setNewComment('');
      handleViewRequest(selectedRequest.id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Requests & Approval Workflow
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Submit operational, purchase, leave, and maintenance requests with automated AI classification and audit trails.
          </p>
        </div>

        <button
          onClick={() => {
            setNewTitle('');
            setNewDescription('');
            setAiPreview(null);
            setCreateModalOpen(true);
          }}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>New Request</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid-4">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Pending Review</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: '#d97706' }}>
            {stats?.pending || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Awaiting initial evaluation
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Under Review</span>
            <Sparkles size={16} className="text-blue-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--primary)' }}>
            {stats?.underReview || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Assigned to officer review
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Approved</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: '#059669' }}>
            {stats?.approved || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {stats?.types?.purchase || 0} purchases / {stats?.types?.leave || 0} leaves
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>Total Logged</span>
            <Layers size={16} className="text-purple-500" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--text-main)' }}>
            {stats?.total || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {stats?.returned || 0} returned with remarks
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Main Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', background: '#e2e8f0', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === 'all' ? '#ffffff' : 'transparent',
                  color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                All Requests ({stats?.total || 0})
              </button>

              <button
                onClick={() => setActiveTab('mine')}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === 'mine' ? '#ffffff' : 'transparent',
                  color: activeTab === 'mine' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                My Requests
              </button>

              {isReviewer && (
                <button
                  onClick={() => setActiveTab('pending')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: activeTab === 'pending' ? '#ffffff' : 'transparent',
                    color: activeTab === 'pending' ? '#d97706' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Pending Action ({stats?.pending || 0})
                </button>
              )}
            </div>

            {/* Type Filter Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
              {REQUEST_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    border: typeFilter === t ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                    background: typeFilter === t ? 'var(--primary-light)' : '#ffffff',
                    color: typeFilter === t ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Secondary Dropdowns */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search requests by title, description or requester..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.3rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="returned">Returned</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Request Details</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Requester</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                let extracted = {};
                try {
                  extracted = typeof req.ai_extracted_data === 'string' 
                    ? JSON.parse(req.ai_extracted_data) 
                    : (req.ai_extracted_data || {});
                } catch(e) {}

                return (
                  <tr key={req.id} style={{ cursor: 'pointer' }} onClick={() => handleViewRequest(req.id)}>
                    <td style={{ maxWidth: '350px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                        #{req.id} • {req.title}
                      </div>
                      {req.ai_summary && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Sparkles size={12} className="text-blue-500" />
                          <span style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.ai_summary}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                        {req.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase',
                        color: req.priority === 'urgent' ? '#dc2626' : req.priority === 'high' ? '#ea580c' : req.priority === 'medium' ? '#3b82f6' : '#64748b'
                      }}>
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        req.status === 'approved' ? 'badge-success' :
                        req.status === 'under_review' ? 'badge-primary' :
                        req.status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>{req.requester_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.requester_role}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewRequest(req.id)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={14} />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No requests found matching the current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. SUBMIT REQUEST MODAL */}
      {/* =================================================================== */}
      {createModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} className="text-blue-600" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Submit Operational Request</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            {/* 1-Click Hackathon Demo Scenario Button */}
            <div style={{ background: '#eff6ff', border: '1px dashed #93c5fd', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#1e40af' }}>Hackathon Demo Quick Fill:</strong>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>“We need 5 new desktop computers for the AI laboratory.”</div>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoScenario}
                  className="btn btn-primary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Fill & Analyze
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Request Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Procurement of AI workstations"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Detailed Description</label>
                  <button
                    type="button"
                    onClick={() => handleRunAiAnalysis(newDescription, newTitle)}
                    disabled={aiLoading || (!newDescription && !newTitle)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Sparkles size={13} />
                    <span>{aiLoading ? 'Analyzing...' : 'Run AI Analysis'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe your request in natural language. AI will automatically classify and extract items, quantities, dates, and budget requirements..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onBlur={() => handleRunAiAnalysis(newDescription, newTitle)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontFamily: 'inherit', fontSize: '0.875rem' }}
                />
              </div>

              {/* AI Live Analysis Preview Card */}
              {aiPreview && (
                <div style={{ background: '#0f172a', color: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#93c5fd', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    <Sparkles size={14} />
                    <span>AI Classification & Structured Extraction</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '0.6rem', lineHeight: 1.5 }}>
                    {aiPreview.ai_summary}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                    <span className="badge badge-primary">Type: {aiPreview.type.toUpperCase()}</span>
                    <span className="badge badge-warning">Priority: {aiPreview.priority.toUpperCase()}</span>
                    {aiPreview.ai_extracted_data?.quantity && (
                      <span className="badge badge-success">Qty: {aiPreview.ai_extracted_data.quantity}</span>
                    )}
                    {aiPreview.ai_extracted_data?.estimated_cost && (
                      <span className="badge badge-success">Est: {formatCurrency(aiPreview.ai_extracted_data.estimated_cost)}</span>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Request Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="purchase">Purchase (Equipment / Supplies)</option>
                    <option value="leave">Leave / Absence</option>
                    <option value="maintenance">Maintenance / Facilities</option>
                    <option value="general">General Administrative</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. REQUEST DETAIL & REVIEW DRAWER */}
      {/* =================================================================== */}
      {selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto' }}>
            {/* Drawer Header */}
            <div className="card-header" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className={`badge ${
                    selectedRequest.status === 'approved' ? 'badge-success' :
                    selectedRequest.status === 'under_review' ? 'badge-primary' :
                    selectedRequest.status === 'pending' ? 'badge-warning' : 'badge-danger'
                  }`} style={{ textTransform: 'capitalize' }}>
                    {selectedRequest.status.replace('_', ' ')}
                  </span>
                  <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                    {selectedRequest.type}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: selectedRequest.priority === 'urgent' ? '#dc2626' : '#64748b' }}>
                    Priority: {selectedRequest.priority}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>#{selectedRequest.id} - {selectedRequest.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submitted by <strong>{selectedRequest.requester_name}</strong> ({selectedRequest.requester_role}) on {new Date(selectedRequest.created_at).toLocaleString()}
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="btn btn-outline" style={{ padding: '0.3rem' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Description Body */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Request Statement
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {selectedRequest.description}
                </p>
              </div>

              {/* AI Intelligence & Extraction Card */}
              {selectedRequest.ai_summary && (
                <div style={{ background: '#0f172a', color: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '1.1rem', border: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Sparkles size={16} />
                    <span>AI Officer Summary & Extracted Fields</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {selectedRequest.ai_summary}
                  </p>

                  {selectedRequest.ai_extracted_data && (
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                      {Object.entries(
                        typeof selectedRequest.ai_extracted_data === 'string' 
                          ? JSON.parse(selectedRequest.ai_extracted_data) 
                          : selectedRequest.ai_extracted_data
                      ).map(([k, v]) => (
                        <div key={k} style={{ background: 'rgba(255,255,255,0.08)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{k.replace('_', ' ')}:</span>{' '}
                          <strong style={{ color: '#ffffff' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Connected Purchase Notice if already synced */}
              {selectedRequest.linkedExpense && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <CheckCircle2 size={16} />
                    <span>Connected Purchase Synced</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#047857' }}>
                    Expense record #{selectedRequest.linkedExpense.expense_id} created for {formatCurrency(selectedRequest.linkedExpense.amount)}. Inventory catalog updated.
                  </p>
                </div>
              )}

              {/* Reviewer Action Panel (Officer & Admin) */}
              {isReviewer && selectedRequest.status !== 'approved' && selectedRequest.status !== 'rejected' && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <ShieldAlert size={16} />
                    <span>Reviewer Approval Actions</span>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Add reviewer remarks or justification (optional)..."
                      value={reviewerRemarks}
                      onChange={(e) => setReviewerRemarks(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #d97706', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedRequest.type === 'purchase' ? (
                      <button
                        onClick={() => handleStatusAction('approved', true)}
                        disabled={actionLoading}
                        className="btn btn-primary"
                        style={{ background: '#059669', borderColor: '#047857', fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                      >
                        <CheckCircle2 size={15} />
                        <span>Approve & Record Purchase (Expense + Inventory)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusAction('approved', false)}
                        disabled={actionLoading}
                        className="btn btn-primary"
                        style={{ background: '#059669', borderColor: '#047857', fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                      >
                        <CheckCircle2 size={15} />
                        <span>Approve Request</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleStatusAction('under_review', false)}
                      disabled={actionLoading}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                    >
                      <Sparkles size={14} />
                      <span>Mark Under Review</span>
                    </button>

                    <button
                      onClick={() => handleStatusAction('returned', false)}
                      disabled={actionLoading}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', color: '#d97706' }}
                    >
                      <RotateCcw size={14} />
                      <span>Return with Remarks</span>
                    </button>

                    <button
                      onClick={() => handleStatusAction('rejected', false)}
                      disabled={actionLoading}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', color: '#dc2626' }}
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Audit History Timeline */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem' }}>Status Transition Audit Trail</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedRequest.history?.map((h) => (
                    <div key={h.id} style={{ padding: '0.6rem 0.8rem', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: '0.7rem', marginRight: '0.5rem' }}>
                          {h.new_status.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>{h.remarks}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          by {h.changed_by_name} ({h.changed_by_role})
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussion Remarks / Comments */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                  Discussion & Notes ({selectedRequest.comments?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {selectedRequest.comments?.map((c) => (
                    <div key={c.id} style={{ padding: '0.6rem 0.8rem', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <strong style={{ fontSize: '0.825rem' }}>{c.user_name} ({c.user_role})</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>{c.comment}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Add a remark or inquiry..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}>
                    <Send size={14} />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
