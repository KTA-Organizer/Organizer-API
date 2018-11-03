import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as modulesService from "../services/modules";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import * as doelstellingsCategoriesService from "../services/doelstellingsCategories";
import * as evaluatieCriteriaService from "../services/evaluatieCriteria";


const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, trx, matchedData) {
    const module = await modulesService.fetchModule(trx, matchedData.id);
    if (!module) {
        throw new HttpError(404, "Module doesn't exist");
    }
    return module;
}));

router.get("/", executor(async function(req, trx) {
    const modules = await modulesService.fetchAllModules(trx);
    if (modules.length < 1) {
        throw new HttpError(404, "Modules not found");
    }
    return modules;
}));

router.get("/:id/student", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, trx, matchedData) {
    const module = await modulesService.fetchModulesForStudent(trx, matchedData.id);
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
], executor(async function (req, trx, { opleidingId, teacherId, name, creatorId }) {
    return await modulesService.insertModule(trx, { opleidingId, teacherId, name, creatorId});
}));

router.put("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("name").exists()
], executor(async function (req, trx, {id, name}) {
    const existingModule = await modulesService.fetchModule(trx, id);
    if (!existingModule) {
        throw new HttpError(400, "A module with this id doesn't exist");
    }
    await modulesService.updateModule(trx, {id, name});
}));

router.delete("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, trx, matchedData) {
    const existingModule = await modulesService.fetchModule(trx, matchedData.id);
    if (!existingModule) {
        throw new HttpError(400, "A module with this id doesn't exist");
    }
    await modulesService.removeModule(trx, matchedData.id);
}));

export default router;