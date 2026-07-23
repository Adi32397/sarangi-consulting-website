const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

let sequelize;

const connectDB = async () => {
    try {
        // 1. First connect directly to MySQL to ensure the database exists (skip on remote/TiDB)
        if (process.env.DB_HOST === '127.0.0.1' || process.env.DB_HOST === 'localhost') {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                ssl: {
                    rejectUnauthorized: false
                }
            });
            
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
            await connection.end();
        }

        // 2. Initialize Sequelize with the specific database
        sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                dialect: 'mysql',
                logging: false, // Set to console.log to see SQL queries
                dialectOptions: {
                    ssl: {
                        rejectUnauthorized: false
                    }
                },
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            }
        );

        await sequelize.authenticate();
        console.log(`MySQL Connected via Sequelize on host: ${process.env.DB_HOST}`);
        
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

// We export a getter for the sequelize instance so models can use it
module.exports = {
    connectDB,
    getSequelize: () => sequelize
};
