import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as evaluatieCriteriaService from "../services/evaluatieCriteria";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import * as aspectenService from "../services/aspecten";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, trx, matchedData) {
    const evaluatie = await evaluatieCriteriaService.fetchEvaluatieCriteriaById(trx, matchedData.id);
    if (!evaluatie) {
        throw new HttpError(404, "EvaluatieCriteria doesn't exist");
    }
    return evaluatie;
}));

router.get("/", executor(async function(req, trx) {
    const evaluaties = await evaluatieCriteriaService.fetchEvaluatieCriteria(trx);
    if (evaluaties.length < 1) {
        throw new HttpError(404, "EvaluatieCriteria not found");
    }
    return evaluaties;
}));

router.post("/", [
    adminsOnly,
    check("doelstellingId").exists(),
    check("name").exists(),
    check("inGebruik").exists(),
    check("gewicht").exists(),
    check("creatorId").exists()
], executor(async function (req, trx, { doelstellingId, name, inGebruik, gewicht, creatorId }) {
    return await evaluatieCriteriaService.insertEvaluatieCriteria(trx, { doelstellingId, name, inGebruik, gewicht, creatorId});
}));

router.put("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("name").exists()
], executor(async function (req, trx, {id, name}) {
    const existingEvaluatieCriteria = await evaluatieCriteriaService.fetchEvaluatieCriteriaById(trx, id);
    if (!existingEvaluatieCriteria) {
        throw new HttpError(400, "A evaluatieCriteria with this id doesn't exist");
    }
    await evaluatieCriteriaService.updateEvaluatieCriteria(trx, {id, name});
}));

router.delete("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, trx, matchedData) {
    const existingEvaluatieCriteria = await evaluatieCriteriaService.fetchEvaluatieCriteriaById(trx, matchedData.id);
    if (!existingEvaluatieCriteria) {
        throw new HttpError(400, "A evaluatieCriteria with this id doesn't exist");
    }
    await evaluatieCriteriaService.deleteEvaluatieCriteria(trx, matchedData.id);
}));


export default router;