const { Op } = require("sequelize");  // Toán tử Sequelize để truy vấn
import db from "../models/index";      // Import models từ Sequelize
import moment from 'moment';           // Thư viện xử lý thời gian

function compareDates(d1, d2) {
    //  lon hon la false
    //  be hon la true

    var parts = d1.split('/');
    var d1 = Number(parts[2] + parts[1] + parts[0]); // Chuyển ngày tháng sang số
    parts = d2.split('/');
    var d2 = Number(parts[2] + parts[1] + parts[0]); // Chuyển ngày tháng sang số

    if (d1 <= d2) return true
    if (d1 >= d2) return false

}
// Hàm sô lượng thống kê tổng quan
let getCountCardStatistic = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Đếm số lượng người dùng có trạng thái 'S1' (đang hoạt động)
            let countUser = await db.User.count({ where: { statusId: 'S1' } });

            // Đếm tổng số sản phẩm
            let countProduct = await db.Product.count();

            // Đếm tổng số đánh giá có `star > 0`
            let countReview = await db.Comment.count({
                where: { star: { [Op.gt]: 0 } }
            });

            // Đếm tổng số đơn hàng (không tính đơn có `statusId = 'S7'`)
            let countOrder = await db.OrderProduct.count({
                where: { statusId: { [Op.ne]: 'S7' } }
            });

            let data = { countUser, countProduct, countReview, countOrder };

            resolve({
                errCode: 0,
                data: data
            });

        } catch (error) {
            reject(error);
        }
    });
};
// Hàm đém số lượng theo trạng thái
let getCountStatusOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra dữ liệu đầu vào có thiếu không
            if (!data.oneDate && !data.twoDate) {
                resolve({
                    errCode: 1,
                    data: 'Missing required parameter!'
                });
            } else {
                // Lấy danh sách trạng thái đơn hàng
                let statusOrder = await db.Allcode.findAll({
                    where: { type: 'STATUS-ORDER' }
                });

                let objectCount = {};
                let arrayLable = [];
                let arrayValue = [];

                if (statusOrder) {
                    // Lấy tất cả đơn hàng
                    let orderProduct = await db.OrderProduct.findAll();

                    // Lọc đơn hàng theo khoảng ngày tháng
                    orderProduct = orderProduct.filter(item => {
                        if (data.type == "day") {
                            // Chuyển `updatedAt` sang định dạng `DD/MM/YYYY`
                            let updatedAt = moment.utc(item.updatedAt).local().format('DD/MM/YYYY').split('/');
                            updatedAt = Number(updatedAt[2] + updatedAt[1] + updatedAt[0]);

                            // Chuyển `oneDate` và `twoDate` sang số
                            let twoDate = moment(data.twoDate).format("DD/MM/YYYY").split('/');
                            twoDate = Number(twoDate[2] + twoDate[1] + twoDate[0]);

                            let oneDate = moment(data.oneDate).format("DD/MM/YYYY").split('/');
                            oneDate = Number(oneDate[2] + oneDate[1] + oneDate[0]);

                            return (updatedAt >= oneDate) && (updatedAt <= twoDate);
                        }
                        else if (data.type == "month") {
                            // Lọc theo tháng và năm
                            let updatedAtMonth = moment.utc(item.updatedAt).local().format('M');
                            let updatedAtYear = moment.utc(item.updatedAt).local().format('YYYY');

                            return moment(data.oneDate).format('M') == updatedAtMonth &&
                                moment(data.oneDate).format('YYYY') == updatedAtYear;
                        } else {
                            // Lọc theo năm
                            let updatedAtYear = moment.utc(item.updatedAt).local().format('YYYY');
                            return moment(data.oneDate).format('YYYY') == updatedAtYear;
                        }
                    });

                    // Tính số lượng đơn hàng theo từng trạng thái
                    for (let i = 0; i < statusOrder.length; i++) {
                        arrayLable.push(statusOrder[i].value);  // Lấy tên trạng thái

                        arrayValue.push(
                            orderProduct.filter(item => item.statusId == statusOrder[i].code).length
                        );
                    }

                    objectCount = { arrayLable, arrayValue };

                    resolve({
                        errCode: 0,
                        data: objectCount
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Hàm tính tổng giá sau khi áp dụng giảm giá
let totalPriceDiscount = (price, discount) => {
    // Nếu giảm giá theo phần trăm
    if (discount.voucherData.typeVoucherOfVoucherData.typeVoucher === "percent") {
        // Kiểm tra nếu số tiền giảm vượt quá giới hạn tối đa thì chỉ giảm đến mức tối đa
        if (((price * discount.voucherData.typeVoucherOfVoucherData.value) / 100) > discount.voucherData.typeVoucherOfVoucherData.maxValue) {
            return price - discount.voucherData.typeVoucherOfVoucherData.maxValue;
        } else {
            return price - ((price * discount.voucherData.typeVoucherOfVoucherData.value) / 100);
        }
    }
    // Nếu giảm giá theo số tiền cố định
    else {
        return price - discount.voucherData.typeVoucherOfVoucherData.maxValue;
    }
}

// Hàm tính số ngày trong một tháng của một năm cụ thể
function DaysOfMonth(thang, nam) {
    var mon = parseInt(thang, 10);
    var yar = parseInt(nam, 10);
    switch (mon) {
        case 2:
            // Kiểm tra năm nhuận
            if ((yar % 4 == 0) && (yar % 400 != 0))
                return 29;
            else
                return 28;
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            return 31;
        default:
            return 30;
    }
}

// Hàm thống kê doanh thu theo tháng trong năm
let getStatisticByMonth = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!data.year) {
                resolve({ errCode: 1, data: 'Missing required parameter!' });
            } else {
                // Lấy danh sách các đơn hàng có trạng thái "S6" (đã hoàn thành)
                let orderProduct = await db.OrderProduct.findAll({
                    where: { statusId: 'S6' },
                    include: [
                        { model: db.TypeShip, as: 'typeShipData' },
                        { model: db.Voucher, as: 'voucherData' },
                        { model: db.Allcode, as: 'statusOrderData' },
                    ],
                    raw: true,
                    nest: true
                });

                // Tính tổng giá trị đơn hàng sau giảm giá và phí vận chuyển
                for (let i = 0; i < orderProduct.length; i++) {
                    orderProduct[i].orderDetail = await db.OrderDetail.findAll({ where: { orderId: orderProduct[i].id } });
                    orderProduct[i].voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
                        where: { id: orderProduct[i].voucherData.typeVoucherId }
                    });

                    let totalprice = 0;
                    for (let j = 0; j < orderProduct[i].orderDetail.length; j++) {
                        totalprice += (orderProduct[i].orderDetail[j].realPrice * orderProduct[i].orderDetail[j].quantity);
                    }

                    // Nếu có voucher, áp dụng giảm giá
                    if (orderProduct[i].voucherId) {
                        orderProduct[i].totalpriceProduct = totalPriceDiscount(totalprice, orderProduct[i]) + orderProduct[i].typeShipData.price;
                    } else {
                        orderProduct[i].totalpriceProduct = totalprice + orderProduct[i].typeShipData.price;
                    }
                }

                // Chuẩn bị dữ liệu để thống kê
                let arrayMonthLable = [];
                let arrayMonthValue = [];

                for (let i = 1; i <= 12; i++) {
                    arrayMonthLable.push("Th " + i);
                    let price = 0;

                    // Lọc và tính tổng doanh thu theo từng tháng
                    for (let j = 0; j < orderProduct.length; j++) {
                        if (moment(orderProduct[j].updatedAt).format('YYYY') === data.year && +moment(orderProduct[j].updatedAt).format('MM') === i) {
                            price += orderProduct[j].totalpriceProduct;
                        }
                    }
                    arrayMonthValue.push(price);
                }

                resolve({ errCode: 0, data: { arrayMonthLable, arrayMonthValue } });
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Hàm thống kê doanh thu theo ngày trong một tháng
let getStatisticByDay = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!data.month && !data.year) {
                resolve({ errCode: 1, data: 'Missing required parameter!' });
            } else {
                let day = DaysOfMonth(data.month, data.year);

                // Lấy danh sách các đơn hàng đã hoàn thành trong tháng
                let orderProduct = await db.OrderProduct.findAll({
                    where: { statusId: 'S6' },
                    include: [
                        { model: db.TypeShip, as: 'typeShipData' },
                        { model: db.Voucher, as: 'voucherData' },
                        { model: db.Allcode, as: 'statusOrderData' },
                    ],
                    raw: true,
                    nest: true
                });

                // Tính tổng giá trị đơn hàng sau giảm giá và phí vận chuyển
                for (let i = 0; i < orderProduct.length; i++) {
                    orderProduct[i].orderDetail = await db.OrderDetail.findAll({ where: { orderId: orderProduct[i].id } });
                    orderProduct[i].voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
                        where: { id: orderProduct[i].voucherData.typeVoucherId }
                    });

                    let totalprice = 0;
                    for (let j = 0; j < orderProduct[i].orderDetail.length; j++) {
                        totalprice += (orderProduct[i].orderDetail[j].realPrice * orderProduct[i].orderDetail[j].quantity);
                    }

                    // Nếu có voucher, áp dụng giảm giá
                    if (orderProduct[i].voucherId) {
                        orderProduct[i].totalpriceProduct = totalPriceDiscount(totalprice, orderProduct[i]) + orderProduct[i].typeShipData.price;
                    } else {
                        orderProduct[i].totalpriceProduct = totalprice + orderProduct[i].typeShipData.price;
                    }
                }

                // Chuẩn bị dữ liệu thống kê theo ngày
                let arrayDayLable = [];
                let arrayDayValue = [];

                for (let i = 1; i <= day; i++) {
                    // Nếu ngày hiện tại trùng với ngày cần thống kê thì hiển thị "Today"
                    if (+moment(new Date()).format("DD") == i && data.year === moment(new Date()).format("YYYY") &&
                        data.month === moment(new Date()).format("M")) {
                        arrayDayLable.push("Today");
                    } else {
                        arrayDayLable.push(i);
                    }

                    let price = 0;
                    // Lọc và tính tổng doanh thu theo từng ngày
                    for (let j = 0; j < orderProduct.length; j++) {
                        if (moment(orderProduct[j].updatedAt).format('YYYY') === data.year && moment(orderProduct[j].updatedAt).format('M') === data.month &&
                            +moment(orderProduct[j].updatedAt).format('DD') === i) {
                            price += orderProduct[j].totalpriceProduct;
                        }
                    }
                    arrayDayValue.push(price);
                }

                resolve({ errCode: 0, data: { arrayDayLable, arrayDayValue } });
            }
        } catch (error) {
            reject(error);
        }
    });
};
// Hàm tính toán lợi nhuận dựa trên giá bán và giá nhập của các sản phẩm trong đơn hàng
let getStatisticProfit = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu không có ngày bắt đầu và ngày kết thúc
            if (!data.oneDate && !data.twoDate) {
                resolve({
                    errCode: 1,
                    data: 'Missing required parameter !'
                });
            } else {
                // Lấy danh sách các đơn hàng có trạng thái 'S6' (đã hoàn thành)
                let orderProduct = await db.OrderProduct.findAll({
                    where: { statusId: 'S6' },
                    include: [
                        { model: db.TypeShip, as: 'typeShipData' },
                        { model: db.Voucher, as: 'voucherData' },
                        { model: db.Allcode, as: 'statusOrderData' },
                    ],
                    raw: true,
                    nest: true
                });

                // Lặp qua từng đơn hàng để tính toán tổng giá và giá nhập
                for (let i = 0; i < orderProduct.length; i++) {
                    // Lấy chi tiết đơn hàng
                    orderProduct[i].orderDetail = await db.OrderDetail.findAll({ where: { orderId: orderProduct[i].id } });

                    // Lấy thông tin voucher nếu có
                    orderProduct[i].voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
                        where: { id: orderProduct[i].voucherData.typeVoucherId }
                    });

                    let totalprice = 0;  // Tổng giá bán
                    let importPrice = 0; // Tổng giá nhập

                    // Lặp qua từng sản phẩm trong đơn hàng
                    for (let j = 0; j < orderProduct[i].orderDetail.length; j++) {
                        // Lấy thông tin nhập kho của sản phẩm
                        let receiptDetail = await db.ReceiptDetail.findAll({ where: { productDetailSizeId: orderProduct[i].orderDetail[j].productId } });

                        let avgPrice = 0;
                        let avgQuantity = 0;

                        // Tính giá nhập trung bình dựa trên các lần nhập kho
                        for (let k = 0; k < receiptDetail.length; k++) {
                            avgPrice += (receiptDetail[k].quantity * receiptDetail[k].price);
                            avgQuantity += receiptDetail[k].quantity;
                        }

                        // Tính giá nhập trung bình
                        orderProduct[i].orderDetail[j].importPrice = Math.round((avgPrice / avgQuantity));

                        // Cập nhật tổng giá nhập
                        importPrice += (Math.round((avgPrice / avgQuantity)) * orderProduct[i].orderDetail[j].quantity);

                        // Cập nhật tổng giá bán
                        totalprice += (orderProduct[i].orderDetail[j].realPrice * orderProduct[i].orderDetail[j].quantity);
                    }

                    orderProduct[i].importPrice = importPrice;

                    // Nếu có voucher, áp dụng giảm giá
                    if (orderProduct[i].voucherId) {
                        orderProduct[i].totalpriceProduct = totalPriceDiscount(totalprice, orderProduct[i]) + orderProduct[i].typeShipData.price;
                        orderProduct[i].profitPrice = orderProduct[i].totalpriceProduct - importPrice;
                    } else {
                        orderProduct[i].totalpriceProduct = totalprice + orderProduct[i].typeShipData.price;
                        orderProduct[i].profitPrice = orderProduct[i].totalpriceProduct - importPrice;
                    }
                }

                // Lọc đơn hàng theo khoảng thời gian người dùng cung cấp
                orderProduct = orderProduct.filter(item => {
                    if (data.type == "day") {
                        let updatedAt = moment.utc(item.updatedAt).local().format('DD/MM/YYYY').split('/');
                        updatedAt = Number(updatedAt[2] + updatedAt[1] + updatedAt[0]);

                        let twoDate = moment(data.twoDate).format("DD/MM/YYYY").split('/');
                        twoDate = Number(twoDate[2] + twoDate[1] + twoDate[0]);
                        let oneDate = moment(data.oneDate).format("DD/MM/YYYY").split('/');
                        oneDate = Number(oneDate[2] + oneDate[1] + oneDate[0]);

                        return (updatedAt >= oneDate && updatedAt <= twoDate);
                    } else if (data.type == "month") {
                        let updatedAtMonth = moment.utc(item.updatedAt).local().format('M');
                        let updatedAtYear = moment.utc(item.updatedAt).local().format('YYYY');
                        return (moment(data.oneDate).format('M') == updatedAtMonth && moment(data.oneDate).format('YYYY') == updatedAtYear);
                    } else {
                        let updatedAtYear = moment.utc(item.updatedAt).local().format('YYYY');
                        return (moment(data.oneDate).format('YYYY') == updatedAtYear);
                    }
                });

                resolve({
                    errCode: 0,
                    data: orderProduct
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Hàm tính tổng doanh thu trong khoảng thời gian được cung cấp.
let getStatisticOverturn = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.oneDate && !data.twoDate) {
                resolve({
                    errCode: 1,
                    data: 'Missing required parameter !'
                });
            } else {
                // Lấy danh sách đơn hàng có trạng thái 'S6' (hoàn thành)
                let orderProduct = await db.OrderProduct.findAll({
                    where: { statusId: 'S6' },
                    include: [
                        { model: db.TypeShip, as: 'typeShipData' },
                        { model: db.Voucher, as: 'voucherData' },
                        { model: db.Allcode, as: 'statusOrderData' },
                    ],
                    raw: true,
                    nest: true
                });

                // Lặp qua từng đơn hàng để tính tổng doanh thu
                for (let i = 0; i < orderProduct.length; i++) {
                    orderProduct[i].orderDetail = await db.OrderDetail.findAll({ where: { orderId: orderProduct[i].id } });
                    orderProduct[i].voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
                        where: { id: orderProduct[i].voucherData.typeVoucherId }
                    });

                    let totalprice = 0;
                    for (let j = 0; j < orderProduct[i].orderDetail.length; j++) {
                        totalprice += (orderProduct[i].orderDetail[j].realPrice * orderProduct[i].orderDetail[j].quantity);
                    }

                    // Nếu có voucher, tính giá sau giảm giá
                    if (orderProduct[i].voucherId) {
                        orderProduct[i].totalpriceProduct = totalPriceDiscount(totalprice, orderProduct[i]) + orderProduct[i].typeShipData.price;
                    } else {
                        orderProduct[i].totalpriceProduct = totalprice + orderProduct[i].typeShipData.price;
                    }
                }

                // Lọc đơn hàng theo thời gian
                orderProduct = orderProduct.filter(item => {
                    let updatedAt = moment.utc(item.updatedAt).local().format('YYYY-MM-DD');
                    return updatedAt >= data.oneDate && updatedAt <= data.twoDate;
                });

                resolve({
                    errCode: 0,
                    data: orderProduct
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Hàm lấy thông tin về số lượng tồn kho của từng sản phẩm dựa trên số lượng nhập kho và số lượng đã bán.
let getStatisticStockProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Định nghĩa objectFilter để lấy dữ liệu từ bảng ProductDetailSize
            let objectFilter = {
                include: [
                    { model: db.Allcode, as: 'sizeData', attributes: ['value', 'code'] }, // Lấy thông tin về kích thước sản phẩm
                ],
                raw: true, // Trả về dữ liệu dạng object thuần, không phải instance của Sequelize
                nest: true // Tổ chức dữ liệu theo dạng phân cấp thay vì phẳng
            };

            // Nếu có limit và offset, thêm vào objectFilter để hỗ trợ phân trang
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit; // Giới hạn số lượng bản ghi trả về
                objectFilter.offset = +data.offset; // Vị trí bắt đầu lấy dữ liệu
            }

            // Truy vấn dữ liệu từ bảng ProductDetailSize và đếm số lượng bản ghi
            let res = await db.ProductDetailSize.findAndCountAll(objectFilter);

            // Duyệt qua danh sách sản phẩm
            for (let i = 0; i < res.rows.length; i++) {
                // Lấy tất cả các lần nhập hàng của sản phẩm hiện tại từ bảng ReceiptDetail
                let receiptDetail = await db.ReceiptDetail.findAll({ where: { productDetailSizeId: res.rows[i].id } });

                // Lấy tất cả các đơn hàng có chứa sản phẩm hiện tại từ bảng OrderDetail
                let orderDetail = await db.OrderDetail.findAll({ where: { productId: res.rows[i].id } });

                let quantity = 0; // Biến lưu trữ tổng số lượng sản phẩm trong kho

                // Lấy thông tin chi tiết của sản phẩm từ bảng ProductDetail
                res.rows[i].productDetaildData = await db.ProductDetail.findOne({
                    where: { id: res.rows[i].productdetailId }
                });

                // Lấy thông tin về sản phẩm chính từ bảng Product
                res.rows[i].productdData = await db.Product.findOne({
                    where: { id: res.rows[i].productDetaildData.productId },
                    include: [
                        { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] }, // Lấy thương hiệu
                        { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] }, // Lấy danh mục sản phẩm
                        { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] }, // Lấy trạng thái sản phẩm
                    ],
                    raw: true,
                    nest: true
                });

                // Tính tổng số lượng sản phẩm đã nhập kho
                for (let j = 0; j < receiptDetail.length; j++) {
                    quantity = quantity + receiptDetail[j].quantity;
                }

                // Tính tổng số lượng sản phẩm đã bán (trừ đi từ số lượng nhập kho)
                for (let k = 0; k < orderDetail.length; k++) {
                    let order = await db.OrderProduct.findOne({ where: { id: orderDetail[k].orderId } });

                    // Nếu đơn hàng không bị hủy (statusId != 'S7'), thì trừ số lượng sản phẩm đã bán
                    if (order.statusId != 'S7') {
                        quantity = quantity - orderDetail[k].quantity;
                    }
                }

                // Cập nhật số lượng tồn kho của sản phẩm hiện tại
                res.rows[i].stock = quantity;
            }

            // Trả về kết quả với danh sách sản phẩm tồn kho
            resolve({
                errCode: 0,
                data: res.rows, // Danh sách sản phẩm
                count: res.count // Tổng số sản phẩm tìm thấy
            });

        } catch (error) {
            reject(error); // Bắt lỗi nếu có vấn đề xảy ra
        }
    });
};

module.exports = {
    getCountCardStatistic: getCountCardStatistic,
    getCountStatusOrder: getCountStatusOrder,
    getStatisticByMonth: getStatisticByMonth,
    getStatisticByDay: getStatisticByDay,
    getStatisticOverturn: getStatisticOverturn,
    getStatisticProfit: getStatisticProfit,
    getStatisticStockProduct: getStatisticStockProduct
}