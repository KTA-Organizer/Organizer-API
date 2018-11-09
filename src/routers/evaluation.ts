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

router.get("/", executor(async function (req, trx) {
    const scores = await evaluationService.fetchEvaluations(trx);
    return scores;
}));

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, trx, {id}) {
    const scores = await evaluationService.fetchEvaluations(trx);
    return scores;
}));

router.get("/module/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, trx, {id}) {
    const scores = await evaluationService.fetchEvaluationsForMolule(trx, id);
    return scores;
}));

router.get("/student/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, trx, {id}) {
    const scores = await evaluationService.fetchEvaluationsForStudent(trx, id);
    return scores;
}));

router.get("/student/:studentid/module/:moduleid", [
    check("studentid").isNumeric(),
    sanitize("studentid").toInt(),
    check("moduleid").isNumeric(),
    sanitize("moduleid").toInt()
], executor(async function (req, trx, {studentid, moduleid}) {
    const scores = await evaluationService.fetchEvaluationsForStudentForModule(trx, studentid, moduleid);
    return scores;
}));

const evaluationSchemaCheck = Joi.object().keys({
    evaluations: Joi.array().items([
        {
            name: Joi.string(),
            grade: Joi.number().integer().min(1).max(4).error(new Error("De score moet tussen 1 en 4 liggen!")),
            criteriaid: Joi.number(),
            studentid: Joi.number(),
            creatorId: Joi.number()
        }
    ])
});

router.post("/", [
    teachersOnly,
    check("evaluations").exists()
], executor(async function (req, trx, evaluations) {
    const {error, value} = Joi.validate(evaluations, evaluationSchemaCheck);
    if (error) {
        throw new HttpError(400, error.message);
    }
    await evaluationService.insertEvaluations(trx, evaluations.evaluations);
}));


export default router;