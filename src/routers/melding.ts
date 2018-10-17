import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as meldingenService from "../services/meldingen";
import { HttpError } from "../util/httpStatus";

const router = Router({
    mergeParams: true,
    strict: true
});

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
    const melding = await meldingenService.fetchMelding(matchedData.id);
    if (!melding) {
        throw new HttpError(404, "Melding doesn't exist");
    }
    return melding;
}));

router.get("/", executor(async function(req, res) {
    const meldingen = await meldingenService.fetchAllMeldingen();
    if (meldingen.length < 1) {
        throw new HttpError(404, "Meldingen not found");
    }
    return meldingen;
}));


export default router;