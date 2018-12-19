import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import { allStaffOnly } from "../util/accessMiddleware";
import * as reportService from "../services/reports";
import { User, UserRole } from "../models/User";
import { HttpError } from "../util/httpStatus";
import * as pdfMaker from "../util/pdf";
import * as moduleService from "../services/modules";
import * as userService from "../services/users";
import * as evaluationService from "../services/evaluation";

const router = Router({
  mergeParams: true,
  strict: true
});

router.post(
  "/",
  [
    allStaffOnly,
    check("evaluationsheetid").isNumeric(),
    sanitize("evaluationsheetid").toInt()
  ],
  executor(async function(req, trx, { evaluationsheetid }) {
    await evaluationService.endEvaluation(trx, evaluationsheetid);
    const reportid = await reportService.generateReport(trx, evaluationsheetid);
    return { reportid };
  })
);

router.get(
  "/",
  [
    check("page")
      .isNumeric()
      .optional(),
    sanitize("page").toInt(),

    check("perpage")
      .isNumeric()
      .optional(),
    sanitize("perpage").toInt(),

    // Filters
    check("studentid")
      .isNumeric()
      .optional(),
    sanitize("studentid").toInt(),
    check("teacherid")
      .isNumeric()
      .optional(),
    sanitize("teacherid").toInt(),
    check("moduleid")
      .isNumeric()
      .optional(),
    sanitize("moduleid").toInt(),
    check("disciplineid")
      .isNumeric()
      .optional(),
    sanitize("disciplineid").toInt(),

    check("open").isBoolean().optional(),
    sanitize("open").toBoolean(),

    check("studentname").optional(),
    check("teachername").optional(),
    check("disciplinename").optional(),
    check("modulename").optional(),
  ],
  executor(async function(req, trx, { page = 1, perpage = 1e10, ...filters }) {
    return await reportService.paginateAllReports(trx, {
      page,
      perPage: perpage,
      ...filters
    });
  })
);

router.get(
  "/:reportid",
  [check("reportid").isNumeric()],
  executor(async function(req, trx, { reportid }) {
    const user = req.user as User;
    const report = await reportService.fetchReport(trx, reportid);
    if (!report) {
      throw new HttpError(404, "Report doesnt exist");
    }
    const isStudent = user.roles.indexOf(UserRole.student) > -1;
    const isReportStudent = report.evaluationSheet.student.id === user.id;
    if (isStudent && (!report.open || !isReportStudent)) {
      throw new HttpError(401);
    }
    return report;
  })
);

router.put(
  "/:reportid",
  [
    allStaffOnly,

    check("reportid").isNumeric(),
    check("generalComment").exists(),
    check("goalComments").exists()
  ],
  executor(async function(
    req,
    trx,
    { reportid, generalComment, goalComments }
  ) {
    const report = await reportService.fetchReport(trx, reportid);
    if (!report) {
      throw new HttpError(404, "Report doesnt exist");
    }
    return await reportService.updateComments(
      reportid,
      report,
      generalComment,
      goalComments
    );
  })
);

router.post(
  "/:reportid/open",
  [allStaffOnly, check("reportid").isNumeric()],
  executor(async function(req, trx, { reportid }) {
    const report = await reportService.fetchReportListItem(trx, reportid);
    if (!report) {
      throw new HttpError(404, "Report doesnt exist");
    }
    await reportService.openReport(trx, reportid);
  })
);

router.get(
  "/pdf/:reportid",
  [allStaffOnly, check("reportid").exists()],
  executor(async function(req, trx, { reportid }) {
    const report = await reportService.fetchReport(trx, reportid);
    return pdfMaker.createReportPDF(report);
  })
);

router.get("/evaluationsheet/:evaluationsheetid", [check("evaluationsheetid").exists()], executor(async function (req, trx, { evaluationsheetid }) {
  const reportid = await reportService.fetchReportIdForEvaluationsheet(trx, evaluationsheetid);
  return { reportid };
}));

export default router;
