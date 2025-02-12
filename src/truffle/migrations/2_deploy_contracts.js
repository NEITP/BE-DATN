const BlockchainLog = artifacts.require("BlockchainLog");

module.exports = function (deployer) {
    deployer.deploy(BlockchainLog);
};
