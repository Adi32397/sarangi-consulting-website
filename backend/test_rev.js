require('dotenv').config();
const { Sequelize, DataTypes, fn, col } = require('sequelize');
const mysql = require('mysql2/promise');

async function test() {
    const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'mysql',
            logging: false
        }
    );

    try {
        const [results, metadata] = await sequelize.query("SELECT * FROM Bookings LIMIT 5;");
        console.log("Bookings:", results);
        
        const [agg, meta2] = await sequelize.query("SELECT MONTH(createdAt) as month, SUM(amount) as total FROM Bookings GROUP BY MONTH(createdAt);");
        console.log("Aggregated Revenue:", agg);
        
    } catch(e) {
        console.error(e);
    }
}
test();
