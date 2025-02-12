import db from "../models/index"; // Import database models

// Hàm thêm sản phẩm vào giỏ hàng
let addShopCart = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các tham số đầu vào
            if (!data.userId || !data.productdetailsizeId || !data.quantity) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !' // Thiếu tham số
                })
            } else {
                // Tìm kiếm sản phẩm trong giỏ hàng với cùng userId, productdetailsizeId và trạng thái chưa thanh toán (statusId = 0)
                let cart = await db.ShopCart.findOne({
                    where: { userId: data.userId, productdetailsizeId: data.productdetailsizeId, statusId: 0 },
                    raw: false
                })

                // Nếu sản phẩm đã có trong giỏ hàng
                if (cart) {
                    // Kiểm tra số lượng tồn kho thực tế
                    let res = await db.ProductDetailSize.findOne({ where: { id: data.productdetailsizeId } })
                    if (res) {
                        let receiptDetail = await db.ReceiptDetail.findAll({ where: { productDetailSizeId: res.id } })
                        let orderDetail = await db.OrderDetail.findAll({ where: { productId: res.id } })
                        let quantity = 0

                        // Tính tổng số lượng nhập hàng
                        for (let j = 0; j < receiptDetail.length; j++) {
                            quantity += receiptDetail[j].quantity
                        }
                        // Trừ đi số lượng đã được đặt hàng nhưng chưa hoàn tất (không có statusId = 'S7')
                        for (let k = 0; k < orderDetail.length; k++) {
                            let order = await db.OrderProduct.findOne({ where: { id: orderDetail[k].orderId } })
                            if (order.statusId !== 'S7') {
                                quantity -= orderDetail[k].quantity
                            }
                        }
                        res.stock = quantity // Cập nhật số lượng tồn kho
                    }

                    // Nếu đang cập nhật số lượng
                    if (data.type === "UPDATE_QUANTITY") {
                        if (+data.quantity > res.stock) {
                            resolve({
                                errCode: 2,
                                errMessage: `Chỉ còn ${res.stock} sản phẩm`,
                                quantity: res.stock
                            })
                        } else {
                            cart.quantity = +data.quantity
                            await cart.save() // Lưu lại thông tin giỏ hàng
                        }
                    } else { // Nếu thêm số lượng vào sản phẩm đã có trong giỏ hàng
                        if ((+cart.quantity + (+data.quantity)) > res.stock) {
                            resolve({
                                errCode: 2,
                                errMessage: `Chỉ còn ${res.stock} sản phẩm`,
                                quantity: res.stock
                            })
                        } else {
                            cart.quantity += +data.quantity
                            await cart.save()
                        }
                    }
                } else { // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
                    let res = await db.ProductDetailSize.findOne({ where: { id: data.productdetailsizeId } })
                    if (res) {
                        let receiptDetail = await db.ReceiptDetail.findAll({ where: { productDetailSizeId: res.id } })
                        let orderDetail = await db.OrderDetail.findAll({ where: { productId: res.id } })
                        let quantity = 0

                        // Tính số lượng tồn kho thực tế
                        for (let j = 0; j < receiptDetail.length; j++) {
                            quantity += receiptDetail[j].quantity
                        }
                        for (let k = 0; k < orderDetail.length; k++) {
                            let order = await db.OrderProduct.findOne({ where: { id: orderDetail[k].orderId } })
                            if (order.statusId !== 'S7') {
                                quantity -= orderDetail[k].quantity
                            }
                        }
                        res.stock = quantity
                    }

                    // Kiểm tra số lượng tồn kho trước khi thêm vào giỏ hàng
                    if (data.quantity > res.stock) {
                        resolve({
                            errCode: 2,
                            errMessage: `Chỉ còn ${res.stock} sản phẩm`,
                            quantity: res.stock
                        })
                    } else {
                        await db.ShopCart.create({
                            userId: data.userId,
                            productdetailsizeId: data.productdetailsizeId,
                            quantity: data.quantity,
                            statusId: 0 // Trạng thái chưa thanh toán
                        })
                    }
                }
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

// Hàm lấy toàn bộ giỏ hàng theo userId
let getAllShopCartByUserId = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let res = await db.ShopCart.findAll({
                    where: { userId: id, statusId: 0 } // Lấy các sản phẩm chưa thanh toán
                })
                for (let i = 0; i < res.length; i++) {
                    // Lấy thông tin kích thước sản phẩm
                    res[i].productdetailsizeData = await db.ProductDetailSize.findOne({
                        where: { id: res[i].productdetailsizeId },
                        include: [
                            { model: db.Allcode, as: 'sizeData', attributes: ['value', 'code'] }, // Thông tin mã kích thước
                        ],
                        raw: true,
                        nest: true
                    })
                    // Lấy thông tin chi tiết sản phẩm
                    res[i].productDetail = await db.ProductDetail.findOne({ where: { id: res[i].productdetailsizeData.productdetailId } })
                    // Lấy hình ảnh sản phẩm
                    res[i].productDetailImage = await db.ProductImage.findAll({ where: { productdetailId: res[i].productDetail.id } })

                    // Chuyển đổi ảnh từ base64 sang binary
                    if (res[i].productDetailImage && res[i].productDetailImage.length > 0) {
                        for (let j = 0; j < res[i].productDetailImage.length; j++) {
                            res[i].productDetailImage[j].image = new Buffer(res[i].productDetailImage[j].image, 'base64').toString('binary');
                        }
                    }
                    // Lấy thông tin sản phẩm chính
                    res[i].productData = await db.Product.findOne({ where: { id: res[i].productDetail.productId } })
                }
                if (res) {
                    resolve({
                        errCode: 0,
                        data: res
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

// Hàm xóa sản phẩm khỏi giỏ hàng
let deleteItemShopCart = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let res = await db.ShopCart.findOne({ where: { id: data.id, statusId: 0 } }) // Kiểm tra sản phẩm có trong giỏ hàng không
                if (res) {
                    await db.ShopCart.destroy({ where: { id: data.id } }) // Xóa sản phẩm khỏi giỏ hàng
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

// Xuất các function để sử dụng ở nơi khác
module.exports = {
    addShopCart: addShopCart,
    getAllShopCartByUserId: getAllShopCartByUserId,
    deleteItemShopCart: deleteItemShopCart
}
