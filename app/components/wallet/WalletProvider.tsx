'use client';

import { useMemo, useCallback } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { Connection } from '@solana/web3.js';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => {
    // Use a more reliable RPC endpoint for Devnet
    return "https://api.devnet.solana.com";
  }, []);

  // Create a custom connection with specific commitment level
  const connection = useMemo(() => {
    console.log("Creating Solana connection to:", endpoint);
    return new Connection(endpoint, 'confirmed');
  }, [endpoint]);

  // Create wallet adapters with explicit configuration
  const wallets = useMemo(() => {
    console.log("Initializing wallet adapters for network:", network);
    return [
      // Configure wallets with explicit network and options to avoid initialization issues
      new PhantomWalletAdapter({ 
        network,
        // Add explicit config to avoid size errors
        config: {
          commitment: 'confirmed',
        }
      }),
      new SolflareWalletAdapter({ 
        network,
        // Add explicit config to avoid size errors
        config: {
          commitment: 'confirmed',
        }
      }),
      new TorusWalletAdapter({ params: { network } })
    ];
  }, [network]);

  // Handle wallet errors
  const onError = useCallback((error: Error) => {
    console.error('Wallet adapter error:', error);
    
    // Handle specific wallet adapter errors
    if (error.message.includes('size')) {
      console.error('Size error detected in wallet adapter. This is likely due to a transaction serialization issue.');
      // You could add toast notifications here
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <SolanaWalletProvider 
        wallets={wallets} 
        autoConnect={true}
        onError={onError}
        // Add additional connection options for better stability
        localStorageKey="walletAdapter"
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
} 