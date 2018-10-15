import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import logger from "./util/logger";
import lusca from "lusca";
import morgan from "morgan";
import path from "path";
import expressValidator from "express-validator";
import { SESSION_SECRET } from "./util/constants";
import passport from "passport";

// Router (route handlers)
import appRouter from "./routers/app";
import apiRouter from "./routers/api";


// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8081");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
// passport
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Security
app.use(lusca({
  csrf: false,
  xframe: "SAMEORIGIN",
  hsts: {maxAge: 31536000, includeSubDomains: true, preload: true},
  xssProtection: true,
  nosniff: true,
}));

// Loging
app.use(morgan("dev"));

// server secret
const SERVER_SECRET = "gertjesamson";

// Static files
app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * App client routes.
 */
app.get("/", appRouter);

/**
 * API routes.
 */
app.use("/api", apiRouter);

export default app;