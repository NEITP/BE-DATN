// Import service xử lý logic liên quan đến blog
import blogService from '../services/blogService';

// Hàm tạo mới một bài blog
let createNewBlog = async (req, res) => {
    try {
        // Gọi service để tạo blog mới từ dữ liệu trong request body
        let data = await blogService.createNewBlog(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy chi tiết blog theo ID
let getDetailBlogById = async (req, res) => {
    try {
        // Gọi service lấy thông tin chi tiết blog dựa trên query param `id`
        let data = await blogService.getDetailBlogById(req.query.id);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy danh sách tất cả blog (hỗ trợ phân trang nếu có)
let getAllBlog = async (req, res) => {
    try {
        // Gọi service để lấy tất cả blog với các tham số từ query
        let data = await blogService.getAllBlog(req.query);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm cập nhật thông tin blog
let updateBlog = async (req, res) => {
    try {
        // Gọi service để cập nhật blog với dữ liệu từ request body
        let data = await blogService.updateBlog(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm xóa blog
let deleteBlog = async (req, res) => {
    try {
        // Gọi service để xóa blog với dữ liệu từ request body
        let data = await blogService.deleteBlog(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy danh sách blog nổi bật
let getFeatureBlog = async (req, res) => {
    try {
        // Gọi service để lấy danh sách blog nổi bật theo query param
        let data = await blogService.getFeatureBlog(req.query);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy danh sách blog mới nhất
let getNewBlog = async (req, res) => {
    try {
        // Gọi service để lấy danh sách blog mới nhất theo query param
        let data = await blogService.getNewBlog(req.query);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Xuất module chứa các API controller để sử dụng trong router
module.exports = {
    createNewBlog: createNewBlog,
    getDetailBlogById: getDetailBlogById,
    getAllBlog: getAllBlog,
    updateBlog: updateBlog,
    deleteBlog: deleteBlog,
    getFeatureBlog: getFeatureBlog,
    getNewBlog: getNewBlog
};
