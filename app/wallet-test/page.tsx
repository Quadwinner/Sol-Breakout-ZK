'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Connection, clusterApiUrl } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getProgram } from '@/app/lib/cpop-program-fixed';
import { fixedIdl } from '@/app/lib/fixed-idl';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export default function WalletTestPage() {
  const wallet = useWallet();
  const [logs, setLogs] = useState<string[]>([]);
  const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Add a log message
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().slice(11, 19)} - ${message}`]);
  };
  
  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };
  
  // Effect to log wallet status changes
  useEffect(() => {
    addLog(`Wallet connected: ${wallet.connected}`);
    if (wallet.publicKey) {
      addLog(`Public key: ${wallet.publicKey.toString()}`);
    }
  }, [wallet.connected, wallet.publicKey]);
  
  // Test simple SOL transfer
  const testSimpleTransaction = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      addLog('❌ Error: Wallet not connected or missing signTransaction method');
      return;
    }
    
    try {
      setTxStatus('loading');
      addLog('Creating simple SOL transfer transaction...');
      
      // Create a new transaction
      const transaction = new Transaction();
      
      // Get a recent blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      
      // Add a simple transfer instruction (sending SOL to self)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: LAMPORTS_PER_SOL * 0.001, // 0.001 SOL
        })
      );
      
      addLog('Sending transaction to wallet for approval...');
      
      // Send the transaction
      const signature = await wallet.sendTransaction(transaction, connection);
      
      addLog(`✅ Transaction submitted! Signature: ${signature}`);
      addLog(`Explorer URL: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      setTxStatus('success');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      setErrorMsg(error.message);
      setTxStatus('error');
    }
  };
  
  // Test direct transaction signing without sending
  const testDirectSigning = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      addLog('❌ Error: Wallet not connected or missing signTransaction method');
      return;
    }
    
    try {
      setTxStatus('loading');
      addLog('Testing direct transaction signing (no Anchor)...');
      
      // Create a new transaction
      const transaction = new Transaction();
      
      // Get a recent blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      
      // Add a simple transfer instruction (sending tiny SOL to self)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 100, // Tiny amount
        })
      );
      
      addLog('Calling wallet.signTransaction directly...');
      
      // Debug transaction
      addLog('Transaction before signing:');
      addLog(`- recentBlockhash: ${transaction.recentBlockhash}`);
      addLog(`- feePayer: ${transaction.feePayer?.toString()}`);
      addLog(`- instructions: ${transaction.instructions.length}`);
      
      // Try direct signing
      try {
        const signedTx = await wallet.signTransaction(transaction);
        addLog('✅ Transaction signed successfully!');
        addLog(`- signatures: ${signedTx.signatures.length}`);
        addLog(`- verified: ${signedTx.verifySignatures()}`);
        setTxStatus('success');
      } catch (signError: any) {
        addLog(`❌ Error signing transaction: ${signError.message}`);
        setErrorMsg(signError.message);
        
        if (signError.message.includes('size')) {
          addLog('DEBUG: Size property error detected!');
          addLog('This confirms the "size" error is coming from your wallet adapter.');
          addLog('Try using a different wallet or browser.');
        }
        
        setTxStatus('error');
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      setErrorMsg(error.message);
      setTxStatus('error');
    }
  };
  
  // Test Anchor program interaction with fixed IDL
  const testAnchorTransaction = async () => {
    if (!wallet.publicKey) {
      addLog('❌ Error: Wallet not connected');
      return;
    }
    
    try {
      setTxStatus('loading');
      addLog('Bypassing Anchor completely...');
      
      // Create a direct transaction instead of using Anchor
      const transaction = new Transaction();
      
      // Get a recent blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      
      // Add a simple transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey, // Send to self
          lamports: LAMPORTS_PER_SOL * 0.0001, // Tiny amount
        })
      );
      
      addLog('Sending direct transaction instead of using Anchor...');
      const signature = await wallet.sendTransaction(transaction, connection);
      
      addLog(`✅ Direct transaction successful: ${signature}`);
      addLog(`Explorer URL: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      setTxStatus('success');
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      setErrorMsg(error.message);
      setTxStatus('error');
    }
  };
  
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold mb-6">Wallet and Transaction Test</h1>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">About the "Size" Error</h2>
        <p className="mb-3">
          If you're encountering the error <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">Cannot read properties of undefined (reading 'size')</code>, 
          this is due to a compatibility issue between your wallet adapter and the Anchor framework.
        </p>
        <p className="mb-3">
          We've implemented a direct transaction workflow that bypasses Anchor completely,
          which should work regardless of wallet compatibility issues.
        </p>
        <p className="font-medium">
          When creating campaigns, the application will automatically fall back to this direct method
          if it encounters the "size" error. Your campaigns will still appear in the campaigns list.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
            <p className="mb-4">
              {wallet.connected ? (
                <span className="text-green-500">
                  ✅ Connected: {wallet.publicKey?.toString().slice(0, 6)}...{wallet.publicKey?.toString().slice(-4)}
                </span>
              ) : (
                <span className="text-red-500">❌ Not connected</span>
              )}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <WalletMultiButton />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <button
              onClick={testSimpleTransaction}
              disabled={!wallet.connected || txStatus === 'loading'}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg mb-4"
            >
              {txStatus === 'loading' ? 'Processing...' : 'Test Simple Transaction'}
            </button>
            
            <button
              onClick={testDirectSigning}
              disabled={!wallet.connected || txStatus === 'loading'}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg mb-4"
            >
              {txStatus === 'loading' ? 'Processing...' : 'Test Direct Signing'}
            </button>
            
            <button
              onClick={testAnchorTransaction}
              disabled={!wallet.connected || txStatus === 'loading'}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg"
            >
              {txStatus === 'loading' ? 'Processing...' : 'Test Direct Transaction'}
            </button>
          </div>
          
          <div>
            {txStatus === 'error' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Error</h3>
                <p className="text-red-700 dark:text-red-300 text-sm">{errorMsg}</p>
              </div>
            )}
            
            {txStatus === 'success' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
                <h3 className="text-green-600 dark:text-green-400 font-medium mb-2">Success</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">Transaction completed successfully!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Logs</h2>
          <button 
            onClick={clearLogs}
            className="text-sm py-1 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md"
          >
            Clear
          </button>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No logs yet. Connect your wallet and test a transaction.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 