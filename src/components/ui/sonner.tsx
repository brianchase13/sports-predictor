'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: 'group-[.toaster]:border-emerald-500/50 group-[.toaster]:bg-emerald-50 dark:group-[.toaster]:bg-emerald-950/50',
          error: 'group-[.toaster]:border-rose-500/50 group-[.toaster]:bg-rose-50 dark:group-[.toaster]:bg-rose-950/50',
          warning: 'group-[.toaster]:border-amber-500/50 group-[.toaster]:bg-amber-50 dark:group-[.toaster]:bg-amber-950/50',
          info: 'group-[.toaster]:border-blue-500/50 group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-950/50',
        },
      }}
      richColors
      closeButton
      duration={5000}
    />
  );
}

// Re-export toast function for convenience
export { toast } from 'sonner';
