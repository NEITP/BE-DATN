// Import service xử lý logic liên quan đến tin nhắn và phòng chat
import messageService from '../services/messageService';

// Hàm tạo phòng chat mới
let createNewRoom = async (req, res) => {
    try {
        // Gọi service để tạo phòng chat mới từ dữ liệu trong request body
        let data = await messageService.createNewRoom(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm gửi tin nhắn trong một phòng chat
let sendMessage = async (req, res) => {
    try {
        // Gọi service để gửi tin nhắn từ dữ liệu trong request body
        let data = await messageService.sendMessage(req.body);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm tải lịch sử tin nhắn trong một phòng chat
let loadMessage = async (req, res) => {
    try {
        // Gọi service để lấy danh sách tin nhắn theo các tham số truy vấn (query)
        let data = await messageService.loadMessage(req.query);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy danh sách các phòng chat của một người dùng
let listRoomOfUser = async (req, res) => {
    try {
        // Gọi service để lấy danh sách phòng chat của user dựa trên userId từ query param
        let data = await messageService.listRoomOfUser(req.query.userId);

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Hàm lấy danh sách tất cả phòng chat mà admin có quyền truy cập
let listRoomOfAdmin = async (req, res) => {
    try {
        // Gọi service để lấy danh sách tất cả phòng chat dành cho admin
        let data = await messageService.listRoomOfAdmin();

        // Trả về kết quả thành công
        return res.status(200).json(data);
    } catch (error) {
        console.log(error);

        // Xử lý lỗi từ server
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

// Xuất module chứa các API controller để sử dụng trong router
module.exports = {
    createNewRoom: createNewRoom,
    sendMessage: sendMessage,
    loadMessage: loadMessage,
    listRoomOfUser: listRoomOfUser,
    listRoomOfAdmin: listRoomOfAdmin
}
