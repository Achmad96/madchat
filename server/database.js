const mysql = require("mysql2/promise");
const DatabaseConfig = require("./configs/database");

const createConnection = async () => {
  return await mysql.createConnection(DatabaseConfig);
};

const closeConnection = (connection) => {
  if (connection) {
    connection.end((err) => {
      if (err) {
        console.error("Error closing the database connection:", err.stack);
      } else {
        console.log("Database connection closed.");
      }
    });
  }
};

module.exports = { createConnection, closeConnection };
