let cacheManager = require("cache-manager");
let redisStore = require("cache-manager-ioredis");

let redisCache = cacheManager.caching({
  store: redisStore,
  host: "localhost", // default value
  port: 6379, // default value
  password: "XXXXX",
  db: 0,
  ttl: 600
});

// listen for redis connection error event
let redisClient = redisCache.store.getClient();

redisClient.on("error", error => {
  // handle error here
  console.log(error);
});

let ttl = 5;

redisCache.set("foo", "bar", { ttl: ttl }, err => {
  if (err) {
    throw err;
  }

  redisCache.get("foo", (err, result) => {
    console.log(result);
    // >> 'bar'
    redisCache.del("foo", err => {});
  });
});

function getUser(id, cb) {
  setTimeout(() => {
    console.log("Returning user from slow database.");
    cb(null, { id: id, name: "Bob" });
  }, 100);
}

let userId = 123;
let key = `user_${userId}`;

// Note: ttl is optional in wrap()
redisCache.wrap(
  key,
  cb => {
    getUser(userId, cb);
  },
  { ttl: ttl },
  (err, user) => {
    console.log(user);

    // Second time fetches user from redisCache
    redisCache
      .wrap(key, () => getUser(userId))
      .then(console.log)
      .catch(err => {
        // handle error
      });
  }
);
