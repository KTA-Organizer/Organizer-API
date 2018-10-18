import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as meldingenService from "../services/meldingen";
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

router.post("/", async function(req, res) {
    const meldingId = await meldingenService.insertMelding(req.body);
    if (!meldingId) {
        res.status(404)
            .send("Unable to add Melding, data is missing or incorrect");
        return;
    }
    res.location("/meldingen/" + meldingId)
        .sendStatus(201);
    return;
});


export default router;