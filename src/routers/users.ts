import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as usersService from "../services/users";
import { HttpError } from "../util/httpStatus";
import { usersOnly } from "../util/accessMiddleware";
import { User } from "../models/User";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.get("/", executor(async function(req, trx) {
  const users = await usersService.fetchAll(trx);
  for (const user of users) {
    user.role = await usersService.fetchUserRole(trx, user.id);
    delete user.password;
  }
  return users;
}));

router.get("/current", executor(async function(req, res) {
  return req.user as User;
}));

router.get("/:id", [
  check("id").isNumeric(),
  sanitize("id").toInt()
], executor(async function(req, trx, matchedData) {
  const user = await usersService.fetchUser(trx, matchedData.id);
  if (!user) {
    throw new HttpError(404, "User doesn't exist");
  }
  return user;
}));

export default router;