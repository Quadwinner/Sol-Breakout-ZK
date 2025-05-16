'use client';

import CreateCampaignForm from '@/app/components/campaigns/CreateCampaignForm';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButton from '@/app/components/wallet/WalletButton';

export default function CreateCampaignPage() {
  const { publicKey, connected } = useWallet();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Campaign</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create a new campaign with compressed tokens for your participants.
        </p>
      </div>
      
      {!connected ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your Solana wallet to create a new campaign.
          </p>
          <div className="inline-block">
            <WalletButton />
          </div>
        </div>
      ) : (
        <CreateCampaignForm />
      )}
      
      <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-3">About ZK Compression</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          ZK Compression on Solana allows you to create and distribute tokens at a fraction of the cost of traditional tokens.
          Using advanced zero-knowledge proofs, your compressed tokens maintain the same security while being up to 1000x more cost-effective.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          This makes it economically viable to distribute tokens to thousands or even millions of participants,
          perfect for large-scale events, loyalty programs, and community rewards.
        </p>
      </div>
    </div>
  );
} 