import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as evaluatiesService from "../services/evaluaties";
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
], executor(async function(req, trx, matchedData) {
    const evaluatie = await evaluatiesService.fetchEvaluatie(trx, matchedData.id);
    if (!evaluatie) {
        throw new HttpError(404, "Evaluatie doesn't exist");
    }
    return evaluatie;
}));

router.get("/:id/student", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, trx, matchedData) {
    const evaluatie = await evaluatiesService.fetchEvaluatiesForStudent(trx, matchedData.id);
    if (!evaluatie) {
        throw new HttpError(404, "Evaluatie doesn't exist");
    }
    return evaluatie;
}));

router.get("/", executor(async function(req, trx) {
    const evaluaties = await evaluatiesService.fetchAllEvaluaties(trx);
    if (evaluaties.length < 1) {
        throw new HttpError(404, "Evaluaties not found");
    }
    return evaluaties;
}));


export default router;