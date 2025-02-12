// Import các module cần thiết
import db from "../models/index"; // Import model database
import bcrypt from "bcryptjs"; // Thư viện mã hóa mật khẩu
import emailService from "./emailService"; // Dịch vụ gửi email
import { v4 as uuidv4 } from 'uuid'; // Thư viện tạo mã UUID
import CommonUtils from '../utils/CommonUtils'; // Import các tiện ích chung
const { Op } = require("sequelize"); // Import Sequelize Operator để hỗ trợ truy vấn
require('dotenv').config(); // Sử dụng biến môi trường từ file .env

const salt = bcrypt.genSaltSync(10); // Tạo "muối" để mã hóa mật khẩu

/**
 * Hàm xây dựng URL xác thực email
 * @param {string} token - Mã token xác thực
 * @param {string} userId - ID của người dùng
 * @returns {string} - URL để xác thực email
 */
let buildUrlEmail = (token, userId) => {
    let result = `${process.env.URL_REACT}/verify-email?token=${token}&userId=${userId}`;
    return result;
}

/**
 * Hàm băm (mã hóa) mật khẩu bằng bcrypt
 * @param {string} password - Mật khẩu người dùng
 * @returns {Promise<string>} - Mật khẩu đã được băm
 */
let hashUserPasswordFromBcrypt = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt); // Băm mật khẩu với salt
            resolve(hashPassword);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Kiểm tra xem email người dùng đã tồn tại trong hệ thống chưa
 * @param {string} userEmail - Email của người dùng
 * @returns {Promise<boolean>} - true nếu email đã tồn tại, false nếu chưa
 */
let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail } // Tìm người dùng theo email
            });
            if (user) {
                resolve(true); // Email đã tồn tại
            } else {
                resolve(false); // Email chưa tồn tại
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Xử lý tạo người dùng mới
 * @param {object} data - Dữ liệu người dùng đầu vào
 * @returns {Promise<object>} - Kết quả xử lý
 */
let handleCreateNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem các trường dữ liệu quan trọng có bị thiếu không
            if (!data.email || !data.lastName) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters!' // Thiếu dữ liệu đầu vào
                });
            } else {
                // Kiểm tra email đã tồn tại chưa
                let check = await checkUserEmail(data.email);
                if (check === true) {
                    resolve({
                        errCode: 1,
                        errMessage: 'Your email is already in use, please try another email!' // Email đã tồn tại
                    });
                } else {
                    // Mã hóa mật khẩu trước khi lưu vào database
                    let hashPassword = await hashUserPasswordFromBcrypt(data.password);

                    // Tạo người dùng mới trong database
                    await db.User.create({
                        email: data.email,
                        password: hashPassword,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        address: data.address,
                        roleId: data.roleId,
                        genderId: data.genderId,
                        phonenumber: data.phonenumber,
                        image: data.avatar,
                        dob: data.dob,
                        isActiveEmail: 0, // Chưa kích hoạt email
                        statusId: 'S1', // Trạng thái mặc định là 'S1' (chờ duyệt hoặc kích hoạt)
                        usertoken: '', // Token trống, sẽ cập nhật sau khi xác thực email
                    });

                    // Trả về kết quả thành công
                    resolve({
                        errCode: 0,
                        message: 'OK'
                    });
                }
            }
        } catch (error) {
            reject(error); // Bắt lỗi và trả về reject
        }
    });
}

/**
 * Xóa người dùng theo ID
 * @param {number} userId - ID của người dùng cần xóa
 * @returns {Promise<object>} - Kết quả xóa người dùng
 */
let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu ID không được cung cấp
            if (!userId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing required parameters !` // Thiếu tham số đầu vào
                });
            } else {
                // Tìm kiếm người dùng theo ID
                let foundUser = await db.User.findOne({
                    where: { id: userId }
                });

                if (!foundUser) {
                    resolve({
                        errCode: 2,
                        errMessage: `The user isn't exist` // Người dùng không tồn tại
                    });
                }

                // Xóa người dùng khỏi database
                await db.User.destroy({
                    where: { id: userId }
                });

                resolve({
                    errCode: 0,
                    message: `The user is deleted` // Xóa thành công
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Cập nhật thông tin người dùng
 * @param {object} data - Dữ liệu mới của người dùng
 * @returns {Promise<object>} - Kết quả cập nhật
 */
let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!data.id || !data.genderId) {
                resolve({
                    errCode: 2,
                    errMessage: `Missing required parameters`
                });
            } else {
                // Tìm kiếm người dùng theo ID
                let user = await db.User.findOne({
                    where: { id: data.id },
                    raw: false // Trả về object Sequelize để có thể cập nhật dữ liệu
                });

                if (user) {
                    // Cập nhật thông tin người dùng
                    user.firstName = data.firstName;
                    user.lastName = data.lastName;
                    user.address = data.address;
                    user.roleId = data.roleId;
                    user.genderId = data.genderId;
                    user.phonenumber = data.phonenumber;
                    user.dob = data.dob;

                    // Cập nhật ảnh nếu có
                    if (data.image) {
                        user.image = data.image;
                    }

                    await user.save(); // Lưu thay đổi vào database

                    resolve({
                        errCode: 0,
                        errMessage: 'Update the user succeeds!' // Cập nhật thành công
                    });
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: 'User not found!' // Không tìm thấy người dùng
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Xử lý đăng nhập người dùng
 * @param {object} data - Dữ liệu đăng nhập (email, password)
 * @returns {Promise<object>} - Kết quả đăng nhập
 */
let handleLogin = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!data.email || !data.password) {
                resolve({
                    errCode: 4,
                    errMessage: 'Missing required parameters!' // Thiếu email hoặc mật khẩu
                });
            } else {
                let userData = {};

                // Kiểm tra email có tồn tại không
                let isExist = await checkUserEmail(data.email);

                if (isExist === true) {
                    // Lấy thông tin người dùng theo email và trạng thái S1 (đã kích hoạt)
                    let user = await db.User.findOne({
                        attributes: ['email', 'roleId', 'password', 'firstName', 'lastName', 'id'],
                        where: { email: data.email, statusId: 'S1' },
                        raw: true
                    });

                    if (user) {
                        // Kiểm tra mật khẩu có đúng không
                        let check = await bcrypt.compareSync(data.password, user.password);
                        if (check) {
                            userData.errCode = 0;
                            userData.errMessage = 'Ok';

                            delete user.password; // Xóa mật khẩu trước khi trả về dữ liệu

                            userData.user = user;
                            userData.accessToken = CommonUtils.encodeToken(user.id); // Tạo access token cho user
                        } else {
                            userData.errCode = 3;
                            userData.errMessage = 'Wrong password'; // Mật khẩu sai
                        }
                    } else {
                        userData.errCode = 2;
                        userData.errMessage = 'User not found!'; // Không tìm thấy người dùng
                    }
                } else {
                    userData.errCode = 1;
                    userData.errMessage = `Your email isn't exist in our system. Please try another email.`; // Email không tồn tại
                }
                resolve(userData);
            }
        } catch (error) {
            reject(error);
        }
    });
};
// Hàm đổi mật khẩu sau khi kiểm tra mật khẩu cũ.
let handleChangePassword = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem có đủ dữ liệu đầu vào không
            if (!data.id || !data.password || !data.oldpassword) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Tìm user theo id
                let user = await db.User.findOne({
                    where: { id: data.id },
                    raw: false
                })

                // Kiểm tra mật khẩu cũ có đúng không
                if (await bcrypt.compareSync(data.oldpassword, user.password)) {
                    if (user) {
                        // Hash mật khẩu mới trước khi lưu vào database
                        user.password = await hashUserPasswordFromBcrypt(data.password);
                        await user.save();
                    }
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Mật khẩu cũ không chính xác'
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy danh sách user có phân trang và lọc theo số điện thoại.
let getAllUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {
                where: { statusId: 'S1' }, // Lọc chỉ những user có trạng thái 'S1'
                attributes: {
                    exclude: ['password', 'image'] // Loại bỏ các trường nhạy cảm
                },
                include: [
                    { model: db.Allcode, as: 'roleData', attributes: ['value', 'code'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['value', 'code'] },
                ],
                raw: true,
                nest: true
            }

            // Nếu có limit và offset thì áp dụng phân trang
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }

            // Nếu có từ khóa tìm kiếm, lọc theo số điện thoại
            if (data.keyword !== '') {
                objectFilter.where = {
                    ...objectFilter.where,
                    phonenumber: { [Op.substring]: data.keyword }
                }
            }

            let res = await db.User.findAndCountAll(objectFilter)
            resolve({
                errCode: 0,
                data: res.rows,
                count: res.count
            })
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy thông tin chi tiết user theo ID.
let getDetailUserById = (userid) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userid) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                // Tìm user theo id và trạng thái 'S1'
                let res = await db.User.findOne({
                    where: { id: userid, statusId: 'S1' },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        { model: db.Allcode, as: 'roleData', attributes: ['value', 'code'] },
                        { model: db.Allcode, as: 'genderData', attributes: ['value', 'code'] },
                    ],
                    raw: true,
                    nest: true
                })

                // Chuyển ảnh từ dạng base64 sang dạng nhị phân
                if (res.image) {
                    res.image = new Buffer(res.image, 'base64').toString('binary');
                }

                resolve({
                    errCode: 0,
                    data: res
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy thông tin user theo email.
let getDetailUserByEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                // Lấy thông tin user theo email (chỉ lấy mật khẩu)
                let res = await db.User.findOne({
                    where: { email: email, statusId: 'S1' },
                    attributes: ['password']
                })

                resolve({
                    errCode: 0,
                    data: res
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm gửi email xác minh tài khoản.
let handleSendVerifyEmailUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let user = await db.User.findOne({
                    where: { id: data.id },
                    attributes: {
                        exclude: ['password']
                    },
                    raw: false
                })

                if (user) {
                    let token = uuidv4(); // Tạo token xác minh email
                    user.usertoken = token;

                    // Gửi email xác minh tới người dùng
                    await emailService.sendSimpleEmail({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        redirectLink: buildUrlEmail(token, user.id),
                        email: user.email,
                        type: 'verifyEmail'
                    })

                    await user.save();
                }

                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
// Hàm xác minh tài khoản bằng email.
let handleVerifyEmailUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.token) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Kiểm tra token xác minh email
                let user = await db.User.findOne({
                    where: {
                        id: data.id,
                        usertoken: data.token
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    raw: false
                })

                if (user) {
                    user.isActiveEmail = 1 // Đánh dấu email đã được xác minh
                    user.usertoken = ""; // Xóa token để tránh dùng lại

                    await user.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'User not found!'
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}
// Hàm gửi email để khôi phục mật khẩu
let handleSendEmailForgotPassword = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem email có được cung cấp không
            if (!email) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Kiểm tra xem email có tồn tại trong hệ thống không
                let check = await checkUserEmail(email);
                if (check === true) {
                    // Tìm kiếm thông tin người dùng theo email
                    let user = await db.User.findOne({
                        where: { email: email },
                        attributes: {
                            exclude: ['password'] // Loại bỏ password khi truy vấn
                        },
                        raw: false
                    });

                    if (user) {
                        // Tạo token ngẫu nhiên để xác thực
                        let token = uuidv4();
                        user.usertoken = token; // Lưu token vào DB của user

                        // Gửi email chứa link xác nhận quên mật khẩu
                        await emailService.sendSimpleEmail({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            redirectLink: `${process.env.URL_REACT}/verify-forgotpassword?token=${token}&userId=${user.id}`,
                            email: user.email,
                            type: 'forgotpassword'
                        });

                        // Lưu thông tin user với token mới
                        await user.save();
                    }

                    // Trả về kết quả thành công
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    });
                } else {
                    // Trả về lỗi nếu email không tồn tại trong hệ thống
                    resolve({
                        errCode: 2,
                        errMessage: `Your email isn't exist in our system. Please try another email`
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Hàm xử lý đặt lại mật khẩu bằng token
let handleForgotPassword = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem các tham số có đầy đủ không
            if (!data.id || !data.token || !data.password) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Tìm kiếm user có id và token khớp với thông tin cung cấp
                let user = await db.User.findOne({
                    where: {
                        id: data.id,
                        usertoken: data.token
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    raw: false
                });

                if (user) {
                    // Cập nhật mật khẩu mới và xoá token sau khi đổi mật khẩu thành công
                    user.password = await hashUserPasswordFromBcrypt(data.password);
                    user.usertoken = "";

                    // Lưu thông tin user mới vào DB
                    await user.save();
                }

                // Trả về kết quả thành công
                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Hàm kiểm tra xem số điện thoại hoặc email đã tồn tại chưa
let checkPhonenumberEmail = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem số điện thoại đã tồn tại hay chưa
            let phone = await db.User.findOne({
                where: { phonenumber: data.phonenumber }
            });

            // Kiểm tra xem email đã tồn tại hay chưa
            let email = await db.User.findOne({
                where: { email: data.email }
            });

            // Nếu số điện thoại đã tồn tại, trả về thông báo lỗi
            if (phone) {
                resolve({
                    isCheck: true,
                    errMessage: "Số điện thoại đã tồn tại"
                });
            }

            // Nếu email đã tồn tại, trả về thông báo lỗi
            if (email) {
                resolve({
                    isCheck: true,
                    errMessage: "Email đã tồn tại"
                });
            }

            // Nếu cả số điện thoại và email đều chưa tồn tại, trả về kết quả hợp lệ
            resolve({
                isCheck: false,
                errMessage: "Hợp lệ"
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    handleCreateNewUser: handleCreateNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    handleLogin: handleLogin,
    handleChangePassword: handleChangePassword,
    getAllUser: getAllUser,
    getDetailUserById: getDetailUserById,
    handleSendVerifyEmailUser: handleSendVerifyEmailUser,
    handleVerifyEmailUser: handleVerifyEmailUser,
    handleSendEmailForgotPassword: handleSendEmailForgotPassword,
    handleForgotPassword: handleForgotPassword,
    checkPhonenumberEmail: checkPhonenumberEmail
}