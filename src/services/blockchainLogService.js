'use strict';

const { Sequelize, Op } = require('sequelize');
const db = require('../models/index');

/**
 * Lấy tất cả các log từ cơ sở dữ liệu MySQL.
 * Hỗ trợ phân trang và tìm kiếm theo từ khóa.
 *
 * @param {Object} data - Dữ liệu đầu vào, bao gồm limit, offset và keyword.
 * @returns {Promise<Object>} - Kết quả bao gồm danh sách log, tổng số lượng và metadata.
 */
let getAllBlockchainLog = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {
                attributes: { exclude: [] }, // Không loại bỏ bất kỳ cột nào
                order: [['createdAt', 'DESC']], // Sắp xếp theo thời gian tạo mới nhất
                raw: true, // Trả về dữ liệu ở dạng JSON thuần
                nest: true // Giữ cấu trúc dữ liệu lồng nhau
            };

            // Xử lý phân trang an toàn nếu có limit và offset
            if (data.limit !== undefined && data.offset !== undefined) {
                objectFilter.limit = +data.limit; // Giới hạn số lượng bản ghi trả về
                objectFilter.offset = +data.offset; // Bỏ qua số lượng bản ghi đã lấy trước đó
            }

            // Xử lý tìm kiếm theo từ khóa
            if (data.keyword && typeof data.keyword === 'string' && data.keyword.trim() !== '') {
                const searchTerm = data.keyword.trim();
                objectFilter.where = {
                    [Op.or]: [
                        { action: { [Op.substring]: searchTerm } }, // Tìm kiếm trong cột action
                        { tableName: { [Op.substring]: searchTerm } } // Tìm kiếm trong cột tableName
                    ]
                };
            }

            // Truy vấn cơ sở dữ liệu
            let res = await db.BlockchainLog.findAndCountAll(objectFilter);
            resolve({
                errCode: 0,
                data: res.rows, // Danh sách log
                count: res.count, // Tổng số log tìm thấy
                meta: {
                    total: res.count, // Tổng số bản ghi
                    limit: objectFilter.limit, // Số lượng bản ghi trên mỗi trang
                    offset: objectFilter.offset // Vị trí bắt đầu của trang hiện tại
                }
            });
        } catch (error) {
            reject({
                errCode: -1,
                errMessage: error.message || 'Lỗi không xác định', // Trả về thông báo lỗi
                ...(process.env.NODE_ENV === 'development' && { fullError: error }) // Hiển thị lỗi đầy đủ trong môi trường development
            });
        }
    });
};

/**
 * Lấy tất cả log từ blockchain bằng cách gọi smart contract.
 *
 * @param {Object} contract - Đối tượng smart contract để gọi các phương thức.
 * @returns {Promise<Array>} - Danh sách các log từ blockchain.
 */
const getAllBlockchainLogLC = async (contract) => {
    try {
        // Lấy tổng số log trên blockchain
        const logsCount = await contract.methods.getLogCount().call();
        if (logsCount === 0) {
            console.log('Không có log nào trong blockchain');
            return [];
        }

        const logs = [];

        // Lấy toàn bộ sự kiện LogAdded để trích xuất transactionHash, blockHash và senderAddress
        const events = await contract.getPastEvents('LogAdded', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        for (let i = 0; i < logsCount; i++) {
            const log = await contract.methods.getLog(i).call();

            // Tìm sự kiện tương ứng với log dựa trên hash
            let transactionHash = 'Không tìm thấy';
            let blockHash = 'Không tìm thấy';
            let address = 'Không tìm thấy';

            for (const event of events) {
                if (event.returnValues.hash === log.hash) {
                    transactionHash = event.transactionHash;
                    blockHash = event.blockHash;
                    address = event.returnValues.senderAddress; // Lấy địa chỉ ví gửi log
                    break;
                }
            }

            // Thêm log vào danh sách trả về
            logs.push({
                tableName: log.tableName,
                recordId: BigInt(log.recordId).toString(), // Chuyển đổi recordId sang kiểu chuỗi
                action: log.action,
                hash: log.hash,
                transactionHash, // Mã giao dịch blockchain
                blockHash, // Mã block chứa giao dịch
                address, // Địa chỉ người gửi giao dịch
                timestamp: new Date(Number(log.timestamp) * 1000).toISOString(), // Chuyển đổi timestamp sang ISO format
            });
        }
        return logs;
    } catch (error) {
        console.error('Lỗi khi lấy tất cả log từ blockchain:', error);
        throw error;
    }
};

// Xuất các hàm để sử dụng trong các phần khác của ứng dụng
export default {
    getAllBlockchainLog,
    getAllBlockchainLogLC,
};
