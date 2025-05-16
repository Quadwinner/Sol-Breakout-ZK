'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import Link from 'next/link';

export default function WalletTroubleshoot() {
  const wallet = useWallet();
  const [devnetSol, setDevnetSol] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Log wallet details for debugging
  useEffect(() => {
    console.log('Wallet details:', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toString(),
      adapter: wallet.wallet?.adapter?.name,
      ready: wallet.wallet?.adapter?.ready,
      connecting: wallet.connecting,
      disconnecting: wallet.disconnecting,
      hasSignTransaction: typeof wallet.signTransaction === 'function',
      hasSignAllTransactions: typeof wallet.signAllTransactions === 'function'
    });
  }, [wallet.connected, wallet.publicKey, wallet.wallet]);
  
  useEffect(() => {
    async function checkConnection() {
      if (!wallet.publicKey) return;
      
      try {
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const balance = await connection.getBalance(wallet.publicKey);
        setDevnetSol(balance / 1000000000); // Convert lamports to SOL
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Error checking connection:', error);
        setConnectionStatus('error');
        setConnectionError(error instanceof Error ? error.message : String(error));
      }
    }
    
    checkConnection();
  }, [wallet.publicKey]);
  
  if (!wallet.connected) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 mb-4">
        <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">Wallet Not Connected</h3>
        <p className="text-red-700 dark:text-red-400 text-sm mb-3">
          Your wallet is not connected. Please click the "Connect Wallet" button to continue.
        </p>
        <div className="bg-white dark:bg-gray-800 p-3 rounded border border-red-100 dark:border-red-900/30 text-xs">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Troubleshooting Tips:</p>
          <ul className="list-disc pl-4 text-gray-600 dark:text-gray-400 space-y-1">
            <li>Make sure you have a Solana wallet extension installed (like Phantom)</li>
            <li>Check that your wallet is unlocked</li>
            <li>Set your wallet network to <span className="font-medium">Devnet</span></li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4 mb-6">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center text-yellow-800 dark:text-yellow-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Having wallet connection issues?</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {isExpanded && (
        <div className="mt-4 text-sm text-yellow-800 dark:text-yellow-300">
          <h4 className="font-semibold mb-2">Troubleshooting Tips:</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>Make sure your wallet is set to <strong>Devnet</strong> network</li>
            <li>Try disconnecting and reconnecting your wallet</li>
            <li>If you encounter a "size" error:
              <ul className="list-circle pl-5 mt-1 space-y-1 text-xs">
                <li>This is a known issue with some wallet adapters</li>
                <li>Try using a different browser (Chrome tends to work best)</li>
                <li>Consider using a different wallet app (like Phantom or Solflare)</li>
              </ul>
            </li>
            <li>Clear your browser cache and reload the page</li>
            <li>Make sure your wallet has some SOL for transaction fees</li>
          </ul>
          
          <div className="mt-3">
            <Link 
              href="/wallet-test" 
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Run Wallet Diagnostic Tests
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">
            <p className="font-medium">About the "size" error:</p>
            <p className="mt-1">
              If you see "Cannot read properties of undefined (reading 'size')" errors, this is a compatibility issue 
              between your wallet and our application. The diagnostic page can help determine which alternative approach
              will work for you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 