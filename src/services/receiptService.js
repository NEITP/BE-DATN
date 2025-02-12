import db from "../models/index"; // Import model từ thư mục models
require('dotenv').config(); // Load biến môi trường từ file .env
const { Op } = require("sequelize"); // Import Op từ Sequelize để thực hiện các điều kiện truy vấn

/**
 * Tạo phiếu nhập hàng mới
 * @param {Object} data - Dữ liệu đầu vào chứa userId, supplierId, productDetailSizeId, quantity, price
 * @returns {Promise<Object>}
 */
let createNewReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các tham số bắt buộc
            if (!data.userId || !data.supplierId || !data.productDetailSizeId || !data.quantity || !data.price) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tạo phiếu nhập hàng mới trong bảng Receipt
                let receipt = await db.Receipt.create({
                    userId: data.userId,
                    supplierId: data.supplierId
                });

                // Nếu tạo thành công, tạo chi tiết phiếu nhập hàng trong bảng ReceiptDetail
                if (receipt) {
                    await db.ReceiptDetail.create({
                        receiptId: receipt.id,
                        productDetailSizeId: data.productDetailSizeId,
                        quantity: data.quantity,
                        price: data.price,
                    });
                }

                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Thêm chi tiết vào phiếu nhập hàng đã tồn tại
 * @param {Object} data - Dữ liệu đầu vào chứa receiptId, productDetailSizeId, quantity, price
 * @returns {Promise<Object>}
 */
let createNewReceiptDetail = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra tham số bắt buộc
            if (!data.receiptId || !data.productDetailSizeId || !data.quantity || !data.price) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Thêm chi tiết phiếu nhập hàng mới vào ReceiptDetail
                await db.ReceiptDetail.create({
                    receiptId: data.receiptId,
                    productDetailSizeId: data.productDetailSizeId,
                    quantity: data.quantity,
                    price: data.price,
                });

                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Lấy chi tiết phiếu nhập hàng theo ID
 * @param {number} id - ID của phiếu nhập hàng
 * @returns {Promise<Object>}
 */
let getDetailReceiptById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra ID hợp lệ
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tìm phiếu nhập hàng theo ID
                let res = await db.Receipt.findOne({
                    where: { id: id }
                });

                // Lấy danh sách chi tiết phiếu nhập hàng
                res.receiptDetail = await db.ReceiptDetail.findAll({ where: { receiptId: id } });

                // Nếu có chi tiết phiếu nhập hàng, lấy thêm thông tin chi tiết
                if (res.receiptDetail && res.receiptDetail.length > 0) {
                    for (let i = 0; i < res.receiptDetail.length; i++) {
                        let productDetailSize = await db.ProductDetailSize.findOne({
                            where: { id: res.receiptDetail[i].productDetailSizeId },
                            include: [
                                { model: db.Allcode, as: 'sizeData', attributes: ['value', 'code'] }, // Lấy thông tin size sản phẩm
                            ],
                            raw: true,
                            nest: true
                        });

                        res.receiptDetail[i].productDetailSizeData = productDetailSize;

                        // Lấy thông tin chi tiết sản phẩm
                        res.receiptDetail[i].productDetailData = await db.ProductDetail.findOne({
                            where: { id: productDetailSize.productdetailId }
                        });

                        // Lấy thông tin sản phẩm
                        res.receiptDetail[i].productData = await db.Product.findOne({
                            where: { id: res.receiptDetail[i].productDetailData.productId }
                        });
                    }
                }

                resolve({
                    errCode: 0,
                    data: res
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Lấy danh sách tất cả phiếu nhập hàng với phân trang
 * @param {Object} data - Dữ liệu đầu vào chứa limit và offset
 * @returns {Promise<Object>}
 */
let getAllReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {};

            // Áp dụng limit và offset nếu có
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit;
                objectFilter.offset = +data.offset;
            }

            // Lấy danh sách phiếu nhập hàng
            let res = await db.Receipt.findAndCountAll(objectFilter);

            // Lấy thêm thông tin user và nhà cung cấp cho từng phiếu nhập hàng
            for (let i = 0; i < res.rows.length; i++) {
                res.rows[i].userData = await db.User.findOne({ where: { id: res.rows[i].userId } });
                res.rows[i].supplierData = await db.Supplier.findOne({ where: { id: res.rows[i].supplierId } });
            }

            resolve({
                errCode: 0,
                data: res.rows,
                count: res.count
            });
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Cập nhật thông tin phiếu nhập hàng
 * @param {Object} data - Dữ liệu đầu vào chứa id, date, supplierId
 * @returns {Promise<Object>}
 */
let updateReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra tham số đầu vào
            if (!data.id || !data.date || !data.supplierId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tìm phiếu nhập hàng theo ID
                let receipt = await db.Receipt.findOne({
                    where: { id: data.id },
                    raw: false
                });

                if (receipt) {
                    // Cập nhật nhà cung cấp
                    receipt.supplierId = data.supplierId;
                    await receipt.save();

                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Xóa phiếu nhập hàng theo ID
 * @param {Object} data - Dữ liệu đầu vào chứa id
 * @returns {Promise<Object>}
 */
let deleteReceipt = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra tham số ID
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tìm phiếu nhập hàng theo ID
                let receipt = await db.Receipt.findOne({
                    where: { id: data.id }
                });

                if (receipt) {
                    // Xóa phiếu nhập hàng khỏi database
                    await db.Receipt.destroy({
                        where: { id: data.id }
                    });

                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Xuất các hàm dưới dạng module
module.exports = {
    createNewReceipt,
    getDetailReceiptById,
    getAllReceipt,
    updateReceipt,
    deleteReceipt,
    createNewReceiptDetail
};
