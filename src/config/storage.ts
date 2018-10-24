import fs from "fs";
import path from "path";
import os from "os";
import { Storage } from "@google-cloud/storage";
import { ENVIRONMENT, GAE_INSTANCE, GCLOUD_KEY_FILE, GCLOUD_CONFIG_BUCKET } from "../util/env";
import { Config } from "../models/Config";

const configFileName = `config.${ENVIRONMENT}.json`;

let storageOptions;
if (!GAE_INSTANCE) {
  const keyFilePath = path.join(__dirname, "../../", GCLOUD_KEY_FILE);
  const keyFile = JSON.parse(fs.readFileSync(keyFilePath, "utf8"));
  storageOptions = {
    projectId: keyFile.project_id,
    keyFilename: GCLOUD_KEY_FILE
  };
}
const storage = new Storage(storageOptions);

// export const frontEndBucket = storage.bucket(GCLOUD_FRONTEND_BUCKET);
export const configBucket = storage.bucket(GCLOUD_CONFIG_BUCKET);

const fileToJson = (file: any) => new Promise((resolve, reject) => {
  const tmpDir = path.resolve(os.tmpdir());
  const tmpFile = path.join(tmpDir, "file.json");
  console.log(tmpDir);
  console.log(tmpFile);
  file.createReadStream()
  .on("error", reject)
  .on("end", () => {
    const data = fs.readFileSync(tmpFile, "utf8");
    resolve(JSON.parse(data));
  })
  .pipe(fs.createWriteStream(tmpFile));
});

let config: Config;
export async function loadConfig(): Promise<Config> {
  if (!config) {
    const file = configBucket.file(configFileName);
    config = (await fileToJson(file)) as Config;
  }
  return config;
}