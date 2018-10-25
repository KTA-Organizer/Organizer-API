import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
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

router.get(
  "/:id/student",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, res, matchedData) {
    const opleiding = await opleidingenService.fetchOpleidingForStudent(
      matchedData.id
    );
    if (!opleiding) {
      throw new HttpError(404, "Opleiding doesn't exist");
    }
    return opleiding;
  })
);

router.post("/", [
    adminsOnly,
    check("active").exists(),
    check("name").exists(),
    check("creatorId").exists()
], executor(async function (req, res, { name, active, creatorId }) {
    await opleidingenService.insertOpleiding({ name, active, creatorId});
}));

router.put("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("active").exists(),
    check("name").exists(),
    check("creatorId").exists()
], executor(async function (req, res, {id, name, active, creatorId }) {
    const existingOpleiding = await opleidingenService.fetchOpleiding(id);
    if (!existingOpleiding) {
        throw new HttpError(400, "A opleiding with this id doesn't exist");
    }
    await opleidingenService.updateOpleiding({id, name, active, creatorId});
}));

router.delete("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, res, matchedData) {
    const existingOpleiding = await doelstellingsCategoriesService.fetchDoelstellingsCategorie(matchedData.id);
    if (!existingOpleiding) {
        throw new HttpError(400, "A opleiding with this id doesn't exist");
    }
    await opleidingenService.removeOpleiding(matchedData.id);
}));


export default router;
