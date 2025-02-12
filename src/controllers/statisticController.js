import statisticService from '../services/statisticService'; // Import service xử lý logic thống kê

// Hàm lấy số lượng thống kê thẻ (ví dụ: số lượng khách hàng, số đơn hàng, doanh thu...)
let getCountCardStatistic = async (req, res) => {
    try {
        let data = await statisticService.getCountCardStatistic(req.query); // Gọi service để lấy dữ liệu thống kê thẻ
        return res.status(200).json(data); // Trả về dữ liệu thống kê thẻ
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1, // Mã lỗi chung
            errMessage: 'Error from server' // Thông báo lỗi chung
        });
    }
}

// Hàm lấy số lượng đơn hàng theo trạng thái (ví dụ: đang xử lý, đã giao hàng, đã hủy...)
let getCountStatusOrder = async (req, res) => {
    try {
        let data = await statisticService.getCountStatusOrder(req.query); // Gọi service để lấy số lượng đơn hàng theo trạng thái
        return res.status(200).json(data); // Trả về dữ liệu
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm lấy thống kê doanh thu theo tháng
let getStatisticByMonth = async (req, res) => {
    try {
        let data = await statisticService.getStatisticByMonth(req.query); // Gọi service để lấy thống kê theo tháng
        return res.status(200).json(data); // Trả về dữ liệu thống kê
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm lấy thống kê doanh thu theo ngày
let getStatisticByDay = async (req, res) => {
    try {
        let data = await statisticService.getStatisticByDay(req.query); // Gọi service để lấy thống kê theo ngày
        return res.status(200).json(data); // Trả về dữ liệu thống kê
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm lấy thống kê tổng doanh thu
let getStatisticOverturn = async (req, res) => {
    try {
        let data = await statisticService.getStatisticOverturn(req.query); // Gọi service để lấy tổng doanh thu
        return res.status(200).json(data); // Trả về dữ liệu tổng doanh thu
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm lấy thống kê lợi nhuận
let getStatisticProfit = async (req, res) => {
    try {
        let data = await statisticService.getStatisticProfit(req.query); // Gọi service để lấy lợi nhuận
        return res.status(200).json(data); // Trả về dữ liệu lợi nhuận
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
}

// Hàm lấy thống kê số lượng sản phẩm trong kho
let getStatisticStockProduct = async (req, res) => {
    try {
        let data = await statisticService.getStatisticStockProduct(req.query); // Gọi service để lấy dữ liệu hàng tồn kho
        return res.status(200).json(data); // Trả về dữ liệu hàng tồn kho
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
    getCountCardStatistic: getCountCardStatistic,
    getCountStatusOrder: getCountStatusOrder,
    getStatisticByMonth: getStatisticByMonth,
    getStatisticByDay: getStatisticByDay,
    getStatisticOverturn: getStatisticOverturn,
    getStatisticProfit: getStatisticProfit,
    getStatisticStockProduct: getStatisticStockProduct
};
