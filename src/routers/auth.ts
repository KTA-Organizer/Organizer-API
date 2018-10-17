import { Router } from "express";
import { check } from "express-validator/check";
import executor from "./executor";
import passport from "../config/passport";


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


export default router;