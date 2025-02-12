import db from "../models/index";

/**
 * Tạo địa chỉ mới cho user
 * @param {Object} data - Dữ liệu địa chỉ của user
 * @returns {Promise<Object>} - Trả về object chứa errCode và errMessage
 */
const createNewAddressUser = async (data) => {
    try {
        // Kiểm tra nếu userId bị thiếu
        if (!data.userId) {
            return { errCode: 1, errMessage: 'Missing required parameter: userId' };
        }

        // Thêm địa chỉ mới vào database
        await db.AddressUser.create({
            userId: data.userId,
            shipName: data.shipName,
            shipAdress: data.shipAdress,
            shipEmail: data.shipEmail,
            shipPhonenumber: data.shipPhonenumber,
        });

        return { errCode: 0, errMessage: 'OK' };
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy danh sách tất cả địa chỉ của user dựa vào userId
 * @param {number} userId - ID của user
 * @returns {Promise<Object>} - Danh sách địa chỉ
 */
const getAllAddressUserByUserId = async (userId) => {
    try {
        if (!userId) {
            return { errCode: 1, errMessage: 'Missing required parameter: userId' };
        }

        // Lấy tất cả địa chỉ của user từ database
        const res = await db.AddressUser.findAll({ where: { userId } });
        return { errCode: 0, data: res };
    } catch (error) {
        throw error;
    }
};

/**
 * Xóa địa chỉ user dựa vào ID
 * @param {number} id - ID của địa chỉ cần xóa
 * @returns {Promise<Object>} - Trạng thái xóa
 */
const deleteAddressUser = async (id) => {
    try {
        if (!id) {
            return { errCode: 1, errMessage: 'Missing required parameter: id' };
        }

        // Kiểm tra địa chỉ có tồn tại không
        const addressUser = await db.AddressUser.findOne({ where: { id } });
        if (!addressUser) {
            return { errCode: -1, errMessage: 'Địa chỉ user không tìm thấy' };
        }

        // Tiến hành xóa địa chỉ
        await db.AddressUser.destroy({ where: { id } });
        return { errCode: 0, errMessage: 'OK' };
    } catch (error) {
        throw error;
    }
};

/**
 * Cập nhật địa chỉ user
 * @param {Object} data - Dữ liệu cần cập nhật
 * @returns {Promise<Object>} - Trạng thái cập nhật
 */
const editAddressUser = async (data) => {
    try {
        // Danh sách các trường bắt buộc
        const requiredFields = ['id', 'shipName', 'shipAdress', 'shipEmail', 'shipPhonenumber'];

        // Kiểm tra xem trường nào bị thiếu
        const missingField = requiredFields.find(field => !data[field]);
        if (missingField) {
            return { errCode: 1, errMessage: `Missing required parameter: ${missingField}` };
        }

        // Kiểm tra địa chỉ cần cập nhật có tồn tại không
        const addressUser = await db.AddressUser.findOne({ where: { id: data.id } });
        if (!addressUser) {
            return { errCode: -1, errMessage: 'Địa chỉ người dùng không tồn tại' };
        }

        // Cập nhật địa chỉ trong database
        await addressUser.update({
            shipName: data.shipName,
            shipPhonenumber: data.shipPhonenumber,
            shipAdress: data.shipAdress,
            shipEmail: data.shipEmail,
        });

        return { errCode: 0, errMessage: 'OK' };
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy chi tiết địa chỉ user theo ID
 * @param {number} id - ID của địa chỉ
 * @returns {Promise<Object>} - Trả về thông tin địa chỉ
 */
const getDetailAddressUserById = async (id) => {
    try {
        if (!id) {
            return { errCode: 1, errMessage: 'Missing required parameter: id' };
        }

        const res = await db.AddressUser.findOne({ where: { id } });
        return { errCode: 0, data: res };
    } catch (error) {
        throw error;
    }
};

// Xuất các hàm để dùng trong các module khác
export default {
    createNewAddressUser,
    getAllAddressUserByUserId,
    deleteAddressUser,
    editAddressUser,
    getDetailAddressUserById
};
