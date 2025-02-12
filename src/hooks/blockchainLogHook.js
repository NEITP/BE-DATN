const crypto = require('crypto');

module.exports = (sequelize) => {
    if (!sequelize || !sequelize.models) {
        console.error("Sequelize chưa khởi tạo hoặc không có models!");
        return;
    }

    const BlockchainLog = sequelize.models.BlockchainLog;

    if (!BlockchainLog) {
        console.error("Model BlockchainLog chưa được khởi tạo!");
        return;
    }

    Object.keys(sequelize.models).forEach((modelName) => {
        const model = sequelize.models[modelName];

        // Bỏ qua bảng BlockchainLog để tránh vòng lặp vô hạn
        if (modelName === "BlockchainLog") return;

        const logAction = async (action, recordId, options) => {
            if (options?.blockchainLog) {
                console.log(`Bỏ qua hook do flag blockchainLog: ${action}`);
                return;
            }

            let transaction = options.transaction;
            let createdTransaction = false;

            try {
                if (!transaction) {
                    transaction = await sequelize.transaction();
                    createdTransaction = true;
                }

                const previousLog = await BlockchainLog.findOne({
                    order: [['createdAt', 'DESC']],
                    transaction
                });

                const previousHash = previousLog ? previousLog.hash : null;
                const hash = crypto.createHash('sha256')
                    .update(`${modelName}-${recordId}-${action}-${previousHash || ''}`)
                    .digest('hex');

                await BlockchainLog.create({
                    tableName: modelName,
                    recordId: recordId,
                    action: action, // Lưu hành động (create, update, delete)
                    hash: hash,
                    previousHash: previousHash,
                }, {
                    transaction,
                    blockchainLog: true, // Đánh dấu để không kích hoạt hook
                    individualHooks: false // Ngăn chặn gọi lại hook
                });

                if (createdTransaction) await transaction.commit();

                console.log(`Ghi log thành công: ${action} - ${modelName}, recordId: ${recordId}`);

            } catch (error) {
                console.error(`Lỗi khi ghi log BlockchainLog (${action}):`, error);
                if (createdTransaction) await transaction.rollback();
            }
        };

        model.addHook('afterCreate', async (record, options) => {
            await logAction('create', record.id, options);
        });

        model.addHook('afterUpdate', async (record, options) => {
            const changes = Object.keys(record.dataValues).filter(
                key => record.dataValues[key] !== record._previousDataValues[key]
            );

            if (changes.length > 0) {
                await logAction('update', record.id, options);
            } else {
                console.log(`Bỏ qua log update cho ${modelName} vì không có thay đổi`);
            }
        });

        model.addHook('beforeDestroy', async (record, options) => {
            await logAction('delete', record.id, options);
        });
    });

    console.log("Hook đã được gắn vào tất cả các models (ngoại trừ BlockchainLog).");
};
