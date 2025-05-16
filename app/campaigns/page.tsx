'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CampaignCard from '@/app/components/campaigns/CampaignCard';
import { fetchCampaigns, Campaign } from '@/app/lib/solana';
import { getLocalCampaigns } from '@/app/lib/direct-campaign';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCampaigns() {
      setIsLoading(true);
      try {
        // Fetch campaigns from blockchain
        let blockchainCampaigns: Campaign[] = [];
        try {
          blockchainCampaigns = await fetchCampaigns();
        } catch (err) {
          console.error('Failed to fetch blockchain campaigns:', err);
        }
        
        // Get campaigns from local storage (our fallback solution)
        const localCampaigns = getLocalCampaigns();
        console.log('Local campaigns:', localCampaigns.length);
        
        // Combine both sources, removing duplicates by ID
        const allCampaigns = [...blockchainCampaigns];
        
        // Add local campaigns only if they don't exist in blockchain campaigns
        localCampaigns.forEach(localCampaign => {
          if (!allCampaigns.some(c => c.id === localCampaign.id)) {
            allCampaigns.push(localCampaign);
          }
        });
        
        setCampaigns(allCampaigns);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.status === filter;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Campaigns</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Explore and participate in compressed token campaigns.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          {(['all', 'active', 'completed', 'upcoming'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <Link
          href="/campaigns/create"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Create Campaign
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-96 animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Error Loading Campaigns</h2>
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
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No campaigns found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === 'all'
              ? 'There are no campaigns available at the moment.'
              : `There are no ${filter} campaigns available.`}
          </p>
          <Link
            href="/campaigns/create"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium inline-block"
          >
            Create Your Own Campaign
          </Link>
        </div>
      )}
    </div>
  );
} 