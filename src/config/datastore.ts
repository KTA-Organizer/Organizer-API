import fs from "fs";
import path from "path";
import Datastore from "@google-cloud/datastore";
import { GOOGLE_CLOUD_PROJECT, GCLOUD_KEY_FILE } from "../util/env";

let options;
if (!GOOGLE_CLOUD_PROJECT) {
  const keyFilePath = path.join(__dirname, "../../", GCLOUD_KEY_FILE);
  const keyFile = JSON.parse(fs.readFileSync(keyFilePath, "utf8"));
  options = {
    projectId: keyFile.project_id,
    keyFilename: GCLOUD_KEY_FILE
  };
}
export const datastore = new Datastore(options);
