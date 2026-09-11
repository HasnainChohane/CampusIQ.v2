import React, { useState } from 'react';
import {
  Settings,
  X,
  Coins,
  Building,
  Calendar,
  Sparkles,
  Check,
  Globe,
  Sliders,
  RotateCcw,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function SettingsModal() {
  const { settings, updateSettings, resetSettings, formatCurrency, isSettingsOpen, setIsSettingsOpen } = useSettings();
  const [activeTab, setActiveTab] = useState('currency');
  const [form, setForm] = useState({ ...settings });
  const [savedToast, setSavedToast] = useState(false);

  if (!isSettingsOpen) return null;

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(form);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      setIsSettingsOpen(false);
    }, 900);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to Pakistani Higher Ed defaults?')) {
      resetSettings();
      setIsSettingsOpen(false);
    }
  };

  // Compute live sample conversion
  const sampleAmountPkr = 1850000;
  const sampleFormatted = () => {
    if (form.currency === 'USD') {
      const usd = sampleAmountPkr / (Number(form.exchangeRate) || 280);
      return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (form.currency === 'EUR') {
      const eur = (sampleAmountPkr / (Number(form.exchangeRate) || 280)) * 0.92;
      return `€${eur.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const prefix = form.currencySymbolStyle === 'code' ? 'PKR ' : 'Rs. ';
    return `${prefix}${sampleAmountPkr.toLocaleString('en-PK')}`;
  };

  return (
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
          maxWidth: '680px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'fadeIn 0.15s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#2563eb', color: '#fff', padding: '6px', borderRadius: '8px' }}>
              <Settings size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Platform Settings & Preferences
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                Customize currency, institutional branding, and regional configurations.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 1rem' }}>
          {[
            { id: 'currency', label: 'Currency & Financials', icon: Coins },
            { id: 'institution', label: 'Institution Profile', icon: Building },
            { id: 'regional', label: 'Localization & Display', icon: Globe }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.85rem 1.1rem',
                  fontSize: '0.85rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#2563eb' : '#64748b',
                  border: 'none',
                  borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: CURRENCY */}
          {activeTab === 'currency' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Primary Display Currency
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { id: 'PKR', label: 'Pakistani Rupee (PKR)', symbol: 'Rs.', desc: 'Default national currency' },
                    { id: 'USD', label: 'US Dollar (USD)', symbol: '$', desc: 'International standard' },
                    { id: 'EUR', label: 'Euro (EUR)', symbol: '€', desc: 'European exchange' }
                  ].map(curr => {
                    const selected = form.currency === curr.id;
                    return (
                      <div
                        key={curr.id}
                        onClick={() => handleChange('currency', curr.id)}
                        style={{
                          cursor: 'pointer',
                          border: selected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: selected ? '#eff6ff' : '#ffffff',
                          borderRadius: '10px',
                          padding: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: selected ? '#1d4ed8' : '#0f172a' }}>
                            {curr.symbol} {curr.id}
                          </span>
                          {selected && <CheckCircle2 size={16} className="text-blue-600" />}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{curr.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PKR Symbol Style */}
              {form.currency === 'PKR' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                    PKR Formatting Prefix
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="symbolStyle"
                        checked={form.currencySymbolStyle === 'symbol'}
                        onChange={() => handleChange('currencySymbolStyle', 'symbol')}
                      />
                      <span>Symbol Prefix: <strong>Rs. 1,850,000</strong> (Recommended)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="symbolStyle"
                        checked={form.currencySymbolStyle === 'code'}
                        onChange={() => handleChange('currencySymbolStyle', 'code')}
                      />
                      <span>Code Prefix: <strong>PKR 1,850,000</strong></span>
                    </label>
                  </div>
                </div>
              )}

              {/* Exchange Rate setting if USD or EUR */}
              {(form.currency === 'USD' || form.currency === 'EUR') && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    PKR to USD Conversion Exchange Rate
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>1 USD =</span>
                    <input
                      type="number"
                      value={form.exchangeRate}
                      onChange={e => handleChange('exchangeRate', Number(e.target.value))}
                      className="input-field"
                      style={{ width: '120px', fontWeight: 700 }}
                    />
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>PKR</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.4rem 0 0 0' }}>
                    Used for dynamic conversion of all live database figures into {form.currency}.
                  </p>
                </div>
              )}

              {/* Live Conversion Preview Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: '#ffffff',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Live Preview Sample
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                    Raw DB: Rs. 1,850,000 (Lab Workstations)
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                    Formatted Display:
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#4ade80' }}>
                    {sampleFormatted()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTITUTION PROFILE */}
          {activeTab === 'institution' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  University / Higher Education Institution
                </label>
                <input
                  type="text"
                  value={form.universityName}
                  onChange={e => handleChange('universityName', e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Department / Faculty Division
                </label>
                <input
                  type="text"
                  value={form.departmentName}
                  onChange={e => handleChange('departmentName', e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Active Academic Term
                </label>
                <input
                  type="text"
                  value={form.activeTerm}
                  onChange={e => handleChange('activeTerm', e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: REGIONAL & LOCALIZATION */}
          {activeTab === 'regional' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Date Format
                </label>
                <select
                  value={form.dateFormat}
                  onChange={e => handleChange('dateFormat', e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Pakistan / UK Standard)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.compactMode}
                    onChange={e => handleChange('compactMode', e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Compact Interface Density</strong>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Reduces padding for data-heavy desktop screens.</p>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.soundAlerts}
                    onChange={e => handleChange('soundAlerts', e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>Action Confirmation Chimes</strong>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Play subtle audio chime on ticket approval & reports export.</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}
        >
          <button
            onClick={handleReset}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b' }}
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={() => setIsSettingsOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              style={{ minWidth: '130px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
            >
              {savedToast ? (
                <>
                  <Check size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
