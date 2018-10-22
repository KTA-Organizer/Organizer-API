import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as evaluatieCriteriaService from "../services/evaluatieCriteria";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
    const evaluatie = await evaluatieCriteriaService.fetchEvaluatieCriteriaById(matchedData.id);
    if (!evaluatie) {
        throw new HttpError(404, "EvaluatieCriteria doesn't exist");
    }
    return evaluatie;
}));

router.get("/", executor(async function(req, res) {
    const evaluaties = await evaluatieCriteriaService.fetchEvaluatieCriteria();
    if (evaluaties.length < 1) {
        throw new HttpError(404, "EvaluatieCriteria not found");
    }
    return evaluaties;
}));

router.post("/", [
    usersOnly,
    check("doelstellingId").exists(),
    check("name").exists(),
    check("inGebruik").exists(),
    check("gewicht").exists(),
    check("creatorId").exists()
], executor(async function (req, res, { doelstellingId, name, inGebruik, gewicht, creatorId }) {
    await evaluatieCriteriaService.insertEvaluatieCriteria({ doelstellingId, name, inGebruik, gewicht, creatorId});
}));


export default router;