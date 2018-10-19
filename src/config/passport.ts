import passport from "passport";
import * as usersService from "../services/users";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../models/User";
import { HttpError } from "../util/httpStatus";
import * as bcrypt from "bcrypt";

passport.serializeUser<User, number>((user, done) => {
    done(undefined, user.id);
});
passport.deserializeUser<User, number>(async (id, done) => {
    try {
        const user = await usersService.fetchUser(id);
        done(undefined, user);
    } catch (err) {
        done(err);
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
    try {
        const passHash = await usersService.fetchUserPasswordByEmail(email);
        if (!passHash) {
            done(undefined, false, { message: `Email ${email} not found.` });
            return;
        }

        const isEqual = await bcrypt.compare(password, passHash);
        if (isEqual) {
            const user = await usersService.fetchUserByEmail(email.toLowerCase());
            done(undefined, user);
        } else {
            done(undefined, false, { message: `Passwords don't match.` });
        }
    } catch (err) {
        done(err);
    }
}

export default passport;

