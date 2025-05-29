require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'supersecretkey';
module.exports = { SECRET_KEY };
