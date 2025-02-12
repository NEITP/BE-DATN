import blockchainLogService from "../services/blockchainLogService"; // Import service xử lý dữ liệu blockchain log
import { contract, web3Testnet, _getLatestLogsTestnet } from "../config/connectDB"; // Import contract từ file config để tương tác với blockchain

// Hàm lấy tất cả blockchainlog từ service
let getAllBlockchainLog = async (req, res) => {
    try {
        let data = await blockchainLogService.getAllBlockchainLog(req.query); // Gọi service để lấy dữ liệu log, truyền tham số truy vấn từ request
        return res.status(200).json(data); // Trả về dữ liệu log với mã trạng thái HTTP 200 (OK)
    } catch (error) {
        console.log(error); // Ghi log lỗi vào console để debug
        return res.status(500).json({ // Trả về mã lỗi 500 (Internal Server Error) nếu có lỗi xảy ra
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy tất cả blockchainlog trên Ganache
let getAllBlockchainLogLC = async (req, res) => {
    try {
        let data = await blockchainLogService.getAllBlockchainLogLC(contract); // Gọi service lấy dữ liệu log liên quan đến smart contract
        return res.status(200).json(data); // Trả về dữ liệu log với mã trạng thái HTTP 200 (OK)
    } catch (error) {
        console.log(error); // Ghi log lỗi vào console để debug
        return res.status(500).json({ // Trả về mã lỗi 500 nếu có lỗi xảy ra
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

// // Hàm lấy tất cả blockchainlog trên mạng testnet
// let getLatestLogsTestnetHandler = async (req, res) => {
//     try {
//         let events = await contract.getPastEvents("LogAdded", {
//             fromBlock: 0,
//             toBlock: "latest",
//         });

//         let logs = events.map(event => ({
//             logId: event.returnValues.logId,
//             tableName: event.returnValues.tableName,
//             recordId: event.returnValues.recordId,
//             action: event.returnValues.action,
//             hash: event.returnValues.hash,
//             senderAddress: event.returnValues.senderAddress,
//             timestamp: event.returnValues.timestamp
//         }));

//         return res.status(200).json(logs);
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             errCode: -1,
//             errMessage: "Error from server",
//         });
//     }
// };


// Xuất các hàm để sử dụng trong router hoặc module khác
export default {
    getAllBlockchainLog: getAllBlockchainLog,
    getAllBlockchainLogLC: getAllBlockchainLogLC,
    // getLatestLogsTestnetHandler
};
