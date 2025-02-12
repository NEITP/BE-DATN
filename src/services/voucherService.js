import db from "../models/index"; // Import mô hình cơ sở dữ liệu
require('dotenv').config(); // Load các biến môi trường từ file .env
const { Op } = require("sequelize"); // Import các toán tử từ Sequelize

//================== TYPE VOUCHER ====================//

// Hàm tạo mới một loại voucher
let createNewTypeVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem dữ liệu đầu vào có đầy đủ không
            if (!data.typeVoucher || !data.value || !data.maxValue || !data.minValue) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tạo một bản ghi mới trong bảng TypeVoucher
                await db.TypeVoucher.create({
                    typeVoucher: data.typeVoucher,
                    value: data.value,
                    maxValue: data.maxValue,
                    minValue: data.minValue
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

// Hàm lấy thông tin chi tiết của một loại voucher theo ID
let getDetailTypeVoucherById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu ID không được cung cấp
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tìm kiếm voucher theo ID và lấy thêm dữ liệu liên quan từ bảng Allcode
                let res = await db.TypeVoucher.findOne({
                    where: { id: id },
                    include: [
                        { model: db.Allcode, as: 'typeVoucherData', attributes: ['value', 'code'] }
                    ],
                    raw: true,
                    nest: true
                });

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

// Hàm lấy danh sách tất cả các loại voucher với phân trang
let getAllTypeVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Định nghĩa bộ lọc cho truy vấn
            let objectFilter = {
                include: [
                    { model: db.Allcode, as: 'typeVoucherData', attributes: ['value', 'code'] }
                ],
                raw: true,
                nest: true
            };

            // Nếu có limit và offset (phân trang), thêm vào bộ lọc
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit; // Ép kiểu sang số nguyên
                objectFilter.offset = +data.offset;
            }

            // Thực hiện truy vấn lấy danh sách loại voucher
            let res = await db.TypeVoucher.findAndCountAll(objectFilter);

            resolve({
                errCode: 0,
                data: res.rows, // Danh sách các loại voucher
                count: res.count // Tổng số bản ghi
            });
        } catch (error) {
            reject(error);
        }
    });
};

// Hàm cập nhật thông tin của một loại voucher
let updateTypeVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem dữ liệu có đầy đủ không
            if (!data.id || !data.typeVoucher || !data.value || !data.maxValue || !data.minValue) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tìm kiếm voucher theo ID
                let typevoucher = await db.TypeVoucher.findOne({
                    where: { id: data.id },
                    raw: false
                });

                // Nếu voucher tồn tại, cập nhật thông tin
                if (typevoucher) {
                    typevoucher.typeVoucher = data.typeVoucher;
                    typevoucher.value = data.value;
                    typevoucher.maxValue = data.maxValue;
                    typevoucher.minValue = data.minValue;

                    await typevoucher.save(); // Lưu thay đổi vào DB

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

// Hàm xóa một loại voucher
let deleteTypeVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem ID có được cung cấp không
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tìm kiếm voucher theo ID
                let typevoucher = await db.TypeVoucher.findOne({
                    where: { id: data.id }
                });

                // Nếu voucher tồn tại, thực hiện xóa
                if (typevoucher) {
                    await db.TypeVoucher.destroy({
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
// Hàm lấy danh sách tất cả các loại voucher
let getSelectTypeVoucher = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let res = await db.TypeVoucher.findAll({
                include: [
                    { model: db.Allcode, as: 'typeVoucherData', attributes: ['value', 'code'] }
                ],
                raw: true,
                nest: true
            });

            resolve({
                errCode: 0,
                data: res
            });

        } catch (error) {
            reject(error);
        }
    });
};

//======================= VOUCHER =======================//

// Hàm tạo mới một voucher
let createNewVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem dữ liệu có đầy đủ không
            if (!data.fromDate || !data.toDate || !data.typeVoucherId || !data.amount || !data.codeVoucher) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tạo một voucher mới trong database
                await db.Voucher.create({
                    fromDate: data.fromDate,
                    toDate: data.toDate,
                    typeVoucherId: data.typeVoucherId,
                    amount: data.amount,
                    codeVoucher: data.codeVoucher
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

// Hàm lấy chi tiết một voucher theo ID
let getDetailVoucherById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu ID không được cung cấp
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tìm voucher theo ID
                let res = await db.Voucher.findOne({
                    where: { id: id },
                });

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

// Hàm lấy danh sách tất cả các voucher (hỗ trợ phân trang)
let getAllVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {
                include: [
                    {
                        model: db.TypeVoucher, as: 'typeVoucherOfVoucherData',
                        include: [
                            { model: db.Allcode, as: 'typeVoucherData', attributes: ['value', 'code'] }
                        ],
                    },
                ],
                raw: true,
                nest: true
            };

            // Nếu có limit và offset (phân trang), thêm vào bộ lọc
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit; // Ép kiểu sang số nguyên
                objectFilter.offset = +data.offset;
            }

            // Thực hiện truy vấn lấy danh sách voucher
            let res = await db.Voucher.findAndCountAll(objectFilter);

            // Kiểm tra nếu có kết quả, thêm số lượng voucher đã sử dụng
            if (res) {
                for (let i = 0; i < res.rows.length; i++) {
                    let voucherUsed = await db.VoucherUsed.findAll({
                        where: {
                            voucherId: res.rows[i].id,
                            status: 1 // Chỉ đếm số voucher đã sử dụng (status = 1)
                        }
                    });

                    // Gán số lượng voucher đã sử dụng vào đối tượng voucher
                    res.rows[i].usedAmount = voucherUsed.length;
                }
            }

            resolve({
                errCode: 0,
                data: res.rows, // Danh sách các voucher
                count: res.count // Tổng số bản ghi
            });

        } catch (error) {
            reject(error);
        }
    });
};

// Hàm cập nhật thông tin một voucher
let updateVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem dữ liệu có đầy đủ không
            if (!data.id || !data.fromDate || !data.toDate || !data.typeVoucherId || !data.amount || !data.codeVoucher) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tìm kiếm voucher theo ID
                let voucher = await db.Voucher.findOne({
                    where: { id: data.id },
                    raw: false
                });

                // Nếu voucher tồn tại, cập nhật thông tin
                if (voucher) {
                    voucher.fromDate = data.fromDate;
                    voucher.toDate = data.toDate;
                    voucher.typeVoucherId = data.typeVoucherId;
                    voucher.amount = data.amount;
                    voucher.codeVoucher = data.codeVoucher;

                    await voucher.save(); // Lưu thay đổi vào database

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

// Hàm xóa một voucher
let deleteVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu ID không được cung cấp
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tìm kiếm voucher theo ID
                let voucher = await db.Voucher.findOne({
                    where: { id: data.id }
                });

                // Nếu voucher tồn tại, thực hiện xóa
                if (voucher) {
                    await db.Voucher.destroy({
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
// Hàm lưu voucher vào kho của người dùng
let saveUserVoucher = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu thiếu dữ liệu đầu vào
            if (!data.voucherId || !data.userId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Kiểm tra xem người dùng đã lưu voucher này chưa
                let voucherused = await db.VoucherUsed.findOne({
                    where: { voucherId: data.voucherId, userId: data.userId },
                    raw: false
                });

                // Nếu voucher đã được lưu, trả về thông báo lỗi
                if (voucherused) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Đã lưu voucher này trong kho!'
                    });
                } else {
                    // Nếu chưa có, tạo mới một bản ghi trong bảng VoucherUsed
                    await db.VoucherUsed.create({
                        voucherId: data.voucherId,
                        userId: data.userId
                    });

                    // Tìm voucher tương ứng và lưu lại thay đổi (nếu cần)
                    let voucher = await db.Voucher.findOne({ where: { id: data.voucherId }, raw: false });
                    await voucher.save();

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

// Hàm lấy tất cả voucher của một người dùng theo userId
let getAllVoucherByUserId = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu thiếu ID người dùng
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Thiết lập bộ lọc tìm kiếm voucher của người dùng với status = 0 (chưa sử dụng)
                let objectFilter = {
                    where: { userId: data.id, status: 0 }
                };

                // Nếu có thông tin phân trang (limit, offset), thêm vào bộ lọc
                if (data.limit && data.offset) {
                    objectFilter.limit = +data.limit;
                    objectFilter.offset = +data.offset;
                }

                // Tìm danh sách voucher đã lưu của người dùng
                let res = await db.VoucherUsed.findAndCountAll(objectFilter);

                // Lặp qua từng voucher để lấy thêm thông tin chi tiết
                for (let i = 0; i < res.rows.length; i++) {
                    res.rows[i].voucherData = await db.Voucher.findOne({
                        where: { id: res.rows[i].voucherId },
                        include: [
                            {
                                model: db.TypeVoucher, as: 'typeVoucherOfVoucherData',
                                include: [
                                    { model: db.Allcode, as: 'typeVoucherData', attributes: ['value', 'code'] }
                                ]
                            }
                        ],
                        raw: true,
                        nest: true
                    });

                    // Đếm số lần voucher này đã được sử dụng
                    let voucherUsedCount = await db.VoucherUsed.findAll({
                        where: {
                            voucherId: res.rows[i].voucherData.id,
                            status: 1 // Chỉ đếm các voucher đã sử dụng
                        }
                    });

                    // Gán số lượng voucher đã sử dụng vào đối tượng voucher
                    res.rows[i].voucherData.usedAmount = voucherUsedCount.length;
                }

                resolve({
                    errCode: 0,
                    data: res.rows, // Danh sách voucher của người dùng
                    count: res.count // Tổng số voucher của người dùng
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    createNewTypeVoucher: createNewTypeVoucher,
    getDetailTypeVoucherById: getDetailTypeVoucherById,
    getAllTypeVoucher: getAllTypeVoucher,
    updateTypeVoucher: updateTypeVoucher,
    deleteTypeVoucher: deleteTypeVoucher,
    createNewVoucher: createNewVoucher,
    getDetailVoucherById: getDetailVoucherById,
    getAllVoucher: getAllVoucher,
    updateVoucher: updateVoucher,
    deleteVoucher: deleteVoucher,
    getSelectTypeVoucher: getSelectTypeVoucher,
    saveUserVoucher: saveUserVoucher,
    getAllVoucherByUserId: getAllVoucherByUserId
}