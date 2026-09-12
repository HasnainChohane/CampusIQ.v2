import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import LoginPage from './pages/LoginPage';
import AppLayout from './layouts/AppLayout';
import HealthDashboard from './components/HealthDashboard';
import DashboardPage from './pages/DashboardPage';
import AcademicPage from './pages/AcademicPage';
import InventoryPage from './pages/InventoryPage';
import RequestsPage from './pages/RequestsPage';
import FinancePage from './pages/FinancePage';
import ReportsPage from './pages/ReportsPage';
import AiAssistantPage from './pages/AiAssistantPage';
import SettingsModal from './components/SettingsModal';

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="pulse-dot" style={{ width: '16px', height: '16px', color: 'var(--primary)' }}></div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading CampusIQ Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentView} />;
      case 'academic':
        return <AcademicPage onNavigate={setCurrentView} />;
      case 'inventory':
        return <InventoryPage onNavigate={setCurrentView} />;
      case 'requests':
        return <RequestsPage onNavigate={setCurrentView} />;
      case 'finance':
        return <FinancePage onNavigate={setCurrentView} />;
      case 'reports':
        return <ReportsPage onNavigate={setCurrentView} />;
      case 'ai-assistant':
        return <AiAssistantPage onNavigate={setCurrentView} />;
      case 'health':
        return <HealthDashboard onNavigate={setCurrentView} />;
      default:
        return <DashboardPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <>
      <AppLayout currentView={currentView} onNavigate={setCurrentView}>
        {renderCurrentView()}
      </AppLayout>
      <SettingsModal />
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </SettingsProvider>
  );
}

