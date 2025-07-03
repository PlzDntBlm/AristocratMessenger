'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(models) {
      // A ChatRoom is the forum for one Location
      ChatRoom.belongsTo(models.Location, {
        foreignKey: 'LocationId',
        as: 'location',
      });
      // A ChatRoom has many messages
      ChatRoom.hasMany(models.ChatMessage, {
        foreignKey: 'ChatRoomId',
        as: 'messages',
      });
    }
  }
  ChatRoom.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    LocationId: { // Foreign Key to the Location
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Enforces the one-to-one relationship
      references: {
        model: 'Locations',
        key: 'id',
      }
    }
  }, {
    sequelize,
    modelName: 'ChatRoom',
  });
  return ChatRoom;
};