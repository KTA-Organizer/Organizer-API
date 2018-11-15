import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as goalsService from "../services/goals";
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
     check("domainid").exists(),
     check("name").exists(),
 ], executor(async function (req, trx, { domainid, name }) {
    const user = req.user as User;
    return await goalsService.insertGoals(trx, { domainid, name, creatorId: user.id });
 }));

 router.put("/:id/status", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("active").isNumeric(),
    sanitize("active").toInt(),
  ], executor(async function (req, trx, { id, active }) {
    const existingGoal = await goalsService.fetchGoal(trx, id);
    if (!existingGoal) {
      throw new HttpError(400, "A goal with this id doesn't exist");
    }
    await goalsService.updateGoalStatus(trx, id, { active });
  }));

  router.put("/:id/status", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("name").exists()
  ], executor(async function (req, trx, { id, name }) {
    const existingGoal = await goalsService.fetchGoal(trx, id);
    if (!existingGoal) {
      throw new HttpError(400, "A goal with this id doesn't exist");
    }
    await goalsService.updateGoal(trx, { id, name });
  }));



// router.delete("/:id", [
//     adminsOnly,
//     check("id").isNumeric(),
//     sanitize("id").toInt()
// ], executor(async function (req, trx, {id}) {
//     const existingDoelstelling = await criteriaService.fetchEvaluatieCriteriaById(trx, id);
//     if (!existingDoelstelling) {
//         throw new HttpError(400, "A doelstelling with this id doesn't exist");
//     }
//     await goalsService.removeDoelstelling(trx, id);
// }));


export default router;