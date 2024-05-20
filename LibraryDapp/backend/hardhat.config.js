require('@nomicfoundation/hardhat-ethers');
module.exports = {
  solidity: '0.8.20',
  networks: {
    moonbase: {
      url: 'https://rpc.api.moonbase.moonbeam.network',
      chainId: 1287,
      accounts: ['f482cc5d71e3e78450c6555767bf0880053206a54fc96d6c4435d64947ae4212']
    }
  }
};