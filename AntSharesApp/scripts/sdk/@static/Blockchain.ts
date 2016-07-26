namespace AntShares.Core
{
    Blockchain.GenesisBlock.ensureHash();
    for (let i = 0; i < Blockchain.GenesisBlock.transactions.length; i++)
        Blockchain.GenesisBlock.transactions[i].ensureHash();
}
