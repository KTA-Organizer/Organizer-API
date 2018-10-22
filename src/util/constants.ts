import logger from "./logger";
import dotenv from "dotenv";

// Load environment variables from .env file, where API keys, database connection and passwords are configured
const environment = process.env.NODE_ENV === "test" ? "test" : process.env.GOOGLE_CLOUD_PROJECT ? "production" : "development";
dotenv.config({ path: `.env.${environment}` });

const env = process.env;

export const ENVIRONMENT = environment;
export const PORT = parseInt(env.PORT);
export const SESSION_SECRET = env.SESSION_SECRET;

export const GCLOUD_PROJECT = env.GCLOUD_PROJECT;
export const GCLOUD_FRONTEND_BUCKET = env.GCLOUD_FRONTEND_BUCKET;
export const GCLOUD_KEYFILE = env.GCLOUD_KEYFILE;
export const GCLOUD_SQL_INSTANCE = env.GCLOUD_SQL_INSTANCE;
export const MYSQL_HOST = env.MYSQL_HOST;
export const MYSQL_PORT = parseInt(env.MYSQL_PORT);
export const MYSQL_USER = env.MYSQL_USER;
export const MYSQL_PASSWORD = env.MYSQL_PASSWORD;
export const MYSQL_DATABASE = env.MYSQL_DATABASE;

export const MAIL_FROM = env.MAIL_FROM;
export const MAIL_SMTP_HOST = env.MAIL_SMTP_HOST;
export const MAIL_SMTP_PORT = parseInt(env.MAIL_SMTP_PORT);
export const MAIL_SMTP_USERNAME = env.MAIL_SMTP_USERNAME;
export const MAIL_SMTP_PASSWORD = env.MAIL_SMTP_PASSWORD;

export const URL = env.URL;

const requiredConstants = [
    PORT,
    SESSION_SECRET,
    GCLOUD_PROJECT,
    GCLOUD_FRONTEND_BUCKET,
    GCLOUD_KEYFILE,
    MYSQL_DATABASE,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MAIL_FROM,
    MAIL_SMTP_HOST,
    MAIL_SMTP_PORT,
    MAIL_SMTP_PASSWORD,
    MAIL_SMTP_USERNAME,
    URL
];
const emptyRequiredConstants = requiredConstants.filter(x => !x);

if (emptyRequiredConstants.length > 0) {
    logger.error("Set all the required constants in the environment variable.");
    process.exit(1);
}
