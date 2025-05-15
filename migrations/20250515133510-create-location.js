'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Name of the target table
          key: 'id',      // Column in the Users table
        },
        unique: true, // A user can only have one primary location (enforces hasOne)
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // If a user is deleted, their location is also removed
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Unnamed Location',
      },
      x: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Represents X coordinate, in "kilometers" for the game map.',
      },
      y: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Represents Y coordinate, in "kilometers" for the game map.',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'settlement',
        comment: 'Type of location (e.g., settlement, castle, ruin, landmark).',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Locations');
  }
};