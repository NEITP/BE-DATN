// Import các thư viện cần thiết
import { v4 as uuidv4 } from 'uuid';  // Để tạo ID duy nhất
import db from "../models/index";      // Các model database
import paypal from 'paypal-rest-sdk'  // Tích hợp thanh toán PayPal
const { Op } = require("sequelize");   // Các toán tử của Sequelize
var querystring = require('qs');       // Xử lý query string
var crypto = require("crypto");        // Cho các hoạt động mã hóa
var dateFormat = require('dateformat') // Định dạng ngày tháng
require('dotenv').config()            // Tải biến môi trường
import moment from 'moment';          // Xử lý ngày giờ
import localization from 'moment/locale/vi';  // Bản địa hóa tiếng Việt
import { EXCHANGE_RATES } from '../utils/constants'  // Tỷ giá tiền tệ

// Cài đặt locale tiếng Việt cho moment.js
moment.updateLocale('vi', localization);

// Cấu hình PayPal SDK với thông tin sandbox
paypal.configure({
    'mode': 'sandbox', // Chế độ sandbox để test
    'client_id': 'AaeuRt8WCq9SBliEVfEyXXQMosfJD-U9emlCflqe8Blz_KWZ3lnXh1piEMcXuo78MvWj0hBKgLN-FamT',
    'client_secret': 'ENWZDMzk17X3mHFJli7sFlS9RT1Vi_aocaLsrftWZ2tjHtBVFMzr4kPf5_9iIcsbFWsHf95vXVi6EADv'
});

// Hàm tạo đơn hàng mới
let createNewOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các trường bắt buộc
            if (!data.addressUserId || !data.typeShipId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Thiếu thông tin bắt buộc!'
                })
            } else {
                // Tạo bản ghi đơn hàng mới trong database
                let product = await db.OrderProduct.create({
                    addressUserId: data.addressUserId,     // ID địa chỉ người dùng
                    isPaymentOnlien: data.isPaymentOnlien, // Thanh toán online hay không
                    statusId: 'S3',                        // Trạng thái ban đầu
                    typeShipId: data.typeShipId,          // Loại vận chuyển
                    voucherId: data.voucherId,            // Mã giảm giá nếu có
                    note: data.note                       // Ghi chú đơn hàng
                })

                // Thêm ID đơn hàng vào từng sản phẩm trong giỏ
                data.arrDataShopCart = data.arrDataShopCart.map((item, index) => {
                    item.orderId = product.dataValues.id
                    return item;
                })

                // Tạo chi tiết đơn hàng cho từng sản phẩm
                await db.OrderDetail.bulkCreate(data.arrDataShopCart)

                // Xử lý giỏ hàng sau khi đặt hàng
                let res = await db.ShopCart.findOne({
                    where: { userId: data.userId, statusId: 0 }
                })
                if (res) {
                    // Xóa các mục trong giỏ hàng
                    await db.ShopCart.destroy({
                        where: { userId: data.userId }
                    })

                    // Cập nhật số lượng tồn kho cho từng sản phẩm
                    for (let i = 0; i < data.arrDataShopCart.length; i++) {
                        let productDetailSize = await db.ProductDetailSize.findOne({
                            where: { id: data.arrDataShopCart[i].productId },
                            raw: false
                        })
                        productDetailSize.stock = productDetailSize.stock - data.arrDataShopCart[i].quantity
                        await productDetailSize.save()
                    }
                }

                // Xử lý voucher nếu có
                if (data.voucherId && data.userId) {
                    let voucherUses = await db.VoucherUsed.findOne({
                        where: {
                            voucherId: data.voucherId,
                            userId: data.userId
                        },
                        raw: false
                    })
                    voucherUses.status = 1; // Đánh dấu voucher đã sử dụng
                    await voucherUses.save()
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Tạo đơn hàng thành công'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy danh sách tất cả đơn hàng
let getAllOrders = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thiết lập các điều kiện lọc và join bảng
            let objectFilter = {
                include: [
                    { model: db.TypeShip, as: 'typeShipData' },    // Thông tin vận chuyển
                    { model: db.Voucher, as: 'voucherData' },      // Thông tin voucher
                    { model: db.Allcode, as: 'statusOrderData' },  // Thông tin trạng thái
                ],
                order: [['createdAt', 'DESC']], // Sắp xếp theo thời gian tạo
                raw: true,
                nest: true
            }

            // Thêm phân trang nếu có
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }

            // Lọc theo trạng thái
            if (data.statusId && data.statusId !== 'ALL') {
                objectFilter.where = { statusId: data.statusId }
            }

            // Lấy dữ liệu đơn hàng
            let res = await db.OrderProduct.findAndCountAll(objectFilter)

            // Bổ sung thông tin chi tiết cho mỗi đơn hàng
            for (let i = 0; i < res.rows.length; i++) {
                // Lấy thông tin địa chỉ và người giao hàng
                let addressUser = await db.AddressUser.findOne({
                    where: { id: res.rows[i].addressUserId }
                })
                let shipper = await db.User.findOne({
                    where: { id: res.rows[i].shipperId }
                })

                if (addressUser) {
                    // Lấy thông tin người dùng
                    let user = await db.User.findOne({
                        where: { id: addressUser.userId }
                    })

                    // Gán thông tin vào kết quả
                    res.rows[i].userData = user
                    res.rows[i].addressUser = addressUser
                    res.rows[i].shipperData = shipper
                }
            }

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

// Hàm lấy chi tiết đơn hàng theo ID
let getDetailOrderById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra ID
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Thiếu ID đơn hàng!'
                })
            } else {
                // Lấy thông tin đơn hàng kèm các thông tin liên quan
                let order = await db.OrderProduct.findOne({
                    where: { id: id },
                    include: [
                        { model: db.TypeShip, as: 'typeShipData' },
                        { model: db.Voucher, as: 'voucherData' },
                        { model: db.Allcode, as: 'statusOrderData' },
                    ],
                    raw: true,
                    nest: true
                })

                // Chuyển đổi hình ảnh từ base64 (nếu có)
                if (order.image) {
                    order.image = new Buffer(order.image, 'base64').toString('binary')
                }

                // Lấy thông tin loại voucher
                order.voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
                    where: { id: order.voucherData.typeVoucherId }
                })

                // Lấy chi tiết từng sản phẩm trong đơn hàng
                let orderDetail = await db.OrderDetail.findAll({
                    where: { orderId: id }
                })

                // Lấy thông tin địa chỉ giao hàng
                let addressUser = await db.AddressUser.findOne({
                    where: { id: order.addressUserId }
                })
                order.addressUser = addressUser

                // Lấy thông tin người đặt hàng
                let user = await db.User.findOne({
                    where: { id: addressUser.userId },
                    attributes: {
                        exclude: ['password', 'image']
                    },
                    raw: true,
                    nest: true
                })
                order.userData = user

                // Lấy thông tin chi tiết cho từng sản phẩm
                for (let i = 0; i < orderDetail.length; i++) {
                    // Thông tin size sản phẩm
                    orderDetail[i].productDetailSize = await db.ProductDetailSize.findOne({
                        where: { id: orderDetail[i].productId },
                        include: [
                            { model: db.Allcode, as: 'sizeData' },
                        ],
                        raw: true,
                        nest: true
                    })

                    // Thông tin chi tiết sản phẩm
                    orderDetail[i].productDetail = await db.ProductDetail.findOne({
                        where: { id: orderDetail[i].productDetailSize.productdetailId }
                    })

                    // Thông tin sản phẩm cơ bản
                    orderDetail[i].product = await db.Product.findOne({
                        where: { id: orderDetail[i].productDetail.productId }
                    })

                    // Lấy hình ảnh sản phẩm
                    orderDetail[i].productImage = await db.ProductImage.findAll({
                        where: { productdetailId: orderDetail[i].productDetail.id }
                    })

                    // Chuyển đổi hình ảnh từ base64
                    for (let j = 0; j < orderDetail[i].productImage.length; j++) {
                        orderDetail[i].productImage[j].image = new Buffer(orderDetail[i].productImage[j].image, 'base64').toString('binary')
                    }
                }

                order.orderDetail = orderDetail;

                resolve({
                    errCode: 0,
                    data: order
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm cập nhật trạng thái đơn hàng
let updateStatusOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!data.id || !data.statusId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Thiếu thông tin cập nhật!'
                })
            } else {
                // Tìm và cập nhật trạng thái đơn hàng
                let order = await db.OrderProduct.findOne({
                    where: { id: data.id },
                    raw: false
                })
                order.statusId = data.statusId
                await order.save()

                // Xử lý khi hủy đơn hàng
                if (data.statusId == 'S7' && data.dataOrder.orderDetail && data.dataOrder.orderDetail.length > 0) {
                    // Hoàn lại số lượng tồn kho
                    for (let i = 0; i < data.dataOrder.orderDetail.length; i++) {
                        let productDetailSize = await db.ProductDetailSize.findOne({
                            where: { id: data.dataOrder.orderDetail[i].productDetailSize.id },
                            raw: false
                        })
                        // Cộng lại số lượng đã trừ trước đó
                        productDetailSize.stock = productDetailSize.stock + data.dataOrder.orderDetail[i].quantity
                        await productDetailSize.save()
                    }
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Cập nhật trạng thái thành công'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Tiếp tục hàm lấy tất cả đơn hàng của người dùng
let getAllOrdersByUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Thiếu ID người dùng!'
                })
            } else {
                // Lấy tất cả địa chỉ của người dùng
                let addressUser = await db.AddressUser.findAll({
                    where: { userId: userId }
                })

                // Duyệt qua từng địa chỉ để lấy đơn hàng
                for (let i = 0; i < addressUser.length; i++) {
                    // Lấy danh sách đơn hàng cho địa chỉ hiện tại
                    addressUser[i].order = await db.OrderProduct.findAll({
                        where: { addressUserId: addressUser[i].id },
                        include: [
                            { model: db.TypeShip, as: 'typeShipData' },     // Thông tin vận chuyển
                            { model: db.Voucher, as: 'voucherData' },       // Thông tin voucher
                            { model: db.Allcode, as: 'statusOrderData' },   // Trạng thái đơn hàng
                        ],
                        raw: true,
                        nest: true
                    })

                    // Duyệt qua từng đơn hàng để lấy chi tiết
                    for (let j = 0; j < addressUser[i].order.length; j++) {
                        // Lấy thông tin loại voucher
                        addressUser[i].order[j].voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
                            where: { id: addressUser[i].order[j].voucherData.typeVoucherId }
                        })

                        // Lấy chi tiết sản phẩm trong đơn hàng
                        let orderDetail = await db.OrderDetail.findAll({
                            where: { orderId: addressUser[i].order[j].id }
                        })

                        // Duyệt qua từng sản phẩm để lấy thông tin chi tiết
                        for (let k = 0; k < orderDetail.length; k++) {
                            // Lấy thông tin size sản phẩm
                            orderDetail[k].productDetailSize = await db.ProductDetailSize.findOne({
                                where: { id: orderDetail[k].productId },
                                include: [
                                    { model: db.Allcode, as: 'sizeData' },
                                ],
                                raw: true,
                                nest: true
                            })

                            // Lấy thông tin chi tiết sản phẩm
                            orderDetail[k].productDetail = await db.ProductDetail.findOne({
                                where: { id: orderDetail[k].productDetailSize.productdetailId }
                            })

                            // Lấy thông tin cơ bản của sản phẩm
                            orderDetail[k].product = await db.Product.findOne({
                                where: { id: orderDetail[k].productDetail.productId }
                            })

                            // Lấy hình ảnh sản phẩm
                            orderDetail[k].productImage = await db.ProductImage.findAll({
                                where: { productdetailId: orderDetail[k].productDetail.id }
                            })

                            // Chuyển đổi hình ảnh từ base64 sang binary
                            for (let f = 0; f < orderDetail[k].productImage.length; f++) {
                                orderDetail[k].productImage[f].image = new Buffer(orderDetail[k].productImage[f].image, 'base64').toString('binary')
                            }
                        }

                        // Gán chi tiết đơn hàng vào đơn hàng
                        addressUser[i].order[j].orderDetail = orderDetail
                    }
                }

                resolve({
                    errCode: 0,
                    data: addressUser
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm lấy đơn hàng theo shipper
let getAllOrdersByShipper = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thiết lập điều kiện lọc cơ bản
            let objectFilter = {
                include: [
                    { model: db.TypeShip, as: 'typeShipData' },     // Join thông tin vận chuyển
                    { model: db.Voucher, as: 'voucherData' },       // Join thông tin voucher
                    { model: db.Allcode, as: 'statusOrderData' },   // Join thông tin trạng thái
                ],
                order: [['createdAt', 'DESC']], // Sắp xếp theo thời gian tạo mới nhất
                raw: true,
                nest: true,
                where: { shipperId: data.shipperId } // Lọc theo ID shipper
            }

            // Thêm điều kiện lọc theo trạng thái
            if (data.status && data.status == 'working') {
                objectFilter.where = { ...objectFilter.where, statusId: 'S5' } // Đơn hàng đang giao
            }
            if (data.status && data.status == 'done') {
                objectFilter.where = { ...objectFilter.where, statusId: 'S6' } // Đơn hàng đã giao
            }

            // Lấy danh sách đơn hàng
            let res = await db.OrderProduct.findAll(objectFilter)

            // Bổ sung thông tin người đặt hàng và địa chỉ
            for (let i = 0; i < res.length; i++) {
                let addressUser = await db.AddressUser.findOne({
                    where: { id: res[i].addressUserId }
                })
                if (addressUser) {
                    let user = await db.User.findOne({
                        where: { id: addressUser.userId }
                    })
                    res[i].userData = user
                    res[i].addressUser = addressUser
                }
            }

            resolve({
                errCode: 0,
                data: res,
            })

        } catch (error) {
            reject(error)
        }
    })
}

// Hàm xử lý thanh toán qua PayPal
let paymentOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let listItem = []
            let totalPriceProduct = 0

            // Duyệt qua từng sản phẩm để tạo danh sách thanh toán
            for (let i = 0; i < data.result.length; i++) {
                // Lấy thông tin chi tiết sản phẩm
                data.result[i].productDetailSize = await db.ProductDetailSize.findOne({
                    where: { id: data.result[i].productId },
                    include: [
                        { model: db.Allcode, as: 'sizeData' },
                    ],
                    raw: true,
                    nest: true
                })

                // Lấy thông tin sản phẩm
                data.result[i].productDetail = await db.ProductDetail.findOne({
                    where: { id: data.result[i].productDetailSize.productdetailId }
                })
                data.result[i].product = await db.Product.findOne({
                    where: { id: data.result[i].productDetail.productId }
                })

                // Chuyển đổi giá từ VND sang USD
                data.result[i].realPrice = parseFloat((data.result[i].realPrice / EXCHANGE_RATES.USD).toFixed(2))

                // Thêm vào danh sách sản phẩm thanh toán PayPal
                listItem.push({
                    "name": data.result[i].product.name + " | " + data.result[i].productDetail.nameDetail + " | " + data.result[i].productDetailSize.sizeData.value,
                    "sku": data.result[i].productId + "",
                    "price": data.result[i].realPrice + "",
                    "currency": "USD",
                    "quantity": data.result[i].quantity
                })

                // Tính tổng giá sản phẩm
                totalPriceProduct += data.result[i].realPrice * data.result[i].quantity
            }

            // Thêm phí ship và voucher vào danh sách thanh toán
            listItem.push({
                "name": "Phí ship + Voucher",
                "sku": "1",
                "price": parseFloat(data.total - totalPriceProduct).toFixed(2) + "",
                "currency": "USD",
                "quantity": 1
            })

            // Tạo đối tượng thanh toán PayPal
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:5000/payment/success",
                    "cancel_url": "http://localhost:5000/payment/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": listItem
                    },
                    "amount": {
                        "currency": "USD",
                        "total": data.total
                    },
                    "description": "Thanh toán đơn hàng."
                }]
            };

            // Tạo thanh toán qua PayPal API
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    resolve({
                        errCode: -1,
                        errMessage: error,
                    })
                } else {
                    resolve({
                        errCode: 0,
                        errMessage: 'ok',
                        link: payment.links[1].href // Link thanh toán PayPal
                    })
                }
            });

        } catch (error) {
            reject(error)
        }
    })
}
// Hàm xử lí Order
let paymentOrderSuccess = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các tham số bắt buộc có tồn tại không
            if (!data.PayerID || !data.paymentId || !data.token) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tạo đối tượng JSON chứa thông tin thanh toán cần thực thi
                var execute_payment_json = {
                    "payer_id": data.PayerID,
                    "transactions": [{
                        "amount": {
                            "currency": "USD",
                            "total": data.total
                        }
                    }]
                };

                var paymentId = data.paymentId;

                // Thực thi thanh toán với PayPal
                paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
                    if (error) {
                        resolve({
                            errCode: 0,
                            errMessage: error
                        })
                    } else {
                        // Nếu thanh toán thành công, tạo đơn hàng trong database
                        let product = await db.OrderProduct.create({
                            addressUserId: data.addressUserId,
                            isPaymentOnlien: data.isPaymentOnlien,
                            statusId: 'S3', // Trạng thái đơn hàng (S3 có thể là trạng thái "đã thanh toán")
                            typeShipId: data.typeShipId,
                            voucherId: data.voucherId,
                            note: data.note
                        });

                        // Gán orderId cho từng sản phẩm trong giỏ hàng
                        data.arrDataShopCart = data.arrDataShopCart.map((item, index) => {
                            item.orderId = product.dataValues.id
                            return item;
                        });

                        // Thêm các sản phẩm từ giỏ hàng vào bảng OrderDetail
                        await db.OrderDetail.bulkCreate(data.arrDataShopCart);

                        // Tìm giỏ hàng của user có trạng thái chưa thanh toán
                        let res = await db.ShopCart.findOne({ where: { userId: data.userId, statusId: 0 } });

                        if (res) {
                            // Xóa giỏ hàng sau khi đã thanh toán thành công
                            await db.ShopCart.destroy({
                                where: { userId: data.userId }
                            });

                            // Giảm số lượng sản phẩm trong kho
                            for (let i = 0; i < data.arrDataShopCart.length; i++) {
                                let productDetailSize = await db.ProductDetailSize.findOne({
                                    where: { id: data.arrDataShopCart[i].productId },
                                    raw: false
                                });

                                // Cập nhật số lượng tồn kho
                                productDetailSize.stock = productDetailSize.stock - data.arrDataShopCart[i].quantity;
                                await productDetailSize.save();
                            }
                        }

                        // Nếu người dùng có sử dụng voucher, cập nhật trạng thái của voucher đó
                        if (data.voucherId && data.userId) {
                            let voucherUses = await db.VoucherUsed.findOne({
                                where: {
                                    voucherId: data.voucherId,
                                    userId: data.userId
                                },
                                raw: false
                            });

                            // Đánh dấu voucher đã được sử dụng
                            voucherUses.status = 1;
                            await voucherUses.save();
                        }

                        // Trả về kết quả thành công
                        resolve({
                            errCode: 0,
                            errMessage: 'ok'
                        });
                    }
                });
            }
        } catch (error) {
            // Xử lý lỗi trong quá trình thực thi
            reject(error);
        }
    });
};
// Hàm xử lí OrderVnPay
let paymentOrderVnpaySuccess = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tạo đơn hàng mới trong database sau khi thanh toán qua VNPAY thành công
            let product = await db.OrderProduct.create({
                addressUserId: data.addressUserId,  // ID địa chỉ giao hàng của người dùng
                isPaymentOnlien: data.isPaymentOnlien, // Hình thức thanh toán (online hay không)
                statusId: 'S3', // Trạng thái đơn hàng (S3 có thể là "Đã thanh toán")
                typeShipId: data.typeShipId, // ID loại hình vận chuyển
                voucherId: data.voucherId, // ID mã giảm giá (nếu có)
                note: data.note // Ghi chú đơn hàng
            });

            // Gán orderId cho từng sản phẩm trong giỏ hàng
            data.arrDataShopCart = data.arrDataShopCart.map((item) => {
                item.orderId = product.dataValues.id;
                return item;
            });

            // Lưu thông tin chi tiết đơn hàng vào bảng OrderDetail
            await db.OrderDetail.bulkCreate(data.arrDataShopCart);

            // Kiểm tra xem người dùng có giỏ hàng chưa thanh toán không
            let res = await db.ShopCart.findOne({ where: { userId: data.userId, statusId: 0 } });

            if (res) {
                // Xóa giỏ hàng sau khi đã thanh toán thành công
                await db.ShopCart.destroy({
                    where: { userId: data.userId }
                });

                // Giảm số lượng sản phẩm trong kho
                for (let i = 0; i < data.arrDataShopCart.length; i++) {
                    let productDetailSize = await db.ProductDetailSize.findOne({
                        where: { id: data.arrDataShopCart[i].productId },
                        raw: false
                    });

                    // Cập nhật số lượng tồn kho
                    productDetailSize.stock = productDetailSize.stock - data.arrDataShopCart[i].quantity;
                    await productDetailSize.save();
                }
            }

            // Nếu người dùng có sử dụng voucher, cập nhật trạng thái của voucher đó
            if (data.voucherId && data.userId) {
                let voucherUses = await db.VoucherUsed.findOne({
                    where: {
                        voucherId: data.voucherId,
                        userId: data.userId
                    },
                    raw: false
                });

                // Đánh dấu voucher đã được sử dụng
                voucherUses.status = 1;
                await voucherUses.save();
            }

            // Trả về kết quả thành công
            resolve({
                errCode: 0,
                errMessage: 'ok'
            });

        } catch (error) {
            // Xử lý lỗi trong quá trình thực thi
            reject(error);
        }
    });
};
// Hàm xác nhận đơn hàng
let confirmOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu thiếu shipperId, orderId hoặc statusId
            if (!data.shipperId || !data.orderId || !data.statusId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tìm đơn hàng theo ID
                let orderProduct = await db.OrderProduct.findOne({ where: { id: data.orderId }, raw: false })
                // Gán shipperId và trạng thái đơn hàng
                orderProduct.shipperId = data.shipperId
                orderProduct.statusId = data.statusId
                // Lưu cập nhật vào database
                await orderProduct.save()

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

// Hàm xử lý thanh toán qua VNPAY
let paymentOrderVnpay = (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Lấy địa chỉ IP của client
            var ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            // Lấy thông tin từ biến môi trường
            var tmnCode = process.env.VNP_TMNCODE;
            var secretKey = process.env.VNP_HASHSECRET;
            var vnpUrl = process.env.VNP_URL;
            var returnUrl = process.env.VNP_RETURNURL;

            var createDate = process.env.DATE_VNPAYMENT;
            var orderId = uuidv4(); // Tạo mã đơn hàng duy nhất

            console.log("createDate", createDate)
            console.log("orderId", orderId)

            // Lấy dữ liệu từ request body
            var amount = req.body.amount;
            var bankCode = req.body.bankCode;
            var orderInfo = req.body.orderDescription;
            var orderType = req.body.orderType;
            var locale = req.body.language;

            // Nếu không có giá trị locale, mặc định là 'vn'
            if (locale === null || locale === '') {
                locale = 'vn';
            }

            var currCode = 'VND'; // Đơn vị tiền tệ là VND
            var vnp_Params = {}; // Đối tượng chứa các tham số gửi lên VNPAY
            vnp_Params['vnp_Version'] = '2.1.0';
            vnp_Params['vnp_Command'] = 'pay';
            vnp_Params['vnp_TmnCode'] = tmnCode;
            vnp_Params['vnp_Locale'] = locale;
            vnp_Params['vnp_CurrCode'] = currCode;
            vnp_Params['vnp_TxnRef'] = orderId;
            vnp_Params['vnp_OrderInfo'] = orderInfo;
            vnp_Params['vnp_OrderType'] = orderType;
            vnp_Params['vnp_Amount'] = amount * 100; // Nhân 100 để đổi đơn vị sang VND
            vnp_Params['vnp_ReturnUrl'] = returnUrl;
            vnp_Params['vnp_IpAddr'] = ipAddr;
            vnp_Params['vnp_CreateDate'] = createDate;

            // Nếu có bankCode thì thêm vào tham số
            if (bankCode !== null && bankCode !== '') {
                vnp_Params['vnp_BankCode'] = bankCode;
            }

            // Sắp xếp tham số theo thứ tự alphabet
            vnp_Params = sortObject(vnp_Params);

            // Tạo chữ ký bảo mật
            var signData = querystring.stringify(vnp_Params, { encode: false });
            var hmac = crypto.createHmac("sha512", secretKey);
            var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;

            // Tạo URL thanh toán
            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
            console.log(vnpUrl)

            resolve({
                errCode: 200,
                link: vnpUrl
            })
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm xác nhận thanh toán từ VNPAY
let confirmOrderVnpay = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            var vnp_Params = data;

            // Lấy giá trị chữ ký bảo mật từ tham số nhận được
            var secureHash = vnp_Params['vnp_SecureHash'];

            // Xóa chữ ký bảo mật trước khi xác thực
            delete vnp_Params['vnp_SecureHash'];
            delete vnp_Params['vnp_SecureHashType'];

            // Sắp xếp tham số theo thứ tự alphabet
            vnp_Params = sortObject(vnp_Params);

            var tmnCode = process.env.VNP_TMNCODE;
            var secretKey = process.env.VNP_HASHSECRET;

            // Tạo lại chữ ký bảo mật để kiểm tra tính hợp lệ
            var signData = querystring.stringify(vnp_Params, { encode: false });
            var hmac = crypto.createHmac("sha512", secretKey);
            var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

            // So sánh chữ ký để xác nhận thanh toán
            if (secureHash === signed) {
                resolve({
                    errCode: 0,
                    errMessage: 'Success'
                })
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'failed'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm sắp xếp object theo thứ tự alphabet
function sortObject(obj) {
    var sorted = {};
    var str = [];
    var key;

    // Lấy danh sách các key và sắp xếp
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();

    // Gán lại các giá trị theo thứ tự đã sắp xếp
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// Hàm cập nhật ảnh đơn hàng
let updateImageOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu thiếu id hoặc image
            if (!data.id || !data.image) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                // Tìm đơn hàng theo ID
                let order = await db.OrderProduct.findOne({
                    where: { id: data.id },
                    raw: false
                })
                // Cập nhật ảnh cho đơn hàng
                order.image = data.image
                await order.save()

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