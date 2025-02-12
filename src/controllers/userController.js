// Import service xử lý logic người dùng
import userService from '../services/userService';

// Hàm tạo người dùng mới
let handleCreateNewUser = async (req, res) => {
    try {
        // Gọi service để tạo người dùng mới
        let data = await userService.handleCreateNewUser(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm cập nhật thông tin người dùng
let handleUpdateUser = async (req, res) => {
    try {
        // Gọi service để cập nhật thông tin người dùng
        let data = await userService.updateUserData(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm xóa người dùng
let handleDeleteUser = async (req, res) => {
    try {
        // Gọi service để xóa người dùng theo ID
        let data = await userService.deleteUser(req.body.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm đăng nhập người dùng
let handleLogin = async (req, res) => {
    try {
        // Gọi service để xử lý đăng nhập
        let data = await userService.handleLogin(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm thay đổi mật khẩu người dùng
let handleChangePassword = async (req, res) => {
    try {
        // Gọi service để thay đổi mật khẩu
        let data = await userService.handleChangePassword(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy danh sách tất cả người dùng
let getAllUser = async (req, res) => {
    try {
        // Gọi service để lấy danh sách tất cả người dùng
        let data = await userService.getAllUser(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy thông tin chi tiết người dùng theo ID
let getDetailUserById = async (req, res) => {
    try {
        // Gọi service để lấy thông tin người dùng theo ID
        let data = await userService.getDetailUserById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy thông tin chi tiết người dùng theo Email
let getDetailUserByEmail = async (req, res) => {
    try {
        // Gọi service để lấy thông tin người dùng theo Email
        let data = await userService.getDetailUserByEmail(req.query.email);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm gửi email xác thực tài khoản
let handleSendVerifyEmailUser = async (req, res) => {
    try {
        // Gọi service để gửi email xác thực tài khoản
        let data = await userService.handleSendVerifyEmailUser(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm xác thực email người dùng
let handleVerifyEmailUser = async (req, res) => {
    try {
        // Gọi service để xác thực email người dùng
        let data = await userService.handleVerifyEmailUser(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm gửi email để đặt lại mật khẩu khi quên mật khẩu
let handleSendEmailForgotPassword = async (req, res) => {
    try {
        // Gọi service để gửi email đặt lại mật khẩu
        let data = await userService.handleSendEmailForgotPassword(req.body.email);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm xử lý đặt lại mật khẩu khi quên mật khẩu
let handleForgotPassword = async (req, res) => {
    try {
        // Gọi service để xử lý đặt lại mật khẩu
        let data = await userService.handleForgotPassword(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm kiểm tra số điện thoại hoặc email đã tồn tại chưa
let checkPhonenumberEmail = async (req, res) => {
    try {
        // Gọi service để kiểm tra số điện thoại hoặc email
        let data = await userService.checkPhonenumberEmail(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Xuất các hàm để sử dụng trong router
module.exports = {
    handleCreateNewUser: handleCreateNewUser,
    handleUpdateUser: handleUpdateUser,
    handleDeleteUser: handleDeleteUser,
    handleLogin: handleLogin,
    handleChangePassword: handleChangePassword,
    getAllUser: getAllUser,
    getDetailUserById: getDetailUserById,
    getDetailUserByEmail: getDetailUserByEmail,
    handleSendVerifyEmailUser: handleSendVerifyEmailUser,
    handleVerifyEmailUser: handleVerifyEmailUser,
    handleSendEmailForgotPassword: handleSendEmailForgotPassword,
    handleForgotPassword: handleForgotPassword,
    checkPhonenumberEmail: checkPhonenumberEmail
};
