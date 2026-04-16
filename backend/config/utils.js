import dotenv from 'dotenv';
dotenv.config(); 

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
const REDIS_URL = process.env.REDIS_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://192.168.49.2:31000";

export { MONGODB_URI, PORT, REDIS_URL, FRONTEND_URL };
