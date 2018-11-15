import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as domainsService from "../services/domains";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import { User } from "../models/User";


const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.post("/", [
    adminsOnly,
    check("moduleid").exists(),
    check("name").exists(),
  ], executor(async function (req, trx, { moduleid, name }) {
    const user = req.user as User;
    return await domainsService.insertDomain(trx, { moduleid, name, creatorId: user.id });
  }));

router.put("/:id/status", [
   adminsOnly,
   check("id").isNumeric(),
   sanitize("id").toInt(),
   check("active").isNumeric(),
   sanitize("active").toInt(),
 ], executor(async function (req, trx, { id, active }) {
   const existingDomain = await domainsService.fetchDomain(trx, id);
   if (!existingDomain) {
     throw new HttpError(400, "A domain with this id doesn't exist");
   }
   await domainsService.updateDomainStatus(trx, id, { active });
 }));

router.put("/:id", [
  adminsOnly,
  check("id").isNumeric(),
  sanitize("id").toInt(),
  check("name").exists()
], executor(async function (req, trx, { id, active }) {
  const existingDomain = await domainsService.fetchDomain(trx, id);
  if (!existingDomain) {
    throw new HttpError(400, "A domain with this id doesn't exist");
  }
  await domainsService.updateDomainStatus(trx, id, { active });
}));

  export default router;