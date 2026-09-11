import React from 'react';
import { DollarSign, CheckCircle2, TrendingUp } from 'lucide-react';

export default function FinancePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Financial Management & Budgets
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Track departmental revenue sources, operating expenses, quarterly budgets, and external revenue targets.
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <CheckCircle2 size={18} className="text-emerald-600" />
          <strong style={{ fontSize: '0.95rem' }}>Database Ready: Revenue, Expense, Budget & Goal Tables Initialized</strong>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          In Step 10, real-time server-side budget utilization calculations, category breakdowns, and revenue vs goal charts will be integrated.
        </p>
      </div>
    </div>
  );
}
