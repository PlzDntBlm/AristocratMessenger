'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model { /** * Helper method for defining associations. * This method is not a part of Sequelize lifecycle. * Themodels/index` file will call this method automatically.
 */
static associate(models) {
// Messages sent by the user
  User.hasMany(models.Message, {
    foreignKey: 'senderId',
    as: 'sentMessages',
  });
// Messages received by the user
  User.hasMany(models.Message, {
    foreignKey: 'recipientId',
    as: 'receivedMessages',
  });
// User's primary location
  User.hasOne(models.Location, { // <-- New Association
    foreignKey: 'UserId',       // Must match the foreign key in Location model
    as: 'location',             // Alias to access user.location
  });
}
}
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};  

