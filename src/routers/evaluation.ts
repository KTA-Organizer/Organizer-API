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
], executor(async function (req, trx, id) {
    const scores = await evaluationService.fetchEvaluations(trx);
    return scores;
}));

export default router;