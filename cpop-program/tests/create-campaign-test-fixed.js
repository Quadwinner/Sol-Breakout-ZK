const anchor = require('@coral-xyz/anchor');
const { SystemProgram, Keypair, PublicKey, Connection } = anchor.web3;
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

// Create a direct connection to devnet instead of using environment variables
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const payer = Keypair.generate();
const wallet = new anchor.Wallet(payer);
const provider = new anchor.AnchorProvider(
  connection,
  wallet,
  { commitment: 'confirmed' }
);

// Set the provider manually instead of using the env method
anchor.setProvider(provider);

async function main() {
  try {
    console.log('Using wallet:', payer.publicKey.toString());
    
    // Airdrop some SOL to the payer
    console.log('Requesting airdrop...');
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    
    // Wait for airdrop confirmation
    console.log('Confirming airdrop transaction...');
    await connection.confirmTransaction(airdropSignature);
    console.log(`Airdropped 2 SOL to ${payer.publicKey.toString()}`);
    
    // Read the generated IDL
    console.log('Reading IDL file...');
    const idlFile = fs.readFileSync('./target/idl/cpop_program.json', 'utf8');
    const idl = JSON.parse(idlFile);
    
    // Fix the IDL by ensuring the account fields are properly defined
    console.log('Checking IDL account definitions...');
    // Always fix the IDL - the account definition is missing the proper type structure
    console.log("Fixing IDL account definitions...");
    
    // Find the CampaignAccount type definition
    const campaignAccountType = idl.types.find(t => t.name === 'CampaignAccount');
    
    if (campaignAccountType) {
      // The issue is that the account definition in the IDL file is incomplete
      // It only has discriminator but needs the full type structure
      console.log("Found CampaignAccount type, fixing account definition...");
      
      // Make sure we have an account with this name
      if (idl.accounts && idl.accounts.length > 0) {
        const campaignAccount = idl.accounts.find(a => a.name === 'CampaignAccount');
        
        if (campaignAccount) {
          // Add the type structure to the account
          campaignAccount.type = campaignAccountType.type;
          console.log("IDL fixed successfully - added type to existing account");
        } else {
          console.log("Couldn't find CampaignAccount in accounts, fixing the first account...");
          // If the account name doesn't match, fix the first account (might be a naming issue)
          idl.accounts[0].type = campaignAccountType.type;
          // Also ensure the name matches
          idl.accounts[0].name = 'CampaignAccount';
          console.log("IDL fixed successfully - updated first account");
        }
      } else {
        console.error("No accounts found in IDL, cannot fix");
        return;
      }
    } else {
      console.error("Could not find CampaignAccount type definition");
      return;
    }
    
    // Debug the fixed IDL structure
    console.log("Fixed IDL accounts structure:", JSON.stringify(idl.accounts, null, 2));
    console.log("Fixed account type:", idl.accounts[0].type ? "Exists" : "Missing");
    
    // Program ID from the deployed program
    const programId = new PublicKey('J1LhfXskL8XwGUpa5jpenWg7mXEKE9TdYJLxYTbu8LAz');
    console.log('Using program ID:', programId.toString());
    
    // Create a program interface with the fixed IDL
    const program = new anchor.Program(idl, programId, provider);
    
    // Use SOL as the token mint for testing
    const tokenMint = new PublicKey('So11111111111111111111111111111111111111112');
    
    // Campaign data
    const title = 'Test Campaign';
    const description = 'Test campaign created from CLI';
    const imageUrl = 'https://example.com/image.jpg';
    const tokenSymbol = 'TEST';
    const totalTokens = 1000;
    const endDateTimestamp = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const benefits = ['Benefit 1', 'Benefit 2'];
    const campaignSeed = `campaign-${Date.now()}`;
    
    // Find PDA for campaign
    console.log('Deriving campaign PDA...');
    const [campaignPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('campaign'),
        payer.publicKey.toBuffer(),
        Buffer.from(campaignSeed),
      ],
      programId
    );
    
    console.log('Campaign PDA:', campaignPda.toString());
    console.log('Creating campaign with the following data:');
    console.log({
      title,
      description,
      imageUrl,
      tokenSymbol,
      totalTokens,
      endDate: new Date(endDateTimestamp * 1000).toISOString(),
      benefits,
      campaignSeed
    });
    
    // Create the campaign
    console.log('Submitting transaction...');
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
          organizer: payer.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([payer])
        .rpc();
      
      console.log('Transaction successful:', tx);
      console.log('Campaign created successfully!');
      
      // Fetch the campaign to verify
      console.log('Fetching campaign data to verify...');
      const campaignAccount = await program.account.campaignAccount.fetch(campaignPda);
      console.log('Campaign data:', {
        title: campaignAccount.title,
        description: campaignAccount.description,
        organizer: campaignAccount.organizer.toString(),
        tokenSymbol: campaignAccount.tokenSymbol,
        totalTokens: campaignAccount.totalTokens.toString(),
        endDate: new Date(campaignAccount.endDate.toNumber() * 1000).toISOString(),
      });
    } catch (txError) {
      console.error('Transaction error:', txError);
      if (txError.logs) {
        console.log('Transaction logs:');
        txError.logs.forEach((log, i) => console.log(`${i}: ${log}`));
      }
    }
    
  } catch (error) {
    console.error('Error creating campaign:', error);
    console.error('Error details:', error.stack);
  }
}

main().then(() => console.log('Done')).catch(console.error); 