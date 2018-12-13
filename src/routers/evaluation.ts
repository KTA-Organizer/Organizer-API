import { Router } from "express";
import { check } from "express-validator/check";
import * as Joi from "joi";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as evaluationService from "../services/evaluation";
import { teachersOnly, allStaffOnly } from "../util/accessMiddleware";
import { HttpError } from "../util/httpStatus";
import { User } from "../models/User";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(allStaffOnly);

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
    return await evaluationService.fetchEvaluationSheet(trx, id);
}));

const scoreSchema = Joi.array().items([
    {
        name: Joi.string(),
        grade: Joi.number().integer().min(1).max(4).error(new Error("De score moet tussen 1 en 4 liggen!")),
        criteriaid: Joi.number()
    }
]);

router.put("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("scores").exists()
], executor(async function (req, trx, { id, scores }) {
    const user = req.user as User;
    const {error} = Joi.validate(scores, scoreSchema);
    if (error) {
        throw new HttpError(400, error.message);
    }
    const sheet = await evaluationService.fetchEvaluationSheet(trx, id);
    if (!sheet) {
        throw new HttpError(404, "Sheet not found");
    }
    await evaluationService.insertScores(trx, id, user.id, scores);
}));

router.delete("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, trx, { id }) {
    await evaluationService.endEvaluation(trx, id);
}));

router.post("/", [
    check("studentid").isNumeric(),
    sanitize("studentid").toInt(),
    check("moduleid").isNumeric(),
    sanitize("moduleid").toInt(),
    check("startdate").exists(),
    sanitize("startdate").toDate(),
    check("periodname").exists()
], executor(async function (req, trx, data) {
    console.log(data);
    const user = req.user as User;
    const evaluationsheetid = await evaluationService.insertEvaluationSheet(trx, { ...data, teacherid: user.id });
    return { evaluationsheetid };
}));


export default router;