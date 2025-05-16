import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WalletProviderWrapper } from './components/wallet/WalletProviderWrapper';
import { ThemeProvider } from './components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'cPOP Interface - Compressed Proof of Participation',
  description: 'A platform for creating and distributing compressed proof of participation tokens on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <WalletProviderWrapper>
            {children}
          </WalletProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
} 