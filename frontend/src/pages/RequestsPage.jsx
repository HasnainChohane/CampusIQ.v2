import React from 'react';
import { FileText, Plus, CheckCircle2, Sparkles } from 'lucide-react';

export default function RequestsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Requests & Workflow Approvals
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Submit and review Leave, Purchase, Maintenance, and General requests with integrated AI extraction.
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={18} className="text-blue-600" />
          <strong style={{ fontSize: '0.95rem' }}>Database Ready: 32 Request Records & Transition History Seeded</strong>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          In Step 9, the complete end-to-end request workflow (Submission → AI Extraction & Categorization → Officer Review → Approval/Rejection/Return → Downstream Purchase & Inventory Sync) will be wired here.
        </p>
      </div>
    </div>
  );
}
