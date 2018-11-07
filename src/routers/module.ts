import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as modulesService from "../services/modules";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import { User } from "../models/User";


const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, trx, matchedData) {
    const module = await modulesService.fetchFullModule(trx, matchedData.id);
    if (!module) {
        throw new HttpError(404, "Module doesn't exist");
    }
    return module;
}));

router.get("/", [
  check("disciplineid").isNumeric(),
  sanitize("disciplineid").toInt(),
], executor(async function (req, trx, { disciplineid }) {
  const modules = await modulesService.fetchModulesForDiscipline(trx, disciplineid);
  return modules;
}));

router.post("/", [
  adminsOnly,
  check("disciplineid").exists(),
  check("name").exists(),
], executor(async function (req, trx, { disciplineid, name }) {
  const user = req.user as User;
  return await modulesService.insertModule(trx, { disciplineid, name, creatorId: user.id });
}));

router.put("/:id", [
  adminsOnly,
  check("id").isNumeric(),
  sanitize("id").toInt(),
  check("name").exists()
], executor(async function (req, trx, { id, name }) {
  const existingModule = await modulesService.fetchModule(trx, id);
  if (!existingModule) {
    throw new HttpError(400, "A module with this id doesn't exist");
  }
  await modulesService.updateModule(trx, id, { name });
}));

router.put("/:id/status", [
  adminsOnly,
  check("id").isNumeric(),
  sanitize("id").toInt(),
  check("active").exists()
], executor(async function (req, trx, { id, active }) {
  const existingModule = await modulesService.fetchModule(trx, id);
  if (!existingModule) {
    throw new HttpError(400, "A module with this id doesn't exist");
  }
  await modulesService.updateModuleStatus(trx, id, { active });
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
  await modulesService.deactivateModule(trx, matchedData.id);
}));

export default router;