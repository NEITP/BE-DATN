const jwt = require('jsonwebtoken');  // Import thư viện JWT để xác thực token
import db from "../models/index";      // Import models database
require('dotenv').config();            // Load biến môi trường từ file .env
const secretString = process.env.JWT_SECRET; // Lấy khóa bí mật từ biến môi trường

const middlewareControllers = {
    // Middleware kiểm tra token của user
    verifyTokenUser: (req, res, next) => {
        const token = req.headers.authorization; // Lấy token từ header

        if (token) {
            const accessToken = token.split(' ')[1]; // Loại bỏ "Bearer " để lấy token thực sự

            jwt.verify(accessToken, secretString, async (err, payload) => {
                if (err) {
                    return res.status(403).json({
                        status: false,
                        errMessage: 'Token is not valid!',
                        refresh: true,
                    });
                }
                // Tìm user trong database theo ID từ payload của JWT
                const user = await db.User.findOne({ where: { id: payload.sub } });
                if (!user) {
                    return res.status(404).json({
                        status: false,
                        errMessage: 'User does not exist',
                        refresh: true,
                    });
                }

                req.user = user; // Lưu thông tin user vào req để dùng trong middleware sau
                next(); // Chuyển tiếp sang middleware tiếp theo
            });
        } else {
            return res.status(401).json({
                status: false,
                message: "You're not authenticated!",
                refresh: true,
            });
        }
    },
    //      verifyTokenUser:
    // Kiểm tra token có tồn tại không.
    // Nếu có, xác thực JWT và lấy thông tin user từ database.
    // Nếu user tồn tại, tiếp tục xử lý request.
    // Nếu lỗi, trả về lỗi 401 (Unauthorized) hoặc 403 (Forbidden).




    // Middleware kiểm tra token của admin (chỉ cho phép role R4 và R1)
    verifyTokenAdmin: (req, res, next) => {
        const token = req.headers.authorization;

        if (token) {
            const accessToken = token.split(' ')[1];

            jwt.verify(accessToken, secretString, async (err, payload) => {
                if (err) {
                    return res.status(403).json({
                        status: false,
                        errMessage: 'Token is not valid!',
                        refresh: true,
                    });
                }
                // Kiểm tra user có tồn tại trong database không
                const user = await db.User.findOne({ where: { id: payload.sub } });
                if (!user) {
                    return res.status(404).json({
                        status: false,
                        errMessage: 'User does not exist',
                        refresh: true,
                    });
                }
                // Kiểm tra quyền hạn của user (chỉ cho phép role R4 hoặc R1)
                if (user && (user.roleId == 'R4' || user.roleId == 'R1')) {
                    req.user = user;
                    next();
                } else {
                    return res.status(403).json({
                        status: false,
                        errMessage: 'Bạn không có đủ quyền',
                        refresh: true,
                    });
                }
            });
        } else {
            return res.status(401).json({
                status: false,
                errMessage: "You're not authenticated!",
                refresh: true,
            });
        }
    },

    //     verifyTokenAdmin:
    // Tương tự verifyTokenUser nhưng có thêm kiểm tra quyền hạn.
    // Chỉ cho phép user có roleId là R4 hoặc R1.
    // Nếu không đủ quyền, trả về lỗi 403 (Forbidden).
};



module.exports = middlewareControllers;
