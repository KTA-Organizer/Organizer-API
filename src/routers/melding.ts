import { Router } from "express";
import { check } from "express-validator/check";
import { URL } from "../util/constants";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as meldingenService from "../services/meldingen";
import * as studentenService from "../services/studenten";
import { HttpError } from "../util/httpStatus";
import { usersOnly, teachersOnly } from "../util/accessMiddleware";
import * as passwordResetService from "../services/passwordReset";
import { Opleiding } from "../models/Opleiding";
import * as userService from "../services/users";
import { User } from "../models/User";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.get(
  "/:id",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, res, matchedData) {
    const melding = await meldingenService.fetchMelding(matchedData.id);
    if (!melding) {
      throw new HttpError(404, "Melding doesn't exist");
    }
    return melding;
  })
);

router.get(
  "/",
  executor(async function(req, res) {
    const meldingen = await meldingenService.fetchAllMeldingen();
    if (meldingen.length < 1) {
      throw new HttpError(404, "Meldingen not found");
    }
    return meldingen;
  })
);

router.post(
  "/",
  [
    teachersOnly,
    check("titel").exists(),
    check("tekst").exists(),
    check("opleidingIds").exists()
  ],
  executor(async function(req, res, matchedData) {
    const teacher = req.user;
    const meldingId = await meldingenService.insertMelding({
      tekst: matchedData.tekst,
      titel: matchedData.titel,
      teacherId: teacher.id
    });
    for (const opleidingId of matchedData.opleidingIds) {
      await meldingenService.addMeldingWithOpleiding(meldingId, +opleidingId);
    }
    const opleidingenIds = await meldingenService.fetchOpleidingenFromMeldingAsArray(
      meldingId
    );
    let users = await studentenService.fetchAllStudents();
    users = users.filter(user => opleidingenIds.indexOf(user.opleidingId) >= 0);
    await meldingenService.requestAlertMelding(
      users,
      URL + "/meldingen/" + meldingId,
      {titel: matchedData.titel, teacher: teacher}
    );
    res.location("/meldingen/" + meldingId).sendStatus(201);
    return;
  })
);

router.delete(
  "/:id",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, res, matchedData) {
    const melding = await meldingenService.fetchMelding(matchedData.id);
    if (!melding) {
      throw new HttpError(404, "Melding doesn't exist");
    }
    await meldingenService.removeMelding(matchedData.id);
  })
);

export default router;
