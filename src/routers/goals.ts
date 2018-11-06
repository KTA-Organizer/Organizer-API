import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as goalsService from "../services/goals";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import * as criteriaService from "../services/criteria";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

// router.post("/", [
//     adminsOnly,
//     check("doelstellingscategorieId").exists(),
//     check("name").exists(),
//     check("inGebruik").exists(),
//     check("creatorId").exists()
// ], executor(async function (req, trx, { doelstellingscategorieId, name, inGebruik, creatorId }) {
//     return await goalsService.insertGoals(trx, { doelstellingscategorieId, name, inGebruik, creatorId});
// }));

// router.put("/:id", [
//     adminsOnly,
//     check("id").isNumeric(),
//     sanitize("id").toInt(),
//     check("name").exists()
// ], executor(async function (req, trx, {id, name }) {
//     const existingDoelstelling = await goalsService.fetchDoelstelling(trx, id);
//     if (!existingDoelstelling) {
//         throw new HttpError(400, "A doelstelling with this id doesn't exist");
//     }
//     await goalsService.updateDoelstelling(trx, {id, name});
// }));

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