import request from "supertest";
import { createApp } from "../src/app";
import { loadConfig } from "../src/config/storage";

let app;
beforeAll(async function () {
  const config = await loadConfig();
  app = createApp(config);
});

describe("GET /random-url", () => {
  it("should return 200 OK", (done) => {
    request(app).get("/random-url")
      .expect(200, done);
  });
});
