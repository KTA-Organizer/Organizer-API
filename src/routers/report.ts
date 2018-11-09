import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as evaluationService from "../services/evaluation";
import { teachersOnly, teacherOrAdminOnly } from "../util/accessMiddleware";
import { HttpError } from "../util/httpStatus";
import * as reportService from "../services/reports";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(teacherOrAdminOnly);

router.get("/student/:studentid/module/:moduleid", [
    check("studentid").exists(),
    sanitize("studentid").toInt(),
    check("moduleid").exists(),
    sanitize("moduleid").toInt()
], executor(async function (req, trx, {studentid, moduleid}) {
    return await reportService.createReportForUser(trx, studentid, moduleid);
}));


export default router;