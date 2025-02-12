// const crypto = require('crypto');

// module.exports = (sequelize) => {
//     const BlockchainLog = sequelize.models.BlockchainLog;

//     if (!BlockchainLog) {
//         console.error("❌ BlockchainLog model chưa được khởi tạo!");
//         return;
//     }

//     Object.keys(sequelize.models).forEach((modelName) => {
//         const model = sequelize.models[modelName];

//         // Bỏ qua bảng BlockchainLog để tránh vòng lặp vô hạn
//         if (modelName === "BlockchainLog") return;

//         model.addHook('afterCreate', async (record, options) => {
//             try {
//                 // Lấy bản ghi BlockchainLog gần nhất
//                 const previousLog = await BlockchainLog.findOne({
//                     order: [['createdAt', 'DESC']],
//                 });

//                 // Lấy hash của bản ghi trước đó (nếu có)
//                 const previousHash = previousLog ? previousLog.hash : null;

//                 // Tạo hash cho bản ghi hiện tại
//                 const hash = crypto.createHash('sha256')
//                     .update(`${modelName}-${record.id}-${previousHash || ''}`)
//                     .digest('hex');

//                 // Thêm bản ghi mới vào bảng BlockchainLog
//                 await BlockchainLog.create({
//                     tableName: modelName,
//                     recordId: record.id,
//                     hash: hash,
//                     previousHash: previousHash,
//                 });

//                 console.log(`✅ [BlockchainLog] Ghi log thành công cho bảng: ${modelName}, recordId: ${record.id}`);

//             } catch (error) {
//                 console.error("❌ Lỗi khi tạo BlockchainLog:", error);
//             }
//         });
//     });
// };
