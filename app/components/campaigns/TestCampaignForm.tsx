'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createCampaign } from '@/app/lib/solana-fixed';
import { Connection, PublicKey } from '@solana/web3.js';

export default function TestCampaignForm() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<string | null>(null);
  const [walletReady, setWalletReady] = useState(false);
  
  // Check if wallet is properly initialized
  useEffect(() => {
    if (connected && publicKey && wallet.signTransaction) {
      setWalletReady(true);
    } else {
      setWalletReady(false);
    }
  }, [connected, publicKey, wallet]);
  
  // Force reconnect wallet
  const forceReconnectWallet = async () => {
    setError(null);
    
    try {
      // First disconnect
      if (wallet.disconnect) {
        console.log("Disconnecting wallet...");
        await wallet.disconnect();
      }
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Then reconnect
      if (wallet.connect) {
        console.log("Reconnecting wallet...");
        await wallet.connect();
        
        // Wait for connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (wallet.connected && wallet.publicKey) {
          console.log("Wallet reconnected successfully:", wallet.publicKey.toString());
          setWalletReady(true);
        } else {
          setError("Failed to reconnect wallet. Please try manually reconnecting.");
        }
      }
    } catch (err: any) {
      console.error("Error reconnecting wallet:", err);
      setError(`Failed to reconnect wallet: ${err.message}`);
    }
  };
  
  const handleCreateTestCampaign = async () => {
    if (!walletReady) {
      setError('Please connect your wallet to create a campaign');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessTx(null);
    
    try {
      // Add a longer delay to ensure wallet is fully initialized
      console.log("Waiting for wallet to fully initialize...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Creating test campaign with wallet:", {
        connected: wallet.connected,
        publicKey: wallet.publicKey?.toString(),
        adapter: wallet.wallet?.adapter?.name,
        ready: wallet.wallet?.adapter?.ready,
        hasSignTransaction: typeof wallet.signTransaction === 'function',
      });
      
      // Force reconnect wallet if needed
      if (!wallet.signTransaction || typeof wallet.signTransaction !== 'function') {
        setError('Wallet not properly initialized. Please disconnect and reconnect your wallet.');
        setIsSubmitting(false);
        return;
      }
      
      // Add explicit wallet state checks
      if (!wallet.publicKey) {
        setError('Wallet public key is missing. Please reconnect your wallet.');
        setIsSubmitting(false);
        return;
      }
      
      // Add tryCatch around campaign creation
      console.log("Initializing campaign creation...");
      try {
        // Create a simple test campaign with explicit parameters
        const txSignature = await createCampaign({
          title: 'Test Campaign',
          description: 'This is a test campaign created to verify the fixed implementation',
          imageUrl: 'https://example.com/image.jpg',
          tokenSymbol: 'TEST',
          totalTokens: 1000,
          endDate: new Date(Date.now() + 86400000), // 1 day from now
          benefits: ['Test Benefit 1', 'Test Benefit 2'],
          status: 'active'
        }, wallet);
        
        setSuccessTx(txSignature);
        console.log('Campaign created successfully with tx:', txSignature);
      } catch (innerErr: any) {
        console.error('Campaign creation inner error:', innerErr);
        throw innerErr; // Re-throw to be handled by outer catch
      }
    } catch (err: any) {
      console.error('Failed to create campaign:', err);
      
      // Enhanced error handling
      let errorMessage = err.message || 'Failed to create campaign. Please try again later.';
      
      // Check for specific error types
      if (errorMessage.includes('size')) {
        errorMessage = 'Wallet transaction signing error. Please use the "Force Reconnect Wallet" button below, then try again.';
      } else if (errorMessage.includes('Wallet not connected')) {
        errorMessage = 'Your wallet disconnected. Please reconnect and try again.';
      } else if (errorMessage.includes('Invalid account discriminator')) {
        errorMessage = 'Wallet transaction failed due to program account mismatch. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Test Campaign Creation</h2>
      
      {!connected && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg mb-6">
          <div className="flex items-center text-yellow-800 dark:text-yellow-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Please connect your wallet to create a campaign
          </div>
        </div>
      )}
      
      {connected && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg mb-6">
          <div className="flex items-center text-green-800 dark:text-green-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Wallet connected: {publicKey?.toString().slice(0, 6)}...{publicKey?.toString().slice(-4)}
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-7">
            Note: Make sure your wallet is set to Devnet network
          </p>
        </div>
      )}
      
      {/* Wallet Debug Info */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Wallet Debug Info</h3>
        <pre className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
          {JSON.stringify({
            connected: wallet.connected,
            publicKey: wallet.publicKey?.toString(),
            adapter: wallet.wallet?.adapter?.name,
            ready: wallet.wallet?.adapter?.ready,
            walletReady: walletReady,
            hasSignTransaction: typeof wallet.signTransaction === 'function',
            hasSignAllTransactions: typeof wallet.signAllTransactions === 'function'
          }, null, 2)}
        </pre>
      </div>
      
      {/* Force Reconnect Wallet Button - always show when connected */}
      {connected && (
        <div className="mb-6">
          <button
            onClick={forceReconnectWallet}
            className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium"
          >
            Force Reconnect Wallet
          </button>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
            Use this if you encounter "size" errors or wallet connection issues
          </p>
        </div>
      )}
      
      {/* Error and Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg mb-6">
          <div className="flex items-center text-red-800 dark:text-red-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      {successTx && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg mb-6">
          <div className="flex items-center text-green-800 dark:text-green-300 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Campaign created successfully!
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID:</p>
            <p className="font-mono text-purple-600 dark:text-purple-400 text-sm break-all">{successTx}</p>
          </div>
          <div className="mt-2">
            <a 
              href={`https://explorer.solana.com/tx/${successTx}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              View on Solana Explorer
            </a>
          </div>
        </div>
      )}
      
      {/* Test Button */}
      <button
        onClick={handleCreateTestCampaign}
        disabled={isSubmitting || !walletReady}
        className={`w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-lg font-medium transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          (isSubmitting || !walletReady) ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Test Campaign...
          </div>
        ) : !connected ? (
          'Connect Wallet to Test'
        ) : !walletReady ? (
          'Waiting for Wallet...'
        ) : (
          'Create Test Campaign'
        )}
      </button>
    </div>
  );
} 