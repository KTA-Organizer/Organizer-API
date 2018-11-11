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
    check("moduleid").isNumeric(),
    sanitize("moduleid").toInt(),

    check("termStart").exists(),
    sanitize("termStart").toDate(),

    check("termEnd").exists(),
    sanitize("termEnd").toDate(),

    check("studentids").exists(),
], executor(async function (req, trx, {moduleid, studentids, termStart, termEnd}) {
    const user = req.user as User;
    const reportids = [];
    for (const studentid of studentids.slice(0, 1)) {
        const id = await reportService.generateReport(trx, user.id, studentid, moduleid, termStart, termEnd);
        reportids.push(id);
    }
    return reportids;
}));

router.get("/", [
    check("studentid").isNumeric().optional(),
    sanitize("studentid").toInt(),
    check("teacherid").isNumeric().optional(),
    sanitize("teacherid").toInt(),
    check("moduleid").isNumeric().optional(),
    sanitize("moduleid").toInt(),
    check("disciplineid").isNumeric().optional(),
    sanitize("disciplineid").toInt(),
], executor(async function (req, trx, filters) {
    return await reportService.fetchReports(trx, filters);
}));

router.get("/:reportid", [
    check("reportid").isNumeric(),
], executor(async function (req, trx, {reportid}) {
    const report = await reportService.fetchReport(reportid);
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
    const report = await reportService.fetchReport(reportid);
    if (!report) {
        throw new HttpError(404, "Report doesnt exist");
    }
    return await reportService.updateComments(reportid, report, generalComment, goalComments);
}));

export default router;