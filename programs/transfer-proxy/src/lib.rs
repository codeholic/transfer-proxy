use anchor_lang::prelude::*;
use anchor_lang::solana_program;

#[program]
pub mod transfer_proxy {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> ProgramResult {
        Ok(())
    }

    pub fn transfer(ctx: Context<Transfer>, lamports: u64, nonce: u8) -> ProgramResult {
        let transfer_proxy_account = &mut ctx.accounts.transfer_proxy_account;
        let from_account = &ctx.accounts.from_pubkey;
        let to_account = &ctx.accounts.to_pubkey;

        transfer_proxy_account.transfer_count += 1;

        let ix = solana_program::system_instruction::transfer(
            from_account.key,
            to_account.key,
            lamports,
        );

        solana_program::program::invoke_signed(
            &ix,
            &[from_account.clone(), to_account.clone()],
            &[&[b"transfer-proxy", &[nonce]]],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init)]
    transfer_proxy_account: ProgramAccount<'info, TransferProxyAccount>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    transfer_proxy_account: ProgramAccount<'info, TransferProxyAccount>,
    #[account(signer)]
    from_pubkey: AccountInfo<'info>,
    #[account(mut)]
    to_pubkey: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
}

#[account]
pub struct TransferProxyAccount {
    transfer_count: u64,
}
