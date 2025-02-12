import allcodeService from '../services/allcodeService';

// Tạo một mã code mới
let handleCreateNewAllCode = async (req, res) => {
    try {
        // Gọi service để tạo code mới từ dữ liệu req.body
        let data = await allcodeService.handleCreateNewAllCode(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Lấy tất cả mã code theo type
let getAllCodeService = async (req, res) => {
    try {
        // Gọi service để lấy code mới từ dữ liệu req.body.type
        let data = await allcodeService.getAllCodeService(req.query.type);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Lấy tất cả danh mục blog theo type
let getAllCategoryBlog = async (req, res) => {
    try {
        // Gọi service để lấy blog mới từ dữ liệu req.body.type
        let data = await allcodeService.getAllCategoryBlog(req.query.type);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Cập nhật thông tin mã code
let handleUpdateAllCode = async (req, res) => {
    try {
        // Gọi service để lấy thông tin code mới từ dữ liệu req.body
        let data = await allcodeService.handleUpdateAllCode(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Lấy chi tiết mã code theo ID
let getDetailAllCodeById = async (req, res) => {
    try {
        // Gọi service để lấy thông tin code từ dữ liệu req.body.id
        let data = await allcodeService.getDetailAllCodeById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Xóa mã code theo ID
let handleDeleteAllCode = async (req, res) => {
    try {
        let data = await allcodeService.handleDeleteAllCode(req.body.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Lấy danh sách tất cả mã code theo tham số query
let getListAllCodeService = async (req, res) => {
    try {
        let data = await allcodeService.getListAllCodeService(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Xuất các function để sử dụng trong các route khác
module.exports = {
    handleCreateNewAllCode: handleCreateNewAllCode,
    getAllCodeService: getAllCodeService,
    handleUpdateAllCode: handleUpdateAllCode,
    getDetailAllCodeById: getDetailAllCodeById,
    handleDeleteAllCode: handleDeleteAllCode,
    getListAllCodeService: getListAllCodeService,
    getAllCategoryBlog: getAllCategoryBlog,
}