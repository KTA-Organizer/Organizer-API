import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as doelstellingenService from "../services/doelstellingen";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import * as evaluatieCriteriaService from "../services/evaluatieCriteria";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, trx, matchedData) {
    const doelstelling = await doelstellingenService.fetchDoelstelling(trx, matchedData.id);
    if (!doelstelling) {
        throw new HttpError(404, "Doelstelling doesn't exist");
    }
    return doelstelling;
}));

router.get("/", executor(async function(req, trx) {
    const doelstellingen = await doelstellingenService.fetchAllDoelstellingen(trx);
    if (doelstellingen.length < 1) {
        throw new HttpError(404, "Doelstellingen not found");
    }
    return doelstellingen;
}));

router.post("/", [
    adminsOnly,
    check("doelstellingscategorieId").exists(),
    check("name").exists(),
    check("inGebruik").exists(),
    check("creatorId").exists()
], executor(async function (req, trx, { doelstellingscategorieId, name, inGebruik, creatorId }) {
    await doelstellingenService.insertDoelstelling(trx, { doelstellingscategorieId, name, inGebruik, creatorId});
}));

router.put("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("name").exists()
], executor(async function (req, trx, {id, name }) {
    const existingDoelstelling = await doelstellingenService.fetchDoelstelling(trx, id);
    if (!existingDoelstelling) {
        throw new HttpError(400, "A doelstelling with this id doesn't exist");
    }
    await doelstellingenService.updateDoelstelling(trx, {id, name});
}));

router.delete("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, trx, {id}) {
    const existingDoelstelling = await evaluatieCriteriaService.fetchEvaluatieCriteriaById(trx, id);
    if (!existingDoelstelling) {
        throw new HttpError(400, "A doelstelling with this id doesn't exist");
    }
    await doelstellingenService.removeDoelstelling(trx, id);
}));


export default router;