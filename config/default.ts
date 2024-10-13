import doetenv from 'dotenv';

doetenv.config();

export default {
    port: process.env.PORT,
    db_url: process.env.DB_URL,
    saltWorkFactor: process.env.SALT_WORK_FACTOR,
    accessTokenTTL: process.env.ACCESS_TOKEN_TTL,
    refreshTokenTTL: process.env.REFRESH_TOKEN_TTL,
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
};