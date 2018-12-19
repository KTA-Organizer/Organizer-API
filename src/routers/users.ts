import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as usersService from "../services/users";
import { HttpError } from "../util/httpStatus";
import { usersOnly, adminsOnly, allStaffOnly } from "../util/accessMiddleware";
import { User, genders, userRoles, userStatuses } from "../models/User";
import * as csvService from "../services/csvInput";
import logger from "../util/logger";
import multer from "multer";
import os from "os";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.get(
  "/",
  [
    allStaffOnly,
    check("search").optional(),
    check("status")
      .isIn(userStatuses)
      .optional(),
    check("gender")
      .isIn(genders)
      .optional(),
    check("role")
      .isIn(userRoles)
      .optional(),
    check("page")
      .isNumeric()
      .optional(),
    check("perpage")
      .isNumeric()
      .optional(),
    check("disciplineid")
      .isNumeric()
      .optional(),
    sanitize("page").toInt(),
    sanitize("perpage").toInt(),
    sanitize("disciplineid").toInt()
  ],
  executor(async function(
    req,
    trx,
    { search, status, gender, role, disciplineid, page = 1, perpage = 1e10 }
  ) {
    const users = await usersService.paginateAllUsers(trx, {
      search,
      status,
      gender,
      role,
      disciplineid,
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
  [allStaffOnly, check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function(req, trx, { id }) {
    const user = await usersService.fetchUser(trx, id);
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
    check("email")
      .optional()
      .isEmail(),
    check("gender").isIn(genders).optional(),
    check("roles").exists(),
    check("nationalRegisterNumber").optional()
  ],
  executor(async function(req, trx, data) {
    const currentUser = req.user as User;
    if (data.email) {
      const existingUser = await usersService.fetchUserByEmail(trx, data.email);
      if (existingUser) {
        throw new HttpError(400, "A user with this email already exists");
      }
    }
    const newUser = await usersService.insertUser(trx, {
      ...data,
      creatorId: currentUser.id
    });
    return newUser;
  })
);

router.put(
  "/:id",
  [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("firstname").exists(),
    check("lastname").exists(),
    check("email").isEmail(),
    check("gender").isIn(genders).optional(),
    check("roles").exists(),
    check("nationalRegisterNumber").optional()
  ],
  executor(async function(req, trx, { id, ...userData }) {
    await usersService.updateUser(trx, id, { ...userData }, true);
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

const upload = multer({ dest: os.tmpdir() });
router.post(
  "/csv",
  [
    adminsOnly,
    upload.single("userfile"),
  ],
  executor(async function(req, trx) {
    if (!req.file || req.file.mimetype !== "text/csv") {
      throw new HttpError(400);
    }
    const path = req.file.path;
    await csvService.csvInput(trx, path);
  })
);

export default router;
