import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as studentsService from "../services/studenten";
import { HttpError } from "../util/httpStatus";
import { usersOnly } from "../util/accessMiddleware";
import * as modulesService from "../services/modules";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
    const student = await studentsService.fetchStudent(matchedData.id);
    if (!student) {
        throw new HttpError(404, "Student doesn't exist");
    }
    return student;
}));

router.get("/", executor(async function(req, res) {
    const students = await studentsService.fetchAllStudents();
    if (students.length < 1) {
        throw new HttpError(404, "Students not found");
    }
    return students;
}));

export default router;