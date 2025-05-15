'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
        `SELECT id from Users;` // Fetch existing user IDs
    );

    const userRows = users[0]; // Assuming users exist. Handle appropriately if not.
                               // For this example, we'll try to assign to first few users.

    const locationsToSeed = [];

    if (userRows.length > 0) {
      locationsToSeed.push({
        UserId: userRows[0].id, // Assign to the first user
        name: 'Dragonstone Keep',
        x: 10, // Coordinates within our 0-100km range
        y: 85,
        type: 'castle',
        description: 'An ancient volcanic fortress.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (userRows.length > 1) {
      locationsToSeed.push({
        UserId: userRows[1].id, // Assign to the second user
        name: 'Whispering Woods Village',
        x: 75,
        y: 50,
        type: 'settlement',
        description: 'A quiet village nestled by the old woods.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (userRows.length > 2) {
      locationsToSeed.push({
        UserId: userRows[2].id, // Assign to the third user
        name: 'Eagle Peak Summit',
        x: 45,
        y: 20,
        type: 'landmark',
        description: 'A high peak offering panoramic views.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    if (userRows.length > 3) {
      locationsToSeed.push({
        UserId: userRows[3].id, // Assign to the fourth user
        name: 'Misty Lake',
        x: 30,
        y: 70,
        type: 'lake',
        description: 'A serene lake surrounded by misty hills.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    if (userRows.length > 4) {
      locationsToSeed.push({
        UserId: userRows[4].id, // Assign to the fifth user
        name: 'Ancient Ruins',
        x: 60,
        y: 40,
        type: 'ruins',
        description: 'Remnants of a long-lost civilization.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    if (userRows.length > 5) {
      locationsToSeed.push({
        UserId: userRows[5].id, // Assign to the sixth user
        name: 'Crystal Cavern',
        x: 20,
        y: 90,
        type: 'cave',
        description: 'A cavern filled with shimmering crystals.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    if (userRows.length > 6) {
      locationsToSeed.push({
        UserId: userRows[6].id, // Assign to the seventh user
        name: 'Golden Fields',
        x: 80,
        y: 10,
        type: 'field',
        description: 'Vast fields of golden wheat swaying in the breeze.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    if (userRows.length > 7) {
      locationsToSeed.push({
        UserId: userRows[7].id, // Assign to the eighth user
        name: 'Shadowy Forest',
        x: 50,
        y: 60,
        type: 'forest',
        description: 'A dense forest filled with shadows and secrets.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    if (userRows.length > 8) {
      locationsToSeed.push({
        UserId: userRows[8].id, // Assign to the ninth user
        name: 'Stormy Coast',
        x: 15,
        y: 30,
        type: 'coast',
        description: 'A rugged coastline battered by storms.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    if (userRows.length > 9) {
      locationsToSeed.push({
        UserId: userRows[9].id, // Assign to the tenth user
        name: 'Serpent River',
        x: 90,
        y: 25,
        type: 'river',
        description: 'A winding river that snakes through the land.',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Add a default/unassigned location marker for testing purposes if needed,
    // though the map will primarily show locations tied to users.
    // Example of a location NOT tied to a specific existing user (will fail if UserId is strictly enforced as FK without a valid User)
    // For now, we only seed locations for existing users.

    if (locationsToSeed.length > 0) {
      await queryInterface.bulkInsert('Locations', locationsToSeed, {});
    } else {
      console.log('No users found to seed locations for, or no locations defined in seeder.');
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove all locations. Be cautious with this in production.
    await queryInterface.bulkDelete('Locations', null, {});
  }
};