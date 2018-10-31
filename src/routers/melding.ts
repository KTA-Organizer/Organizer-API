import { Router } from "express";
import { check } from "express-validator/check";
import { loadConfig } from "../config/storage";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
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
  executor(async function(req, trx, matchedData) {
    const melding = await meldingenService.fetchMelding(trx, matchedData.id);
    if (!melding) {
      throw new HttpError(404, "Melding doesn't exist");
    }
    return melding;
  })
);

router.get(
  "/",
  executor(async function(req, trx) {
    const meldingen = await meldingenService.fetchAllMeldingen(trx);
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
  executor(async function(req, trx, { opleidingIds, ...data }, res) {
    const teacher = req.user;
    const meldingId = await meldingenService.insertMelding(trx, {
      ...data,
      teacherId: teacher.id
    });
    for (const opleidingId of opleidingIds) {
      await meldingenService.addMeldingWithOpleiding(trx, meldingId, +opleidingId);
    }
    // TODO send mails
    //     const config = await loadConfig():
    //     /*const opleidingenIds = await meldingenService.fetchOpleidingenFromMeldingAsArray(meldingId);
    //     let users = await studentenService.fetchAllStudents();
    //     users =  users.filter(user => opleidingenIds.indexOf(user.opleidingId) < 0);
    //     await meldingenService.requestAlertMelding(users, config.url + "/meldingen/" + meldingId);*/
    //     res.location("/meldingen/" + meldingId)
    //         .sendStatus(201);
    //     return;
    res.header("Location", `/api/meldingen/${meldingId}`);
    res.status(201);
  })
);

router.post(
  "/:id",
  [
    teachersOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("titel").exists(),
    check("tekst").exists(),
  ],
  executor(async function(req, trx, { id, ...data }) {
    const teacher = req.user as User;
    const existingMelding = await meldingenService.fetchMelding(trx, id);
    if (!existingMelding) {
      throw new HttpError(404, "Melding doesn't exist");
    }
    if (existingMelding.teacherId != teacher.id) {
      throw new HttpError(403, "Melding is niet geplaatst door u.");
    }
    await meldingenService.updateMelding(trx, id, data);
  })
);

router.delete(
  "/:id",
  [teachersOnly, check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, trx, { id }) {
    const teacher = req.user as User;
    const existingMelding = await meldingenService.fetchMelding(trx, id);
    if (!existingMelding) {
      throw new HttpError(404, "Melding doesn't exist");
    }
    if (existingMelding.teacherId != teacher.id) {
      throw new HttpError(403, "Melding is niet geplaatst door u.");
    }
    await meldingenService.removeMelding(trx, id);
  })
);

export default router;
