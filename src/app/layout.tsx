import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import ClientInitializer from './ClientInitializer';

export const metadata: Metadata = {
  title: 'SIPLOK — Kantor Pertanahan Kabupaten Banyumas',
  description:
    'Sistem Informasi Pelacakan Lokasi Dokumen Fisik Pertanahan — Kementerian Agraria dan Tata Ruang / Badan Pertanahan Nasional (ATR/BPN) Kabupaten Banyumas',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased bg-bg-page text-text-main min-h-screen">
        <ClientInitializer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#002147',
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'var(--font-plus-jakarta), sans-serif',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 33, 71, 0.25)',
            },
            success: {
              iconTheme: {
                primary: '#FFD700',
                secondary: '#002147',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
