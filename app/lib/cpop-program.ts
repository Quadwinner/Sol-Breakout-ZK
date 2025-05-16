import * as anchor from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, clusterApiUrl, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Campaign, Reward } from './solana';

// Import the IDL from the generated file
// In a real production setup, you'd bundle the IDL with your frontend 
// or fetch it from a known location
let idl;
try {
  // Try to import from the original location first
  idl = require('../../cpop-program/target/idl/cpop_program.json');
} catch (error) {
  // Fallback to the local copy for deployments (Netlify/Vercel)
  console.log("Using fallback IDL location");
  idl = require('./idl/cpop_program.json');
}

// Configure Solana connection - use devnet for compatibility with Phantom wallet
const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Program ID from the deployed program
const PROGRAM_ID = new PublicKey('J1LhfXskL8XwGUpa5jpenWg7mXEKE9TdYJLxYTbu8LAz');

// Fix the IDL by manually defining the account structure
function getFixedIdl() {
  // Create a deep copy of the IDL
  const fixedIdl = JSON.parse(JSON.stringify(idl));
  
  // Find the CampaignAccount type definition
  const campaignAccountType = fixedIdl.types.find(t => t.name === 'CampaignAccount');
  
  // Check if the account definition exists and needs fixing
  if (campaignAccountType && fixedIdl.accounts && fixedIdl.accounts.length > 0) {
    // Copy the type definition to the account
    fixedIdl.accounts[0].type = campaignAccountType.type;
    console.log("IDL fixed successfully");
  }
  
  return fixedIdl;
}

// Create program interface
export function getProgram(wallet: WalletContextState) {
  // Comprehensive wallet validation with detailed logging
  console.log("Wallet state in getProgram:", {
    connected: wallet.connected,
    publicKey: wallet.publicKey?.toString() || "null",
    adapter: wallet.wallet?.adapter?.name || "unknown",
    readyState: wallet.wallet?.adapter?.readyState,
    connecting: wallet.connecting,
    disconnecting: wallet.disconnecting,
    signTransaction: typeof wallet.signTransaction === 'function' ? 'function' : typeof wallet.signTransaction
  });

  if (!wallet.connected) {
    throw new Error("Wallet not connected - connection state is false");
  }

  if (!wallet.publicKey) {
    throw new Error("Wallet not connected - cannot create program interface (missing public key)");
  }

  if (!wallet.signTransaction) {
    throw new Error("Wallet missing signTransaction method - cannot create program interface");
  }

  // Use the AnchorProvider with the wallet
  try {
    // Create a properly typed wallet adapter that the Anchor provider can use
    // This is a critical fix for the "size" error
    const walletAdapter = {
      publicKey: wallet.publicKey,
      // Use a wrapper function to ensure proper typing and avoid the 'size' error
      signTransaction: async (tx) => {
        console.log("Signing transaction in walletAdapter wrapper");
        if (!wallet.signTransaction) {
          throw new Error("Wallet signTransaction method is not available");
        }
        return await wallet.signTransaction(tx);
      },
      signAllTransactions: async (txs) => {
        console.log("Signing all transactions in walletAdapter wrapper");
        if (!wallet.signAllTransactions) {
          throw new Error("Wallet signAllTransactions method is not available");
        }
        return await wallet.signAllTransactions(txs);
      }
    };
    
    // Add additional debug logging
    console.log("Creating Anchor provider with wallet adapter:", {
      publicKey: walletAdapter.publicKey.toString(),
      hasSignTransaction: typeof walletAdapter.signTransaction === 'function',
      hasSignAllTransactions: typeof walletAdapter.signAllTransactions === 'function'
    });
    
    // Create the provider with explicit options
    const provider = new anchor.AnchorProvider(
      connection,
      walletAdapter,
      { 
        commitment: 'confirmed', 
        preflightCommitment: 'confirmed',
        skipPreflight: false // Ensure transaction simulation runs
      }
    );
    
    // Use the fixed IDL
    const fixedIdl = getFixedIdl();
    
    return new anchor.Program(fixedIdl, PROGRAM_ID, provider);
  } catch (error) {
    console.error("Error creating Anchor provider:", error);
    throw new Error(`Failed to create Anchor provider: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Find PDA for campaign
export async function findCampaignAddress(organizer: PublicKey, campaignSeed: string): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from('campaign'),
      organizer.toBuffer(),
      Buffer.from(campaignSeed),
    ],
    PROGRAM_ID
  );
}

// Create a new campaign on the blockchain
export async function createCampaign(
  wallet: WalletContextState,
  title: string,
  description: string,
  imageUrl: string,
  tokenSymbol: string,
  totalTokens: number,
  endDateTimestamp: number,
  benefits: string[],
  tokenMint: PublicKey,
): Promise<string> {
  // Enhanced logging for wallet debugging
  console.log("createCampaign called with wallet:", {
    connected: wallet.connected,
    publicKey: wallet.publicKey?.toString() || "null",
    hasSignTransaction: !!wallet.signTransaction,
    hasSignAllTransactions: !!wallet.signAllTransactions,
    adapter: wallet.wallet?.adapter?.name || "unknown",
    readyState: wallet.wallet?.adapter?.readyState
  });
  
  // Enhanced wallet connection check with detailed logging
  if (!wallet.publicKey) {
    console.error("Wallet public key is missing");
    throw new Error("Wallet not connected - missing public key");
  }
  
  if (!wallet.connected) {
    console.error("Wallet is not connected");
    throw new Error("Wallet not connected - connection state is false");
  }
  
  if (!wallet.signTransaction) {
    console.error("Wallet cannot sign transactions");
    throw new Error("Wallet cannot sign transactions - are you using a compatible wallet?");
  }
  
  try {
    console.log("Getting program with wallet", wallet.publicKey.toString());
    
    // Create the program interface with our wallet
    const program = getProgram(wallet);
    const campaignSeed = `campaign-${Date.now()}`;
    
    const [campaignPda] = await findCampaignAddress(wallet.publicKey, campaignSeed);
    console.log("Campaign PDA:", campaignPda.toString());
    
    console.log("Preparing transaction...");
    console.log("Transaction accounts:", {
      campaign: campaignPda.toString(),
      tokenMint: tokenMint.toString(),
      organizer: wallet.publicKey.toString(),
    });
    
    // Build the transaction with explicit error handling
    try {
      const tx = await program.methods
        .createCampaign(
          title,
          description,
          imageUrl,
          tokenSymbol,
          new anchor.BN(totalTokens),
          new anchor.BN(endDateTimestamp),
          benefits,
          campaignSeed
        )
        .accounts({
          campaign: campaignPda,
          tokenMint,
          organizer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();
      
      console.log("Transaction successful:", tx);
      return tx;
    } catch (txError: any) {
      console.error("Transaction error:", txError);
      
      // Handle transaction-specific errors
      if (txError.message?.includes("size")) {
        throw new Error("Wallet transaction signing error. Please make sure your wallet is properly connected to Devnet and try again.");
      } else if (txError.message?.includes("Blockhash")) {
        throw new Error("Network connection error. Please check your internet connection and try again.");
      }
      
      throw txError;
    }
  } catch (error) {
    console.error('Error creating campaign:', error);
    
    // Enhanced error reporting with more detail
    if (error instanceof Error) {
      // Detailed logging for debugging
      console.error('Campaign creation error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });
      
      // Check for specific Anchor/Solana errors
      if (error.message.includes("custom program error")) {
        throw new Error(`Solana program error: ${error.message}`);
      } else if (error.message.includes("Transaction simulation failed")) {
        throw new Error(`Transaction simulation failed. Make sure your wallet has enough SOL and is connected to Devnet.`);
      } else if (error.message.includes("Wallet not connected")) {
        throw new Error(`Wallet connection issue: ${error.message}. Please reconnect your wallet and try again.`);
      } else if (error.message.includes("Cannot read properties of undefined")) {
        throw new Error(`Wallet adapter error: ${error.message}. Try refreshing the page and reconnecting your wallet.`);
      } else if (error.message.includes("size")) {
        throw new Error(`Transaction signing error: ${error.message}. Make sure your wallet is properly connected to Devnet.`);
      } else {
        throw new Error(`Failed to create campaign: ${error.message}`);
      }
    }
    throw error;
  }
}

// Fetch all campaigns from the blockchain
export async function fetchCampaigns(): Promise<Campaign[]> {
  try {
    // Create a provider without a real wallet for read-only operations
    const provider = new anchor.AnchorProvider(
      connection, 
      {
        publicKey: PublicKey.default,
        signTransaction: async () => { throw new Error("Read-only"); },
        signAllTransactions: async () => { throw new Error("Read-only"); },
      } as any,
      { commitment: 'confirmed' }
    );
    
    const program = new anchor.Program(idl, PROGRAM_ID, provider);
    
    // Fetch all campaign accounts
    const campaignAccounts = await program.account.campaignAccount.all();
    
    // Convert to Campaign interface
    return campaignAccounts.map(account => {
      const data = account.account;
      return {
        id: account.publicKey.toString(),
        title: data.title,
        description: data.description,
        organizer: data.organizer.toString(),
        imageUrl: data.imageUrl,
        mintAddress: data.mintAddress.toString(),
        totalTokens: Number(data.totalTokens),
        distributedTokens: Number(data.distributedTokens),
        createdAt: new Date(Number(data.createdAt) * 1000),
        endDate: new Date(Number(data.endDate) * 1000),
        status: convertStatus(data.status),
        tokenSymbol: data.tokenSymbol,
        decimals: 9, // Assuming 9 decimals for SPL tokens
        benefits: data.benefits,
      };
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

// Convert campaign status from enum to string
function convertStatus(status: any): 'active' | 'completed' | 'upcoming' {
  if (status.active) return 'active';
  if (status.completed) return 'completed';
  if (status.upcoming) return 'upcoming';
  return 'active'; // Default
}

// Fetch a single campaign by ID
export async function fetchCampaignById(id: string): Promise<Campaign | null> {
  try {
    // Create a provider without a real wallet for read-only operations
    const provider = new anchor.AnchorProvider(
      connection, 
      {
        publicKey: PublicKey.default,
        signTransaction: async () => { throw new Error("Read-only"); },
        signAllTransactions: async () => { throw new Error("Read-only"); },
      } as any,
      { commitment: 'confirmed' }
    );
    
    const program = new anchor.Program(idl, PROGRAM_ID, provider);
    
    // Convert ID string to PublicKey
    const campaignPubkey = new PublicKey(id);
    
    // Fetch the campaign account
    const campaignAccount = await program.account.campaignAccount.fetch(campaignPubkey);
    
    // Convert to Campaign interface
    return {
      id,
      title: campaignAccount.title,
      description: campaignAccount.description,
      organizer: campaignAccount.organizer.toString(),
      imageUrl: campaignAccount.imageUrl,
      mintAddress: campaignAccount.mintAddress.toString(),
      totalTokens: Number(campaignAccount.totalTokens),
      distributedTokens: Number(campaignAccount.distributedTokens),
      createdAt: new Date(Number(campaignAccount.createdAt) * 1000),
      endDate: new Date(Number(campaignAccount.endDate) * 1000),
      status: convertStatus(campaignAccount.status),
      tokenSymbol: campaignAccount.tokenSymbol,
      decimals: 9, // Assuming 9 decimals for SPL tokens
      benefits: campaignAccount.benefits,
    };
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
}

// Distribute tokens to a recipient
export async function distributeTokens(
  wallet: WalletContextState,
  campaignId: string,
  recipientPubkey: PublicKey,
  recipientTokenAccount: PublicKey,
  campaignTokenAccount: PublicKey,
  amount: number
): Promise<string> {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  
  try {
    const program = getProgram(wallet);
    const campaignPubkey = new PublicKey(campaignId);
    
    // Fetch the campaign to get its data
    const campaignAccount = await program.account.campaignAccount.fetch(campaignPubkey);
    
    // Calculate campaign authority PDA
    const [campaignAuthority] = await PublicKey.findProgramAddress(
      [
        Buffer.from('campaign'),
        campaignAccount.organizer.toBuffer(),
        Buffer.from(campaignAccount.seed),
      ],
      PROGRAM_ID
    );
    
    // Send transaction to distribute tokens
    const tx = await program.methods
      .distributeTokens(new anchor.BN(amount))
      .accounts({
        campaign: campaignPubkey,
        campaignAuthority,
        campaignTokenAccount,
        recipient: recipientPubkey,
        recipientTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error distributing tokens:', error);
    throw error;
  }
}

// Update campaign status
export async function updateCampaignStatus(
  wallet: WalletContextState,
  campaignId: string,
  newStatus: 'active' | 'completed' | 'upcoming'
): Promise<string> {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  
  try {
    const program = getProgram(wallet);
    const campaignPubkey = new PublicKey(campaignId);
    
    // Convert string status to enum variant
    let statusEnum;
    if (newStatus === 'active') {
      statusEnum = { active: {} };
    } else if (newStatus === 'completed') {
      statusEnum = { completed: {} };
    } else {
      statusEnum = { upcoming: {} };
    }
    
    // Send transaction to update status
    const tx = await program.methods
      .updateCampaignStatus(statusEnum)
      .accounts({
        campaign: campaignPubkey,
        organizer: wallet.publicKey,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error updating campaign status:', error);
    throw error;
  }
}

// Fetch user rewards based on token accounts
export async function fetchUserRewards(walletAddress: string): Promise<Reward[]> {
  try {
    // This would require:
    // 1. Fetching all token accounts for the wallet
    // 2. For each token account, checking if the mint is associated with a campaign
    // 3. Creating Reward objects for each matching token account
    
    // For now, return an empty array
    return [];
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return [];
  }
} 