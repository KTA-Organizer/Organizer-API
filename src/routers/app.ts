import { Router } from "express";
import { loadConfig, storage } from "../config/storage";

const router = Router();

router.get("/*", async (req, res, next) => {
  const config = await loadConfig();
  const bucket = storage.bucket(config.gcloud.buckets.frontend);
  const htmlFile = bucket.file("index.html");

  res.status(200);
  res.setHeader("content-type", "text/html");
  htmlFile.createReadStream().pipe(res);
});

export default router;