'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchCampaignById, Campaign } from '@/app/lib/solana';
import { getLocalCampaigns } from '@/app/lib/direct-campaign';
import DistributeTokensForm from '@/app/components/campaigns/DistributeTokensForm';
import CampaignStatusBadge from '@/app/components/campaigns/CampaignStatusBadge';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatDistanceToNow } from 'date-fns';

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const wallet = useWallet();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadCampaign() {
      setIsLoading(true);
      try {
        // Try to fetch from blockchain first
        let fetchedCampaign = null;
        try {
          fetchedCampaign = await fetchCampaignById(params.id);
        } catch (err) {
          console.error('Failed to fetch campaign from blockchain:', err);
        }
        
        // If not found on blockchain, check local storage
        if (!fetchedCampaign) {
          console.log('Campaign not found on blockchain, checking local storage...');
          const localCampaigns = getLocalCampaigns();
          fetchedCampaign = localCampaigns.find(c => c.id === params.id) || null;
          
          if (fetchedCampaign) {
            console.log('Found campaign in local storage:', fetchedCampaign.id);
          }
        }
        
        if (fetchedCampaign) {
          setCampaign(fetchedCampaign);
          setError(null);
        } else {
          setError('Campaign not found');
        }
      } catch (err) {
        console.error('Error loading campaign:', err);
        setError('Failed to load campaign details');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCampaign();
  }, [params.id]);
  
  const isOwner = wallet.connected && campaign?.organizer === wallet.publicKey?.toString();
  
  // Format the campaign creation date as "x time ago"
  const createdTimeAgo = campaign?.createdAt ? formatDistanceToNow(campaign.createdAt, { addSuffix: true }) : '';
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }
  
  if (error || !campaign) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error || 'Campaign not found'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The campaign you're looking for might have been removed or doesn't exist.
        </p>
        <Link 
          href="/campaigns"
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium inline-block"
        >
          Back to Campaigns
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <Link 
        href="/campaigns"
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Campaigns
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {campaign.imageUrl && (
          <div className="w-full h-64 md:h-80 bg-cover bg-center" style={{ backgroundImage: `url(${campaign.imageUrl})` }}></div>
        )}
        
        <div className="p-8">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{campaign.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <CampaignStatusBadge status={campaign.status} />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created {createdTimeAgo}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  by {campaign.organizer.slice(0, 6)}...{campaign.organizer.slice(-4)}
                </p>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="mr-3">
                  <p className="text-sm text-purple-600 dark:text-purple-400">Token</p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {campaign.tokenSymbol}
                  </p>
                </div>
                <div className="h-10 border-r border-purple-200 dark:border-purple-800 mx-2"></div>
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Total Supply</p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {campaign.totalTokens.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 border-r border-purple-200 dark:border-purple-800 mx-2"></div>
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Distributed</p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {campaign.distributedTokens.toLocaleString()} 
                    <span className="text-xs ml-1">
                      ({Math.round((campaign.distributedTokens / campaign.totalTokens) * 100)}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="prose dark:prose-invert mb-8 max-w-none">
            <p>{campaign.description}</p>
          </div>
          
          {campaign.benefits && campaign.benefits.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Token Benefits</h3>
              <ul className="space-y-2">
                {campaign.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {campaign.transactionSignature && (
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Transaction Details
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-0 sm:mr-4">
                  Signature: <span className="font-mono">{campaign.transactionSignature?.slice(0, 8)}...{campaign.transactionSignature?.slice(-8)}</span>
                </p>
                <a
                  href={`https://explorer.solana.com/tx/${campaign.transactionSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  View on Solana Explorer
                </a>
              </div>
            </div>
          )}
          
          {isOwner && campaign.status === 'active' && (
            <div className="mb-6 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Distribute Tokens
              </h3>
              <DistributeTokensForm campaignId={campaign.id} />
            </div>
          )}
          
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Campaign ID: <span className="font-mono">{campaign.id}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ends: {campaign.endDate.toLocaleDateString()}
                </p>
              </div>
              
              {isOwner && (
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Edit Campaign
                  </button>
                  <button
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Change Status
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 