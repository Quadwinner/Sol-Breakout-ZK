'use client';

import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { createMintToInstruction, getMintInfo } from '@solana/spl-token';
import { 
  createCompressedTokenSPLExtension, 
  compressAccount 
} from '@lightprotocol/compressed-token';
import { StatelessBatchTransaction } from '@lightprotocol/stateless.js';

const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || '';

export const createCompressedToken = async (
  connection: Connection,
  payer: Keypair,
  mintAuthority: Keypair,
  decimals: number,
  name: string,
  symbol: string,
  uri: string
): Promise<PublicKey> => {
  try {
    const mintKeypair = Keypair.generate();
    
    // Create SPL token mint with compressed extension
    const createMintTransaction = await createCompressedTokenSPLExtension({
      connection,
      payer: payer.publicKey,
      mint: mintKeypair.publicKey,
      mintAuthority: mintAuthority.publicKey,
      freezeAuthority: null,
      decimals,
      metadataTitle: name,
      metadataSymbol: symbol,
      metadataUri: uri,
    });

    // Sign and send transaction
    createMintTransaction.partialSign(payer, mintKeypair);
    const signature = await connection.sendRawTransaction(createMintTransaction.serialize());
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log(`Created compressed token mint: ${mintKeypair.publicKey.toString()}`);
    return mintKeypair.publicKey;
  } catch (error) {
    console.error('Error creating compressed token:', error);
    throw error;
  }
};

export const mintCompressedTokens = async (
  connection: Connection,
  payer: Keypair,
  mintAuthority: Keypair,
  mintPublicKey: PublicKey,
  recipientPublicKey: PublicKey,
  amount: number
): Promise<string> => {
  try {
    // Get mint info to calculate amount with decimals
    const mintInfo = await getMintInfo(connection, mintPublicKey);
    const adjustedAmount = amount * Math.pow(10, mintInfo.decimals);
    
    // Create mint instruction
    const transaction = new Transaction();
    transaction.add(
      createMintToInstruction(
        mintPublicKey,
        recipientPublicKey,
        mintAuthority.publicKey,
        BigInt(adjustedAmount)
      )
    );
    
    // Sign and send transaction
    transaction.partialSign(payer, mintAuthority);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  } catch (error) {
    console.error('Error minting compressed tokens:', error);
    throw error;
  }
};

export const compressTokenAccount = async (
  connection: Connection,
  payer: Keypair,
  tokenAccountPubkey: PublicKey
): Promise<string> => {
  try {
    // Create the transaction to compress an account
    const compressAccountTx = await compressAccount({
      connection,
      payer: payer.publicKey,
      tokenAccount: tokenAccountPubkey,
    });
    
    // Sign and send transaction
    compressAccountTx.partialSign(payer);
    const signature = await connection.sendRawTransaction(compressAccountTx.serialize());
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log(`Compressed token account: ${tokenAccountPubkey.toString()}`);
    return signature;
  } catch (error) {
    console.error('Error compressing token account:', error);
    throw error;
  }
};

export const batchMintCompressedTokens = async (
  connection: Connection,
  payer: Keypair,
  mintAuthority: Keypair,
  mintPublicKey: PublicKey,
  recipients: { publicKey: PublicKey; amount: number }[]
): Promise<string> => {
  try {
    // Get mint info to calculate amount with decimals
    const mintInfo = await getMintInfo(connection, mintPublicKey);
    
    // Create a new stateless batch transaction
    const batchTx = new StatelessBatchTransaction();
    
    // Add mint instructions for each recipient
    for (const recipient of recipients) {
      const adjustedAmount = recipient.amount * Math.pow(10, mintInfo.decimals);
      
      batchTx.add(
        createMintToInstruction(
          mintPublicKey,
          recipient.publicKey,
          mintAuthority.publicKey,
          BigInt(adjustedAmount)
        )
      );
    }
    
    // Sign and send the batch transaction
    batchTx.partialSign(payer, mintAuthority);
    const signature = await connection.sendRawTransaction(batchTx.serialize());
    await connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  } catch (error) {
    console.error('Error batch minting compressed tokens:', error);
    throw error;
  }
}; 