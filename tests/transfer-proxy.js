const anchor = require('@project-serum/anchor');
const assert = require('assert');

// Configure the client to use the local cluster.
const provider = anchor.Provider.env();
anchor.setProvider(provider);

const { connection } = provider;

const program = anchor.workspace.TransferProxy;

const initializeTx = async () => {
  const transferProxyAccount = anchor.web3.Keypair.generate();

  const tx = await program.rpc.initialize({
    accounts: {
      transferProxyAccount: transferProxyAccount.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
    instructions: [
      await program.account.transferProxyAccount.createInstruction(transferProxyAccount),
    ],
    signers: [transferProxyAccount],
  });

  return { transferProxyAccount, tx };
};

const airdrop = async (publicKey, lamports) => (
  await connection.confirmTransaction(
    await connection.requestAirdrop(publicKey, lamports),
    'confirmed',
  )
);

describe('TransferProxy', () => {
  it('initialize', async () => {
    const { transferProxyAccount } = await initializeTx();

    const transferProxyAccountData = await program.account.transferProxyAccount(transferProxyAccount.publicKey);
    assert(transferProxyAccountData.transferCount.eq(new anchor.BN(0)));
  });

  it('transfer', async () => {
    const { transferProxyAccount } = await initializeTx();

    let fromAccount = provider.wallet;

    const transferAmount = 10 * anchor.web3.LAMPORTS_PER_SOL;
    await airdrop(fromAccount.publicKey, transferAmount);

    const toAccount = anchor.web3.Keypair.generate();

    const [_pdaAccount, nonce] = await anchor.web3.PublicKey.findProgramAddress(
      ['transfer-proxy'],
      program.programId,
    );

    await connection.confirmTransaction(
      await program.rpc.transfer(
        new anchor.BN(transferAmount),
        nonce,
        {
          accounts: {
            transferProxyAccount: transferProxyAccount.publicKey,
            fromPubkey: fromAccount.publicKey,
            toPubkey: toAccount.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
        },
      ),
      'confirmed',
    );

    const balance = await connection.getBalance(toAccount.publicKey);
    assert(balance == transferAmount);

    const transferProxyAccountData = await program.account.transferProxyAccount(transferProxyAccount.publicKey);
    assert(transferProxyAccountData.transferCount.eq(new anchor.BN(1)));
  });
});
