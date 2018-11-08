import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as criteriaService from "../services/criteria";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import { User } from "../models/User";


const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.post("/", [
    adminsOnly,
    check("goalid").exists(),
    check("weight").exists(),
    check("name").exists(),
  ], executor(async function (req, trx, { name, goalid, weight }) {
    const user = req.user as User;
    return await criteriaService.insertCriterion(trx, { name, goalid, weight, creatorId: user.id });
  }));

  router.put("/:id/status", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("active").isNumeric(),
    sanitize("active").toInt(),
  ], executor(async function (req, trx, { id, active }) {
    const existingCriteria = await criteriaService.fetchCriteria(trx, id);
    if (!existingCriteria) {
      throw new HttpError(400, "A criteria with this id doesn't exist");
    }
    await criteriaService.updateCriterionStatus(trx, id, { active });
  }));
 

  export default router;