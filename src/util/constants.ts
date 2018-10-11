import logger from "./logger";
import dotenv from "dotenv";

// Load environment variables from .env file, where API keys, database connection and passwords are configured
dotenv.config({ path: ".env.development" });

const env = process.env;

export const ENVIRONMENT = env.NODE_ENV;
export const PORT = parseInt(env.PORT);
export const SESSION_SECRET = env.SESSION_SECRET;
export const MYSQL_HOST = env.MYSQL_HOST;
export const MYSQL_PORT = parseInt(env.MYSQL_PORT);
export const MYSQL_USER = env.MYSQL_USER;
export const MYSQL_PASSWORD = env.MYSQL_PASSWORD;
export const MYSQL_DATABASE = env.MYSQL_DATABASE;

const requiredConstants = [PORT, SESSION_SECRET, MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE];
const emptyRequiredConstants = requiredConstants.filter(x => !x);

if (emptyRequiredConstants.length > 0) {
    logger.error("Set all the required constants in the environment variable.");
    process.exit(1);
}
