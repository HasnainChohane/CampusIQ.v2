import React from 'react';
import { Sparkles, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AiAssistantPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles className="text-blue-600" size={24} />
          <span>Department AI Assistant & Intelligence</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Ask natural-language questions grounded strictly in live database facts without hallucination.
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={18} className="text-blue-600" />
          <strong style={{ fontSize: '0.95rem' }}>Architecture Ready: Grounded Query Pipeline</strong>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          In Step 13, the natural language query pipeline will interpret user questions, query MySQL via deterministic functions, and formulate concise, accurate executive answers with zero hallucination.
        </p>
      </div>
    </div>
  );
}
