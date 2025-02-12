'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const crypto = require('crypto'); // Import thư viện tạo hash
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

const db = {};

// Khởi tạo sequelize
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Đọc models trong thư mục hiện tại và import vào sequelize
fs.readdirSync(__dirname)
  .filter(file => file !== basename && file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Thiết lập các mối quan hệ giữa các models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Gọi hook sau khi models đã được load (đặt sau khi khởi tạo models)
const blockchainLogHook = require('../hooks/blockchainLogHook');
blockchainLogHook(sequelize);

// Gán sequelize vào db để sử dụng ở nơi khác
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
