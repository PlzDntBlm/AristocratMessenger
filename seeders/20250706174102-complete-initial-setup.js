'use strict';
const bcrypt = require('bcrypt');
const {User, Location, ChatRoom, sequelize} = require('../models');

const saltRounds = 10;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const t = await sequelize.transaction();

        try {
            // --- 1. Create Users ---
            const usersData = [
                {
                    username: 'Aethelred',
                    email: 'aethelred@example.com',
                    password: await bcrypt.hash('password123', saltRounds),
                    isAdmin: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    username: 'Godwin',
                    email: 'godwin@example.com',
                    password: await bcrypt.hash('password123', saltRounds),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    username: 'Leofric',
                    email: 'leofric@example.com',
                    password: await bcrypt.hash('password123', saltRounds),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    username: 'Eadric',
                    email: 'eadric@example.com',
                    password: await bcrypt.hash('password123', saltRounds),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    username: 'Wulfstan',
                    email: 'wulfstan@example.com',
                    password: await bcrypt.hash('password123', saltRounds),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            const users = await User.bulkCreate(usersData, {transaction: t, returning: true});

            // --- 2. Create Locations ---
            const locationsData = [
                {
                    UserId: users[0].id,
                    name: 'Crowland',
                    x: 25,
                    y: 80,
                    type: 'abbey',
                    description: 'A stone abbey amidst the fens.',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    UserId: users[1].id,
                    name: 'Winchester',
                    x: 45,
                    y: 25,
                    type: 'capital',
                    description: 'The grand capital of the realm.',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    UserId: users[2].id,
                    name: 'Thegn\'s Folly',
                    x: 75,
                    y: 50,
                    type: 'fortress',
                    description: 'A newly built fortress on the western marches.',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    UserId: users[3].id,
                    name: 'Oakhaven',
                    x: 60,
                    y: 70,
                    type: 'settlement',
                    description: 'A quiet village nestled in the old woods.',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    UserId: users[4].id,
                    name: 'Seacliff',
                    x: 10,
                    y: 40,
                    type: 'port',
                    description: 'A bustling port town on the southern coast.',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            const locations = await Location.bulkCreate(locationsData, {transaction: t, returning: true});

            // --- 3. Create Chat Rooms ---
            const chatRoomsData = locations.map(location => ({
                LocationId: location.id,
                name: `The Great Hall of ${location.name}`,
                description: `A place for discourse at ${location.name}.`,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            await ChatRoom.bulkCreate(chatRoomsData, {transaction: t});

            await t.commit();
            console.log('Seeding complete: Users, Locations, and ChatRooms created successfully.');

        } catch (error) {
            await t.rollback();
            console.error('Seeding failed:', error);
        }
    },

    async down(queryInterface, Sequelize) {
        const t = await sequelize.transaction();
        try {
            // The order of deletion is important to avoid foreign key constraint errors
            await queryInterface.bulkDelete('ChatRooms', null, {transaction: t});
            await queryInterface.bulkDelete('Locations', null, {transaction: t});
            await queryInterface.bulkDelete('Users', null, {transaction: t});
            await t.commit();
            console.log('Database cleaned successfully.');
        } catch (error) {
            await t.rollback();
            console.error('Failed to clean database:', error);
        }
    }
};