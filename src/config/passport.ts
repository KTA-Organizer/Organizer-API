import passport from "passport";
import * as usersService from "../services/users";
import passportLocal from "passport-local";
import { User } from "../models/User";
import { HttpError } from "../util/httpStatus";
import * as bcrypt from "bcrypt";
import { doesNotThrow } from "assert";

const LocalStrategy   = passportLocal.Strategy;

passport.serializeUser<any, any>((user: User, done) => {
    done(undefined, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await usersService.fetchUser(id);
        if (!user) {
            throw new Error("User doesn't exist");
        }
        done(undefined, user);
    } catch (err) {
        done(err);
    }
});


/**
 * Sign in using Email and Password.
 */
passport.use("local-login", new LocalStrategy({ usernameField: "email", passwordField: "password" }, async (email: string, password: string, done) => {
    try {
        const user = await usersService.fetchUserByEmail(email.toLowerCase());
        if (!user) {
            done(undefined, false, { message: `Email ${email} not found.` });
            return;
        }

        console.log(password, user.password);
        const isEqual = await bcrypt.compare(password, user.password);
        if (isEqual) {
            done(undefined, user);
        } else {
            done(undefined, false, { message: `Passwords don't match.` });
        }
    } catch (err) {
        done(err);
    }
}));

export default passport;

