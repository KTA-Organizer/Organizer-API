import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as usersService from "../services/users";
import { HttpError } from "../util/httpStatus";

const router = Router({
  mergeParams: true,
  strict: true
});

router.get("/:id", [
  check("id").isNumeric(),
  sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
  const user = await usersService.fetchUser(matchedData.id);
  if (!user) {
    throw new HttpError(404, "User doesn't exist");
  }
  return user;
}));

export default router;