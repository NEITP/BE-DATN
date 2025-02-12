import db from "../models/index";
require('dotenv').config();
const { Op } = require("sequelize");

// Hàm tạo blog mới
let createNewBlog = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các tham số bắt buộc
            if (!data.title || !data.contentMarkdown || !data.contentHTML || !data.image || !data.subjectId || !data.userId) {
                resolve({ errCode: 1, errMessage: 'Missing required parameter !' })
            } else {
                // Tạo blog mới trong cơ sở dữ liệu
                await db.Blog.create({
                    shortdescription: data.shortdescription,
                    title: data.title,
                    subjectId: data.subjectId,
                    statusId: 'S1', // Mặc định trạng thái là S1
                    image: data.image,
                    contentMarkdown: data.contentMarkdown,
                    contentHTML: data.contentHTML,
                    userId: data.userId,
                    view: 0 // Số lượt xem ban đầu là 0
                })
                resolve({ errCode: 0, errMessage: 'ok' })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy thông tin chi tiết blog theo ID
let getDetailBlogById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({ errCode: 1, errMessage: 'Missing required parameter !' })
            } else {
                let blog = await db.Blog.findOne({ where: { id: id }, raw: false })

                // Tăng số lượt xem blog
                blog.view = blog.view + 1;
                await blog.save()

                let res = await db.Blog.findOne({
                    where: { id: id },
                    include: [
                        { model: db.Allcode, as: 'subjectData', attributes: ['value', 'code'] },
                    ],
                    raw: true,
                    nest: true
                })
                res.userData = await db.User.findOne({ where: { id: res.userId } })

                // Giải mã ảnh từ dạng base64
                if (res && res.image) {
                    res.image = new Buffer(res.image, 'base64').toString('binary');
                }
                resolve({ errCode: 0, data: res })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy danh sách tất cả blog
let getAllBlog = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {
                where: { statusId: 'S1' },
                include: [
                    { model: db.Allcode, as: 'subjectData', attributes: ['value', 'code'] },
                ],
                raw: true,
                nest: true
            }
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }
            if (data.subjectId && data.subjectId !== '') {
                objectFilter.where = { ...objectFilter.where, subjectId: data.subjectId }
            }
            if (data.keyword !== '') {
                objectFilter.where = { ...objectFilter.where, title: { [Op.substring]: data.keyword } }
            }
            let res = await db.Blog.findAndCountAll(objectFilter)

            // Lặp qua danh sách blog để bổ sung thông tin người dùng và bình luận
            if (res.rows && res.rows.length > 0) {
                for (let i = 0; i < res.rows.length; i++) {
                    res.rows[i].image = new Buffer(res.rows[i].image, 'base64').toString('binary')
                    res.rows[i].userData = await db.User.findOne({ where: { id: res.rows[i].userId } })
                    res.rows[i].commentData = await db.Comment.findAll({ where: { blogId: res.rows[i].id } })
                }
            }
            resolve({ errCode: 0, data: res.rows, count: res.count })
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm cập nhật blog
let updateBlog = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.title || !data.contentMarkdown || !data.contentHTML || !data.image || !data.subjectId) {
                resolve({ errCode: 1, errMessage: 'Missing required parameter !' })
            } else {
                let blog = await db.Blog.findOne({ where: { id: data.id }, raw: false })
                if (blog) {
                    blog.title = data.title;
                    blog.contentMarkdown = data.contentMarkdown;
                    blog.contentHTML = data.contentHTML;
                    blog.image = data.image;
                    blog.subjectId = data.subjectId;
                    blog.shortdescription = data.shortdescription;

                    await blog.save()
                    resolve({ errCode: 0, errMessage: 'ok' })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm xóa blog
let deleteBlog = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({ errCode: 1, errMessage: 'Missing required parameter !' })
            } else {
                let blog = await db.Blog.findOne({ where: { id: data.id } })
                if (blog) {
                    await db.Blog.destroy({ where: { id: data.id } })
                    resolve({ errCode: 0, errMessage: 'ok' })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy danh sách blog nổi bật
let getFeatureBlog = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let res = await db.Blog.findAll({
                where: { statusId: 'S1' },
                include: [
                    { model: db.Allcode, as: 'subjectData', attributes: ['value', 'code'] },
                ],
                order: [['view', 'DESC']], // Sắp xếp theo lượt xem giảm dần
                limit: +data.limit,
                raw: true,
                nest: true
            })
            resolve({ errCode: 0, data: res })
        } catch (error) {
            reject(error)
        }
    })
}

// Xuất các hàm ra module
module.exports = {
    createNewBlog,
    getDetailBlogById,
    getAllBlog,
    updateBlog,
    deleteBlog,
    getFeatureBlog
}
