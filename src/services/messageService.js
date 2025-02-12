import db from "../models/index";
import { Op } from 'sequelize';

// Hàm tạo phòng chat mới giữa người dùng và admin
let createNewRoom = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu không có userId1 thì báo lỗi
            if (!data.userId1) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                // Tìm user admin có email 'chat@gmail.com'
                let userAdmin = await db.User.findOne({
                    where: { email: 'chat@gmail.com' }
                });

                // Kiểm tra xem user này đã có phòng chat hay chưa
                let room = await db.RoomMessage.findOne({ where: { userOne: data.userId1 } });

                if (room) {
                    resolve({
                        errCode: 2,
                        errMessage: 'Da Co Phong'
                    })
                } else {
                    // Nếu tìm thấy admin thì tạo phòng chat mới
                    if (userAdmin) {
                        let res = await db.RoomMessage.create({
                            userOne: data.userId1,
                            userTwo: userAdmin.id
                        });
                        if (res) {
                            resolve({
                                errCode: 0,
                                errMessage: 'ok'
                            })
                        }
                    }
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm gửi tin nhắn trong phòng chat
let sendMessage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu thiếu dữ liệu thì báo lỗi
            if (!data.userId || !data.roomId || !data.text) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                // Lưu tin nhắn mới vào database
                let res = await db.Message.create({
                    text: data.text,
                    userId: data.userId,
                    roomId: data.roomId,
                    unRead: true // Đánh dấu là chưa đọc
                });

                if (res) {
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm tải tin nhắn của phòng chat
let loadMessage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Nếu thiếu roomId thì báo lỗi
            if (!data.roomId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                // Cập nhật trạng thái tin nhắn đã đọc nếu không phải là người gửi
                await db.Message.update({
                    unRead: false
                }, {
                    where: {
                        roomId: data.roomId,
                        userId: { [Op.not]: data.userId } // Tất cả tin nhắn không phải của người dùng hiện tại
                    }
                });

                // Lấy danh sách tin nhắn của phòng chat
                let message = await db.Message.findAll({
                    where: { roomId: data.roomId }
                });

                // Lấy thông tin user gửi tin nhắn
                for (let i = 0; i < message.length; i++) {
                    message[i].userData = await db.User.findOne({ where: { id: message[i].userId } });

                    // Nếu user có ảnh thì chuyển đổi base64 sang binary
                    if (message[i].userData.image) {
                        message[i].userData.image = new Buffer(message[i].userData.image, 'base64').toString('binary');
                    }
                }

                resolve({
                    errCode: 0,
                    data: message
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy danh sách phòng chat của một user
let listRoomOfUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Nếu thiếu userId thì báo lỗi
            if (!userId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                // Lấy danh sách phòng chat của user
                let room = await db.RoomMessage.findAll({
                    where: { userOne: userId }
                });

                // Lấy thông tin tin nhắn và user liên quan
                for (let i = 0; i < room.length; i++) {
                    room[i].messageData = await db.Message.findAll({ where: { roomId: room[i].id } });

                    room[i].userOneData = await db.User.findOne({ where: { id: room[i].userOne } });
                    if (room[i].userOneData.image) {
                        room[i].userOneData.image = new Buffer(room[i].userOneData.image, 'base64').toString('binary');
                    }

                    room[i].userTwoData = await db.User.findOne({ where: { id: room[i].userTwo } });
                    if (room[i].userTwoData.image) {
                        room[i].userTwoData.image = new Buffer(room[i].userTwoData.image, 'base64').toString('binary');
                    }
                }

                resolve({
                    errCode: 0,
                    data: room
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy danh sách phòng chat của admin
let listRoomOfAdmin = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tìm admin dựa trên email
            let user = await db.User.findOne({ where: { email: 'chat@gmail.com' } });

            if (user) {
                // Lấy danh sách phòng chat mà admin tham gia
                let room = await db.RoomMessage.findAll({
                    where: { userTwo: user.id }
                });

                // Lấy thông tin tin nhắn và user liên quan
                for (let i = 0; i < room.length; i++) {
                    room[i].messageData = await db.Message.findAll({ where: { roomId: room[i].id } });

                    room[i].userOneData = await db.User.findOne({ where: { id: room[i].userOne } });
                    if (room[i].userOneData.image) {
                        room[i].userOneData.image = new Buffer(room[i].userOneData.image, 'base64').toString('binary');
                    }

                    room[i].userTwoData = await db.User.findOne({ where: { id: room[i].userTwo } });
                    if (room[i].userTwoData.image) {
                        room[i].userTwoData.image = new Buffer(room[i].userTwoData.image, 'base64').toString('binary');
                    }
                }

                resolve({
                    errCode: 0,
                    data: room
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Xuất các function để sử dụng trong module khác
module.exports = {
    createNewRoom: createNewRoom,
    sendMessage: sendMessage,
    loadMessage: loadMessage,
    listRoomOfUser: listRoomOfUser,
    listRoomOfAdmin: listRoomOfAdmin
}
