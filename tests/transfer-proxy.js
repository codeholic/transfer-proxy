const anchor = require('@project-serum/anchor');
const assert = require('assert');

// Configure the client to use the local cluster.
const provider = anchor.Provider.env();
anchor.setProvider(provider);

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

describe('transfer-proxy', () => {
  it('Is initialized!', async () => {
    const { transferProxyAccount } = await initializeTx();

    const transferProxyAccountData = await program.account.transferProxyAccount(transferProxyAccount.publicKey);

    assert(transferProxyAccountData.transferCount.eq(new anchor.BN(0)));
  });
});
