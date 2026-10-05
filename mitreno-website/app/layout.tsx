import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MITRENO — AI-First Luxury Fashion Platform',
  description: 'Style Yourself Before You Buy. AI Virtual Try-On, Runway Discovery, Smart Fit Engine, and Curated Digital Wardrobe.',
  openGraph: {
    title: 'MITRENO — AI-First Luxury Fashion Platform',
    description: 'Style Yourself Before You Buy. AI Virtual Try-On, Runway Discovery, Smart Fit Engine, and Curated Digital Wardrobe.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MITRENO — AI-First Luxury Fashion Platform',
    description: 'Style Yourself Before You Buy. AI Virtual Try-On, Runway Discovery, Smart Fit Engine, and Curated Digital Wardrobe.',
  },
};

import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`scroll-smooth ${playfair.variable} ${plusJakarta.variable}`}>
      <body className="bg-[#FFFFFF] text-[#0F172A] antialiased selection:bg-[#1246B8] selection:text-white font-sans" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

