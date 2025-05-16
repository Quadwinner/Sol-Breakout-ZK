const anchor = require('@coral-xyz/anchor');
const { SystemProgram, Keypair, PublicKey } = anchor.web3;
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');

// Configure the client to use the devnet cluster
anchor.setProvider(anchor.AnchorProvider.env());

async function main() {
  try {
    // Generate a new keypair for testing
    const payer = Keypair.generate();
    
    // Airdrop some SOL to the payer
    const connection = anchor.getProvider().connection;
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    
    // Wait for airdrop confirmation
    await connection.confirmTransaction(airdropSignature);
    console.log(`Airdropped 2 SOL to ${payer.publicKey.toString()}`);
    
    // Create a provider with our payer
    const provider = new anchor.AnchorProvider(
      connection,
      new anchor.Wallet(payer),
      { commitment: 'confirmed' }
    );
    
    // Read the generated IDL
    const idl = JSON.parse(
      require('fs').readFileSync('./target/idl/cpop_program.json', 'utf8')
    );
    
    // Program ID from the deployed program
    const programId = new PublicKey('J1LhfXskL8XwGUpa5jpenWg7mXEKE9TdYJLxYTbu8LAz');
    
    // Create a program interface
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
    const [campaignPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('campaign'),
        payer.publicKey.toBuffer(),
        Buffer.from(campaignSeed),
      ],
      programId
    );
    
    console.log('Campaign PDA:', campaignPda.toString());
    console.log('Creating campaign...');
    
    // Create the campaign
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
    const campaignAccount = await program.account.campaignAccount.fetch(campaignPda);
    console.log('Campaign data:', {
      title: campaignAccount.title,
      description: campaignAccount.description,
      organizer: campaignAccount.organizer.toString(),
      tokenSymbol: campaignAccount.tokenSymbol,
      totalTokens: campaignAccount.totalTokens.toString(),
      endDate: new Date(campaignAccount.endDate.toNumber() * 1000).toISOString(),
    });
    
  } catch (error) {
    console.error('Error creating campaign:', error);
  }
}

main().then(() => console.log('Done')).catch(console.error); 