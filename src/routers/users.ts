import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as usersService from "../services/users";
import { HttpError } from "../util/httpStatus";
import {
  usersOnly,
  adminsOnly,
  teacherOrAdminOnly
} from "../util/accessMiddleware";
import { User, UserRole, Gender, genders, userRoles, userStatuses } from "../models/User";
import logger from "../util/logger";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.get(
  "/",
  [
    teacherOrAdminOnly,
    check("search").optional(),
    check("status").isIn(userStatuses).optional(),
    check("gender").isIn(genders).optional(),
    check("role").isIn(userRoles).optional(),
    check("page").isNumeric().optional(),
    check("perpage").isNumeric().optional()
  ],
  executor(async function(req, trx, { search, status, gender, role, page = 1, perpage = 50 }) {
    const users = await usersService.paginateAllUsers(trx, {
      search,
      status,
      gender,
      role,
      page,
      perPage: perpage
    });
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
  [teacherOrAdminOnly,
    check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function (req, trx, matchedData) {
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
    check("gender").isIn(genders),
    check("roles").exists()
  ],
  executor(async function(req, trx, matchedData) {
    const existingUser = await usersService.fetchUserByEmail(
      trx,
      matchedData.email
    );
    if (existingUser) {
      throw new HttpError(400, "A user with this email already exists");
    }
    const newUser = await usersService.insertUser(trx, matchedData);
    return newUser;
  })
);

router.put(
  "/:id",
  [
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("firstname").exists(),
    check("lastname").exists(),
    check("email").isEmail(),
    check("gender").isIn(genders),
    check("roles").exists()
  ],
  executor(async function(req, trx, { id, ...userData }) {
    const currentUser = req.user as User;
    const isAdmin = usersService.hasRole(currentUser, UserRole.admin);
    if (!isAdmin && currentUser.id !== id) {
      throw new HttpError(403, "You are not authorized to edit this user.");
    }
    await usersService.updateUser(trx, id, userData, isAdmin);
  })
);

router.put(
  "/:id/activate",
  [adminsOnly, check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, trx, { id }) {
    await usersService.activateUser(trx, id);
  })
);

router.delete(
  "/:id",
  [adminsOnly, check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, trx, matchedData) {
    logger.info("deleting user => " + matchedData.id);
    await usersService.disableUser(trx, matchedData.id);
  })
);

export default router;
