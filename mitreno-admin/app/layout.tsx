import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nvilar Seller Admin Console',
  description: 'Enterprise boutique review and onboarding management for Nvilar Marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
