const {exec} = require('child_process');
require('dotenv').config(); // Load environment variables

// This script only runs the migration command.
// It uses the environment variables loaded from your .env file.
const migrationCommand = 'npx sequelize-cli db:migrate';

console.log('Running database migrations...');

exec(migrationCommand, {env: process.env}, (err, stdout, stderr) => {
    if (err) {
        console.error(`Migration failed: ${err}`);
        console.error(stderr);
        process.exit(1); // Exit with an error code
    }
    console.log('Migration successful!');
    console.log(stdout);
    process.exit(0); // Exit successfully
});