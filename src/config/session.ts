import session from "express-session";
import connectRedis from "connect-redis";
import { SESSION_SECRET } from "../util/constants";

export default () => {
  const RedisStore = connectRedis(session);
  const redisOptions = {
  };
  return session({
    store: new RedisStore(redisOptions),
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
  });
};