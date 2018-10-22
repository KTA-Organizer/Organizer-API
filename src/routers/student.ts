import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize, matchedData } from "express-validator/filter";
import executor from "./executor";
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

router.post(
  "/",
  [
    adminsOnly,
    check("firstname").exists(),
    check("lastname").exists(),
    check("email").isEmail(),
    check("opleidingId").exists(),
    check("moduleIds").exists()
  ],
  executor(async function(
    req,
    res,
    { firstname, lastname, email, opleidingId, moduleIds }
  ) {
    const existingUser = await usersService.fetchUserByEmail(email);
    if (existingUser) {
      throw new HttpError(400, "A user with this email already exists");
    }
    await studentsService.insertStudent(
      { firstname, lastname, email },
      opleidingId,
      moduleIds
    );
  })
);

router.put(
  "/:id",
  [
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
    res,
    { id, firstname, lastname, email, opleidingId, moduleIds }
  ) {
    const student = await studentsService.fetchStudent(id);
    if (!student) {
      throw new HttpError(404, "Student doesn't exist");
    }
    studentsService.updateStudent(
      { id, firstname, lastname, email },
      opleidingId,
      moduleIds
    );
  })
);

router.delete(
    "/:id",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, res, matchedData) {
    const student = await studentsService.fetchStudent(matchedData.id);
    if (!student) {
      throw new HttpError(404, "Student doesn't exist");
    }
    await studentsService.removeStudent(matchedData.id);
  })
);

router.get(
  "/:id",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, res, matchedData) {
    const student = await studentsService.fetchStudent(matchedData.id);
    if (!student) {
      throw new HttpError(404, "Student doesn't exist");
    }
    return student;
  })
);

router.get(
  "/",
  executor(async function(req, res) {
    const students = await studentsService.fetchAllStudents();
    if (students.length < 1) {
      throw new HttpError(404, "Students not found");
    }
    return students;
  })
);

export default router;
