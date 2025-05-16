import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { createMint, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import * as cpopProgram from './cpop-program';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Configure Solana connection - use devnet for compatibility with Phantom wallet
const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
const solanaConnection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Interface for Campaign data from blockchain
export interface Campaign {
  id: string; // This might be the account address of the campaign on-chain
  title: string;
  description: string;
  organizer: string; // Public key of the organizer
  creatorName?: string;
  imageUrl?: string;
  mintAddress: string; // Public key of the SPL Token Mint for this campaign
  totalTokens: number;
  distributedTokens: number;
  createdAt: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'upcoming';
  tokenSymbol: string;
  decimals: number;
  benefits?: string[];
  transactionSignature?: string; // To store the creation transaction
}

// Interface for Reward data from blockchain
export interface Reward {
  id: string;
  campaignId: string;
  campaignTitle: string;
  imageUrl?: string;
  tokenSymbol: string;
  amount: number;
  receivedAt: Date;
  status: string;
}

// Fetch list of all campaigns from the Solana program
export async function fetchCampaigns(): Promise<Campaign[]> {
  try {
    // Use the cpop-program integration to fetch campaigns
    return await cpopProgram.fetchCampaigns();
  } catch (error) {
    console.error('Error fetching campaigns from blockchain:', error);
    throw error; // Re-throw the error to be handled by the UI
  }
}

// Fetch a single campaign by ID (likely its account address)
export async function fetchCampaignById(id: string): Promise<Campaign | null> {
  try {
    // Use the cpop-program integration to fetch a single campaign
    return await cpopProgram.fetchCampaignById(id);
  } catch (error) {
    console.error('Error fetching campaign from blockchain:', error);
    throw error; // Re-throw the error
  }
}

// Fetch user rewards based on their wallet address
export async function fetchUserRewards(walletAddress: string): Promise<Reward[]> {
  try {
    // Use the cpop-program integration to fetch user rewards
    return await cpopProgram.fetchUserRewards(walletAddress);
  } catch (error) {
    console.error('Error fetching rewards from blockchain:', error);
    return []; // Return empty array on error
  }
}

// Create a new campaign - prepare transaction and data for on-chain storage
export async function createCampaign(
  campaignData: Partial<Campaign>, 
  wallet: WalletContextState
): Promise<string> { // Returns the transaction signature
  try {
    // Enhanced wallet connection check with detailed diagnostics
    console.log("Wallet state in createCampaign:", {
      wallet: !!wallet,
      connected: wallet?.connected,
      publicKey: wallet?.publicKey?.toString(),
      adapter: wallet?.wallet?.adapter?.name,
      readyState: wallet?.wallet?.adapter?.readyState,
      hasSignTransaction: !!wallet?.signTransaction,
    });
    
    if (!wallet) {
      console.error("Wallet object is null or undefined");
      throw new Error("Wallet not available. Please reload the page and try again.");
    }
    
    if (!wallet.connected) {
      console.error("Wallet is not connected");
      throw new Error("Wallet not connected. Please connect your wallet first.");
    }
    
    if (!wallet.publicKey) {
      console.error("Wallet has no public key");
      throw new Error("Wallet has no public key. Please reconnect your wallet.");
    }
    
    if (!wallet.signTransaction) {
      console.error("Wallet cannot sign transactions");
      throw new Error("Your wallet doesn't support transaction signing. Please use a compatible wallet.");
    }
    
    console.log("Creating campaign with wallet:", wallet.publicKey.toString());
    
    // For development/testing, we'll use a well-known token mint address
    // In production, you'd need to create a real mint through a backend service
    // or implement a different token handling strategy
    const tokenMint = new PublicKey("So11111111111111111111111111111111111111112");
    
    try {
      // Now create the campaign on-chain
      const txSignature = await cpopProgram.createCampaign(
        wallet,
        campaignData.title!,
        campaignData.description!,
        campaignData.imageUrl || "",
        campaignData.tokenSymbol!,
        campaignData.totalTokens!,
        Math.floor(campaignData.endDate!.getTime() / 1000), // Convert to Unix timestamp
        campaignData.benefits || [],
        tokenMint
      );
  
      console.log("Campaign created successfully with tx:", txSignature);
      return txSignature;
    } catch (err: any) {
      console.error("Error in cpopProgram.createCampaign:", err);
      // Check for specific error messages
      if (err.message && err.message.includes("Wallet not connected")) {
        throw new Error("Wallet connection issue. Please try reconnecting your wallet.");
      }
      throw err;
    }
  } catch (error: any) {
    console.error('Error in createCampaign:', error);
    throw error;
  }
}

// Distribute tokens to recipients
export async function distributeTokens(
  campaignId: string, // ID of the campaign (its account address)
  recipient: string,
  amount: number, 
  wallet: WalletContextState
): Promise<string> {
  try {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    
    // First, get the campaign
    const campaign = await fetchCampaignById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found on-chain');
    }

    // Convert recipient to PublicKey
    const recipientPubkey = new PublicKey(recipient);
    
    // Get the token mint for this campaign
    const tokenMint = new PublicKey(campaign.mintAddress);
    
    // In a browser environment, we can't create token accounts directly
    // We'd need to use a different approach like an API endpoint
    // For now, we'll use placeholder values
    const recipientTokenAccount = recipientPubkey;
    const campaignTokenAccount = new PublicKey(campaign.mintAddress);
    
    // Distribute tokens
    const txSignature = await cpopProgram.distributeTokens(
      wallet,
      campaignId,
      recipientPubkey,
      recipientTokenAccount,
      campaignTokenAccount,
      amount
    );
    
    return txSignature;
  } catch (error) {
    console.error('Error distributing tokens:', error);
    throw error;
  }
}

// Update campaign status
export async function updateCampaignStatus(
  campaignId: string,
  newStatus: 'active' | 'completed' | 'upcoming',
  wallet: WalletContextState
): Promise<string> {
  try {
    return await cpopProgram.updateCampaignStatus(
      wallet,
      campaignId,
      newStatus
    );
  } catch (error) {
    console.error('Error updating campaign status:', error);
    throw error;
  }
}

// Get Solana network status
export async function getSolanaNetworkStatus(): Promise<{
  blockHeight: number;
  tps: number;
  status: 'up' | 'degraded' | 'down';
}> {
  try {
    const blockHeight = await solanaConnection.getBlockHeight();
    
    // This is a simple approximation of TPS
    // const slot = await solanaConnection.getSlot();
    // const slotLeader = await solanaConnection.getSlotLeader();
    
    return {
      blockHeight,
      tps: 2000 + Math.floor(Math.random() * 1000), // Mock TPS value
      status: 'up'
    };
  } catch (error) {
    console.error('Error getting Solana network status:', error);
    return {
      blockHeight: 0,
      tps: 0,
      status: 'down'
    };
  }
} 