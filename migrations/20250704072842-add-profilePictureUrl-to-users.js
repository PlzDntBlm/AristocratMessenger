'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'profilePictureUrl', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'profilePictureUrl');
    }
};