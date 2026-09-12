import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Database,
  ArrowRight,
  TrendingUp,
  BookOpen,
  DollarSign,
  Package,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  User,
  Bot,
  Layers,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';

export default function AiAssistantPage({ onNavigate }) {

  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      answer: `Hello! I am **CampusIQ Intelligence**, your grounded AI management assistant. Ask me any natural-language question about course capacity, faculty workloads, financial balances, hardware inventory, or approval backlogs. Every response is strictly computed against live MySQL database records with zero hallucination.`,
      metrics: [
        { label: 'Grounding Mode', value: 'Live SQL', color: 'emerald' },
        { label: 'Database', value: 'departmenthub_db', color: 'blue' },
        { label: 'Hallucination Rate', value: '0.0%', color: 'purple' }
      ]
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchSuggestions = async () => {
    try {
      const res = await api.getAiSuggestions();
      if (res.success) {
        setSuggestions(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch AI suggestions:', err);
    }
  };

  const handleSendQuery = async (queryText) => {
    const textToSend = (queryText || queryInput).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQueryInput('');
    setLoading(true);

    try {
      const res = await api.queryAi({ query: textToSend });
      if (res.success && res.data) {
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          answer: res.data.answer,
          metrics: res.data.metrics || [],
          columns: res.data.columns || [],
          data: res.data.data || [],
          actionSuggestion: res.data.actionSuggestion,
          confidence: res.data.confidence,
          source: res.data.source
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        answer: `⚠ Unable to execute query against database: ${err.message}`,
        metrics: []
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#0f172a', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles className="text-blue-600" size={26} />
            <span>Department AI Assistant & Intelligence</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Query departmental metrics, analyze bottlenecks, and explore real-time SQL data using natural language.
          </p>
        </div>

        {/* Grounding Verification Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '8px' }}>
          <ShieldCheck size={16} className="text-emerald-600" />
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>
            GROUNDED IN LIVE MYSQL DATA
          </div>
        </div>
      </div>

      {/* Suggested Fast Queries Ribbon */}
      <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <HelpCircle size={14} className="text-blue-600" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Suggested Quick Inquiries (Click to Execute)
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {suggestions.map(s => (
            <button
              key={s.id}
              onClick={() => handleSendQuery(s.query)}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={12} className="text-blue-500" />
              <span>{s.query}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread Container */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          overflow: 'hidden',
          background: '#ffffff'
        }}
      >
        {/* Messages Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  justifyContent: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: isUser ? '75%' : '85%',
                    background: isUser ? '#2563eb' : '#f8fafc',
                    color: isUser ? '#ffffff' : '#1e293b',
                    padding: '1rem 1.25rem',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    border: isUser ? 'none' : '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* User Question */}
                  {isUser && (
                    <div style={{ fontSize: '0.92rem', lineHeight: 1.5, fontWeight: 500 }}>
                      {m.text}
                    </div>
                  )}

                  {/* AI Response */}
                  {!isUser && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {/* Answer Paragraph */}
                      <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#334155' }}>
                        {renderFormattedText(m.answer)}
                      </div>

                      {/* KPI Stat Badges */}
                      {m.metrics && m.metrics.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                          {m.metrics.map((met, i) => {
                            const colors = {
                              emerald: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
                              blue: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
                              purple: { bg: '#faf5ff', text: '#6b21a8', border: '#e9d5ff' },
                              rose: { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
                              amber: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
                              indigo: { bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe' }
                            };
                            const c = colors[met.color] || colors.blue;
                            return (
                              <div
                                key={i}
                                style={{
                                  background: c.bg,
                                  border: `1px solid ${c.border}`,
                                  color: c.text,
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem'
                                }}
                              >
                                <span style={{ opacity: 0.85 }}>{met.label}:</span>
                                <strong style={{ fontSize: '0.85rem' }}>{met.value}</strong>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Supporting Data Table */}
                      {m.data && m.data.length > 0 && (
                        <div style={{ marginTop: '0.5rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                          <div style={{ padding: '6px 10px', background: '#f1f5f9', fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Database size={12} />
                            <span>SUPPORTING LIVE SQL DATA RECORDS</span>
                          </div>
                          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                                  {m.columns.map((col, idx) => (
                                    <th key={idx} style={{ padding: '6px 8px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {m.data.slice(0, 8).map((row, rIdx) => (
                                  <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} style={{ padding: '6px 8px', color: '#334155' }}>
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Direct Navigation Action Suggestion */}
                      {m.actionSuggestion && (
                        <div style={{ marginTop: '0.25rem' }}>
                          <button
                            onClick={() => onNavigate && onNavigate(m.actionSuggestion.path.replace('/', ''))}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            <span>{m.actionSuggestion.label}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: isUser ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                      marginTop: '0.4rem',
                      textAlign: 'right'
                    }}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}
                  >
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Spinner Indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}
              >
                <Sparkles size={18} className="animate-spin" />
              </div>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <RefreshCw className="animate-spin" size={14} />
                <span>Querying MySQL & formulating grounded response...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. 'Which faculty teach > 12 credits?', 'What is our net margin?', 'Damaged laptops?')..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              disabled={loading}
              className="input-field"
              style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.9rem' }}
            />
            <button
              type="submit"
              disabled={!queryInput.trim() || loading}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Send size={16} />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
