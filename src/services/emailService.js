require('dotenv').config()
const nodemailer = require("nodemailer");

// Hàm gửi email đơn giản với hai loại: xác thực email và quên mật khẩu
let sendSimpleEmail = async (dataSend) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true cho cổng 465, false cho các cổng khác
        auth: {
            user: process.env.EMAIL_APP,// Email gửi
            pass: process.env.EMAIL_APP_PASSWORD,// Mật khẩu ứng dụng của email gửi
        },
    });
    // Nếu loại email là xác thực tài khoản
    if (dataSend.type === 'verifyEmail') {
        let info = await transporter.sendMail({
            from: '"BiNgo2706 👻" <dotanthanhvlog@gmail.com>', // sender address
            to: dataSend.email, // list of receivers
            subject: "Xác thực email | PTITSHOP", // Subject line
            html: getBodyHTMLEmailVerify(dataSend)
        });
    }
    // Nếu loại email là quên mật khẩu
    if (dataSend.type === 'forgotpassword') {
        let info = await transporter.sendMail({
            from: '"BiNgo2706 👻" <dotanthanhvlog@gmail.com>', // sender address
            to: dataSend.email, // list of receivers
            subject: "Xác nhận quên mật khẩu | PTITSHOP", // Subject line
            html: getBodyHTMLEmailForgotPassword(dataSend)
        });
    }
}
// Hàm tạo nội dung email xác thực tài khoản
let getBodyHTMLEmailVerify = (dataSend) => {
    let fullname = `${dataSend.firstName} ${dataSend.lastName}`
    let result = `<h3>Xin chào ${fullname}!</h3>
        <p>Bạn nhận được email này vì đã thực hiện lệnh xác thực email!</p>
        <p>Bui lòng click vào đường link bên dưới để xác nhận và hoàn tất thủ tục xác minh email của bạn</p>
        <div>
            <a href="${dataSend.redirectLink}" target=""_blank>Click here</a>
        </div>
        <div>Xin cảm ơn !</div>
    `

    return result;
}
// Hàm tạo nội dung email quên mật khẩu
let getBodyHTMLEmailForgotPassword = (dataSend) => {
    let fullname = `${dataSend.firstName} ${dataSend.lastName}`
    let result = `<h3>Xin chào ${fullname}!</h3>
        <p>Bạn nhận được email này vì đã thực hiện lệnh quên mật khẩu!</p>
        <p>Bui lòng click vào đường link bên dưới để xác nhận quên mật khẩu và lấy lại mật khẩu của bạn</p>
        <div>
            <a href="${dataSend.redirectLink}" target=""_blank>Click here</a>
        </div>
        <div>Xin cảm ơn !</div>
    `

    return result;
}
// let sendAttachment = async (dataSend) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let transporter = nodemailer.createTransport({
//                 host: "smtp.gmail.com",
//                 port: 587,
//                 secure: false, // true for 465, false for other ports
//                 auth: {
//                     user: process.env.EMAIL_APP,
//                     pass: process.env.EMAIL_APP_PASSWORD,
//                 },
//             });

//             let info = await transporter.sendMail({
//                 from: '"BiNgo2706 👻" <dotanthanhvlog@gmail.com>', // sender address
//                 to: dataSend.email, // list of receivers
//                 subject: "Thông tin đặt lịch khám bệnh", // Subject line
//                 html: getBodyHTMLEmailRemedy(dataSend),
//                 attachments: [
//                     {
//                         filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.${dataSend.filename}`,
//                         content: dataSend.imgBase64.split("base64,")[1],
//                         encoding: 'base64'
//                     }
//                 ]
//             });
//             resolve()
//         } catch (error) {
//             reject(error)
//         }
//     })
// }
module.exports = {
    sendSimpleEmail: sendSimpleEmail,

}