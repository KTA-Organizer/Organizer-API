import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as usersService from "../services/users";
import { HttpError } from "../util/httpStatus";
import { usersOnly, adminsOnly, teacherOrAdminOnly } from "../util/accessMiddleware";
import { User } from "../models/User";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.get(
  "/",
  [teacherOrAdminOnly],
  executor(async function(req, trx) {
    const users = await usersService.fetchAll(trx, true);
    return users;
  })
);

router.get(
  "/current",
  executor(async function(req, res) {
    return req.user as User;
  })
);

router.get(
  "/:id",
  [teacherOrAdminOnly, check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, trx, matchedData) {
    const user = await usersService.fetchUser(trx, matchedData.id);
    if (!user) {
      throw new HttpError(404, "User doesn't exist");
    }
    return user;
  })
);

router.post(
  "/",
  [
    adminsOnly,
    check("firstname").exists(),
    check("lastname").exists(),
    check("email").isEmail(),
    check("gender").exists(),
    check("role").exists()
  ],
  executor(async function(req, trx, matchedData) {
    const existingUser = await usersService.fetchUserByEmail(
      trx,
      matchedData.email
    );
    if (existingUser) {
      throw new HttpError(400, "A user with this email already exists");
    }
    const newUserId = await usersService.insertUser(trx, matchedData);
    console.log("newUserId", newUserId);
    return { newId: newUserId };
  })
);

export default router;
