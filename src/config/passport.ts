import passport from "passport";
import * as usersService from "../services/users";
import passportLocal from "passport-local";
import { User } from "../models/User";
import { HttpError } from "../util/httpStatus";
import bcrypt from "bcrypt";

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
passport.use("local-login", new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email: string, password: string, done) => {
    usersService.fetchUserByEmail(email.toLowerCase()).then(function(user: any) {
        if (!user) {
            return done(undefined, false, { message: `Email ${email} not found.` });
        }
        console.log(user);
        console.log(password);
        if (password === user.password) {
            console.log("match");
            done(undefined, user);
        } else {
            console.log("no match");
            done(undefined, false);
        }
/*
        bcrypt.compare(password, user.password, function(err: Error, res: any) {
            if (err) { throw (err); }
            if (res) {
                console.log("match");
                done(undefined, user);
            } else {
                console.log("unmatch");
                done(undefined, false);
            }
        });*/

    });
}));

module.exports = passport;

