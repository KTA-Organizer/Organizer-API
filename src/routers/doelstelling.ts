import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as doelstellingenService from "../services/doelstellingen";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
    const doelstelling = await doelstellingenService.fetchDoelstelling(matchedData.id);
    if (!doelstelling) {
        throw new HttpError(404, "Doelstelling doesn't exist");
    }
    return doelstelling;
}));

router.get("/", executor(async function(req, res) {
    const doelstellingen = await doelstellingenService.fetchAllDoelstellingen();
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
], executor(async function (req, res, { doelstellingscategorieId, name, inGebruik, creatorId }) {
    await doelstellingenService.insertDoelstelling({ doelstellingscategorieId, name, inGebruik, creatorId});
}));

router.put("/:id", [
    usersOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("doelstellingscategorieId").exists(),
    check("name").exists(),
    check("inGebruik").exists(),
    check("creatorId").exists()
], executor(async function (req, res, {id, doelstellingscategorieId, name, inGebruik, gewicht, creatorId }) {
    const existingEvaluatieCriteria = await doelstellingenService.fetchDoelstelling(id);
    if (!existingEvaluatieCriteria) {
        throw new HttpError(400, "A doelstelling with this id doesn't exist");
    }
    await doelstellingenService.updateDoelstelling({id, doelstellingscategorieId, name, inGebruik, creatorId});
}));


export default router;