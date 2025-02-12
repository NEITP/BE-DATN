import voucherService from '../services/voucherService';

//========================TYPE VOUCHER=====================//

// Tạo mới một loại voucher
let createNewTypeVoucher = async (req, res) => {
    try {
        let data = await voucherService.createNewTypeVoucher(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Lấy thông tin chi tiết của một loại voucher theo ID
let getDetailTypeVoucherById = async (req, res) => {
    try {
        let data = await voucherService.getDetailTypeVoucherById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Lấy danh sách tất cả loại voucher
let getAllTypeVoucher = async (req, res) => {
    try {
        let data = await voucherService.getAllTypeVoucher(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Cập nhật thông tin của một loại voucher
let updateTypeVoucher = async (req, res) => {
    try {
        let data = await voucherService.updateTypeVoucher(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Xóa một loại voucher
let deleteTypeVoucher = async (req, res) => {
    try {
        let data = await voucherService.deleteTypeVoucher(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Lấy danh sách các loại voucher có thể chọn
let getSelectTypeVoucher = async (req, res) => {
    try {
        let data = await voucherService.getSelectTypeVoucher();
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

//==========================VOUCHER=====================//

// Tạo mới một voucher
let createNewVoucher = async (req, res) => {
    try {
        let data = await voucherService.createNewVoucher(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Lấy thông tin chi tiết của một voucher theo ID
let getDetailVoucherById = async (req, res) => {
    try {
        let data = await voucherService.getDetailVoucherById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Lấy danh sách tất cả voucher
let getAllVoucher = async (req, res) => {
    try {
        let data = await voucherService.getAllVoucher(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Cập nhật thông tin của một voucher
let updateVoucher = async (req, res) => {
    try {
        let data = await voucherService.updateVoucher(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Xóa một voucher
let deleteVoucher = async (req, res) => {
    try {
        let data = await voucherService.deleteVoucher(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Lưu voucher vào danh sách voucher của người dùng
let saveUserVoucher = async (req, res) => {
    try {
        let data = await voucherService.saveUserVoucher(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Lấy danh sách tất cả voucher của một người dùng theo ID
let getAllVoucherByUserId = async (req, res) => {
    try {
        let data = await voucherService.getAllVoucherByUserId(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Xuất tất cả các phương thức để có thể sử dụng ở các module khác
module.exports = {
    createNewTypeVoucher: createNewTypeVoucher,
    getDetailTypeVoucherById: getDetailTypeVoucherById,
    getAllTypeVoucher: getAllTypeVoucher,
    updateTypeVoucher: updateTypeVoucher,
    deleteTypeVoucher: deleteTypeVoucher,
    createNewVoucher: createNewVoucher,
    getDetailVoucherById: getDetailVoucherById,
    getAllVoucher: getAllVoucher,
    updateVoucher: updateVoucher,
    deleteVoucher: deleteVoucher,
    getSelectTypeVoucher: getSelectTypeVoucher,
    saveUserVoucher: saveUserVoucher,
    getAllVoucherByUserId: getAllVoucherByUserId
}