'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sport } from '@/lib/types';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  onSportSelect?: (sport: Sport | null) => void;
  selectedSport?: Sport | null;
}

export function MobileNav({ onSportSelect, selectedSport }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSportSelect = (sport: Sport | null) => {
    onSportSelect?.(sport);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 px-4 flex items-center justify-between bg-background/95 backdrop-blur-sm border-b">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm">Sports Predictor</span>
        </div>

        {/* Spacer for alignment */}
        <div className="w-9" />
      </header>

      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Overlay */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[280px] transform transition-transform duration-300 ease-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors z-10"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        <Sidebar
          onSportSelect={handleSportSelect}
          selectedSport={selectedSport}
          className="w-full"
        />
      </div>
    </>
  );
}
