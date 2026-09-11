import React from 'react';
import { FileBarChart2, Download, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Management Reports & PDF Generation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Generate, preview, and download official departmental PDF reports with automated AI summaries.
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <CheckCircle2 size={18} className="text-emerald-600" />
          <strong style={{ fontSize: '0.95rem' }}>Database Ready: Reports Table Configured</strong>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          In Step 11, PDF generation for Academic, Financial, Inventory, and Performance reports with AI executive summaries will be active here.
        </p>
      </div>
    </div>
  );
}
