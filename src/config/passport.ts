import passport from "passport";
import * as usersService from "../services/users";
import passportLocal from "passport-local";
import { default as User } from "../models/User";
import { HttpError } from "../util/httpStatus";
import bcrypt from "bcrypt";

const LocalStrategy   = passportLocal.Strategy;

passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id);
});

passport.deserializeUser((id: number, done) => {
    /*usersService.fetchUser(id, (err, user) => {
        done(err, user);
    });*/
    const user = usersService.fetchUser(id);
    if (!user) {
        throw new HttpError(404, "User doesn't exist");
    } else {
        done(undefined, user);
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

