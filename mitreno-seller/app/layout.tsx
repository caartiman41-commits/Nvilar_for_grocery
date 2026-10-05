import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Sell on Mitreno | Boutique Partner Hub & Seller Studio',
  description: 'Join Mitreno as a verified boutique seller. 0% commission introductory tier, 30-minute hyperlocal express reach, 24-hour fast UPI payouts, and direct buyer bargaining.',
  keywords: ['sell on mitreno', 'mitreno seller portal', 'boutique marketplace india', 'become a seller', 'fashion boutique onboarding', 'hyperlocal fashion'],
  openGraph: {
    title: 'Sell on Mitreno | Premier Boutique Seller Portal',
    description: 'Grow your designer boutique with Mitreno. Zero onboarding fees, fast payouts, and direct customers.',
    url: 'https://seller.mitreno.com',
    siteName: 'Mitreno Seller Studio',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
