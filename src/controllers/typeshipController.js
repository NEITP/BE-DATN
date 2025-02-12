import typeshipService from '../services/typeshipService'; // Import service xử lý logic loại hình vận chuyển

// Hàm tạo mới một loại hình vận chuyển
let createNewTypeShip = async (req, res) => {
    try {
        let data = await typeshipService.createNewTypeShip(req.body); // Gọi service để tạo loại hình vận chuyển mới
        return res.status(200).json(data); // Trả về kết quả sau khi tạo
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1, // Mã lỗi chung
            errMessage: 'Error from server' // Thông báo lỗi chung
        });
    }
}

// Hàm lấy thông tin chi tiết của một loại hình vận chuyển theo ID
let getDetailTypeshipById = async (req, res) => {
    try {
        let data = await typeshipService.getDetailTypeshipById(req.query.id); // Gọi service lấy thông tin loại hình vận chuyển theo ID
        return res.status(200).json(data); // Trả về thông tin loại hình vận chuyển
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm lấy danh sách tất cả các loại hình vận chuyển
let getAllTypeship = async (req, res) => {
    try {
        let data = await typeshipService.getAllTypeship(req.query); // Gọi service để lấy danh sách loại hình vận chuyển
        return res.status(200).json(data); // Trả về danh sách loại hình vận chuyển
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm cập nhật thông tin một loại hình vận chuyển
let updateTypeship = async (req, res) => {
    try {
        let data = await typeshipService.updateTypeship(req.body); // Gọi service để cập nhật thông tin loại hình vận chuyển
        return res.status(200).json(data); // Trả về kết quả sau khi cập nhật
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm xóa một loại hình vận chuyển
let deleteTypeship = async (req, res) => {
    try {
        let data = await typeshipService.deleteTypeship(req.body); // Gọi service để xóa loại hình vận chuyển
        return res.status(200).json(data); // Trả về kết quả sau khi xóa
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Xuất các function để sử dụng trong các file khác
module.exports = {
    createNewTypeShip: createNewTypeShip,
    getDetailTypeshipById: getDetailTypeshipById,
    getAllTypeship: getAllTypeship,
    updateTypeship: updateTypeship,
    deleteTypeship: deleteTypeship
};
