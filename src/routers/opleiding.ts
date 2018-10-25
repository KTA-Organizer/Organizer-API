import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
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
  executor(async function(req, trx, matchedData) {
    const opleiding = await opleidingenService.fetchOpleiding(trx, matchedData.id);
    if (!opleiding) {
      throw new HttpError(404, "Opleiding doesn't exist");
    }
    return opleiding;
  })
);

router.get(
  "/:id/full",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, trx, matchedData) {
    const opleiding = await opleidingenService.fetchFullOpleiding(trx, matchedData.id);
    if (!opleiding) {
      throw new HttpError(404, "Opleiding doesn't exist");
    }
    return opleiding;
  })
);

router.get(
  "/",
  executor(async function(req, trx) {
      const opleidingen = await opleidingenService.fetchAllOpleidingen(trx);
      return opleidingen;
  })
);

router.get(
  "/:id/student",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, trx, matchedData) {
    const opleiding = await opleidingenService.fetchOpleidingForStudent(trx, matchedData.id);
    return opleiding;
  })
);


export default router;
