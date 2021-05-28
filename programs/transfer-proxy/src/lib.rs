use anchor_lang::prelude::*;

#[program]
pub mod transfer_proxy {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init)]
    transfer_proxy_account: ProgramAccount<'info, TransferProxyAccount>,
    rent: Sysvar<'info, Rent>,
}

#[account]
pub struct TransferProxyAccount {
    transfer_count: u64,
}
