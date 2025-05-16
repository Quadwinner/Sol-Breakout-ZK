import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CpopProgram } from "../target/types/cpop_program";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { assert } from "chai";

describe("cpop-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CpopProgram as Program<CpopProgram>;
  const organizer = Keypair.generate();
  const recipient = Keypair.generate();
  const payer = provider.wallet.payer;
  const campaignSeed = "test-campaign-" + Math.floor(Math.random() * 1000000);
  let campaignPda: PublicKey;
  let campaignBump: number;
  let tokenMint: PublicKey;
  let organizerTokenAccount: PublicKey;
  let recipientTokenAccount: PublicKey;
  let campaignTokenAccount: PublicKey;

  before(async () => {
    // Fund the organizer account
    const airdropSignature = await provider.connection.requestAirdrop(
      organizer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);

    // Fund the recipient account
    const recipientAirdropSignature = await provider.connection.requestAirdrop(
      recipient.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(recipientAirdropSignature);

    // Create token mint
    tokenMint = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      9 // 9 decimals
    );

    // Find the campaign PDA
    [campaignPda, campaignBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("campaign"),
        organizer.publicKey.toBuffer(),
        Buffer.from(campaignSeed),
      ],
      program.programId
    );

    // Create token accounts
    const organizerAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      tokenMint,
      organizer.publicKey
    );
    organizerTokenAccount = organizerAta.address;

    const recipientAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      tokenMint,
      recipient.publicKey
    );
    recipientTokenAccount = recipientAta.address;

    // Create campaign token account
    const campaignTokenAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      tokenMint,
      campaignPda,
      true // Allow owner off curve
    );
    campaignTokenAccount = campaignTokenAta.address;
  });

  it("Creates a campaign", async () => {
    const title = "Test Campaign";
    const description = "This is a test campaign";
    const imageUrl = "https://example.com/image.png";
    const tokenSymbol = "TEST";
    const totalTokens = new anchor.BN(1000000000); // 1000 tokens with 6 decimals
    const endDateTimestamp = new anchor.BN(Math.floor(Date.now() / 1000) + 86400); // 1 day from now
    const benefits = ["Benefit 1", "Benefit 2", "Benefit 3"];

    const tx = await program.methods
      .createCampaign(
        title,
        description,
        imageUrl,
        tokenSymbol,
        totalTokens,
        endDateTimestamp,
        benefits,
        campaignSeed
      )
      .accounts({
        campaign: campaignPda,
        tokenMint: tokenMint,
        organizer: organizer.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([organizer])
      .rpc();

    console.log("Your transaction signature", tx);

    // Fetch the campaign account
    const campaign = await program.account.campaignAccount.fetch(campaignPda);
    console.log("Campaign:", campaign);

    // Verify campaign data
    assert.equal(campaign.title, title);
    assert.equal(campaign.description, description);
    assert.equal(campaign.organizer.toString(), organizer.publicKey.toString());
    assert.equal(campaign.imageUrl, imageUrl);
    assert.equal(campaign.tokenSymbol, tokenSymbol);
    assert.ok(campaign.totalTokens.eq(totalTokens));
    assert.ok(campaign.distributedTokens.eq(new anchor.BN(0)));
    assert.ok(campaign.endDate.eq(endDateTimestamp));
    assert.deepEqual(campaign.benefits, benefits);
    assert.equal(campaign.mintAddress.toString(), tokenMint.toString());
    assert.equal(campaign.seed, campaignSeed);
  });

  it("Distributes tokens to a recipient", async () => {
    // First, mint some tokens to the campaign token account
    const tokensToMint = 1000000000; // 1000 tokens with 6 decimals
    await mintTo(
      provider.connection,
      payer,
      tokenMint,
      campaignTokenAccount,
      payer.publicKey,
      tokensToMint
    );

    // Check the campaign token account balance
    const campaignTokenAccountInfo = await provider.connection.getTokenAccountBalance(campaignTokenAccount);
    assert.equal(campaignTokenAccountInfo.value.amount, tokensToMint.toString());

    // Now distribute some tokens to the recipient
    const tokensToDistribute = 100000000; // 100 tokens
    const tx = await program.methods
      .distributeTokens(new anchor.BN(tokensToDistribute))
      .accounts({
        campaign: campaignPda,
        campaignAuthority: campaignPda,
        campaignTokenAccount: campaignTokenAccount,
        recipient: recipient.publicKey,
        recipientTokenAccount: recipientTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([recipient])
      .rpc();

    console.log("Distribution transaction signature", tx);

    // Fetch the campaign account to verify distributed tokens
    const campaign = await program.account.campaignAccount.fetch(campaignPda);
    assert.ok(campaign.distributedTokens.eq(new anchor.BN(tokensToDistribute)));

    // Check the recipient token account balance
    const recipientTokenAccountInfo = await provider.connection.getTokenAccountBalance(recipientTokenAccount);
    assert.equal(recipientTokenAccountInfo.value.amount, tokensToDistribute.toString());
  });

  it("Updates campaign status", async () => {
    // Update the campaign status to Completed
    const tx = await program.methods
      .updateCampaignStatus({ completed: {} })
      .accounts({
        campaign: campaignPda,
        organizer: organizer.publicKey,
      })
      .signers([organizer])
      .rpc();

    console.log("Update status transaction signature", tx);

    // Fetch the campaign account to verify status
    const campaign = await program.account.campaignAccount.fetch(campaignPda);
    assert.deepEqual(campaign.status, { completed: {} });
  });
});
