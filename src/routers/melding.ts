import { Router } from "express";
import { check } from "express-validator/check";
import { loadConfig } from "../config/storage";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as meldingenService from "../services/meldingen";
import { HttpError } from "../util/httpStatus";
import { usersOnly, teacherOrAdminOnly } from "../util/accessMiddleware";
import { User } from "../models/User";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.get(
  "/",
  [teacherOrAdminOnly],
  executor(async function(req, trx) {
    const user = req.user as User;
    const options: any = { page: 1, perPage: 10000 };
    const meldingen = await meldingenService.paginateAllMeldingen(trx, options);
    return meldingen.items;
  })
);

router.post(
  "/",
  [
    teacherOrAdminOnly,
    check("titel").exists(),
    check("tekst").exists(),
  ],
  executor(async function(req, trx, data, res) {
    const user = req.user as User;
    const meldingId = await meldingenService.insertMelding(trx, {
      ...data,
      creatorId: user.id
    });
    res.header("Location", `/api/meldingen/${meldingId}`);
    res.status(201);
  })
);

router.delete(
  "/:id",
  [teacherOrAdminOnly, check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, trx, { id }) {
    const user = req.user as User;
    const existingMelding = await meldingenService.fetchMelding(trx, id);
    if (!existingMelding) {
      throw new HttpError(404, "Melding doesn't exist");
    }
    await meldingenService.removeMelding(trx, id);
  })
);

export default router;
