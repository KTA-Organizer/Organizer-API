import { Router } from "express";
import { check } from "express-validator/check";
import executor from "./executor";
import passport from "../config/passport";
import { usersOnly } from "../util/accessMiddleware";


const router = Router({
    mergeParams: true,
    strict: true
});

router.post("/login", [
    check("email").isEmail(),
    check("password").exists(),
    passport.authenticate("local-login")
], executor(async (req) => {
    return req.user;
}));

router.post("/logout", usersOnly, (req, res) => {
    req.logout();
    req.session.destroy(() => {});
    res.status(200).send();
});

export default router;