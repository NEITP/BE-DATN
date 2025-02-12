import receiptService from '../services/receiptService'; // Import service xử lý logic của receipt (hóa đơn)

// Hàm tạo mới hóa đơn
let createNewReceipt = async (req, res) => {
    try {
        let data = await receiptService.createNewReceipt(req.body); // Gọi service để tạo hóa đơn mới
        return res.status(200).json(data); // Trả về dữ liệu hóa đơn vừa tạo
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1, // Mã lỗi mặc định
            errMessage: 'Error from server' // Thông báo lỗi chung
        });
    }
}

// Hàm lấy chi tiết hóa đơn theo ID
let getDetailReceiptById = async (req, res) => {
    try {
        let data = await receiptService.getDetailReceiptById(req.query.id); // Gọi service để lấy chi tiết hóa đơn theo ID
        return res.status(200).json(data); // Trả về dữ liệu hóa đơn
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm lấy danh sách tất cả hóa đơn
let getAllReceipt = async (req, res) => {
    try {
        let data = await receiptService.getAllReceipt(req.query); // Gọi service để lấy danh sách hóa đơn theo điều kiện lọc
        return res.status(200).json(data); // Trả về danh sách hóa đơn
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm cập nhật thông tin hóa đơn
let updateReceipt = async (req, res) => {
    try {
        let data = await receiptService.updateReceipt(req.body); // Gọi service để cập nhật hóa đơn
        return res.status(200).json(data); // Trả về dữ liệu hóa đơn sau khi cập nhật
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm xóa hóa đơn
let deleteReceipt = async (req, res) => {
    try {
        let data = await receiptService.deleteReceipt(req.body); // Gọi service để xóa hóa đơn
        return res.status(200).json(data); // Trả về kết quả xóa hóa đơn
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm tạo chi tiết hóa đơn mới
let createNewReceiptDetail = async (req, res) => {
    try {
        let data = await receiptService.createNewReceiptDetail(req.body); // Gọi service để tạo chi tiết hóa đơn mới
        return res.status(200).json(data); // Trả về dữ liệu chi tiết hóa đơn vừa tạo
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
    createNewReceipt: createNewReceipt,
    getDetailReceiptById: getDetailReceiptById,
    getAllReceipt: getAllReceipt,
    updateReceipt: updateReceipt,
    deleteReceipt: deleteReceipt,
    createNewReceiptDetail: createNewReceiptDetail
};
