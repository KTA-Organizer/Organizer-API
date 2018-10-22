import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import * as aspectenService from "../services/aspecten";
import * as usersService from "../services/users";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/", executor(async function(req, res) {
    const aspecten = await aspectenService.fetchAllAspecten();
    if (aspecten.length < 1) {
        throw new HttpError(404, "Aspecten not found");
    }
    return aspecten;
}));

router.post("/", [
    adminsOnly,
    check("evaluatiecriteriumId").exists(),
    check("name").exists(),
    check("inGebruik").exists(),
    check("gewicht").exists(),
    check("creatorId").exists(),
], executor(async function (req, res, { evaluatiecriteriumId, name, inGebruik, gewicht, creatorId }) {
    await aspectenService.insertAspect({ evaluatiecriteriumId, name, inGebruik, gewicht, creatorId});
}));

router.put("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("evaluatiecriteriumId").exists(),
    check("name").exists(),
    check("inGebruik").exists(),
    check("gewicht").exists(),
    check("creatorId").exists(),
], executor(async function (req, res, {id, evaluatiecriteriumId, name, inGebruik, gewicht, creatorId }) {
    const existingAspect = await aspectenService.fetchAspect(id);
    if (!existingAspect) {
        throw new HttpError(400, "A aspect with this id doesn't exist");
    }
    await aspectenService.updateAspect({id, evaluatiecriteriumId, name, inGebruik, gewicht, creatorId});
}));

router.delete("/:id", [
    usersOnly,
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, res, matchedData) {
    const existingAspect = await aspectenService.fetchAspect(matchedData.id);
    if (!existingAspect) {
        throw new HttpError(400, "A aspect with this id doesn't exist");
    }
    await aspectenService.deleteAspect(matchedData.id);
}));

export default router;