import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as opleidingenService from "../services/opleidingen";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import * as modulesService from "../services/modules";
import * as doelstellingsCategoriesService from "../services/doelstellingsCategories";

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

router.post("/", [
    adminsOnly,
    check("active").exists(),
    check("name").exists(),
    check("creatorId").exists()
], executor(async function (req, trx, { name, active, creatorId }) {
    await opleidingenService.insertOpleiding(trx, { name, active, creatorId});
}));

router.put("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("active").exists(),
    check("name").exists(),
    check("creatorId").exists()
], executor(async function (req, trx, {id, name, active, creatorId }) {
    const existingOpleiding = await opleidingenService.fetchOpleiding(trx, id);
    if (!existingOpleiding) {
        throw new HttpError(400, "A opleiding with this id doesn't exist");
    }
    await opleidingenService.updateOpleiding(trx, {id, name, active, creatorId});
}));

router.delete("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, trx, matchedData) {
    const existingOpleiding = await doelstellingsCategoriesService.fetchDoelstellingsCategorie(trx, matchedData.id);
    if (!existingOpleiding) {
        throw new HttpError(400, "A opleiding with this id doesn't exist");
    }
    await opleidingenService.removeOpleiding(trx, matchedData.id);
}));


export default router;
