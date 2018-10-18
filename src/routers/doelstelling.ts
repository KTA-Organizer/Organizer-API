import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as doelstellingenService from "../services/doelstellingen";
import { HttpError } from "../util/httpStatus";
import { usersOnly } from "../util/accessMiddleware";

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


export default router;