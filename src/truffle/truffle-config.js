module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Chạy trên localhost
      port: 7545,       // Cổng của Ganache
      network_id: "*",  // Kết nối với bất kỳ network nào
    }
  },
  compilers: {
    solc: {
      version: "0.8.0", // Chọn phiên bản Solidity phù hợp
    }
  }
};

// require("dotenv").config();
// const HDWalletProvider = require("@truffle/hdwallet-provider");

// module.exports = {
//   networks: {
//     sepolia: {
//       provider: () =>
//         new HDWalletProvider(process.env.PRIVATE_KEY, process.env.ALCHEMY_API_URL),
//       network_id: 11155111, // ID của Sepolia
//       gas: 5500000,
//       confirmations: 2,
//       timeoutBlocks: 200,
//       skipDryRun: true,
//     },
//   },
//   compilers: {
//     solc: {
//       version: "0.8.0",
//     },
//   },
// };
