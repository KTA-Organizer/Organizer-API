import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as opleidingenService from "../services/opleidingen";
import { HttpError } from "../util/httpStatus";
import { usersOnly } from "../util/accessMiddleware";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.get(
  "/:id",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, res, matchedData) {
    const opleiding = await opleidingenService.fetchOpleiding(matchedData.id);
    if (!opleiding) {
      throw new HttpError(404, "Opleiding doesn't exist");
    }
    return opleiding;
  })
);

router.get(
  "/:id/full",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, res, matchedData) {
    const opleiding = await opleidingenService.fetchFullOpleiding(
      matchedData.id
    );
    if (!opleiding) {
      throw new HttpError(404, "Opleiding doesn't exist");
    }
    return opleiding;
  })
);

router.get(
  "/",
  executor(async function(req, res) {
      const opleidingen = await opleidingenService.fetchAllOpleidingen();
      if (opleidingen.length < 1) {
        throw new HttpError(404, "Opleidingen not found");
      }
      return opleidingen;
  })
);

export default router;
