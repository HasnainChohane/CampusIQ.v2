import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  currency: 'PKR', // 'PKR' | 'USD' | 'EUR'
  currencySymbolStyle: 'symbol', // 'symbol' ('Rs.') | 'code' ('PKR')
  exchangeRate: 280, // 1 USD = 280 PKR
  dateFormat: 'DD/MM/YYYY',
  universityName: 'National University of Computer & Emerging Sciences',
  departmentName: 'Department of Computer Science & Software Engineering',
  activeTerm: 'Fall 2026',
  compactMode: false,
  soundAlerts: true
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('dphub_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('dphub_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const updateSettings = (partial) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  /**
   * Universal Currency Formatter across all views
   * Formats PKR values by default, and converts to USD/EUR if set in settings!
   */
  const formatCurrency = (amountInPkr, options = {}) => {
    if (amountInPkr === undefined || amountInPkr === null || isNaN(amountInPkr)) {
      return 'Rs. 0';
    }

    const num = Number(amountInPkr);

    if (settings.currency === 'USD') {
      const usdValue = num / (settings.exchangeRate || 280);
      return `$${usdValue.toLocaleString('en-US', {
        minimumFractionDigits: options.decimals !== undefined ? options.decimals : 2,
        maximumFractionDigits: options.decimals !== undefined ? options.decimals : 2
      })}`;
    }

    if (settings.currency === 'EUR') {
      const eurValue = (num / (settings.exchangeRate || 280)) * 0.92;
      return `€${eurValue.toLocaleString('en-US', {
        minimumFractionDigits: options.decimals !== undefined ? options.decimals : 2,
        maximumFractionDigits: options.decimals !== undefined ? options.decimals : 2
      })}`;
    }

    // Default PKR
    const prefix = settings.currencySymbolStyle === 'code' ? 'PKR ' : 'Rs. ';
    return `${prefix}${num.toLocaleString('en-PK', {
      maximumFractionDigits: options.decimals !== undefined ? options.decimals : 0
    })}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        formatCurrency,
        isSettingsOpen,
        setIsSettingsOpen
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default SettingsContext;
