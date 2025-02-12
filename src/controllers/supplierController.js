import supplierService from '../services/supplierService'; // Import service xử lý logic nhà cung cấp

// Hàm tạo mới một nhà cung cấp
let createNewSupplier = async (req, res) => {
    try {
        let data = await supplierService.createNewSupplier(req.body); // Gọi service để tạo nhà cung cấp mới
        return res.status(200).json(data); // Trả về kết quả sau khi tạo
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1, // Mã lỗi chung
            errMessage: 'Error from server' // Thông báo lỗi chung
        });
    }
}

// Hàm lấy thông tin chi tiết của một nhà cung cấp theo ID
let getDetailSupplierById = async (req, res) => {
    try {
        let data = await supplierService.getDetailSupplierById(req.query.id); // Gọi service lấy thông tin nhà cung cấp theo ID
        return res.status(200).json(data); // Trả về thông tin nhà cung cấp
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm lấy danh sách tất cả các nhà cung cấp
let getAllSupplier = async (req, res) => {
    try {
        let data = await supplierService.getAllSupplier(req.query); // Gọi service để lấy danh sách nhà cung cấp
        return res.status(200).json(data); // Trả về danh sách nhà cung cấp
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm cập nhật thông tin một nhà cung cấp
let updateSupplier = async (req, res) => {
    try {
        let data = await supplierService.updateSupplier(req.body); // Gọi service để cập nhật thông tin nhà cung cấp
        return res.status(200).json(data); // Trả về kết quả sau khi cập nhật
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm xóa một nhà cung cấp
let deleteSupplier = async (req, res) => {
    try {
        let data = await supplierService.deleteSupplier(req.body); // Gọi service để xóa nhà cung cấp
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
    createNewSupplier: createNewSupplier,
    getDetailSupplierById: getDetailSupplierById,
    getAllSupplier: getAllSupplier,
    updateSupplier: updateSupplier,
    deleteSupplier: deleteSupplier
};
