use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("J1LhfXskL8XwGUpa5jpenWg7mXEKE9TdYJLxYTbu8LAz");

#[program]
pub mod cpop_program {
    use super::*;

    // Initialize a new campaign with all necessary data
    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        title: String,
        description: String,
        image_url: String,
        token_symbol: String,
        total_tokens: u64,
        end_date_timestamp: i64,
        benefits: Vec<String>,
        campaign_seed: String,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let organizer = &ctx.accounts.organizer;
        let clock = Clock::get()?;

        // Set all campaign data
        campaign.title = title;
        campaign.description = description;
        campaign.organizer = *organizer.key;
        campaign.image_url = image_url;
        campaign.token_symbol = token_symbol;
        campaign.total_tokens = total_tokens;
        campaign.distributed_tokens = 0; // Initialize to 0
        campaign.created_at = clock.unix_timestamp;
        campaign.end_date = end_date_timestamp;
        campaign.status = CampaignStatus::Active;
        campaign.benefits = benefits;
        campaign.mint_address = ctx.accounts.token_mint.key();
        campaign.bump = ctx.bumps.campaign;
        campaign.seed = campaign_seed;

        msg!("Campaign created: {}", campaign.title);
        msg!("Campaign ID: {}", campaign.key());
        Ok(())
    }

    // Distribute tokens to a recipient
    pub fn distribute_tokens(
        ctx: Context<DistributeTokens>,
        amount: u64,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        
        // Check if there are enough tokens left to distribute
        if campaign.distributed_tokens + amount > campaign.total_tokens {
            return err!(CampaignError::NotEnoughTokensRemaining);
        }

        // Update the distributed tokens count
        campaign.distributed_tokens += amount;

        // Transfer tokens from campaign token account to recipient token account
        // This is a simplified version - in a real implementation, you'd use SPL token program
        // to mint new tokens to the recipient
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.campaign_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.campaign_authority.to_account_info(),
        };
        
        let seeds = &[
            b"campaign",
            campaign.organizer.as_ref(),
            campaign.seed.as_bytes(),
            &[campaign.bump],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::transfer(cpi_ctx, amount)?;
        
        msg!("Distributed {} tokens to {}", amount, ctx.accounts.recipient.key());
        Ok(())
    }

    // Update campaign status
    pub fn update_campaign_status(
        ctx: Context<UpdateCampaignStatus>,
        new_status: CampaignStatus,
    ) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        
        // Only the organizer can update the campaign status
        if campaign.organizer != ctx.accounts.organizer.key() {
            return err!(CampaignError::Unauthorized);
        }
        
        let status_copy = new_status.clone();
        campaign.status = new_status;
        msg!("Campaign status updated to: {:?}", status_copy);
        Ok(())
    }
}

// Account structure for creating a new campaign
#[derive(Accounts)]
#[instruction(
    title: String,
    description: String,
    image_url: String,
    token_symbol: String,
    total_tokens: u64,
    end_date_timestamp: i64,
    benefits: Vec<String>,
    campaign_seed: String,
)]
pub struct CreateCampaign<'info> {
    #[account(
        init,
        payer = organizer,
        space = 8 + // Discriminator
            32 + // organizer (Pubkey)
            4 + title.len() + // title (String)
            4 + description.len() + // description (String)
            4 + image_url.len() + // image_url (String)
            4 + token_symbol.len() + // token_symbol (String)
            8 + // total_tokens (u64)
            8 + // distributed_tokens (u64)
            8 + // created_at (i64)
            8 + // end_date (i64)
            1 + // status (enum - 1 byte)
            4 + // benefits vector length
            benefits.iter().map(|b| 4 + b.len()).sum::<usize>() + // benefits (Vec<String>)
            32 + // mint_address (Pubkey)
            1 + // bump (u8)
            4 + campaign_seed.len(), // seed (String)
        seeds = [b"campaign", organizer.key().as_ref(), campaign_seed.as_bytes()],
        bump
    )]
    pub campaign: Account<'info, CampaignAccount>,
    
    // The token mint associated with this campaign
    pub token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub organizer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

// Account structure for distributing tokens
#[derive(Accounts)]
pub struct DistributeTokens<'info> {
    #[account(mut)]
    pub campaign: Account<'info, CampaignAccount>,
    
    #[account(
        seeds = [b"campaign", campaign.organizer.as_ref(), campaign.seed.as_bytes()],
        bump = campaign.bump,
    )]
    /// CHECK: This is the PDA that acts as the authority for the campaign token account
    pub campaign_authority: UncheckedAccount<'info>,
    
    #[account(
        mut,
        constraint = campaign_token_account.mint == campaign.mint_address,
        constraint = campaign_token_account.owner == campaign_authority.key()
    )]
    pub campaign_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub recipient: Signer<'info>,
    
    #[account(
        mut,
        constraint = recipient_token_account.mint == campaign.mint_address,
        constraint = recipient_token_account.owner == recipient.key()
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

// Account structure for updating campaign status
#[derive(Accounts)]
pub struct UpdateCampaignStatus<'info> {
    #[account(mut)]
    pub campaign: Account<'info, CampaignAccount>,
    
    pub organizer: Signer<'info>,
}

// Main campaign account structure
#[account]
pub struct CampaignAccount {
    pub title: String,
    pub description: String,
    pub organizer: Pubkey,
    pub image_url: String,
    pub token_symbol: String,
    pub total_tokens: u64,
    pub distributed_tokens: u64,
    pub created_at: i64,
    pub end_date: i64,
    pub status: CampaignStatus,
    pub benefits: Vec<String>,
    pub mint_address: Pubkey,
    pub bump: u8,
    pub seed: String,
}

// Campaign status enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum CampaignStatus {
    Active,
    Completed,
    Upcoming,
}

// Custom error codes
#[error_code]
pub enum CampaignError {
    #[msg("Not enough tokens remaining in the campaign")]
    NotEnoughTokensRemaining,
    #[msg("Unauthorized operation")]
    Unauthorized,
}
