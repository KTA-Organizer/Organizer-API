import request from "supertest";
import { createApp } from "../src/app";
import { loadConfig } from "../src/config/storage";

let app: any;
beforeAll(async function () {
  const config = await loadConfig();
  app = createApp(config);
});

describe("GET /", () => {
  it("should return 200 OK", (done) => {
    request(app).get("/")
      .expect(200, done);
  });
});
