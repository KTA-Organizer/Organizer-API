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

  export default router;