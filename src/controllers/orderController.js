// Import service xử lý logic liên quan đến đơn hàng
import orderService from '../services/orderService';

// Hàm tạo đơn hàng mới
let createNewOrder = async (req, res) => {
    try {
        // Gọi service để tạo đơn hàng mới từ dữ liệu trong request body
        let data = await orderService.createNewOrder(req.body);

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

// Hàm lấy danh sách tất cả đơn hàng (có thể lọc theo query)
let getAllOrders = async (req, res) => {
    try {
        // Gọi service để lấy danh sách đơn hàng dựa trên query param
        let data = await orderService.getAllOrders(req.query);

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

// Hàm lấy chi tiết một đơn hàng theo ID
let getDetailOrderById = async (req, res) => {
    try {
        // Gọi service để lấy thông tin chi tiết đơn hàng theo ID từ query param
        let data = await orderService.getDetailOrderById(req.query.id);

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

// Hàm cập nhật trạng thái đơn hàng
let updateStatusOrder = async (req, res) => {
    try {
        // Gọi service để cập nhật trạng thái đơn hàng
        let data = await orderService.updateStatusOrder(req.body);

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

// Hàm lấy danh sách đơn hàng của một người dùng
let getAllOrdersByUser = async (req, res) => {
    try {
        // Gọi service để lấy danh sách đơn hàng của user dựa trên userId từ query param
        let data = await orderService.getAllOrdersByUser(req.query.userId);

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

// Hàm thực hiện thanh toán đơn hàng
let paymentOrder = async (req, res) => {
    try {
        // Gọi service để xử lý thanh toán đơn hàng
        let data = await orderService.paymentOrder(req.body);

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

// Hàm xử lý sau khi thanh toán thành công
let paymentOrderSuccess = async (req, res) => {
    try {
        // Gọi service để xử lý đơn hàng sau khi thanh toán thành công
        let data = await orderService.paymentOrderSuccess(req.body);

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

// Hàm xử lý thanh toán thành công qua VNPay
let paymentOrderVnpaySuccess = async (req, res) => {
    try {
        // Gọi service để xử lý đơn hàng sau khi thanh toán thành công qua VNPay
        let data = await orderService.paymentOrderVnpaySuccess(req.body);

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

// Hàm xác nhận đơn hàng (có thể là khi đơn hàng đã được thanh toán hoặc kiểm tra lại)
let confirmOrder = async (req, res) => {
    try {
        // Gọi service để xác nhận đơn hàng
        let data = await orderService.confirmOrder(req.body);

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

// Hàm lấy danh sách đơn hàng dành cho shipper (có thể lọc theo trạng thái)
let getAllOrdersByShipper = async (req, res) => {
    try {
        // Gọi service để lấy danh sách đơn hàng dành cho shipper
        let data = await orderService.getAllOrdersByShipper(req.query);

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

// Hàm xử lý thanh toán đơn hàng qua VNPay
let paymentOrderVnpay = async (req, res) => {
    try {
        // Gọi service để thực hiện thanh toán đơn hàng qua VNPay
        let data = await orderService.paymentOrderVnpay(req);

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

// Hàm xác nhận đơn hàng khi thanh toán bằng VNPay
let confirmOrderVnpay = async (req, res) => {
    try {
        // Gọi service để xác nhận đơn hàng sau khi thanh toán VNPay
        let data = await orderService.confirmOrderVnpay(req.body);

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

// Hàm cập nhật hình ảnh liên quan đến đơn hàng (ví dụ: hình ảnh khi giao hàng)
let updateImageOrder = async (req, res) => {
    try {
        // Gọi service để cập nhật hình ảnh đơn hàng
        let data = await orderService.updateImageOrder(req.body);

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
    createNewOrder: createNewOrder,
    getAllOrders: getAllOrders,
    getDetailOrderById: getDetailOrderById,
    updateStatusOrder: updateStatusOrder,
    getAllOrdersByUser: getAllOrdersByUser,
    paymentOrder: paymentOrder,
    paymentOrderSuccess: paymentOrderSuccess,
    confirmOrder: confirmOrder,
    getAllOrdersByShipper: getAllOrdersByShipper,
    paymentOrderVnpay: paymentOrderVnpay,
    confirmOrderVnpay: confirmOrderVnpay,
    paymentOrderVnpaySuccess: paymentOrderVnpaySuccess,
    updateImageOrder: updateImageOrder
}