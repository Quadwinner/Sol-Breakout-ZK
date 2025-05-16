'use client';

import WalletProvider from './WalletProvider';
import Header from '../Header';

export function WalletProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="py-6 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} cPOP Interface - Built with ZK Compression on Solana
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
} 