import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ScamRadar - AI-Powered Fake Job Detection',
  description:
    'Protect yourself from job scams with AI-powered ML and Gemini deep analysis. Detect fake job postings instantly.',
  keywords: ['job scam', 'fake job', 'scam detection', 'AI', 'ML', 'Gemini'],
  authors: [{ name: 'ScamRadar Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#3b82f6',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ScamRadar',
  },
  openGraph: {
    title: 'ScamRadar - AI-Powered Fake Job Detection',
    description:
      'Protect yourself from job scams with AI-powered ML and Gemini deep analysis.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-512x512.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}





