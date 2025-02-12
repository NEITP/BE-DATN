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
