import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TRPCProvider from '@/lib/trpc/Provider';
import { AuthProvider } from '@/lib/auth/AuthContext';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ecommerce App',
  description: 'Modern Ecommerce Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider>
          <AuthProvider>
            <Header />
            <main className="container mx-auto py-8 px-4">
              {children}
            </main>
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}