import doetenv from 'dotenv';

doetenv.config();

export default {
    port: 1338,
    db_url: process.env.DB_URL,
    saltWorkFactor: 10,
    accessTokenTTL: '3h',
    refreshTokenTTL: '12h',
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
    googleBooksApiKey: process.env.GOOGLE_BOOKS_API_KEY,
};