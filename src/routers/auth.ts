import { Router } from "express";
import { check } from "express-validator/check";
import executor from "../util/executor";
import passport from "../config/passport";
import { usersOnly, unauthenticatedOnly } from "../util/accessMiddleware";
import * as accessTokensService from "../services/accessTokens";
import * as passwordResetService from "../services/passwordReset";
import * as usersService from "../services/users";
import * as invitesService from "../services/invites";
import { HttpError } from "../util/httpStatus";
import { AccessTokenType } from "../models/AccessToken";


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
], executor(async (req, trx, { email }) => {
    const user = await usersService.fetchUserByEmail(trx, email);
    if (!user) {
        // Dont throw error because hackers shouldnt be able to derrive from this if a user exists
        return;
    }
    await passwordResetService.requestPasswordReset(trx, user);
}));

router.get("/token/:token", [
    check("token").exists(),
    unauthenticatedOnly,
], executor(async (req, trx, { token }) => {
    const acccessToken = await accessTokensService.fetchAccessToken(trx, token);
    if (!acccessToken) {
        throw new HttpError(404, "The token has expired.");
    }
    return acccessToken;
}));

router.put("/token/:token", [
    check("token").exists(),
    check("password").exists(),
    unauthenticatedOnly,
], executor(async (req, trx, { token, password }) => {
    const acccessToken = await accessTokensService.fetchAccessToken(trx, token);
    if (!acccessToken) {
        throw new HttpError(400, "The token has expired.");
    }

    if (acccessToken.type === AccessTokenType.passwordReset
        && accessTokensService.hasResetTokenExpired(acccessToken)) {
        throw new HttpError(400, "The password reset has expired.");
    }
    await accessTokensService.redeemToken(trx, acccessToken, password);
}));

export default router;