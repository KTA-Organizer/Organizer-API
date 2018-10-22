import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as evaluatieCriteriaService from "../services/evaluatieCriteria";
import { HttpError } from "../util/httpStatus";
import { usersOnly } from "../util/accessMiddleware";

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


export default router;