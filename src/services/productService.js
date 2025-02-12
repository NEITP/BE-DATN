import db from "../models/index"; // Import mô hình cơ sở dữ liệu từ thư mục models
import jsrecommender from 'js-recommender' // Import thư viện gợi ý (recommendation system)
require('dotenv').config(); // Nạp các biến môi trường từ tệp .env
const { Op } = require("sequelize"); // Import toán tử Op từ Sequelize để sử dụng trong truy vấn

// Hàm sắp xếp động theo một thuộc tính cụ thể
function dynamicSort(property) {
    var sortOrder = 1; // Mặc định sắp xếp tăng dần
    if (property[0] === "-") { // Kiểm tra nếu property có dấu '-' (tức là sắp xếp giảm dần)
        sortOrder = -1;
        property = property.substr(1); // Loại bỏ dấu '-' để lấy tên thuộc tính
    }
    return function (a, b) {
        // So sánh hai đối tượng theo thuộc tính được chỉ định
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder; // Nhân với sortOrder để quyết định thứ tự tăng hay giảm
    }
}

// Hàm sắp xếp động theo nhiều thuộc tính
function dynamicSortMultiple() {
    var props = arguments; // Lấy danh sách thuộc tính được truyền vào
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* Thử tìm kết quả khác 0 (tức là không bằng nhau)
         * miễn là vẫn còn thuộc tính cần so sánh
         */
        while (result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2); // Gọi hàm dynamicSort cho từng thuộc tính
            i++;
        }
        return result; // Trả về kết quả sắp xếp
    }
}
// dynamicSort(property): Sắp xếp mảng đối tượng theo một thuộc tính nhất định, có thể tăng (property) hoặc giảm (-property).
// dynamicSortMultiple(...properties): Sắp xếp mảng đối tượng theo nhiều thuộc tính, xét ưu tiên từ trái sang phải. Nếu hai phần tử có giá trị bằng nhau ở thuộc tính đầu tiên, sẽ tiếp tục so sánh ở thuộc tính tiếp theo.

// Hàm tạo mới một sản phẩm
let createNewProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu thiếu các tham số bắt buộc
            if (!data.categoryId || !data.brandId || !data.image || !data.nameDetail) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Tạo bản ghi mới trong bảng Product
                let product = await db.Product.create({
                    name: data.name,
                    contentHTML: data.contentHTML,
                    contentMarkdown: data.contentMarkdown,
                    statusId: 'S1', // Trạng thái mặc định là 'S1'
                    categoryId: data.categoryId,
                    madeby: data.madeby, // Xuất xứ
                    material: data.material, // Chất liệu
                    brandId: data.brandId
                })

                if (product) {
                    // Tạo bản ghi mới trong bảng ProductDetail
                    let productdetail = await db.ProductDetail.create({
                        productId: product.id, // Liên kết với bảng Product
                        description: data.description,
                        originalPrice: data.originalPrice, // Giá gốc
                        discountPrice: data.discountPrice, // Giá sau giảm giá
                        nameDetail: data.nameDetail
                    })

                    if (productdetail) {
                        // Tạo bản ghi trong bảng ProductImage (lưu ảnh sản phẩm)
                        await db.ProductImage.create({
                            productdetailId: productdetail.id, // Liên kết với ProductDetail
                            image: data.image
                        })

                        // Tạo bản ghi trong bảng ProductDetailSize (lưu kích thước sản phẩm)
                        await db.ProductDetailSize.create({
                            productdetailId: productdetail.id, // Liên kết với ProductDetail
                            width: data.width, // Chiều rộng
                            height: data.height, // Chiều cao
                            sizeId: data.sizeId, // Mã kích thước
                            weight: data.weight // Trọng lượng
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
// createNewProduct(data):
// Kiểm tra đầu vào, nếu thiếu dữ liệu bắt buộc thì trả về lỗi.
// Tạo bản ghi mới trong bảng Product.
// Nếu thành công, tạo bản ghi trong ProductDetail, ProductImage, và ProductDetailSize.
// Trả về kết quả thành công hoặc lỗi.


// Hàm lấy danh sách tất cả sản phẩm dành cho admin
let getAllProductAdmin = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Tạo object để lọc dữ liệu
            let objectFilter = {
                include: [
                    { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] }, // Lấy thông tin thương hiệu
                    { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] }, // Lấy thông tin danh mục
                    { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] } // Lấy thông tin trạng thái
                ],
                raw: true, // Trả về dữ liệu ở dạng đơn giản (không có instance của Sequelize)
                nest: true // Định dạng dữ liệu dạng cây
            }

            // Nếu có limit và offset thì thêm vào objectFilter (phân trang)
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }

            // Lọc theo categoryId nếu có
            if (data.categoryId && data.categoryId !== 'ALL') {
                objectFilter.where = { categoryId: data.categoryId }
            }

            // Lọc theo brandId nếu có
            if (data.brandId && data.brandId !== 'ALL') {
                objectFilter.where = { ...objectFilter.where, brandId: data.brandId }
            }

            // Sắp xếp theo tên nếu được yêu cầu
            if (data.sortName === "true") {
                objectFilter.order = [['name', 'ASC']]
            }

            // Tìm kiếm theo từ khóa nếu có
            if (data.keyword !== '') {
                objectFilter.where = { ...objectFilter.where, name: { [Op.substring]: data.keyword } }
            }

            // Truy vấn danh sách sản phẩm từ cơ sở dữ liệu
            let res = await db.Product.findAndCountAll(objectFilter)

            // Duyệt qua danh sách sản phẩm để lấy thêm thông tin chi tiết
            for (let i = 0; i < res.rows.length; i++) {
                let objectFilterProductDetail = {
                    where: { productId: res.rows[i].id }, // Lọc theo productId
                    raw: true
                }

                // Lấy danh sách chi tiết sản phẩm (ProductDetail)
                res.rows[i].productDetail = await db.ProductDetail.findAll(objectFilterProductDetail)

                for (let j = 0; j < res.rows[i].productDetail.length; j++) {
                    // Lấy thông tin kích thước sản phẩm (ProductDetailSize)
                    res.rows[i].productDetail[j].productDetailSize = await db.ProductDetailSize.findAll({
                        where: { productdetailId: res.rows[i].productDetail[j].id },
                        raw: true
                    })

                    // Gán giá sản phẩm theo giá giảm giá của sản phẩm đầu tiên
                    res.rows[i].price = res.rows[i].productDetail[0].discountPrice

                    // Lấy danh sách hình ảnh của sản phẩm (ProductImage)
                    res.rows[i].productDetail[j].productImage = await db.ProductImage.findAll({
                        where: { productdetailId: res.rows[i].productDetail[j].id },
                        raw: true
                    })

                    // Chuyển đổi ảnh từ base64 sang định dạng nhị phân để hiển thị
                    for (let k = 0; k < res.rows[i].productDetail[j].productImage.length > 0; k++) {
                        res.rows[i].productDetail[j].productImage[k].image = new Buffer(
                            res.rows[i].productDetail[j].productImage[k].image,
                            'base64'
                        ).toString('binary')
                    }
                }
            }

            // Nếu yêu cầu sắp xếp theo giá, sử dụng hàm sắp xếp động
            if (data.sortPrice && data.sortPrice === "true") {
                res.rows.sort(dynamicSortMultiple("price"))
            }

            // Trả về kết quả
            resolve({
                errCode: 0,
                data: res.rows, // Danh sách sản phẩm
                count: res.count // Tổng số sản phẩm
            })

        } catch (error) {
            reject(error) // Bắt lỗi nếu có
        }
    })
}
// getAllProductAdmin(data):
// Lọc và lấy danh sách sản phẩm kèm theo danh mục (categoryData), thương hiệu (brandData), và trạng thái (statusData).
// Hỗ trợ phân trang với limit và offset.
// Hỗ trợ lọc theo danh mục (categoryId), thương hiệu (brandId), từ khóa (keyword).
// Hỗ trợ sắp xếp theo tên (sortName) và giá (sortPrice).
// Truy vấn thêm chi tiết sản phẩm, kích thước, hình ảnh.
// Chuyển đổi ảnh từ base64 sang binary trước khi trả về.
// Trả về danh sách sản phẩm và số lượng sản phẩm.

// Hàm lấy danh sách sản phẩm dành cho người dùng
let getAllProductUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {
                where: { statusId: 'S1' }, // Chỉ lấy sản phẩm có trạng thái hoạt động (S1)
                include: [
                    { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] }, // Lấy dữ liệu thương hiệu
                    { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] }, // Lấy dữ liệu danh mục
                    { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] }, // Lấy dữ liệu trạng thái
                ],
                raw: true,
                nest: true
            }

            // Kiểm tra và áp dụng phân trang
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }

            // Lọc theo categoryId nếu có
            if (data.categoryId && data.categoryId !== 'ALL')
                objectFilter.where = { categoryId: data.categoryId }

            // Lọc theo brandId nếu có
            if (data.brandId && data.brandId !== 'ALL')
                objectFilter.where = { ...objectFilter.where, brandId: data.brandId }

            // Sắp xếp theo tên nếu được yêu cầu
            if (data.sortName === "true")
                objectFilter.order = [['name', 'ASC']]

            // Lọc theo từ khóa tìm kiếm nếu có
            if (data.keyword !== '')
                objectFilter.where = { ...objectFilter.where, name: { [Op.substring]: data.keyword } }

            // Truy vấn danh sách sản phẩm từ database
            let res = await db.Product.findAndCountAll(objectFilter)

            for (let i = 0; i < res.rows.length; i++) {
                let objectFilterProductDetail = {
                    where: { productId: res.rows[i].id },
                    raw: true
                }

                // Lấy danh sách chi tiết sản phẩm
                res.rows[i].productDetail = await db.ProductDetail.findAll(objectFilterProductDetail)

                for (let j = 0; j < res.rows[i].productDetail.length; j++) {
                    // Lấy thông tin kích thước sản phẩm
                    res.rows[i].productDetail[j].productDetailSize = await db.ProductDetailSize.findAll({
                        where: { productdetailId: res.rows[i].productDetail[j].id },
                        raw: true
                    })

                    // Gán giá sản phẩm theo giá giảm giá của sản phẩm đầu tiên
                    res.rows[i].price = res.rows[i].productDetail[0].discountPrice

                    // Lấy danh sách hình ảnh sản phẩm
                    res.rows[i].productDetail[j].productImage = await db.ProductImage.findAll({
                        where: { productdetailId: res.rows[i].productDetail[j].id },
                        raw: true
                    })

                    // Chuyển đổi ảnh từ base64 sang định dạng nhị phân để hiển thị
                    for (let k = 0; k < res.rows[i].productDetail[j].productImage.length; k++) {
                        res.rows[i].productDetail[j].productImage[k].image = new Buffer(
                            res.rows[i].productDetail[j].productImage[k].image, 'base64'
                        ).toString('binary')
                    }
                }
            }

            // Nếu yêu cầu sắp xếp theo giá, sử dụng hàm sắp xếp động
            if (data.sortPrice && data.sortPrice === "true") {
                res.rows.sort(dynamicSortMultiple("price"))
            }

            resolve({
                errCode: 0,
                data: res.rows, // Trả về danh sách sản phẩm
                count: res.count // Tổng số lượng sản phẩm
            })

        } catch (error) {
            reject(error) // Bắt lỗi nếu có
        }
    })
}
// getAllProductUser(data):
// Lấy danh sách sản phẩm đang hoạt động (statusId = 'S1').
// Hỗ trợ phân trang (limit, offset).
// Hỗ trợ lọc theo danh mục (categoryId), thương hiệu (brandId), từ khóa (keyword).
// Hỗ trợ sắp xếp theo tên (sortName) và giá (sortPrice).
// Truy vấn thêm thông tin chi tiết về sản phẩm (kích thước, hình ảnh).
// Chuyển đổi ảnh từ base64 sang binary để hiển thị



// Hàm vô hiệu hóa (ẩn) một sản phẩm
let UnactiveProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu thiếu id sản phẩm
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Tìm kiếm sản phẩm theo id
                let product = await db.Product.findOne({
                    where: { id: data.id },
                    raw: false // Cần dạng instance để có thể cập nhật
                })

                // Nếu không tìm thấy sản phẩm, trả về lỗi
                if (!product) {
                    resolve({
                        errCode: 2,
                        errMessage: `The product isn't exist`
                    })
                } else {
                    // Cập nhật trạng thái sản phẩm thành 'S2' (không hoạt động)
                    product.statusId = 'S2';
                    await product.save(); // Lưu thay đổi vào database
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                }
            }
        } catch (error) {
            reject(error) // Bắt lỗi nếu có
        }
    })
}
// UnactiveProduct(data):
// Nhận ID sản phẩm cần ngừng hoạt động.
// Kiểm tra xem sản phẩm có tồn tại không.
// Nếu có, cập nhật trạng thái thành 'S2' (ngừng hoạt động).
// Trả về kết quả thành công hoặc lỗi

// Hàm hiện một sản phẩm
let ActiveProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu không có ID sản phẩm truyền vào
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Tìm sản phẩm trong database theo ID
                let product = await db.Product.findOne({
                    where: { id: data.id },
                    raw: false // Để có thể cập nhật dữ liệu
                })

                // Nếu sản phẩm không tồn tại, trả về lỗi
                if (!product) {
                    resolve({
                        errCode: 2,
                        errMessage: `The product isn't exist`
                    })
                } else {
                    // Cập nhật trạng thái sản phẩm thành 'S1' (đang hoạt động)
                    product.statusId = 'S1';
                    await product.save(); // Lưu thay đổi vào database

                    // Trả về kết quả thành công
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                }
            }
        } catch (error) {
            reject(error) // Bắt lỗi nếu có
        }
    })
}
// ActiveProduct(data):
// Kích hoạt lại sản phẩm bằng cách đặt trạng thái statusId = 'S1'.
// Trả về lỗi nếu không có ID sản phẩm hoặc sản phẩm không tồn tại.


// Hàm xem chi tiết sản phảm theo ID
let getDetailProductById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu không có ID sản phẩm
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Truy vấn thông tin sản phẩm theo ID
                let res = await db.Product.findOne({
                    where: { id: id },
                    include: [
                        { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] }, // Lấy thông tin thương hiệu
                        { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] }, // Lấy thông tin danh mục
                        { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] } // Lấy thông tin trạng thái
                    ],
                    raw: true,
                    nest: true
                })

                // Cập nhật số lượt xem của sản phẩm
                let product = await db.Product.findOne({
                    where: { id: id },
                    raw: false
                })
                product.view = product.view + 1
                await product.save()

                // Truy vấn chi tiết sản phẩm
                res.productDetail = await db.ProductDetail.findAll({
                    where: { productId: res.id }
                })

                for (let i = 0; i < res.productDetail.length > 0; i++) {
                    // Lấy danh sách hình ảnh của sản phẩm
                    res.productDetail[i].productImage = await db.ProductImage.findAll({
                        where: { productdetailId: res.productDetail[i].id }
                    })

                    // Lấy danh sách kích thước sản phẩm
                    res.productDetail[i].productDetailSize = await db.ProductDetailSize.findAll({
                        where: { productdetailId: res.productDetail[i].id },
                        include: [
                            { model: db.Allcode, as: 'sizeData', attributes: ['value', 'code'] }
                        ],
                        raw: true,
                        nest: true
                    })

                    // Chuyển đổi ảnh từ base64 sang binary để hiển thị
                    for (let j = 0; j < res.productDetail[i].productImage.length; j++) {
                        res.productDetail[i].productImage[j].image = new Buffer(
                            res.productDetail[i].productImage[j].image, 'base64'
                        ).toString('binary')
                    }

                    // Tính toán số lượng tồn kho của từng kích thước sản phẩm
                    for (let k = 0; k < res.productDetail[i].productDetailSize.length; k++) {
                        let receiptDetail = await db.ReceiptDetail.findAll({
                            where: { productDetailSizeId: res.productDetail[i].productDetailSize[k].id }
                        })
                        let orderDetail = await db.OrderDetail.findAll({
                            where: { productId: res.productDetail[i].productDetailSize[k].id }
                        })
                        let quantity = 0

                        // Cộng dồn số lượng nhập kho
                        for (let g = 0; g < receiptDetail.length; g++) {
                            quantity = quantity + receiptDetail[g].quantity
                        }

                        // Trừ đi số lượng sản phẩm đã đặt nhưng chưa hủy
                        for (let h = 0; h < orderDetail.length; h++) {
                            let order = await db.OrderProduct.findOne({
                                where: { id: orderDetail[h].orderId }
                            })
                            if (order.statusId != 'S7') { // Nếu đơn hàng chưa bị hủy
                                quantity = quantity - orderDetail[h].quantity
                            }
                        }

                        // Cập nhật số lượng tồn kho
                        res.productDetail[i].productDetailSize[k].stock = quantity
                    }
                }

                // Trả về kết quả
                resolve({
                    errCode: 0,
                    data: res
                })
            }

        } catch (error) {
            reject(error)
        }
    })
}
// getDetailProductById(id):
// Truy vấn chi tiết sản phẩm theo ID.
// Cập nhật số lượt xem của sản phẩm.
// Lấy danh sách hình ảnh, kích thước và số lượng tồn kho của sản phẩm.
// Tính toán số lượng tồn kho dựa trên phiếu nhập kho và đơn hàng chưa hủy.

// Hàm cập nhật sản phẩm
let updateProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu thiếu ID, danh mục hoặc thương hiệu
            if (!data.id || !data.categoryId || !data.brandId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Tìm sản phẩm theo ID
                let product = await db.Product.findOne({
                    where: { id: data.id },
                    raw: false // Cho phép cập nhật dữ liệu
                })

                // Nếu sản phẩm tồn tại, cập nhật thông tin
                if (product) {
                    product.name = data.name; // Cập nhật tên sản phẩm
                    product.material = data.material; // Cập nhật chất liệu
                    product.madeby = data.madeby; // Cập nhật nơi sản xuất
                    product.brandId = data.brandId; // Cập nhật thương hiệu
                    product.categoryId = data.categoryId; // Cập nhật danh mục
                    product.contentMarkdown = data.contentMarkdown; // Cập nhật mô tả dạng Markdown
                    product.contentHTML = data.contentHTML; // Cập nhật mô tả dạng HTML

                    await product.save() // Lưu thay đổi vào database

                    // Trả về kết quả thành công
                    resolve({
                        errCode: 0,
                        errMessage: ''
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}
// updateProduct(data):
// Cập nhật thông tin sản phẩm theo ID.
// Nếu thiếu thông tin quan trọng (ID, danh mục, thương hiệu), trả về lỗi

// Hàm tìm danh sách chi tiết sản phẩm theo ID sản phẩm
let getAllProductDetailById = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra tham số đầu vào
            if (!data.id || !data.limit || !data.offset) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Tìm danh sách chi tiết sản phẩm theo ID sản phẩm với phân trang
                let productdetail = await db.ProductDetail.findAndCountAll({
                    where: { productId: data.id },
                    limit: +data.limit, // Giới hạn số lượng bản ghi
                    offset: +data.offset // Bỏ qua số lượng bản ghi để phân trang
                })

                // Nếu có chi tiết sản phẩm, lấy thêm dữ liệu ảnh và kích thước
                if (productdetail.rows && productdetail.rows.length > 0) {
                    for (let i = 0; i < productdetail.rows.length; i++) {
                        // Lấy danh sách ảnh của từng chi tiết sản phẩm
                        productdetail.rows[i].productImageData = await db.ProductImage.findAll({
                            where: { productdetailId: productdetail.rows[i].id }
                        })

                        // Lấy danh sách kích thước của từng chi tiết sản phẩm
                        productdetail.rows[i].productsize = await db.ProductDetailSize.findAll({
                            where: { productdetailId: productdetail.rows[i].id }
                        })

                        // Chuyển đổi ảnh từ base64 sang binary để hiển thị
                        if (productdetail.rows[i].productImageData && productdetail.rows[i].productImageData.length > 0) {
                            for (let j = 0; j < productdetail.rows[i].productImageData.length > 0; j++) {
                                productdetail.rows[i].productImageData[j].image = new Buffer(
                                    productdetail.rows[i].productImageData[j].image, 'base64'
                                ).toString('binary')
                            }
                        }
                    }
                }

                // Trả về kết quả gồm danh sách chi tiết sản phẩm và tổng số lượng
                resolve({
                    errCode: 0,
                    data: productdetail.rows,
                    count: productdetail.count
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
// Hàm tìm danh sách ảnh của chi tiết sản phẩm
let getAllProductDetailImageById = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra tham số đầu vào
            if (!data.id || !data.limit || !data.offset) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Tìm danh sách ảnh của chi tiết sản phẩm với phân trang
                let productImage = await db.ProductImage.findAndCountAll({
                    where: { productdetailId: data.id },
                    limit: +data.limit,
                    offset: +data.offset
                })

                // Chuyển đổi ảnh từ base64 sang binary
                if (productImage.rows && productImage.rows.length > 0) {
                    productImage.rows.map(item => item.image = new Buffer(item.image, 'base64').toString('binary'))
                }

                // Trả về danh sách ảnh và số lượng ảnh
                resolve({
                    errCode: 0,
                    data: productImage.rows,
                    count: productImage.count
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
// Hàm tạo mới một bản ghi chi tiết sản phẩm
let createNewProductDetail = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra tham số đầu vào
            if (!data.image || !data.nameDetail || !data.originalPrice || !data.discountPrice || !data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Tạo mới một bản ghi chi tiết sản phẩm
                let productdetail = await db.ProductDetail.create({
                    productId: data.id,
                    description: data.description,
                    originalPrice: data.originalPrice,
                    discountPrice: data.discountPrice,
                    nameDetail: data.nameDetail
                })

                // Nếu tạo thành công, thêm ảnh và kích thước cho sản phẩm
                if (productdetail) {
                    // Thêm ảnh vào bảng ProductImage
                    await db.ProductImage.create({
                        productdetailId: productdetail.id,
                        image: data.image
                    })

                    // Thêm kích thước vào bảng ProductDetailSize
                    await db.ProductDetailSize.create({
                        productdetailId: productdetail.id,
                        width: data.width,
                        height: data.height,
                        sizeId: data.sizeId,
                        weight: data.weight
                    })
                }

                // Trả về kết quả thành công
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
// Hàm cập nhật thông tin chi tiết sản phẩm theo ID
let updateProductDetail = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem các tham số bắt buộc có đầy đủ không
            if (!data.nameDetail || !data.originalPrice || !data.discountPrice || !data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu tham số
                })
            } else {
                // Tìm sản phẩm trong cơ sở dữ liệu theo ID
                let productDetail = await db.ProductDetail.findOne({
                    where: { id: data.id },
                    raw: false // Cho phép cập nhật dữ liệu
                })

                // Nếu tìm thấy sản phẩm, tiến hành cập nhật thông tin
                if (productDetail) {
                    productDetail.nameDetail = data.nameDetail // Cập nhật tên sản phẩm
                    productDetail.originalPrice = data.originalPrice // Giá gốc
                    productDetail.discountPrice = data.discountPrice // Giá sau giảm
                    productDetail.description = data.description // Mô tả sản phẩm
                    await productDetail.save(); // Lưu thay đổi vào database

                    resolve({
                        errCode: 0,
                        errMessage: 'ok' // Trả về kết quả thành công
                    })
                } else {
                    // Nếu không tìm thấy sản phẩm, trả về lỗi
                    resolve({
                        errCode: 2,
                        errMessage: 'Product not found!'
                    })
                }
            }
        } catch (error) {
            reject(error) // Xử lý lỗi khi truy vấn database
        }
    })
}
// Hàm lấy thông tin chi tiết sản phẩm theo ID
let getDetailProductDetailById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra tham số đầu vào có tồn tại không
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu ID
                })
            } else {
                // Truy vấn cơ sở dữ liệu để tìm chi tiết sản phẩm theo ID
                let productdetail = await db.ProductDetail.findOne({
                    where: { id: id },
                })

                // Trả về dữ liệu chi tiết sản phẩm
                resolve({
                    errCode: 0,
                    data: productdetail
                })
            }
        } catch (error) {
            reject(error) // Xử lý lỗi
        }
    })
}
// Hàm thêm ảnh mới cho sản phẩm
let createNewProductDetailImage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem các tham số bắt buộc có đầy đủ không
            if (!data.image || !data.caption || !data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu tham số
                })
            } else {
                // Thêm ảnh mới vào bảng ProductImage trong cơ sở dữ liệu
                await db.ProductImage.create({
                    productdetailId: data.id, // ID của chi tiết sản phẩm
                    caption: data.caption, // Chú thích ảnh
                    image: data.image // Ảnh (base64 hoặc đường dẫn)
                })

                // Trả về thông báo thành công
                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }
        } catch (error) {
            reject(error) // Xử lý lỗi nếu có
        }
    })
}
// Hàm lấy thông tin ảnh sản phẩm theo ID
let getDetailProductImageById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem ID có được truyền vào không
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu ID
                })
            } else {
                // Truy vấn database để tìm ảnh sản phẩm theo ID
                let productdetailImage = await db.ProductImage.findOne({
                    where: { id: id },
                })

                // Nếu tìm thấy ảnh, chuyển đổi dữ liệu ảnh từ base64 sang binary
                if (productdetailImage) {
                    productdetailImage.image = new Buffer(productdetailImage.image, 'base64').toString('binary');
                }

                // Trả về dữ liệu ảnh
                resolve({
                    errCode: 0,
                    data: productdetailImage
                })
            }
        } catch (error) {
            reject(error) // Xử lý lỗi nếu có
        }
    })
}
// Hàm cập nhật ảnh sản phẩm
let updateProductDetailImage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem các tham số cần thiết có được truyền vào không
            if (!data.id || !data.caption || !data.image) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu dữ liệu
                })
            } else {
                // Tìm ảnh sản phẩm trong database theo ID
                let productImage = await db.ProductImage.findOne({
                    where: { id: data.id },
                    raw: false // Cho phép cập nhật dữ liệu
                })

                // Nếu tìm thấy ảnh, cập nhật thông tin
                if (productImage) {
                    productImage.caption = data.caption // Cập nhật chú thích
                    productImage.image = data.image // Cập nhật ảnh

                    await productImage.save(); // Lưu thay đổi vào database

                    resolve({
                        errCode: 0,
                        errMessage: 'ok' // Trả về kết quả thành công
                    })
                } else {
                    // Nếu không tìm thấy ảnh, báo lỗi
                    resolve({
                        errCode: 2,
                        errMessage: 'Product Image not found!'
                    })
                }
            }
        } catch (error) {
            reject(error) // Xử lý lỗi nếu có
        }
    })
}
// Hàm xóa ảnh sản phẩm
let deleteProductDetailImage = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem ID có được truyền vào không
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu ID
                })
            } else {
                // Tìm ảnh sản phẩm trong database theo ID
                let productImage = await db.ProductImage.findOne({
                    where: { id: data.id },
                    raw: false
                })

                // Nếu tìm thấy ảnh, tiến hành xóa
                if (productImage) {
                    await db.ProductImage.destroy({
                        where: { id: data.id }
                    })
                    resolve({
                        errCode: 0,
                        errMessage: 'ok' // Trả về kết quả thành công
                    })
                } else {
                    // Nếu không tìm thấy ảnh, báo lỗi
                    resolve({
                        errCode: 2,
                        errMessage: 'Product Image not found!'
                    })
                }
            }
        } catch (error) {
            reject(error) // Xử lý lỗi nếu có
        }
    })
}
// Hàm Xóa thông tin sản phẩm
let deleteProductDetail = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem ID có được truyền vào không
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu ID
                })
            } else {
                // Tìm sản phẩm theo ID
                let productDetail = await db.ProductDetail.findOne({
                    where: { id: data.id }
                })

                if (productDetail) {
                    // Xóa sản phẩm nếu tìm thấy
                    await db.ProductDetail.destroy({
                        where: { id: data.id }
                    })

                    // Tìm và xóa ảnh liên quan đến sản phẩm
                    let productImg = await db.ProductImage.findOne({
                        where: { productdetailId: data.id }
                    })
                    if (productImg) {
                        await db.ProductImage.destroy({
                            where: { productdetailId: data.id }
                        })
                    }

                    // Tìm và xóa kích thước sản phẩm liên quan
                    let productSize = await db.ProductDetailSize.findOne({
                        where: { productdetailId: data.id }
                    })
                    if (productSize) {
                        await db.ProductDetailSize.destroy({
                            where: { productdetailId: data.id }
                        })
                    }

                    resolve({
                        errCode: 0,
                        errMessage: 'ok' // Trả về kết quả thành công
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Product not found!' // Báo lỗi nếu không tìm thấy sản phẩm
                    })
                }
            }
        } catch (error) {
            reject(error) // Xử lý lỗi nếu có
        }
    })
}
// Hàm lấy danh sách kích thước của sản phẩm
let getAllProductDetailSizeById = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem các tham số cần thiết có được truyền vào không
            if (!data.id || !data.limit || !data.offset) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu dữ liệu
                })
            } else {
                // Truy vấn danh sách kích thước của sản phẩm
                let productsize = await db.ProductDetailSize.findAndCountAll({
                    where: { productdetailId: data.id },
                    limit: +data.limit,  // Giới hạn số lượng kết quả
                    offset: +data.offset, // Phân trang
                    include: [
                        { model: db.Allcode, as: 'sizeData', attributes: ['value', 'code'] }
                    ],
                    raw: true,
                    nest: true
                })

                // Tính toán số lượng tồn kho
                for (let i = 0; i < productsize.rows.length > 0; i++) {
                    let receiptDetail = await db.ReceiptDetail.findAll({ where: { productDetailSizeId: productsize.rows[i].id } })
                    let orderDetail = await db.OrderDetail.findAll({ where: { productId: productsize.rows[i].id } })
                    let quantity = 0

                    // Cộng dồn số lượng từ phiếu nhập hàng
                    for (let j = 0; j < receiptDetail.length; j++) {
                        quantity = quantity + receiptDetail[j].quantity
                    }

                    // Trừ số lượng từ đơn hàng chưa giao
                    for (let k = 0; k < orderDetail.length; k++) {
                        let order = await db.OrderProduct.findOne({ where: { id: orderDetail[k].orderId } })
                        if (order.statusId != 'S7') {
                            quantity = quantity - orderDetail[k].quantity
                        }
                    }

                    // Cập nhật số lượng tồn kho vào danh sách sản phẩm
                    productsize.rows[i].stock = quantity
                }

                resolve({
                    errCode: 0,
                    data: productsize.rows, // Trả về danh sách kích thước
                    count: productsize.count // Trả về tổng số kết quả
                })
            }
        } catch (error) {
            reject(error) // Xử lý lỗi nếu có
        }
    })
}
// Hàm Tạo kích thước mới cho sản phẩm
let createNewProductDetailSize = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem các tham số cần thiết có được truyền vào không
            if (!data.productdetailId || !data.sizeId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu dữ liệu
                })
            } else {
                // Thêm kích thước mới cho sản phẩm vào database
                await db.ProductDetailSize.create({
                    productdetailId: data.productdetailId, // ID sản phẩm
                    sizeId: data.sizeId, // ID kích thước
                    width: data.width, // Chiều rộng
                    height: data.height, // Chiều cao
                    weight: data.weight, // Cân nặng
                })
                resolve({
                    errCode: 0,
                    errMessage: 'ok' // Trả về kết quả thành công
                })
            }
        } catch (error) {
            reject(error) // Xử lý lỗi nếu có
        }
    })
}
// Hàm Lấy chi tiết kích thước sản phẩm theo ID
let getDetailProductDetailSizeById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem ID có được truyền vào không
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu ID
                })
            } else {
                // Tìm thông tin kích thước sản phẩm theo ID
                let res = await db.ProductDetailSize.findOne({
                    where: { id: id }
                })

                resolve({
                    errCode: 0,
                    data: res // Trả về dữ liệu nếu tìm thấy
                })
            }
        } catch (error) {
            reject(error) // Xử lý lỗi nếu có
        }
    })
}
// Hàm Cập nhật kích thước sản phẩm
let updateProductDetailSize = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem ID và sizeId có được truyền vào không
            if (!data.id || !data.sizeId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu dữ liệu
                })
            } else {
                // Tìm kích thước sản phẩm theo ID
                let res = await db.ProductDetailSize.findOne({
                    where: { id: data.id },
                    raw: false
                })

                if (res) {
                    // Cập nhật các giá trị
                    res.sizeId = data.sizeId
                    res.width = data.width
                    res.height = data.height
                    res.weight = data.weight

                    // Lưu thay đổi vào database
                    await res.save()

                    resolve({
                        errCode: 0,
                        errMessage: 'ok' // Trả về kết quả thành công
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Product Detail Size not found!' // Báo lỗi nếu không tìm thấy kích thước sản phẩm
                    })
                }
            }
        } catch (error) {
            reject(error) // Xử lý lỗi nếu có
        }
    })
}
// Hàm Xóa kích thước sản phẩm theo ID
let deleteProductDetailSize = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra xem ID có được truyền vào không
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!' // Báo lỗi nếu thiếu ID
                })
            } else {
                // Tìm kích thước sản phẩm theo ID
                let res = await db.ProductDetailSize.findOne({
                    where: { id: data.id },
                    raw: false
                })

                if (res) {
                    // Xóa kích thước sản phẩm khỏi database
                    await db.ProductDetailSize.destroy({
                        where: { id: data.id }
                    })
                    resolve({
                        errCode: 0,
                        errMessage: 'ok' // Trả về kết quả thành công
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Product Detail Size not found!' // Báo lỗi nếu không tìm thấy kích thước sản phẩm
                    })
                }
            }
        } catch (error) {
            reject(error) // Xử lý lỗi nếu có
        }
    })
}
// Hàm lấy danh sách sản phẩm nổi bật (dựa vào lượt xem cao nhất)
let getProductFeature = (limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Truy vấn danh sách sản phẩm từ DB
            let res = await db.Product.findAll({
                include: [
                    { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] },
                    { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] },
                    { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] },
                ],
                limit: +limit,  // Giới hạn số lượng sản phẩm trả về
                order: [['view', 'DESC']], // Sắp xếp theo lượt xem giảm dần
                raw: true,
                nest: true
            });

            // Lặp qua từng sản phẩm để lấy thông tin chi tiết
            for (let i = 0; i < res.length; i++) {
                // Lấy danh sách chi tiết sản phẩm theo productId
                res[i].productDetail = await db.ProductDetail.findAll({
                    where: { productId: res[i].id }, raw: true
                });

                // Lặp qua danh sách chi tiết sản phẩm
                for (let j = 0; j < res[i].productDetail.length; j++) {
                    // Lấy danh sách kích thước sản phẩm
                    res[i].productDetail[j].productDetailSize = await db.ProductDetailSize.findAll({
                        where: { productdetailId: res[i].productDetail[j].id }, raw: true
                    });

                    // Gán giá của sản phẩm dựa vào giá giảm của sản phẩm đầu tiên
                    res[i].price = res[i].productDetail[0].discountPrice;

                    // Lấy danh sách hình ảnh của từng sản phẩm
                    res[i].productDetail[j].productImage = await db.ProductImage.findAll({
                        where: { productdetailId: res[i].productDetail[j].id }, raw: true
                    });

                    // Chuyển đổi ảnh từ base64 sang binary
                    for (let k = 0; k < res[i].productDetail[j].productImage.length; k++) {
                        res[i].productDetail[j].productImage[k].image =
                            new Buffer(res[i].productDetail[j].productImage[k].image, 'base64').toString('binary');
                    }
                }
            }

            // Trả về kết quả thành công
            resolve({
                errCode: 0,
                data: res
            });

        } catch (error) {
            reject(error);
        }
    });
};

// Hàm lấy danh sách sản phẩm mới nhất (dựa vào thời gian tạo)
let getProductNew = (limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let res = await db.Product.findAll({
                include: [
                    { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] },
                    { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] },
                    { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] },
                ],
                limit: +limit,
                order: [['createdAt', 'DESC']], // Sắp xếp theo ngày tạo giảm dần
                raw: true,
                nest: true
            });

            for (let i = 0; i < res.length; i++) {
                res[i].productDetail = await db.ProductDetail.findAll({
                    where: { productId: res[i].id }, raw: true
                });

                for (let j = 0; j < res[i].productDetail.length; j++) {
                    res[i].productDetail[j].productDetailSize = await db.ProductDetailSize.findAll({
                        where: { productdetailId: res[i].productDetail[j].id }, raw: true
                    });

                    res[i].price = res[i].productDetail[0].discountPrice;
                    res[i].productDetail[j].productImage = await db.ProductImage.findAll({
                        where: { productdetailId: res[i].productDetail[j].id }, raw: true
                    });

                    for (let k = 0; k < res[i].productDetail[j].productImage.length; k++) {
                        res[i].productDetail[j].productImage[k].image =
                            new Buffer(res[i].productDetail[j].productImage[k].image, 'base64').toString('binary');
                    }
                }
            }

            resolve({
                errCode: 0,
                data: res
            });

        } catch (error) {
            reject(error);
        }
    });
};

// Hàm lấy danh sách sản phẩm trong giỏ hàng của người dùng
let getProductShopCart = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let productArr = [];

            // Kiểm tra đầu vào hợp lệ
            if (!data.userId && !data.limit) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                });
            } else {
                // Lấy danh sách sản phẩm trong giỏ hàng theo userId
                let shopcart = await db.ShopCart.findAll({ where: { userId: data.userId } });

                for (let i = 0; i < shopcart.length; i++) {
                    let productDetailSize = await db.ProductDetailSize.findOne({
                        where: { id: shopcart[i].productdetailsizeId }
                    });

                    let productDetail = await db.ProductDetail.findOne({
                        where: { id: productDetailSize.productdetailId }
                    });

                    let product = await db.Product.findOne({
                        where: { id: productDetail.productId },
                        include: [
                            { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] },
                            { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] },
                            { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] },
                        ],
                        raw: true,
                        nest: true
                    });

                    productArr.push(product);
                }

                if (productArr && productArr.length > 0) {
                    for (let g = 0; g < productArr.length; g++) {
                        productArr[g].productDetail = await db.ProductDetail.findAll({
                            where: { productId: productArr[g].id }, raw: true
                        });

                        for (let j = 0; j < productArr[g].productDetail.length; j++) {
                            productArr[g].productDetail[j].productDetailSize = await db.ProductDetailSize.findAll({
                                where: { productdetailId: productArr[g].productDetail[j].id }, raw: true
                            });

                            productArr[g].price = productArr[g].productDetail[0].discountPrice;
                            productArr[g].productDetail[j].productImage = await db.ProductImage.findAll({
                                where: { productdetailId: productArr[g].productDetail[j].id }, raw: true
                            });

                            for (let k = 0; k < productArr[g].productDetail[j].productImage.length; k++) {
                                productArr[g].productDetail[j].productImage[k].image =
                                    new Buffer(productArr[g].productDetail[j].productImage[k].image, 'base64').toString('binary');
                            }
                        }
                    }
                }

                resolve({
                    errCode: 0,
                    data: productArr
                });
            }

        } catch (error) {
            reject(error);
        }
    });
};

let getProductRecommend = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let productArr = []

            // Kiểm tra nếu thiếu tham số userId hoặc limit thì trả về lỗi
            if (!data.userId && !data.limit) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                // Khởi tạo hệ thống gợi ý sử dụng thư viện jsrecommender
                let recommender = new jsrecommender.Recommender();

                // Tạo bảng dữ liệu để huấn luyện mô hình
                let table = new jsrecommender.Table();

                // Lấy danh sách các đánh giá sản phẩm có điểm đánh giá (star) khác null
                let rateList = await db.Comment.findAll({
                    where: {
                        star: { [Op.not]: null } // Chỉ lấy các đánh giá có điểm số
                    }
                })

                // Duyệt qua danh sách đánh giá và thêm dữ liệu vào bảng
                for (let i = 0; i < rateList.length; i++) {
                    table.setCell(`${rateList[i].productId}`, `${rateList[i].userId}`, rateList[i].star)
                }

                // Huấn luyện mô hình dựa trên bảng dữ liệu
                let model = recommender.fit(table);

                // Dự đoán bảng dữ liệu mới sau khi huấn luyện
                let predicted_table = recommender.transform(table);

                // Duyệt qua danh sách người dùng được mô hình dự đoán
                for (let i = 0; i < predicted_table.columnNames.length; ++i) {
                    let user = predicted_table.columnNames[i];

                    // Duyệt qua danh sách sản phẩm
                    for (let j = 0; j < predicted_table.rowNames.length; ++j) {
                        let product = predicted_table.rowNames[j];

                        // Nếu user hiện tại trùng với userId đầu vào và điểm đánh giá dự đoán > 3
                        if (user == data.userId && Math.round(predicted_table.getCell(product, user)) > 3) {
                            // Lấy thông tin sản phẩm từ database
                            let productdata = await db.Product.findOne({ where: { id: product } })

                            // Nếu danh sách sản phẩm gợi ý đã đủ số lượng limit, dừng vòng lặp
                            if (productArr.length == +data.limit) {
                                break;
                            } else {
                                productArr.push(productdata) // Thêm sản phẩm vào danh sách
                            }
                        }
                    }
                }

                // Nếu danh sách sản phẩm gợi ý có dữ liệu, lấy thêm thông tin chi tiết của sản phẩm
                if (productArr && productArr.length > 0) {
                    for (let g = 0; g < productArr.length; g++) {
                        let objectFilterProductDetail = {
                            where: { productId: productArr[g].id }, raw: true
                        }

                        // Lấy danh sách chi tiết sản phẩm theo productId
                        productArr[g].productDetail = await db.ProductDetail.findAll(objectFilterProductDetail)

                        for (let j = 0; j < productArr[g].productDetail.length; j++) {
                            // Lấy danh sách kích thước sản phẩm
                            productArr[g].productDetail[j].productDetailSize = await db.ProductDetailSize.findAll({
                                where: { productdetailId: productArr[g].productDetail[j].id }, raw: true
                            })

                            // Lấy giá khuyến mãi của sản phẩm
                            productArr[g].price = productArr[g].productDetail[0].discountPrice

                            // Lấy danh sách hình ảnh sản phẩm
                            productArr[g].productDetail[j].productImage = await db.ProductImage.findAll({
                                where: { productdetailId: productArr[g].productDetail[j].id }, raw: true
                            })

                            // Chuyển đổi dữ liệu ảnh từ base64 sang binary
                            for (let k = 0; k < productArr[g].productDetail[j].productImage.length > 0; k++) {
                                productArr[g].productDetail[j].productImage[k].image = new Buffer(
                                    productArr[g].productDetail[j].productImage[k].image, 'base64'
                                ).toString('binary')
                            }
                        }
                    }
                }

                // Trả về danh sách sản phẩm được gợi ý
                resolve({
                    errCode: 0,
                    data: productArr
                })
            }

        } catch (error) {
            reject(error) // Bắt lỗi nếu có lỗi xảy ra
        }
    })
}

module.exports = {
    createNewProduct: createNewProduct,
    getAllProductAdmin: getAllProductAdmin,
    getAllProductUser: getAllProductUser,
    UnactiveProduct: UnactiveProduct,
    ActiveProduct: ActiveProduct,
    getDetailProductById: getDetailProductById,
    updateProduct: updateProduct,
    getAllProductDetailById: getAllProductDetailById,
    getAllProductDetailImageById: getAllProductDetailImageById,
    createNewProductDetail: createNewProductDetail,
    updateProductDetail: updateProductDetail,
    getDetailProductDetailById: getDetailProductDetailById,
    createNewProductDetailImage: createNewProductDetailImage,
    getDetailProductImageById: getDetailProductImageById,
    updateProductDetailImage: updateProductDetailImage,
    deleteProductDetailImage: deleteProductDetailImage,
    deleteProductDetail: deleteProductDetail,
    getAllProductDetailSizeById: getAllProductDetailSizeById,
    createNewProductDetailSize: createNewProductDetailSize,
    getDetailProductDetailSizeById: getDetailProductDetailSizeById,
    updateProductDetailSize: updateProductDetailSize,
    deleteProductDetailSize: deleteProductDetailSize,
    getProductFeature: getProductFeature,
    getProductNew: getProductNew,
    getProductShopCart: getProductShopCart,
    getProductRecommend: getProductRecommend
}