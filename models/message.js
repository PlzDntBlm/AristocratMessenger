'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      Message.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender', // Alias for the association
      });
      Message.belongsTo(models.User, {
        foreignKey: 'recipientId',
        as: 'recipient', // Alias for the association
      });
    }
  }
  Message.init({
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'delivered', 'read'),
      allowNull: false,
      defaultValue: 'draft',
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Message',
    // tableName: 'Messages' // Usually not needed if modelName pluralized matches table name
  });
  return Message;
};