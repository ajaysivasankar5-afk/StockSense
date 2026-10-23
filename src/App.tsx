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
