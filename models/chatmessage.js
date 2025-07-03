'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatMessage extends Model {
    static associate(models) {
      // A message belongs to one author (User)
      ChatMessage.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'author',
      });
      // A message belongs to one room
      ChatMessage.belongsTo(models.ChatRoom, {
        foreignKey: 'ChatRoomId',
        as: 'room',
      });
    }
  }
  ChatMessage.init({
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    UserId: { // Foreign Key to User
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    ChatRoomId: { // Foreign Key to ChatRoom
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ChatRooms',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'ChatMessage',
  });
  return ChatMessage;
};