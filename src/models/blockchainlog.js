'use strict';

const { Model } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  class BlockchainLog extends Model {
    static generateHash(tableName, recordId, action) {
      const data = `${tableName}:${recordId}:${action}`;
      return crypto.createHash('sha256').update(data).digest('hex');
    }
  }

  BlockchainLog.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    tableName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM('create', 'update', 'delete'),
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'BlockchainLog',
  });

  return BlockchainLog;
};
