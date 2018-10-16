import request from "supertest";
import app from "../src/app";

describe("GET /api/user/:id", () => {

  it("should return 200 OK", () => {
    return request(app).get("/api/user/10")
      .expect(200);
  });

});

describe("GET /api/opleidingen/:id", () => {

    it("should return 200 OK", () => {
        return request(app).get("/api/opleidingen/10")
            .expect(200);
    });

});

describe("GET /api/opleidingen", () => {

    it("should return 200 OK", () => {
        return request(app).get("/api/opleidingen")
            .expect(200);
    });

});

describe("GET /api/meldingen/:id", () => {

    it("should return 200 OK", () => {
        return request(app).get("/api/meldingen/1")
            .expect(200);
    });

});

describe("GET /api/meldingen", () => {

    it("should return 200 OK", () => {
        return request(app).get("/api/meldingen")
            .expect(200);
    });

});

describe("GET /api/teacher/:id", () => {

    it("should return 200 OK", () => {
        return request(app).get("/api/teacher/4")
            .expect(200);
    });

});

describe("POST /api/login", () => {

  it("should return 200 on succesful login", () => {
    return request(app)
      .post("/api/login")
      .send({
        email: "test@test.be",
        password: "test"
      })
      .expect(200);
  });

  it("should return 401 on unexisting email", () => {
    return request(app)
      .post("/api/login")
      .send({
        email: "random@email.com",
        password: "test"
      })
      .expect(401);
  });

  it("should return 401 on wrong password", () => {
    return request(app)
      .post("/api/login")
      .send({
        email: "test@test.be",
        password: "wrong password"
      })
      .expect(401);
  });

});
