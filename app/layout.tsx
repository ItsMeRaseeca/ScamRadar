import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '700', '900'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'SCAMRADAR // AI FRAUD DETECTION',
  description: 'Refined AI-powered analysis for job seekers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-black antialiased selection:bg-primary selection:text-white`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#000000',
              border: '2px solid #000000',
              borderRadius: '0px',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow: '2px 2px 0px 0px #000000',
            },
            success: {
              iconTheme: {
                primary: '#002395',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
