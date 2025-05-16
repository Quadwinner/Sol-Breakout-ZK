'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/app/lib/utils';
import WalletButton from '@/app/components/wallet/WalletButton';
import { fetchUserRewards, Reward } from '@/app/lib/solana';

export default function RewardsPage() {
  const { publicKey, connected } = useWallet();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRewards() {
      if (!connected || !publicKey) return;
      
      setIsLoading(true);
      try {
        const data = await fetchUserRewards(publicKey.toString());
        setRewards(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch rewards:', err);
        setError('Failed to load rewards. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    if (connected && publicKey) {
      loadRewards();
    } else {
      setIsLoading(false);
    }
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Rewards</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Connect Your Wallet</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your Solana wallet to view your rewards.
          </p>
          <div className="inline-block">
            <WalletButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Rewards</h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and manage your compressed proof of participation tokens.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Error Loading Rewards</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium inline-block"
          >
            Try Again
          </button>
        </div>
      ) : rewards.length > 0 ? (
        <div className="space-y-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-5 flex items-center">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                  {reward.imageUrl ? (
                    <Image
                      src={reward.imageUrl}
                      alt={reward.campaignTitle}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-500"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <Link 
                    href={`/campaigns/${reward.campaignId}`} 
                    className="text-lg font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {reward.campaignTitle}
                  </Link>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>Received {formatDate(reward.receivedAt)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full">
                    <span className="text-purple-800 dark:text-purple-200 font-medium">{reward.amount} {reward.tokenSymbol}</span>
                  </div>
                  <button 
                    className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                    onClick={() => {
                      // In a real app, this would open a modal or redirect to redeem page
                      alert(`Redeem functionality for ${reward.tokenSymbol} would open here`);
                    }}
                  >
                    Use Reward
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Rewards Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You haven't received any compressed tokens yet. Participate in campaigns to earn rewards.
          </p>
          <Link
            href="/campaigns"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium inline-block"
          >
            Explore Campaigns
          </Link>
        </div>
      )}
      
      <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-3">About Your Rewards</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Your proof of participation tokens are compressed using ZK technology, making them up to 1000x more cost-effective
          while maintaining the same security and usability of traditional tokens. These tokens can be used to verify your
          participation in events, receive exclusive benefits, or be traded on supported platforms.
        </p>
      </div>
    </div>
  );
} 