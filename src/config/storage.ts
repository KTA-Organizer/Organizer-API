import Storage from "@google-cloud/storage";
import { GCLOUD_FRONTEND_BUCKET, GCLOUD_PROJECT, GCLOUD_KEYFILE } from "../util/constants";

const storage = new Storage({
  projectId: GCLOUD_PROJECT,
  keyFilename: GCLOUD_KEYFILE
});

export const frontEndBucket = storage.bucket(GCLOUD_FRONTEND_BUCKET);