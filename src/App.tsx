import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/layout/Navbar';
import { CookieBanner } from './components/ui/CookieBanner';
import { AuthModal } from './views/AuthModal';
import { StockCountModal } from './components/inventory/StockCountModal';
import { LandingPage } from './views/LandingPage';
import { LoginPage } from './views/LoginPage';
import { DashboardView } from './views/DashboardView';
import { AiReportView } from './views/AiReportView';
import { ItemsView } from './views/ItemsView';
import { UploadView } from './views/UploadView';
import { WastageView } from './views/WastageView';
import { StockAgingReportView } from './views/StockAgingReportView';
import { DesignSystemView } from './views/DesignSystemView';

type AppTab = 'landing' | 'login' | 'dashboard' | 'plan' | 'items' | 'aging' | 'upload' | 'wastage' | 'design';

const MainApp: React.FC = () => {
  const { user } = useStore();
  // Flow requirement: first landing, second login, then application.
  // Persist logged-in session so once a user is registered/logged-in, it stays logged in across page reloads.
  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    const savedUser = localStorage.getItem('stocksense_user');
    if (savedUser) {
      const savedTab = localStorage.getItem('stocksense_active_tab') as AppTab | null;
      if (savedTab && savedTab !== 'landing' && savedTab !== 'login') {
        return savedTab;
      }
      return 'dashboard';
    }
    return 'landing';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isStockCountModalOpen, setIsStockCountModalOpen] = useState(false);

  // If user is logged in, save active tab to keep user on same view across reloads
  useEffect(() => {
    if (user) {
      if (currentTab !== 'landing' && currentTab !== 'login') {
        localStorage.setItem('stocksense_active_tab', currentTab);
      }
    } else {
      localStorage.removeItem('stocksense_active_tab');
      if (currentTab !== 'landing' && currentTab !== 'login' && currentTab !== 'design') {
        setCurrentTab('landing');
      }
    }
  }, [user, currentTab]);

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col selection:bg-primary-tint selection:text-primary-ink">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenAuth={() => setCurrentTab('login')}
        onOpenStockCount={() => setIsStockCountModalOpen(true)}
      />

      {/* Main Content View Container adhering to: Landing -> Login -> Application */}
      <main className="flex-1 pb-20 md:pb-12">
        {/* Step 1: Landing Page */}
        {currentTab === 'landing' && (
          <LandingPage
            onStartTrial={() => setCurrentTab(user ? 'dashboard' : 'login')}
            onLogin={() => setCurrentTab(user ? 'dashboard' : 'login')}
            onExploreDemo={() => setCurrentTab(user ? 'dashboard' : 'login')}
            onOpenDesign={() => setCurrentTab('design')}
          />
        )}

        {/* Step 2: Login / Register Page (with Store Location in Register) */}
        {currentTab === 'login' && (
          <LoginPage
            onBackToLanding={() => setCurrentTab('landing')}
            onSuccessLogin={() => setCurrentTab('dashboard')}
          />
        )}

        {/* Step 3: Application Views */}
        {currentTab === 'dashboard' && (
          <DashboardView
            onGoToPlan={() => setCurrentTab('plan')}
            onGoToUpload={() => setCurrentTab('upload')}
            onGoToItems={() => setCurrentTab('items')}
            onOpenStockCount={() => setIsStockCountModalOpen(true)}
          />
        )}

        {currentTab === 'plan' && <AiReportView />}

        {currentTab === 'items' && (
          <ItemsView onOpenStockCount={() => setIsStockCountModalOpen(true)} />
        )}

        {currentTab === 'aging' && <StockAgingReportView />}

        {currentTab === 'upload' && (
          <UploadView onGoToItems={() => setCurrentTab('items')} />
        )}

        {currentTab === 'wastage' && <WastageView />}

        {currentTab === 'design' && <DesignSystemView />}
      </main>

      {/* View Switcher Ribbon for Evaluators */}
      <aside
        aria-label="Demo Navigation Switcher"
        className="fixed top-20 right-4 z-30 hidden xl:flex flex-col gap-1 p-1.5 bg-surface/90 backdrop-blur-md border border-border rounded-xl shadow-sm text-xs"
      >
        <span className="text-[10px] font-semibold text-text-muted px-2 py-0.5 uppercase tracking-wider">
          Flow Switcher
        </span>
        <button
          type="button"
          onClick={() => setCurrentTab('landing')}
          className={`px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer ${
            currentTab === 'landing'
              ? 'bg-primary-tint text-primary-ink font-semibold'
              : 'hover:bg-surface-soft text-text'
          }`}
        >
          1. Landing Page
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('login')}
          className={`px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer ${
            currentTab === 'login'
              ? 'bg-primary-tint text-primary-ink font-semibold'
              : 'hover:bg-surface-soft text-text'
          }`}
        >
          2. Login Page
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('dashboard')}
          className={`px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-primary-tint text-primary-ink font-semibold'
              : 'hover:bg-surface-soft text-text'
          }`}
        >
          3. Application Dashboard
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('aging')}
          className={`px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer ${
            currentTab === 'aging'
              ? 'bg-primary-tint text-primary-ink font-semibold'
              : 'hover:bg-surface-soft text-text'
          }`}
        >
          Old vs New Stocks
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('items')}
          className={`px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer ${
            currentTab === 'items'
              ? 'bg-primary-tint text-primary-ink font-semibold'
              : 'hover:bg-surface-soft text-text'
          }`}
        >
          Items Master (+Add Item)
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('plan')}
          className={`px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer ${
            currentTab === 'plan'
              ? 'bg-primary-tint text-primary-ink font-semibold'
              : 'hover:bg-surface-soft text-text'
          }`}
        >
          Reorder Plan
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('design')}
          className={`px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer ${
            currentTab === 'design'
              ? 'bg-primary-tint text-primary-ink font-semibold'
              : 'hover:bg-surface-soft text-text'
          }`}
        >
          /design Catalog
        </button>
      </aside>

      {/* Modals & Bottom Overlays */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <StockCountModal
        isOpen={isStockCountModalOpen}
        onClose={() => setIsStockCountModalOpen(false)}
      />

      <CookieBanner />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <MainApp />
      </StoreProvider>
    </ToastProvider>
  );
}
