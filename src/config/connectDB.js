'use strict';

const { Sequelize } = require('sequelize');
const { Web3 } = require('web3');
const BlockchainLog = require('../models/blockchainlog');

// Khởi tạo Web3 để kết nối với blockchain thông qua Ganache
const web3 = new Web3('http://127.0.0.1:7545');

// Khởi tạo hợp đồng thông minh từ ABI và địa chỉ contract
const contractABI = require('../truffle/build/contracts/BlockchainLog.json');
const contractAddress = "0x991A4312897a3DB36f98d239deB698ECd88121aB";
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

// Địa chỉ ví thực hiện giao dịch trên blockchain
const senderAddress = '0x17F99F3CFEF260Bd0479dC700134c4e372270079';

// Khởi tạo Sequelize để kết nối MySQL
const sequelize = new Sequelize('ecom', 'root', null, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

/**
 * Kết nối đến cơ sở dữ liệu MySQL và kiểm tra kết nối với Ganache.
 */
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Kết nối cơ sở dữ liệu thành công.');

        // Kiểm tra kết nối với blockchain bằng cách lấy danh sách tài khoản
        const accounts = await web3.eth.getAccounts();
        console.log(`Kết nối với Ganache. Số tài khoản có sẵn: ${accounts.length}`);
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        throw error;
    }
};

/**
 * Đồng bộ dữ liệu log từ MySQL.
 * Truy vấn tất cả các bản ghi log từ bảng BlockchainLogs và trả về danh sách log.
 */
const syncBlockchainLogs = async () => {
    try {
        await sequelize.sync();
        console.log('Tất cả các models đã được đồng bộ thành công.');

        // Lấy danh sách logs từ cơ sở dữ liệu, sắp xếp theo thời gian tạo
        const [logs] = await sequelize.query('SELECT * FROM BlockchainLogs ORDER BY createdAt ASC');
        return logs;
    } catch (error) {
        console.error('Lỗi khi đồng bộ dữ liệu:', error);
        throw error;
    }
};

/**
 * Thêm một bản ghi log vào blockchain.
 * Gửi transaction tới smart contract và trả về transaction receipt.
 */
const addLogToBlockchain = async (log) => {
    try {
        // Gửi dữ liệu log lên smart contract trên blockchain
        const receipt = await contract.methods.addLog(
            log.tableName,
            log.recordId.toString(),
            log.action,
            log.hash
        ).send({
            from: senderAddress,
            gas: 3000000 // Giới hạn gas để tránh lỗi do thiếu gas
        });

        console.log('Log đã được thêm vào blockchain:', {
            tableName: log.tableName,
            recordId: log.recordId,
            transactionHash: receipt.transactionHash,
            blockHash: receipt.blockHash,
            address: senderAddress
        });

        return receipt;
    } catch (error) {
        console.error('Lỗi khi thêm log vào blockchain:', error);
        throw error;
    }
};

/**
 * Lấy các log mới nhất từ blockchain.
 * Duyệt qua các sự kiện để tìm transaction hash và block hash.
 */
const getLatestLogs = async (count = 1) => {
    try {
        // Lấy tổng số log đã lưu trên blockchain
        const logsCount = await contract.methods.getLogCount().call();
        if (logsCount === 0) {
            console.log('Không có log nào trong blockchain');
            return [];
        }

        const logs = [];
        const startIndex = Math.max(0, Number(logsCount) - count);

        for (let i = startIndex; i < logsCount; i++) {
            const log = await contract.methods.getLog(i).call();

            // Lấy tất cả sự kiện để tìm transaction hash và block hash
            const events = await contract.getPastEvents('LogAdded', {
                fromBlock: 0,
                toBlock: 'latest'
            });

            let transactionHash = null;
            let blockHash = null;

            for (const event of events) {
                if (event.returnValues.hash === log.hash) {
                    transactionHash = event.transactionHash;
                    blockHash = event.blockHash;
                    break;
                }
            }

            logs.push({
                tableName: log.tableName,
                recordId: BigInt(log.recordId).toString(),
                action: log.action,
                hash: log.hash,
                transactionHash: transactionHash || 'Không tìm thấy',
                blockHash: blockHash || 'Không tìm thấy',
                address: log.senderAddress,
                timestamp: new Date(Number(log.timestamp) * 1000).toISOString()
            });
        }
        return logs;
    } catch (error) {
        console.error('Lỗi khi lấy log mới nhất:', error);
        throw error;
    }
};

/**
 * Kiểm tra xem log có tồn tại trên blockchain hay không.
 */
const logExistsInBlockchain = async (log) => {
    try {
        const logsCount = await contract.methods.getLogCount().call();
        for (let i = 0; i < logsCount; i++) {
            const blockchainLog = await contract.methods.getLog(i).call();
            if (blockchainLog.hash === log.hash) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Lỗi khi kiểm tra log trong blockchain:', error);
        throw error;
    }
};

/**
 * Chạy toàn bộ quy trình đồng bộ dữ liệu từ database lên blockchain.
 */
const runSync = async () => {
    try {
        const logs = await syncBlockchainLogs();
        console.log(`Đã tìm thấy ${logs.length} log để đồng bộ`);

        const results = [];
        for (const log of logs) {
            const exists = await logExistsInBlockchain(log);
            if (!exists) {
                const receipt = await addLogToBlockchain(log);
                console.log(`Giao dịch thành công! Transaction Hash: ${receipt.transactionHash}, Block Hash: ${receipt.blockHash}`);
                results.push({ log, transactionHash: receipt.transactionHash, blockHash: receipt.blockHash });
            } else {
                console.log(`Log với recordId ${log.recordId} đã tồn tại trong blockchain, bỏ qua.`);
            }
        }

        const latestLogs = await getLatestLogs();
        return { latestLogs };
    } catch (error) {
        console.error('Quá trình đồng bộ thất bại:', error);
        throw error;
    }
};

// Thiết lập đồng bộ định kỳ mỗi 5000 giây
setInterval(async () => {
    try {
        await connectDB();
        await runSync();
    } catch (error) {
        console.error('Lỗi trong quá trình đồng bộ:', error);
    }
}, 5000000);

module.exports = {
    connectDB,
    web3,
    contract,
    syncBlockchainLogs,
    addLogToBlockchain,
    getLatestLogs,
    runSync
};
