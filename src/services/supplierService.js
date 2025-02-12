import db from "../models/index";
require('dotenv').config();
const { Op } = require("sequelize"); // Import toán tử Op của Sequelize để hỗ trợ tìm kiếm

// Hàm tạo mới nhà cung cấp
let createNewSupplier = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem các tham số đầu vào có bị thiếu không
            if (!data.name || !data.address || !data.phonenumber || !data.email) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tạo một nhà cung cấp mới trong database
                await db.Supplier.create({
                    name: data.name,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    email: data.email,
                })
                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy thông tin chi tiết nhà cung cấp theo ID
let getDetailSupplierById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tìm nhà cung cấp trong database theo ID
                let res = await db.Supplier.findOne({
                    where: { id: id }
                })
                resolve({
                    errCode: 0,
                    data: res
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy danh sách tất cả nhà cung cấp (có hỗ trợ phân trang và tìm kiếm)
let getAllSupplier = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {}

            // Nếu có limit và offset, thêm vào objectFilter để phân trang
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }

            // Nếu có keyword, tìm kiếm theo tên nhà cung cấp
            if (data.keyword !== '') {
                objectFilter.where = { ...objectFilter.where, name: { [Op.substring]: data.keyword } }
            }

            // Tìm kiếm tất cả các nhà cung cấp phù hợp với điều kiện lọc
            let res = await db.Supplier.findAndCountAll(objectFilter)

            resolve({
                errCode: 0,
                data: res.rows, // Danh sách các nhà cung cấp
                count: res.count // Tổng số lượng nhà cung cấp tìm được
            })
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm cập nhật thông tin nhà cung cấp
let updateSupplier = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem dữ liệu đầu vào có đầy đủ không
            if (!data.id || !data.name || !data.address || !data.phonenumber || !data.email) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tìm nhà cung cấp theo ID
                let supplier = await db.Supplier.findOne({
                    where: { id: data.id },
                    raw: false
                })

                if (supplier) {
                    // Cập nhật thông tin nhà cung cấp
                    supplier.name = data.name;
                    supplier.address = data.address;
                    supplier.phonenumber = data.phonenumber;
                    supplier.email = data.email;

                    // Lưu thay đổi vào database
                    await supplier.save()
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm xóa nhà cung cấp
let deleteSupplier = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tìm nhà cung cấp theo ID
                let supplier = await db.Supplier.findOne({
                    where: { id: data.id }
                })

                if (supplier) {
                    // Xóa nhà cung cấp khỏi database
                    await db.Supplier.destroy({
                        where: { id: data.id }
                    })
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Xuất các function để sử dụng ở các module khác
module.exports = {
    createNewSupplier: createNewSupplier,
    getDetailSupplierById: getDetailSupplierById,
    getAllSupplier: getAllSupplier,
    updateSupplier: updateSupplier,
    deleteSupplier: deleteSupplier
}
