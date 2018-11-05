import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize, matchedData } from "express-validator/filter";
import executor from "../util/executor";
import * as usersService from "../services/users";
import * as studentsService from "../services/studenten";
import { HttpError } from "../util/httpStatus";
import {
  usersOnly,
  adminsOnly,
  unauthenticatedOnly
} from "../util/accessMiddleware";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.put(
  "/:id",
  [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),

    check("opleidingId").exists()
  ],
  executor(async function(
    req,
    trx,
    { id, opleidingId }
  ) {
    const student = await studentsService.fetchStudent(trx, id);
    if (!student) {
      throw new HttpError(404, "Student doesn't exist");
    }
    await studentsService.updateStudent(trx, id, opleidingId);
  })
);

export default router;
