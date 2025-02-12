import db from "../models/index";
require('dotenv').config();
const { Op } = require("sequelize");

// Hàm tạo một banner mới
let createNewBanner = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!data.image || !data.description || !data.name) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                // Tạo banner mới trong database
                await db.Banner.create({
                    name: data.name,
                    description: data.description,
                    image: data.image,
                    statusId: 'S1' // Mặc định trạng thái là S1 (hoạt động)
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

// Hàm lấy thông tin chi tiết của một banner dựa trên ID
let getDetailBanner = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                let res = await db.Banner.findOne({
                    where: { id: id }
                });
                // Chuyển đổi ảnh từ dạng base64 về binary để hiển thị đúng
                if (res && res.image) {
                    res.image = new Buffer(res.image, 'base64').toString('binary');
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

// Hàm lấy danh sách tất cả các banner với phân trang và tìm kiếm
let getAllBanner = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {
                where: { statusId: 'S1' }, // Chỉ lấy các banner đang hoạt động
            };
            // Áp dụng giới hạn số lượng kết quả và phân trang
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit;
                objectFilter.offset = +data.offset;
            }
            // Nếu có từ khóa tìm kiếm, lọc theo tên banner
            if (data.keyword !== '') objectFilter.where = { ...objectFilter.where, name: { [Op.substring]: data.keyword } };

            let res = await db.Banner.findAndCountAll(objectFilter);

            // Chuyển đổi ảnh về dạng binary
            if (res.rows && res.rows.length > 0) {
                res.rows.map(item => item.image = new Buffer(item.image, 'base64').toString('binary'));
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

// Hàm cập nhật thông tin của một banner
let updateBanner = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.image || !data.description || !data.name) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                let banner = await db.Banner.findOne({
                    where: { id: data.id },
                    raw: false
                });
                if (banner) {
                    // Cập nhật thông tin banner
                    banner.name = data.name;
                    banner.description = data.description;
                    banner.image = data.image;
                    await banner.save();
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

// Hàm xóa một banner
let deleteBanner = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                });
            } else {
                let banner = await db.Banner.findOne({
                    where: { id: data.id }
                });
                if (banner) {
                    await db.Banner.destroy({
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

// Xuất các hàm để sử dụng ở các file khác
module.exports = {
    createNewBanner: createNewBanner,
    getDetailBanner: getDetailBanner,
    getAllBanner: getAllBanner,
    updateBanner: updateBanner,
    deleteBanner: deleteBanner
};
