import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sports Predictor - AI-Powered Game Predictions',
  description:
    'Get AI-powered predictions for NFL, NBA, MLB, NHL, and Soccer games with confidence scores and detailed analysis.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DashboardLayout>
          {children}

          {/* Footer */}
          <footer className="border-t py-6 mt-8">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Predictions are for entertainment purposes only. Sports Predictor uses
                AI and statistical models but cannot guarantee accuracy.
              </p>
            </div>
          </footer>
        </DashboardLayout>
        <Toaster />
      </body>
    </html>
  );
}
