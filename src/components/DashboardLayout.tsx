'use client';

import { ReactNode, createContext, useContext, useState } from 'react';
import { Sport } from '@/lib/types';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { BottomNav } from './BottomNav';

interface DashboardContextType {
  selectedSport: Sport | null;
  setSelectedSport: (sport: Sport | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardLayout');
  }
  return context;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

  return (
    <DashboardContext.Provider value={{ selectedSport, setSelectedSport }}>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar - fixed, always visible */}
        <div className="hidden md:flex md:flex-shrink-0">
          <Sidebar
            selectedSport={selectedSport}
            onSportSelect={setSelectedSport}
            className="fixed top-0 left-0 h-screen"
          />
        </div>

        {/* Mobile Navigation */}
        <MobileNav
          selectedSport={selectedSport}
          onSportSelect={setSelectedSport}
        />

        {/* Main Content Area */}
        <main className="flex-1 md:ml-[220px] min-h-screen">
          {/* Mobile spacer for fixed header */}
          <div className="h-14 md:hidden" />

          {/* Content with padding - extra bottom padding for mobile bottom nav */}
          <div className="p-4 md:p-6 lg:p-8 pb-20 md:pb-6 lg:pb-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav className="md:hidden" />
      </div>
    </DashboardContext.Provider>
  );
}
