import { Router } from "express";
import passport from "../config/passport";

const router = Router({
  mergeParams: true,
  strict: true
});
router.post("/", function(req, res, next) {
  passport.authenticate("local-login", function(err: Error, user: any) {
      console.log("User: " + user);
    if (err) {
      return next(err);
    }
    // stop if it fails
    if (!user) {
      console.log("no user found");
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    req.logIn(user, function(err) {
      // return if does not match
      if (err) {
        return next(err);
      }
    });
    return res.status(200).json({
      user: req.user
    });
  })(req, res, next);
});

export default router;
