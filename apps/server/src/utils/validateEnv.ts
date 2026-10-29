import {
  cleanEnv, port, str, url,
} from 'envalid';

const validateEnv = (): void => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    MONGO_URL: str(),
    PARSE_APP_ID: str(),
    PARSE_MASTER_KEY: str(),
    BREVO_API_KEY: str(),
    CLOUDINARY_NAME: str(),
    CLOUDINARY_API_KEY: str(),
    CLOUDINARY_API_SECRET: str(),
    SERVER_URL: url(),
    WEBSITE_URL: url(),
    REST_API_KEY: str(),
    CRYPTO_FIXED_PART_KEY: str(),
    CRYPTO_FIXED_FULL_KEY: str(),
    CRYPTO_IV: str(),
  });
};

export default validateEnv;
