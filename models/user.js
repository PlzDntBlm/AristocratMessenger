'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /** * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * Themodels/index` file will call this method automatically.
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
            User.hasOne(models.Location, {
                foreignKey: 'UserId',
                as: 'location',
            });
            // A User can author many ChatMessages
            User.hasMany(models.ChatMessage, {
                foreignKey: 'UserId',
                as: 'chatMessages'
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
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    }, {
        sequelize,
        modelName: 'User',
        paranoid: true,
    });
    return User;
};