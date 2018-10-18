import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as studentmodulesService from "../services/studentmodules";
import { HttpError } from "../util/httpStatus";
import { usersOnly } from "../util/accessMiddleware";


const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/", executor(async function(req, res) {
    const studentmodules = await studentmodulesService.fetchAllStudentModules();
    if (studentmodules.length < 1) {
        throw new HttpError(404, "StudentModules not found");
    }
    return studentmodules;
}));


export default router;