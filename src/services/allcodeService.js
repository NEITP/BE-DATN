import db from "../models/index";
const { Op } = require("sequelize"); // Import Sequelize operators để hỗ trợ truy vấn điều kiện

// Hàm tạo mới một bản ghi Allcode
let handleCreateNewAllCode = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các trường bắt buộc
            if (!data.type || !data.value || !data.code) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                // Kiểm tra xem mã code đã tồn tại hay chưa
                let res = await db.Allcode.findOne({
                    where: { code: data.code }
                })

                if (res) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Mã code đã tồn tại !'
                    })
                } else {
                    // Nếu chưa tồn tại thì tạo mới
                    await db.Allcode.create({
                        type: data.type,
                        value: data.value,
                        code: data.code
                    })
                }

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

// Hàm lấy danh sách Allcode theo loại type
let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                })
                resolve({
                    errCode: 0,
                    data: allcode
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm cập nhật thông tin Allcode
let handleUpdateAllCode = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.value || !data.code || !data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                // Tìm Allcode theo id
                let res = await db.Allcode.findOne({
                    where: { id: data.id },
                    raw: false // Cho phép cập nhật dữ liệu
                })
                if (res) {
                    res.value = data.value
                    res.code = data.code
                    await res.save(); // Lưu cập nhật
                }
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

// Hàm lấy chi tiết Allcode theo id
let getDetailAllCodeById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                let data = await db.Allcode.findOne({
                    where: { id: id }
                })
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm xóa Allcode theo id
let handleDeleteAllCode = (allcodeId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!allcodeId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing required parameters !`
                })
            } else {
                // Kiểm tra Allcode có tồn tại hay không
                let foundAllCode = await db.Allcode.findOne({
                    where: { id: allcodeId }
                })
                if (!foundAllCode) {
                    resolve({
                        errCode: 2,
                        errMessage: `The allCode isn't exist`
                    })
                }
                // Xóa Allcode
                await db.Allcode.destroy({
                    where: { id: allcodeId }
                })
                resolve({
                    errCode: 0,
                    message: `The allCode is deleted`
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy danh sách Allcode có phân trang và tìm kiếm theo keyword
let getListAllCodeService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {
                where: { type: data.type },
            }
            // Kiểm tra nếu có giới hạn và phân trang
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }
            // Tìm kiếm theo keyword nếu có
            if (data.keyword !== '') {
                objectFilter.where = {
                    ...objectFilter.where,
                    value: { [Op.substring]: data.keyword }
                }
            }
            // Truy vấn dữ liệu theo điều kiện
            let allcode = await db.Allcode.findAndCountAll(objectFilter)
            resolve({
                errCode: 0,
                data: allcode.rows,
                count: allcode.count
            })
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy danh sách danh mục blog (Allcode type = blog) kèm số lượng bài viết trong từng danh mục
let getAllCategoryBlog = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                // Lấy danh sách Allcode theo type
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                })

                // Duyệt từng danh mục và đếm số lượng bài viết thuộc danh mục đó
                for (let i = 0; i < allcode.length; i++) {
                    let blog = await db.Blog.findAll({
                        where: { subjectId: allcode[i].code }
                    })
                    if (blog)
                        allcode[i].countPost = blog.length // Thêm số lượng bài viết vào danh mục
                }

                resolve({
                    errCode: 0,
                    data: allcode
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Xuất các hàm để sử dụng trong các file khác
module.exports = {
    handleCreateNewAllCode,
    getAllCodeService,
    handleUpdateAllCode,
    getDetailAllCodeById,
    handleDeleteAllCode,
    getListAllCodeService,
    getAllCategoryBlog
}
