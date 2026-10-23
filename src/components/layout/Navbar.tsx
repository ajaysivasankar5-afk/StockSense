import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Package,
  UploadCloud,
  Trash2,
  Moon,
  Sun,
  User,
  LogOut,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';

export interface NavbarProps {
  currentTab: 'dashboard' | 'plan' | 'items' | 'upload' | 'wastage' | 'design' | 'aging' | 'landing' | 'login';
  onSelectTab: (tab: 'dashboard' | 'plan' | 'items' | 'upload' | 'wastage' | 'design' | 'aging' | 'landing' | 'login') => void;
  onOpenAuth: () => void;
  onOpenStockCount: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  onOpenStockCount,
}) => {
  const { user, logout, isDarkMode, toggleDarkMode, criticalCount } = useStore();

  const handleBrandClick = () => {
    if (user) {
      onSelectTab('dashboard');
    } else {
      onSelectTab('landing');
    }
  };

  const handleLogout = () => {
    logout();
    onSelectTab('landing');
  };

  return (
    <>
      {/* Desktop & Tablet Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleBrandClick}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="font-heading font-bold text-xl tracking-tight text-text">
                Stock<span className="text-primary-ink">Sense</span>
              </span>
            </button>
          </div>

          {/* Zone 2: 4-5 Clean Nav Links */}
          {user ? (
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-text-muted">
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className={`hover:text-text transition-colors whitespace-nowrap cursor-pointer py-1 relative ${
                  currentTab === 'dashboard' ? 'text-primary-ink font-semibold' : ''
                }`}
              >
                Dashboard
                {currentTab === 'dashboard' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('plan')}
                className={`hover:text-text transition-colors whitespace-nowrap cursor-pointer py-1 relative flex items-center gap-1.5 ${
                  currentTab === 'plan' ? 'text-primary-ink font-semibold' : ''
                }`}
              >
                Reorder Plan
                {criticalCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                )}
                {currentTab === 'plan' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('items')}
                className={`hover:text-text transition-colors whitespace-nowrap cursor-pointer py-1 relative ${
                  currentTab === 'items' ? 'text-primary-ink font-semibold' : ''
                }`}
              >
                Items Master
                {currentTab === 'items' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('aging')}
                className={`hover:text-text transition-colors whitespace-nowrap cursor-pointer py-1 relative flex items-center gap-1.5 ${
                  currentTab === 'aging' ? 'text-primary-ink font-semibold' : ''
                }`}
              >
                Stock Aging & Reports
                {currentTab === 'aging' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('upload')}
                className={`hover:text-text transition-colors whitespace-nowrap cursor-pointer py-1 relative ${
                  currentTab === 'upload' ? 'text-primary-ink font-semibold' : ''
                }`}
              >
                Upload
                {currentTab === 'upload' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('wastage')}
                className={`hover:text-text transition-colors whitespace-nowrap cursor-pointer py-1 relative ${
                  currentTab === 'wastage' ? 'text-primary-ink font-semibold' : ''
                }`}
              >
                Wastage
                {currentTab === 'wastage' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
              <button
                type="button"
                onClick={() => onSelectTab('landing')}
                className={`hover:text-text transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'landing' ? 'text-primary-ink font-semibold' : ''
                }`}
              >
                Product Overview
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('design')}
                className={`hover:text-text transition-colors whitespace-nowrap cursor-pointer ${
                  currentTab === 'design' ? 'text-primary-ink font-semibold' : ''
                }`}
              >
                Design System (/design)
              </button>
            </nav>
          )}

          {/* Zone 3: 1 Primary Action + Utility Icons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Design preview badge link */}
            <button
              type="button"
              onClick={() => onSelectTab('design')}
              className={`text-xs px-2.5 py-1 rounded-md border border-border hover:bg-surface-soft transition-colors text-text-muted hover:text-text hidden xl:inline-flex items-center gap-1 cursor-pointer ${
                currentTab === 'design' ? 'bg-surface-soft text-text font-semibold' : ''
              }`}
              title="Design system component spec"
            >
              <Layers size={13} />
              <span>/design</span>
            </button>

            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-soft transition-colors cursor-pointer"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* User Profile Pill showing exact registered email & name */}
                <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-soft border border-border text-xs">
                  <div className="w-6 h-6 rounded-full bg-primary-tint text-primary-ink flex items-center justify-center font-bold text-[11px] shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight max-w-[140px] truncate">
                    <span className="font-semibold block text-text text-[11px] truncate">{user.name}</span>
                    <span className="text-[10px] text-text-muted truncate block">{user.email}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={onOpenStockCount}
                  className="hidden sm:inline-flex"
                >
                  Quick Stock Count
                </Button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger-tint transition-colors cursor-pointer"
                  title="Logout to Landing"
                >
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onSelectTab('login')}
              >
                Store Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar for Logged-In User */}
      {user && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 py-1.5 safe-area-bottom"
          aria-label="Mobile Navigation"
        >
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center p-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
              currentTab === 'dashboard' ? 'text-primary-ink font-semibold' : 'text-text-muted'
            }`}
          >
            <LayoutDashboard size={20} strokeWidth={currentTab === 'dashboard' ? 2 : 1.5} />
            <span className="mt-0.5">Overview</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('plan')}
            className={`flex flex-col items-center justify-center p-1.5 text-[11px] font-medium transition-colors cursor-pointer relative ${
              currentTab === 'plan' ? 'text-primary-ink font-semibold' : 'text-text-muted'
            }`}
          >
            <FileSpreadsheet size={20} strokeWidth={currentTab === 'plan' ? 2 : 1.5} />
            <span className="mt-0.5">Reorder</span>
            {criticalCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-accent" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('items')}
            className={`flex flex-col items-center justify-center p-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
              currentTab === 'items' ? 'text-primary-ink font-semibold' : 'text-text-muted'
            }`}
          >
            <Package size={20} strokeWidth={currentTab === 'items' ? 2 : 1.5} />
            <span className="mt-0.5">Items</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('aging')}
            className={`flex flex-col items-center justify-center p-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
              currentTab === 'aging' ? 'text-primary-ink font-semibold' : 'text-text-muted'
            }`}
          >
            <Clock size={20} strokeWidth={currentTab === 'aging' ? 2 : 1.5} />
            <span className="mt-0.5">Aging</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('upload')}
            className={`flex flex-col items-center justify-center p-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
              currentTab === 'upload' ? 'text-primary-ink font-semibold' : 'text-text-muted'
            }`}
          >
            <UploadCloud size={20} strokeWidth={currentTab === 'upload' ? 2 : 1.5} />
            <span className="mt-0.5">Upload</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('wastage')}
            className={`flex flex-col items-center justify-center p-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
              currentTab === 'wastage' ? 'text-primary-ink font-semibold' : 'text-text-muted'
            }`}
          >
            <Trash2 size={20} strokeWidth={currentTab === 'wastage' ? 2 : 1.5} />
            <span className="mt-0.5">Wastage</span>
          </button>
        </nav>
      )}
    </>
  );
};
