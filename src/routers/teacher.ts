import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as teacherService from "../services/teachers";
import { HttpError } from "../util/httpStatus";

const router = Router({
    mergeParams: true,
    strict: true
});

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
    const teacher = await teacherService.fetchTeacher(matchedData.id);
    if (!teacher) {
        throw new HttpError(404, "Teacher doesn't exist");
    }
    return teacher;
}));

export default router;