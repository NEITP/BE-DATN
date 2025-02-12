import db from "../models/index"; // Import model từ thư mục models
require('dotenv').config(); // Load biến môi trường từ file .env
const { Op } = require("sequelize"); // Import toán tử Op từ Sequelize để hỗ trợ tìm kiếm

// Hàm tạo mới loại hình vận chuyển (TypeShip)
let createNewTypeShip = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem các tham số đầu vào có bị thiếu không
            if (!data.type || !data.price) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tạo một loại hình vận chuyển mới trong database
                await db.TypeShip.create({
                    type: data.type,
                    price: data.price
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

// Hàm lấy thông tin chi tiết loại hình vận chuyển theo ID
let getDetailTypeshipById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tìm loại hình vận chuyển theo ID trong database
                let res = await db.TypeShip.findOne({
                    where: { id: id },
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

// Hàm lấy danh sách tất cả các loại hình vận chuyển (có hỗ trợ phân trang và tìm kiếm)
let getAllTypeship = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {}

            // Nếu có limit và offset, thêm vào objectFilter để phân trang
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }

            // Nếu có keyword, tìm kiếm theo tên loại vận chuyển
            if (data.keyword !== '') {
                objectFilter.where = { ...objectFilter.where, type: { [Op.substring]: data.keyword } }
            }

            // Tìm kiếm tất cả các loại hình vận chuyển phù hợp với điều kiện lọc
            let res = await db.TypeShip.findAndCountAll(objectFilter)

            resolve({
                errCode: 0,
                data: res.rows, // Danh sách các loại hình vận chuyển
                count: res.count // Tổng số lượng loại hình vận chuyển tìm được
            })
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm cập nhật thông tin loại hình vận chuyển
let updateTypeship = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem dữ liệu đầu vào có đầy đủ không
            if (!data.id || !data.type || !data.price) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tìm loại hình vận chuyển theo ID
                let typeship = await db.TypeShip.findOne({
                    where: { id: data.id },
                    raw: false
                })

                if (typeship) {
                    // Cập nhật thông tin loại hình vận chuyển
                    typeship.type = data.type;
                    typeship.price = data.price;

                    // Lưu thay đổi vào database
                    await typeship.save()
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

// Hàm xóa loại hình vận chuyển
let deleteTypeship = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tìm loại hình vận chuyển theo ID
                let typeship = await db.TypeShip.findOne({
                    where: { id: data.id }
                })

                if (typeship) {
                    // Xóa loại hình vận chuyển khỏi database
                    await db.TypeShip.destroy({
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
    createNewTypeShip: createNewTypeShip,
    getDetailTypeshipById: getDetailTypeshipById,
    getAllTypeship: getAllTypeship,
    updateTypeship: updateTypeship,
    deleteTypeship: deleteTypeship
}
