// Import service xử lý logic liên quan đến banner
import bannerService from '../services/bannerService';

// Hàm tạo mới một banner
let createNewBanner = async (req, res) => {
    try {
        // Gọi service để tạo banner mới từ dữ liệu trong request body
        let data = await bannerService.createNewBanner(req.body);

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

// Hàm lấy chi tiết banner theo ID
let getDetailBanner = async (req, res) => {
    try {
        // Gọi service lấy thông tin chi tiết banner dựa trên query param `id`
        let data = await bannerService.getDetailBanner(req.query.id);

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

// Hàm lấy danh sách tất cả banner (hỗ trợ phân trang nếu có)
let getAllBanner = async (req, res) => {
    try {
        // Gọi service để lấy tất cả banner với các tham số từ query
        let data = await bannerService.getAllBanner(req.query);

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

// Hàm cập nhật thông tin banner
let updateBanner = async (req, res) => {
    try {
        // Gọi service để cập nhật banner với dữ liệu từ request body
        let data = await bannerService.updateBanner(req.body);

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

// Hàm xóa banner
let deleteBanner = async (req, res) => {
    try {
        // Gọi service để xóa banner với dữ liệu từ request body
        let data = await bannerService.deleteBanner(req.body);

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

// Xuất module chứa các API controller
module.exports = {
    createNewBanner: createNewBanner,
    getDetailBanner: getDetailBanner,
    getAllBanner: getAllBanner,
    updateBanner: updateBanner,
    deleteBanner: deleteBanner
};
