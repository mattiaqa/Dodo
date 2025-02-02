import doetenv from 'dotenv';

doetenv.config();

export default {
    hostname: 'localhost',
    port: 1338,
    frontend_port: 4200,
    db_url: process.env.DB_URL,
    saltWorkFactor: 10,
    accessTokenTTL: '3h',
    refreshTokenTTL: '12h',
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
    googleBooksApiKey: process.env.GOOGLE_BOOKS_API_KEY,
    redis_url: 'redis://redis:6379/'
};