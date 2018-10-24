import request from "supertest";
import { createApp } from "../src/app";
import { getKnex } from "../src/config/db";
import { loadConfig } from "../src/config/storage";

let app;
beforeAll(async function () {
  const config = await loadConfig();
  app = createApp(config);
});

describe("GET /random-url", () => {
  it("should return 404", (done) => {
    request(app).get("/reset")
      .expect(404, done);
  });
});
