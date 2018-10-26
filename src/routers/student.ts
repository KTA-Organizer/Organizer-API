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
import { createTrx } from "../config/db";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.post(
  "/",
  [
    adminsOnly,
    check("firstname").exists(),
    check("lastname").exists(),
    check("email").isEmail(),
    check("gender").exists(),
    check("opleidingId").exists(),
    check("moduleIds").exists()
  ],
  executor(async function (
    req,
    trx,
    { firstname, lastname, email, gender, opleidingId, moduleIds }
  ) {
    const existingUser = await usersService.fetchUserByEmail(trx, email);
    if (existingUser) {
      throw new HttpError(400, "A user with this email already exists");
    }
    await studentsService.insertStudent(trx,
      { firstname, lastname, email, gender },
      opleidingId,
      moduleIds
    );
  })
);

router.put(
  "/:id",
  [
    adminsOnly,
    check("firstname").exists(),
    check("lastname").exists(),
    check("email").isEmail(),
    check("opleidingId").exists(),
    check("moduleIds").exists(),
    check("id").isNumeric(),
    sanitize("id").toInt()
  ],
  executor(async function(
    req,
    trx,
    { id, firstname, lastname, email, opleidingId, moduleIds }
  ) {
    const student = await studentsService.fetchStudent(trx, id);
    if (!student) {
      throw new HttpError(404, "Student doesn't exist");
    }
    studentsService.updateStudent(trx, { id, firstname, lastname, email }, opleidingId, moduleIds);
  })
);

router.delete(
    "/:id",
  [adminsOnly, check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, trx, matchedData) {
    const student = await studentsService.fetchStudent(trx, matchedData.id);
    if (!student) {
      throw new HttpError(404, "Student doesn't exist");
    }
    await studentsService.disableStudent(trx, matchedData.id);
  })
);

router.get(
  "/",
  executor(async function(req, trx) {
    const students = await studentsService.fetchAllStudents(trx);
    if (students.length < 1) {
      throw new HttpError(404, "Students not found");
    }
    return students;
  })
);

export default router;
