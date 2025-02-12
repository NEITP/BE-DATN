import addressUserService from '../services/addressUserService';

// Tạo mới địa chỉ cho người dùng
let createNewAddressUser = async (req, res) => {
    try {
        // Gọi service để tạo địa chỉ mới từ dữ liệu req.body
        let data = await addressUserService.createNewAddressUser(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Lấy danh sách tất cả địa chỉ của một người dùng theo userId
let getAllAddressUserByUserId = async (req, res) => {
    try {
        // Lấy userId từ query params
        let data = await addressUserService.getAllAddressUserByUserId(req.query.userId);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Xóa địa chỉ của người dùng
let deleteAddressUser = async (req, res) => {
    try {
        // Gọi service để xóa địa chỉ
        let data = await addressUserService.deleteAddressUser(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Chỉnh sửa địa chỉ của người dùng
let editAddressUser = async (req, res) => {
    try {
        // Gọi service để cập nhật địa chỉ
        let data = await addressUserService.editAddressUser(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Lấy chi tiết một địa chỉ theo ID
let getDetailAddressUserById = async (req, res) => {
    try {
        // Lấy id từ query params
        let data = await addressUserService.getDetailAddressUserById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
// Export các chức năng để sử dụng trong router
module.exports = {
    createNewAddressUser: createNewAddressUser,
    getAllAddressUserByUserId: getAllAddressUserByUserId,
    deleteAddressUser: deleteAddressUser,
    editAddressUser: editAddressUser,
    getDetailAddressUserById: getDetailAddressUserById
}