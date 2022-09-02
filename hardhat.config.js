require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      network_id: 4,
      accounts: [process.env.PRIVATE_KEY]
    },
    goerli: {
      url: "https://goerli.prylabs.net",
      network_id: 5,
      accounts: [process.env.PRIVATE_KEY]
    },
    emerald_testnet: {
      url: "https://testnet.emerald.oasis.dev",
      accounts:
        process.env.PRIVATE_KEY_EMERALD !== undefined ? [process.env.PRIVATE_KEY_EMERALD] : [],
    },
    emerald_mainnet: {
      url: "https://emerald.oasis.dev",
      accounts:
        process.env.PRIVATE_KEY_EMERALD !== undefined ? [process.env.PRIVATE_KEY_EMERALD] : [],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: "0.8.11",
};
