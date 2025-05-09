'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Message, {
        foreignKey: 'senderId',
        as: 'sentMessages', // Alias for messages sent by the user
      });
      User.hasMany(models.Message, {
        foreignKey: 'recipientId',
        as: 'receivedMessages', // Alias for messages received by the user
      });
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming username is required
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming email is required
      unique: true,     // Assuming email should be unique
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming password is required
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};