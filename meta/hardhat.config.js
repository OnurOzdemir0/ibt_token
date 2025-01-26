require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-foundry");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.21",
  networks: {
    anvil: {
      url: "http://127.0.0.1:8545", // Anvil's default RPC URL
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" //0
      ], // Private key of the owner account provided by Anvil
    },
  },
};
