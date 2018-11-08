import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as evaluationService from "../services/evaluation";
import { teachersOnly, teacherOrAdminOnly } from "../util/accessMiddleware";

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

export default router;