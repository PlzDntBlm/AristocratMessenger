'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Name of the target table
          key: 'id',      // Name of the target column
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Or 'SET NULL' if you want to keep messages from deleted users, but requires senderId to be nullable
      },
      recipientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Or 'SET NULL', similar considerations as senderId
      },
      subject: {
        type: Sequelize.STRING, // Sequelize.STRING by default is VARCHAR(255)
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('draft', 'sent', 'delivered', 'read'),
        allowNull: false,
        defaultValue: 'draft',
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true, // A draft message might not have a sentAt timestamp
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true, // Message is not read initially
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Ensure default on DB level
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), // Ensure default on DB level
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  }
};