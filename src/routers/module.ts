import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as modulesService from "../services/modules";
import { HttpError } from "../util/httpStatus";


const router = Router({
    mergeParams: true,
    strict: true
});

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
    const teacher = await modulesService.fetchModule(matchedData.id);
    if (!teacher) {
        throw new HttpError(404, "Module doesn't exist");
    }
    return teacher;
}));

router.get("/", executor(async function(req, res) {
    const meldingen = await modulesService.fetchAllModules();
    if (meldingen.length < 1) {
        throw new HttpError(404, "Modules not found");
    }
    return meldingen;
}));


export default router;