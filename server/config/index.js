import {config as envconfig} from 'dotenv';
envconfig();

const config = {
    db: {
        url: `${process.env.DB_HOST}:${process.env.DB_PORT}`,
        name: `${process.env.DB_NAME}`
    }
};

export default config;
