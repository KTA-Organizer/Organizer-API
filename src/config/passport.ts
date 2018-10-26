import passport from "passport";
import * as usersService from "../services/users";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../models/User";
import { HttpError } from "../util/httpStatus";
import * as bcrypt from "bcrypt";
import { createTrx } from "./db";

passport.serializeUser<User, number>((user, done) => {
    done(undefined, user.id);
});
passport.deserializeUser<User, number>(async (id, done) => {
    const trx = await createTrx();
    const cb = (err: any, user?: User) => {
        trx.commit();
        done(err, user);
    };
    try {
        const user = await usersService.fetchUser(trx, id);
        cb(undefined, user);
    } catch (err) {
        cb(err);
    }
});


/**
 * Sign in using Email and Password.
 */
const strategyOptions = {
    usernameField: "email",
    passwordField: "password",
};
passport.use("local-login", new LocalStrategy(strategyOptions, login));

async function login(email: string, password: string, done: any) {
    const trx = await createTrx();
    const cb = (err: any, user?: any, options?: any) => {
        trx.commit();
        done(err, user, options);
    };
    try {
        const passHash = await usersService.fetchUserPasswordByEmail(trx, email);
        if (!passHash) {
            cb(undefined, false, { message: `Email ${email} not found.` });
            return;
        }

        const isEqual = await bcrypt.compare(password, passHash);
        if (isEqual) {
            const user = await usersService.fetchUserByEmail(trx, email.toLowerCase());
            cb(undefined, user);
        } else {
            cb(undefined, false, { message: `Passwords don't match.` });
        }
    } catch (err) {
        cb(err);
    }
}

export default passport;

