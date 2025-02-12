import JWT from 'jsonwebtoken'
require('dotenv').config();

let encodeToken = (userId) => {
    return JWT.sign({
        iss: 'TIEN',  // Người phát hành token (Issuer)
        sub: userId,    // Đối tượng nhận token (Subject) - ở đây là ID người dùng
        iat: new Date().getTime(),  // Thời gian phát hành token (Issued At)
        exp: new Date().setDate(new Date().getDate() + 3) // Token hết hạn sau 3 ngày (Expiration)
    }, process.env.JWT_SECRET) // Sử dụng khóa bí mật JWT_SECRET từ file .env
}

module.exports = {
    encodeToken: encodeToken
}