import { Router } from "express";
import { check } from "express-validator/check";
import executor from "./executor";
import passport from "../config/passport";
import { usersOnly, unauthenticatedOnly } from "../util/accessMiddleware";
import * as accessTokensService from "../services/accessTokens";
import * as passwordResetService from "../services/passwordReset";
import * as usersService from "../services/users";
import * as studentInviteService from "../services/studentInvite";
import { HttpError } from "../util/httpStatus";


const router = Router({
    mergeParams: true,
    strict: true
});

router.post("/login", unauthenticatedOnly, [
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

router.post("/forgot", [
    check("email").isEmail(),
    unauthenticatedOnly,
], executor(async (req, res, { email }) => {
    const user = await usersService.fetchUserByEmail(email);
    if (!user) {
        // Dont throw error because hackers shouldnt be able to derrive from this if a user exists
        return;
    }

    await passwordResetService.requestPasswordReset(user);
}));

router.post("/reset", [
    check("token").exists(),
    check("password").exists(),
    unauthenticatedOnly,
], executor(async (req, res, { token, password }) => {
    const acccessToken = await accessTokensService.fetchAccessToken(token);
    if (!acccessToken) {
        throw new HttpError(400, "The password reset token has expired.");
    }
    await passwordResetService.resetPassword(acccessToken, password);
}));

router.post("/invitation", [
    check("token").exists(),
    check("password").exists(),
    unauthenticatedOnly,
], executor(async (req, res, { token, password }) => {
    const acccessToken = await accessTokensService.fetchAccessToken(token);
    if (!acccessToken) {
        throw new HttpError(400, "The password reset token has expired.");
    }
    await studentInviteService.acceptInvitation(acccessToken, password);
}));


export default router;