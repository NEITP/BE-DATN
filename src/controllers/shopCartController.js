import shopCartService from '../services/shopCartService'; // Import service xử lý logic của giỏ hàng

// Hàm thêm sản phẩm vào giỏ hàng
let addShopCart = async (req, res) => {
    try {
        let data = await shopCartService.addShopCart(req.body); // Gọi service để thêm sản phẩm vào giỏ hàng
        return res.status(200).json(data); // Trả về dữ liệu giỏ hàng sau khi thêm
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1, // Mã lỗi chung
            errMessage: 'Error from server' // Thông báo lỗi chung
        });
    }
}

// Hàm lấy danh sách sản phẩm trong giỏ hàng theo ID người dùng
let getAllShopCartByUserId = async (req, res) => {
    try {
        let data = await shopCartService.getAllShopCartByUserId(req.query.id); // Gọi service để lấy danh sách sản phẩm trong giỏ hàng theo ID người dùng
        return res.status(200).json(data); // Trả về danh sách giỏ hàng
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm xóa sản phẩm khỏi giỏ hàng
let deleteItemShopCart = async (req, res) => {
    try {
        let data = await shopCartService.deleteItemShopCart(req.body); // Gọi service để xóa sản phẩm khỏi giỏ hàng
        return res.status(200).json(data); // Trả về kết quả sau khi xóa sản phẩm
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
    addShopCart: addShopCart,
    getAllShopCartByUserId: getAllShopCartByUserId,
    deleteItemShopCart: deleteItemShopCart
};
