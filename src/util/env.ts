import logger from "./logger";
import dotenv from "dotenv";

// Load environment variables from .env file, where API keys, database connection and passwords are configured
dotenv.config();

const env = process.env;

export const ENVIRONMENT = env.NODE_ENV || "development";
export const GOOGLE_CLOUD_PROJECT = env.GOOGLE_CLOUD_PROJECT;
export const GCLOUD_KEY_FILE = env.GCLOUD_KEY_FILE;
export const GCLOUD_CONFIG_BUCKET = env.GCLOUD_CONFIG_BUCKET;

const requiredConstants = [
    GCLOUD_KEY_FILE,
    GCLOUD_CONFIG_BUCKET
];
const emptyRequiredConstants = requiredConstants.filter(x => !x);

if (emptyRequiredConstants.length > 0) {
    logger.error("Set all the required constants in the environment variable.");
    process.exit(1);
}
