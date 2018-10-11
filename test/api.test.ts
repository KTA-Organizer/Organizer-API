import request from "supertest";
import app from "../src/app";

describe("GET /api/user", () => {

  it("should return 200 OK", () => {
    return request(app).get("/api/user")
      .expect(200);
  });

});
