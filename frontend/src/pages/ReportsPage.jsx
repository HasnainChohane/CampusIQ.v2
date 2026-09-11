import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Eye,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Package,
  BookOpen,
  ClipboardList,
  User,
  X,
  Building,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('academic');
  const [customTitle, setCustomTitle] = useState('');
  const [activeReport, setActiveReport] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReports();
      if (res.success) {
        setReports(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await api.generateReport({
        reportType: selectedType,
        title: customTitle.trim() || undefined
      });
      if (res.success) {
        setActiveReport(res.data);
        await fetchReports();
      }
    } catch (err) {
      alert('Error generating report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const reportTypes = [
    {
      id: 'academic',
      title: 'Academic Performance & Workload',
      desc: 'Student GPAs, at-risk watchlist, course fill rates, and faculty credit hours.',
      icon: BookOpen,
      color: '#2563eb'
    },
    {
      id: 'financial',
      title: 'Fiscal Audit & Budget Utilization',
      desc: 'YTD revenues, expenditure ledger by category, operating margin, and budget caps.',
      icon: DollarSign,
      color: '#059669'
    },
    {
      id: 'inventory',
      title: 'Asset Inventory & Hardware Health',
      desc: 'Total equipment valuation, damaged assets, and active faculty assignments.',
      icon: Package,
      color: '#d97706'
    },
    {
      id: 'requests',
      title: 'Procurement & Approval Flow',
      desc: 'Ticket volumes, pending review valuation, approval velocity, and AI cost estimates.',
      icon: ClipboardList,
      color: '#7c3aed'
    }
  ];

  const filteredReports = reports.filter(r => {
    if (filterType !== 'all' && r.report_type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.title?.toLowerCase().includes(q) ||
        r.report_type?.toLowerCase().includes(q) ||
        r.generated_by_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText className="text-blue-600" size={26} />
            <span>Management Reports & PDF Export</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Generate grounded, verifiable department reports with AI executive summaries and instant printable export.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchReports} className="btn btn-secondary" title="Refresh list">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Report Generator Studio */}
      <div className="card" style={{ border: '1px solid #bfdbfe', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#2563eb', padding: '6px', borderRadius: '8px', color: '#fff' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>
              Live Report Generator
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
              Pulls live SQL records from MySQL and synthesizes an executive summary.
            </p>
          </div>
        </div>

        {/* Category Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {reportTypes.map(t => {
            const Icon = t.icon;
            const isSelected = selectedType === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${t.color}` : '1px solid #e2e8f0',
                  background: isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  borderRadius: '10px',
                  padding: '1rem',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <div style={{ background: isSelected ? t.color : '#f1f5f9', color: isSelected ? '#fff' : '#64748b', padding: '6px', borderRadius: '6px' }}>
                    <Icon size={16} />
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: isSelected ? '#0f172a' : '#475569' }}>
                    {t.title.split('&')[0]}
                  </strong>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Options Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Custom Report Title (Optional)
            </label>
            <input
              type="text"
              placeholder={`e.g. Q3 Computer Science Department ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Audit`}
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn btn-primary"
              style={{ minWidth: '180px', display: 'flex', justifyContent: 'center' }}
            >
              {generating ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Preview Modal / Sheet */}
      {activeReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            className="print-modal-container"
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText className="text-blue-600" size={20} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Report Document Preview
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print document or save as PDF">
                  <Printer size={15} />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setActiveReport(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Report Content Body */}
            <div id="printable-report-area" style={{ padding: '2rem' }}>
              {/* Department Header */}
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Building size={22} className="text-blue-600" />
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                      DEPARTMENT OF COMPUTER SCIENCE
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                    Faculty of Computing & Information Technology • Official Academic & Financial Record
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#ecfdf5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    <ShieldCheck size={14} />
                    <span>VERIFIED AUDIT</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                    Generated: {new Date(activeReport.createdAt || Date.now()).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                {activeReport.title}
              </h2>

              {/* Grounded AI Executive Summary Callout */}
              <div style={{ background: '#f8fafc', borderLeft: '4px solid #2563eb', padding: '1rem', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1d4ed8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <Sparkles size={16} />
                  <span>GROUNDED AI EXECUTIVE SUMMARY</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  {activeReport.aiSummary || activeReport.summary_ai}
                </p>
              </div>

              {/* KPI Metrics Summary Grid if present */}
              {activeReport.payload?.metrics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {Object.entries(activeReport.payload.metrics).map(([k, v]) => (
                    <div key={k} style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        {k.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                        {typeof v === 'number' && k.toLowerCase().includes('rev') || k.toLowerCase().includes('exp') || k.toLowerCase().includes('val') || k.toLowerCase().includes('cost') || k.toLowerCase().includes('income') || k.toLowerCase().includes('budget')
                          ? `$${v.toLocaleString()}`
                          : v}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Data Table Sections */}
              {activeReport.payload?.sections?.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.6rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
                    {section.title}
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                        {section.headers.map((h, i) => (
                          <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '8px 10px', color: '#334155' }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Report Footer */}
              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                <div>DepartmentHub Enterprise Management Intelligence • Confidential</div>
                <div>Authorized Signoff: ____________________</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Generated Reports Archive */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Generated Reports Archive
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Historical archive of all verified reports generated across the department.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Search Filter */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search archive..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '32px', width: '180px', fontSize: '0.8rem' }}
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.8rem' }}
            >
              <option value="all">All Report Types</option>
              <option value="academic">Academic</option>
              <option value="financial">Financial</option>
              <option value="inventory">Inventory</option>
              <option value="requests">Requests</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 0.5rem auto' }} />
            <div>Loading reports archive...</div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px' }}>
            <FileText size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No reports found matching criteria.</p>
            <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>Generate your first live report using the generator above.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>Category</th>
                  <th>Generated By</th>
                  <th>Date & Time</th>
                  <th>AI Executive Summary Preview</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(r => {
                  const typeColors = {
                    academic: { bg: '#dbeafe', color: '#1d4ed8' },
                    financial: { bg: '#dcfce7', color: '#15803d' },
                    inventory: { bg: '#fef3c7', color: '#b45309' },
                    requests: { bg: '#ede9fe', color: '#6d28d9' }
                  };
                  const badge = typeColors[r.report_type] || { bg: '#f1f5f9', color: '#475569' };

                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} className="text-blue-600" />
                          <span>{r.title}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}
                        >
                          {r.report_type}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <User size={13} />
                          <span>{r.generated_by_name || 'Administrator'}</span>
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {new Date(r.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ maxWidth: '280px', fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.summary_ai || 'Automated data summary'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setActiveReport({
                              ...r,
                              aiSummary: r.summary_ai
                            });
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <Eye size={13} />
                          <span>View / Export</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
