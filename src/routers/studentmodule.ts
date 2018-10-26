import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as studentmodulesService from "../services/studentmodules";
import { HttpError } from "../util/httpStatus";
import { usersOnly } from "../util/accessMiddleware";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.get(
  "/",
  executor(async function(req, trx) {
    const studentmodules = await studentmodulesService.fetchAllStudentModules(trx);
    if (studentmodules.length < 1) {
      throw new HttpError(404, "StudentModules not found");
    }
    return studentmodules;
  })
);

router.get(
  "/:id",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, trx, matchedData) {
    const modules = await studentmodulesService.fetchStudentModulesWithStudentId(trx, matchedData.id);
    return modules;
  })
);

export default router;
