import { Router } from "express";
import { check } from "express-validator/check";
import * as Joi from "joi";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as evaluationService from "../services/evaluation";
import { teachersOnly, teacherOrAdminOnly } from "../util/accessMiddleware";
import { HttpError } from "../util/httpStatus";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(teacherOrAdminOnly);

router.get("/", [
    check("studentid").isNumeric().optional(),
    sanitize("studentid").toInt(),
    check("moduleid").isNumeric().optional(),
    sanitize("moduleid").toInt()
], executor(async function (req, trx, options) {
    const scores = await evaluationService.fetchEvaluationSheets(trx, options);
    return scores;
}));

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, trx, { id }) {
    const scores = await evaluationService.fetchEvaluationSheet(trx, id);
    return scores;
}));

const scoreSchema = Joi.array().items([
    {
        name: Joi.string(),
        grade: Joi.number().integer().min(1).max(4).error(new Error("De score moet tussen 1 en 4 liggen!")),
        criteriaid: Joi.number(),
        evaluationsheetid: Joi.number(),
        creatorId: Joi.number()
    }
]);

router.post("/", [
    check("scores").exists()
], executor(async function (req, trx, scores) {
    const {error} = Joi.validate(scores, scoreSchema);
    if (error) {
        throw new HttpError(400, error.message);
    }
    await evaluationService.insertScores(trx, scores);
}));


export default router;