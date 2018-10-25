import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as modulesService from "../services/modules";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import * as doelstellingsCategoriesService from "../services/doelstellingsCategories";


const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
    const module = await modulesService.fetchModule(matchedData.id);
    if (!module) {
        throw new HttpError(404, "Module doesn't exist");
    }
    return module;
}));

router.get("/", executor(async function(req, res) {
    const modules = await modulesService.fetchAllModules();
    if (modules.length < 1) {
        throw new HttpError(404, "Modules not found");
    }
    return modules;
}));

router.get("/:id/student", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
    const module = await modulesService.fetchModulesForStudent(matchedData.id);
    if (!module) {
        throw new HttpError(404, "Module doesn't exist");
    }
    return module;
}));

router.post("/", [
    adminsOnly,
    check("opleidingId").exists(),
    check("teacherId").exists(),
    check("name").exists(),
    check("creatorId").exists()
], executor(async function (req, res, { opleidingId, teacherId, name, creatorId }) {
    await modulesService.insertModule({ opleidingId, teacherId, name, creatorId});
}));

export default router;