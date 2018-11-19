import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import { teacherOrAdminOnly } from "../util/accessMiddleware";
import * as reportService from "../services/reports";
import { User } from "../models/User";
import { HttpError } from "../util/httpStatus";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(teacherOrAdminOnly);

router.post("/", [
    check("evaluationsheetid").isNumeric(),
    sanitize("evaluationsheetid").toInt(),
], executor(async function (req, trx, { evaluationsheetid }) {
    const user = req.user as User;
    const reportid = await reportService.generateReport(trx, evaluationsheetid);
    return { reportid };
}));

router.get("/", [
    check("page").isNumeric().optional(),
    sanitize("page").toInt(),

    check("perpage").isNumeric().optional(),
    sanitize("perpage").toInt(),

    // Filters
    check("studentid").isNumeric().optional(),
    sanitize("studentid").toInt(),
    check("teacherid").isNumeric().optional(),
    sanitize("teacherid").toInt(),
    check("moduleid").isNumeric().optional(),
    sanitize("moduleid").toInt(),
    check("disciplineid").isNumeric().optional(),
    sanitize("disciplineid").toInt(),
], executor(async function (req, trx, { page = 1, perpage = 50, ...filters }) {
    return await reportService.paginateAllReports(trx, {  page, perPage: perpage, ...filters });
}));

router.get("/:reportid", [
    check("reportid").isNumeric(),
], executor(async function (req, trx, {reportid}) {
    const report = await reportService.fetchReport(trx, reportid);
    if (!report) {
        throw new HttpError(404, "Report doesnt exist");
    }
    return report;
}));

router.put("/:reportid", [
    check("reportid").isNumeric(),
    check("generalComment").exists(),
    check("goalComments").exists(),
], executor(async function (req, trx, { reportid, generalComment, goalComments }) {
    const report = await reportService.fetchReport(trx, reportid);
    if (!report) {
        throw new HttpError(404, "Report doesnt exist");
    }
    return await reportService.updateComments(reportid, report, generalComment, goalComments);
}));

export default router;