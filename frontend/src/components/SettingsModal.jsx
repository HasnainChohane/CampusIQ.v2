import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Coins,
  Building,
  User,
  Globe,
  RotateCcw,
  CheckCircle2,
  Check,
  Building2,
  Laptop,
  GraduationCap,
  Cpu,
  Layers,
  School,
  BookOpen
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const DEPT_ICONS = [
  { id: 'Building2', label: 'Building / Complex', icon: Building2 },
  { id: 'Laptop', label: 'Computing & Software', icon: Laptop },
  { id: 'GraduationCap', label: 'Academic & Faculty', icon: GraduationCap },
  { id: 'Cpu', label: 'Hardware & AI', icon: Cpu },
  { id: 'Layers', label: 'Systems & Infrastructure', icon: Layers },
  { id: 'School', label: 'University / Institute', icon: School },
  { id: 'BookOpen', label: 'Research & Library', icon: BookOpen },
];

export default function SettingsModal() {
  const { settings, updateSettings, resetSettings, isSettingsOpen, setIsSettingsOpen } = useSettings();
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('user-profile');
  const [form, setForm] = useState({ ...settings });
  
  // User profile state initialized to the current active logged-in user
  const [userForm, setUserForm] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    avatar_url: ''
  });

  const [savedToast, setSavedToast] = useState(false);

  // Sync state whenever active user or modal opens
  useEffect(() => {
    if (user) {
      setUserForm({
        name: user.name || '',
        designation: user.designation || (user.role === 'admin' ? 'Professor & Dean' : user.role === 'officer' ? 'Operations Officer' : user.role === 'faculty' ? 'Faculty Member' : 'Staff Member'),
        email: user.email || '',
        phone: user.phone || '+92 42 111 128 128 (Ext. 402)',
        avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'
      });
    }
    setForm({ ...settings });
  }, [user, isSettingsOpen, settings]);

  if (!isSettingsOpen) return null;

  const handleSettingsChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleUserChange = (key, value) => {
    setUserForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // 1. Save global application settings
    updateSettings(form);
    
    // 2. Save user profile settings specifically for this logged-in user
    updateUserProfile({
      name: userForm.name,
      designation: userForm.designation,
      email: userForm.email,
      phone: userForm.phone,
      avatar_url: userForm.avatar_url
    });

    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      setIsSettingsOpen(false);
    }, 800);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default configurations?')) {
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
          maxWidth: '720px',
          maxHeight: '92vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#2563eb', color: '#fff', padding: '7px', borderRadius: '8px', display: 'flex' }}>
              <Settings size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Platform Settings & Preferences
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                Manage Personal Profile, Department Branding, Currency, and System Settings.
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
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 0.5rem', overflowX: 'auto' }}>
          {[
            { id: 'user-profile', label: 'My Profile', icon: User },
            { id: 'department', label: 'Department Profile', icon: Building },
            { id: 'currency', label: 'Currency & Financials', icon: Coins },
            { id: 'preferences', label: 'Localization & Display', icon: Globe }
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
                  gap: '0.45rem',
                  padding: '0.85rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#2563eb' : '#64748b',
                  border: 'none',
                  borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
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
          {/* TAB 1: INDIVIDUAL USER PROFILE (Dedicated to current user) */}
          {activeTab === 'user-profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Profile Avatar Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <img
                  src={userForm.avatar_url || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'}
                  alt={userForm.name}
                  style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      {userForm.name || user?.name}
                    </h4>
                    <span className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                      {user?.role || 'Admin'}
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {userForm.designation} • {userForm.email}
                  </p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Personal profile settings for your account ({user?.role?.toUpperCase()})
                  </p>
                </div>
              </div>

              {/* Input Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={e => handleUserChange('name', e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={userForm.designation}
                    onChange={e => handleUserChange('designation', e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="e.g. Professor & Dean, Chair, Manager"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={e => handleUserChange('email', e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="name@departmenthub.edu"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Phone / Office Contact
                  </label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={e => handleUserChange('phone', e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="+92 42 111 128 128"
                  />
                </div>
              </div>

              {/* Profile Photo / Avatar URL Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Profile Picture / Avatar URL
                </label>
                <input
                  type="url"
                  value={userForm.avatar_url}
                  onChange={e => handleUserChange('avatar_url', e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                  placeholder="https://images.unsplash.com/... or paste image URL"
                />
                <p style={{ fontSize: '0.725rem', color: '#64748b', margin: '0.3rem 0 0' }}>
                  Enter any direct image URL to update your personal profile avatar.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DEPARTMENT PROFILE */}
          {activeTab === 'department' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Department Full Name
                </label>
                <input
                  type="text"
                  value={form.departmentName}
                  onChange={e => handleSettingsChange('departmentName', e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                  placeholder="e.g. Department of Computer Science & Software Engineering"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Department Code / Acronym
                  </label>
                  <input
                    type="text"
                    value={form.departmentCode || 'CS-SE'}
                    onChange={e => handleSettingsChange('departmentCode', e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="e.g. CS-SE, FAST-CS"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Active Academic Term
                  </label>
                  <input
                    type="text"
                    value={form.activeTerm}
                    onChange={e => handleSettingsChange('activeTerm', e.target.value)}
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="e.g. Fall 2026, Spring 2027"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  University / Higher Education Institution
                </label>
                <input
                  type="text"
                  value={form.universityName}
                  onChange={e => handleSettingsChange('universityName', e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                  placeholder="e.g. National University of Computer & Emerging Sciences"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Campus Complex / Building
                </label>
                <input
                  type="text"
                  value={form.campusBuilding}
                  onChange={e => handleSettingsChange('campusBuilding', e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                  placeholder="e.g. Al-Khawarizmi Computing Complex - CS Wing"
                />
              </div>

              {/* Department Brand Icon Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Department Logo / Brand Icon
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
                  {DEPT_ICONS.map(item => {
                    const Icon = item.icon;
                    const isSelected = (form.departmentIcon || 'Building2') === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSettingsChange('departmentIcon', item.id)}
                        style={{
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          borderRadius: '10px',
                          padding: '0.65rem 0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.35rem',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ color: isSelected ? '#2563eb' : '#64748b' }}>
                          <Icon size={22} />
                        </div>
                        <span style={{ fontSize: '0.725rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1d4ed8' : '#334155' }}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CURRENCY & FINANCIALS */}
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
                        onClick={() => handleSettingsChange('currency', curr.id)}
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
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="symbolStyle"
                        checked={form.currencySymbolStyle === 'symbol'}
                        onChange={() => handleSettingsChange('currencySymbolStyle', 'symbol')}
                      />
                      <span>Symbol Prefix: <strong>Rs. 1,850,000</strong> (Recommended)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="symbolStyle"
                        checked={form.currencySymbolStyle === 'code'}
                        onChange={() => handleSettingsChange('currencySymbolStyle', 'code')}
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
                      onChange={e => handleSettingsChange('exchangeRate', Number(e.target.value))}
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
                    Live Financial Formatter Preview
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

          {/* TAB 4: LOCALIZATION & PREFERENCES */}
          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Date Format
                </label>
                <select
                  value={form.dateFormat}
                  onChange={e => handleSettingsChange('dateFormat', e.target.value)}
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
                    onChange={e => handleSettingsChange('compactMode', e.target.checked)}
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
                    onChange={e => handleSettingsChange('soundAlerts', e.target.checked)}
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
