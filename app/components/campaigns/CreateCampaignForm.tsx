'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { createCampaignDirect } from '@/app/lib/direct-campaign';
import Link from 'next/link';
import { Transaction, Connection, clusterApiUrl } from '@solana/web3.js';
import { SystemProgram, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import WalletTroubleshoot from '../wallet/WalletTroubleshoot';

// Create a connection to the Solana devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export default function CreateCampaignForm() {
  const router = useRouter();
  const wallet = useWallet();
  const { publicKey, sendTransaction, connected, connecting } = wallet;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    tokenSymbol: '',
    totalTokens: 1000,
    endDate: '',
    benefits: ['', '', ''] // Start with 3 empty benefit fields
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({
      ...prev,
      benefits: newBenefits
    }));
  };

  const addBenefitField = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeBenefitField = (index: number) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      benefits: newBenefits
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !connected) {
      setError('Please connect your wallet to create a campaign');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessTx(null);
    
    try {
      // Filter out empty benefit fields
      const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');
      
      // Validate the form
      if (!formData.title.trim()) {
        throw new Error('Campaign title is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Campaign description is required');
      }
      
      if (!formData.tokenSymbol.trim()) {
        throw new Error('Token symbol is required');
      }
      
      if (!formData.endDate) {
        throw new Error('End date is required');
      }
      
      // Generate a new keypair for the campaign token mint
      const mintKeypair = Keypair.generate();
      
      // Create a direct Solana transaction
      const transaction = new Transaction();
      
      // Get a recent blockhash
      const { blockhash } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Add a simple transfer instruction
      // In a real implementation, this would be a token mint creation
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: mintKeypair.publicKey,
          lamports: LAMPORTS_PER_SOL * 0.001, // 0.001 SOL
        })
      );
      
      console.log('Sending transaction to wallet for approval...');
      
      try {
        // Send the transaction to the connected wallet for signing and submission
        // Pass the explicit connection to avoid undefined rpcEndpoint error
        const txSignature = await sendTransaction(transaction, connection);
        console.log('Transaction sent! Signature:', txSignature);
        
        // Now create the campaign with the transaction signature
        await createCampaignDirect({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          tokenSymbol: formData.tokenSymbol,
          totalTokens: Number(formData.totalTokens),
          endDate: new Date(formData.endDate),
          benefits: filteredBenefits,
          status: 'active'
        }, wallet);
        
        setSuccessTx(txSignature);
        
        // Start countdown for redirect
        let count = 5;
        setRedirectCountdown(count);
        const countdownInterval = setInterval(() => {
          count--;
          setRedirectCountdown(count);
          if (count <= 0) {
            clearInterval(countdownInterval);
            router.push('/campaigns');
          }
        }, 1000);
      } catch (err: any) {
        if (err.message && err.message.includes('User rejected')) {
          throw new Error('Transaction was rejected by the wallet. Please try again.');
        } else if (err.message && err.message.includes('rpcEndpoint')) {
          throw new Error('Wallet connection error. Make sure your wallet is connected to Solana Devnet.');
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error('Failed to create campaign:', err);
      setError(err.message || 'Failed to create campaign. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      {successTx ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Campaign Created Successfully!</h2>
          
          <div className="max-w-md mx-auto mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your campaign has been created and saved to the blockchain. You can now start distributing tokens to participants.
            </p>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID:</p>
              <p className="font-mono text-purple-600 dark:text-purple-400 text-sm break-all">{successTx}</p>
            </div>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">View on Solana Explorer:</p>
              <a 
                href={`https://explorer.solana.com/tx/${successTx}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-purple-600 dark:text-purple-400 hover:underline break-all"
              >
                Solana Explorer Link
              </a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/campaigns" 
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-center"
            >
              View All Campaigns
            </Link>
            <Link 
              href="/rewards" 
              className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md transition-all duration-200 text-center"
            >
              View My Rewards
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            Redirecting to campaigns in {redirectCountdown} seconds...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
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
            
            {/* Add the wallet troubleshooting component */}
            <WalletTroubleshoot />
            
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. DevConnect 2023 Attendance"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your campaign and what the tokens will be used for..."
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Use a direct link to an image (JPG, PNG). For best results, use 16:9 ratio.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Token Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Token Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Token Symbol *
                  </label>
                  <input
                    type="text"
                    id="tokenSymbol"
                    name="tokenSymbol"
                    value={formData.tokenSymbol}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. DEVCON23"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Maximum 10 characters, no spaces
                  </p>
                </div>
                
                <div>
                  <label htmlFor="totalTokens" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Supply *
                  </label>
                  <input
                    type="number"
                    id="totalTokens"
                    name="totalTokens"
                    value={formData.totalTokens}
                    onChange={handleChange}
                    required
                    min={1}
                    max={1000000000}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            {/* Benefits */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Token Benefits</h3>
                <button
                  type="button"
                  onClick={addBenefitField}
                  className="px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  + Add Benefit
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleBenefitChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder={`Benefit ${index + 1}`}
                    />
                    {formData.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBenefitField(index)}
                        className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
                <div className="flex items-center text-red-800 dark:text-red-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            {/* ZK Compression Info */}
            <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-xl border border-purple-100 dark:border-purple-800/20">
              <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-3">About ZK Compression</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Your campaign will use ZK Compression on Solana to create tokens at a fraction of the cost of traditional methods, 
                saving up to <span className="font-bold">1000x</span> on fees while maintaining the same security guarantees.
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Note: You'll need a small amount of SOL (~0.001) to create the campaign.
              </p>
            </div>
            
            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !connected}
                className={`w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-lg font-medium transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  (isSubmitting || !connected) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Campaign...
                  </div>
                ) : !connected ? (
                  'Connect Wallet to Create'
                ) : (
                  'Create Campaign'
                )}
              </button>
              <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                This will connect to your Solana wallet to sign the transaction
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
} 