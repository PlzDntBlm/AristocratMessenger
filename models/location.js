'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Location.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'user', // This alias is used when you query Location and want to include User
      });
      // A Location has one designated ChatRoom
      Location.hasOne(models.ChatRoom, {
        foreignKey: 'LocationId',
        as: 'chatRoom',
      });
    }
  }
  Location.init({
    UserId: { // Foreign Key
      type: DataTypes.INTEGER,
      allowNull: false, // Ensure this is here if it's required
      references: {     // Good to have for model definition, though migration handles DB level
        model: 'Users',
        key: 'id',
      },
      unique: true,     // Enforces the hasOne relationship from User to Location
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unnamed Location',
    },
    x: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Represents X coordinate, in "kilometers" for the game map.',
    },
    y: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Represents Y coordinate, in "kilometers" for the game map.',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'settlement',
      comment: 'Type of location (e.g., settlement, castle, ruin, landmark).',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Location',
    timestamps: true, // Ensure this is present if you have createdAt/updatedAt
  });
  return Location;
};