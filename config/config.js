// config/config.js
/**
 * Sequelize configuration file (JavaScript version).
 * Reads database connection details from environment variables.
 * This file allows dynamic reading of process.env variables.
 */

// Ensure environment variables are loaded early
// If dotenv is already loaded in your main app entry point (app.js) before DB connection,
// this might be redundant, but it guarantees availability here.
require('dotenv').config(); // Make sure to call config()

module.exports = {
    development: {
        username: process.env.DB_USER,       // Read from .env
        password: process.env.DB_PASSWORD,   // Read from .env
        database: process.env.DB_NAME,       // Read from .env
        host: process.env.DB_HOST,           // Read from .env
        dialect: 'mysql',                   // Specify MySQL dialect
        port: process.env.DB_PORT || 3306,   // Read from .env or default
        // TODO: Add any other dialect options if needed (e.g., logging)
        // dialectOptions: {
        //   // e.g., support big numbers
        //   supportBigNumbers: true,
        //   bigNumberStrings: true
        // }
    },
    test: {
        // TODO: Configure a separate test database if needed using different ENV variables
        username: process.env.DB_USER_TEST,
        password: process.env.DB_PASSWORD_TEST,
        database: process.env.DB_NAME_TEST,
        host: process.env.DB_HOST_TEST,
        dialect: 'mysql',
        port: process.env.DB_PORT_TEST || 3306,
        logging: false // Often disable logging for tests
    },
    production: {
        // TODO: Configure production database credentials using ENV variables set in your production environment
        username: process.env.DB_USER_PROD,
        password: process.env.DB_PASSWORD_PROD,
        database: process.env.DB_NAME_PROD,
        host: process.env.DB_HOST_PROD,
        dialect: 'mysql',
        port: process.env.DB_PORT_PROD || 3306,
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 5000, // <--- Set a short timeout (5 seconds)
            idle: 10000
        }// Usually disable detailed SQL logging in production
        // Example dialect options for production:
        // dialectOptions: {
        //   ssl: {
        //     require: true,
        //     rejectUnauthorized: false // Adjust based on your SSL setup
        //   }
        // }
    },
    render: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
};