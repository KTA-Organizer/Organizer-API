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
    check("moduleId").exists(),
    check("name").exists(),
  ], executor(async function (req, trx, { moduleid, name }) {
    const user = req.user as User;
    return await domainsService.insertDomain(trx, { moduleid, name, creatorId: user.id });
  }));