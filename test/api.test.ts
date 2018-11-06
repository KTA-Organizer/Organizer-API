import request from "supertest";
import { loadConfig } from "../src/config/storage";
import { createApp } from "../src/app";

jest.setTimeout(30000);

const TEST_LOGIN_ADMIN_DATA = {
  email: "admin@test.test",
  password: "test"
};

const TEST_USER_ID = 107;

const TEST_LOGIN_TEACHER_DATA = {
  email: "teacher@test.test",
  password: "test"
};

const TEST_LOGIN_STAFF_DATA = {
  email: "staff@test.test",
  password: "test"
};

const TEST_LOGIN_STUDENT_DATA = {
  email: "student@test.test",
  password: "test"
};

const TEST_ACCESS_TOKEN = "f432b7151d98e658a4b5d5098cb6023c5a45d6009423b2537e37b934d2b9a7e5";

const TEST_MELDING_DATA = {
  titel: "Test",
  tekst: "Test Text",
};

const TEST_MELDING_ID = 141;

const TEST_USER_INSERT_DATA = {
  "firstname": "jeanke",
  "lastname": "bonny",
  "email": "testemail@gmail.com",
  "gender": "F",
  "roles": ["ADMIN"],
  "nationalRegisterNumber": "13051828367"
};

const TEST_DISCIPLINE_ID = 2;

const TEST_DISCIPLINE_DATA = {
  name: "test opleiding",
};

const TEST_MODULE_ID = 1;

const TEST_MODULE_DATA = {
  disciplineid: TEST_DISCIPLINE_ID,
  name: "test module"
};

async function authWithTest(agent) {
  await agent.post("/api/auth/login").send(TEST_LOGIN_ADMIN_DATA);
}

async function authTeacherWithTest(agent) {
  await agent.post("/api/auth/login").send(TEST_LOGIN_TEACHER_DATA);
}

async function getAgent() {
  const config = await loadConfig();
  const app = createApp(config);
  return request.agent(app);
}

describe("Authentication API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
  });

  describe("POST /api/auth/login", () => {

    it("should return 200 on succesful login", () => {
      return agent
        .post("/api/auth/login")
        .send(TEST_LOGIN_ADMIN_DATA)
        .expect(200);
    });

    it("should return 403 on unexisting email", () => {
      return agent
        .post("/api/auth/login")
        .send({
          ...TEST_LOGIN_ADMIN_DATA,
          email: "random@email.com",
        })
        .expect(403);
    });

    it("should return 403 on wrong password", () => {
      return agent
        .post("/api/auth/login")
        .send({
          ...TEST_LOGIN_ADMIN_DATA,
          password: "wrong password"
        })
        .expect(403);
    });

  });

  describe("POST /api/auth/logout", () => {

    it("should return 200 on succesful logout", () => {
      return agent
        .post("/api/auth/logout")
        .send()
        .expect(200);
    });

  });

  describe("POST /api/auth/forgot", () => {

    it("should return 200 OK", () => {
      return agent
        .post("/api/auth/forgot")
        .send({
          email: TEST_LOGIN_TEACHER_DATA.email
        })
        .expect(200);
    });

  });

  describe("GET /api/auth/token/:token", () => {

    it("should return 200 OK", () => {
      return agent
      .get(`/api/auth/token/${TEST_ACCESS_TOKEN}`)
      .expect(200);
    });

  });

  describe("PUT /api/auth/token/:token", () => {

    it("should return 200 OK", () => {
      return agent
      .put(`/api/auth/token/${TEST_ACCESS_TOKEN}`)
      .send({
        password: "new password"
      })
      .expect(200);
    });

  });

});

describe("Users API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/users", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/users")
        .expect(200);
    });

  });

  describe("GET /api/users/current", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/users/current")
        .expect(200);
    });

  });

  describe("GET /api/users/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/users/" + TEST_USER_ID)
        .expect(200);
    });

  });

  describe("POST /api/users", () => {

    it("should return 200 OK", () => {
      return agent.post("/api/users")
        .send(TEST_USER_INSERT_DATA)
        .expect(200);
    });

  });

  describe("PUT /api/users/:id", () => {

    it("should return 200 OK", () => {
      return agent.put("/api/users/" + TEST_USER_ID)
        .send(TEST_USER_INSERT_DATA)
        .expect(200);
    });

  });

  describe("DELETE /api/users/:id", () => {

    it("should return 200 OK", () => {
      return agent.delete("/api/users/" + TEST_USER_ID)
        .expect(200);
    });

  });

});

describe("Meldingen API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authTeacherWithTest(agent);
  });

  describe("GET /api/meldingen", () => {
    it("should return 200 OK", () => {
      return agent.get("/api/meldingen").expect(200);
    });
  });

  describe("POST /api/meldingen", () => {
    it("should return 200 on succesful melding post", () => {
      return agent
        .post("/api/meldingen")
        .send(TEST_MELDING_DATA)
        .expect(201);
    });
    it("should return 404 on failed melding post", () => {
      return agent
        .post("/api/meldingen")
        .send({})
        .expect(400);
    });
  });

  describe("DELETE /api/meldingen/:id", () => {
    it("should return 200 OK", () => {
      return agent.delete("/api/meldingen/" + TEST_MELDING_ID).expect(200);
    });
  });

});

describe("Disciplines API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/disciplines", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/disciplines/")
        .expect(200);
    });

  });

  describe("POST /api/disciplines", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/disciplines/")
        .send(TEST_DISCIPLINE_DATA)
        .expect(200);
    });

  });

  describe("PUT /api/disciplines/:id", () => {

    it("should return 200 OK", () => {
      return agent.put("/api/disciplines/" + TEST_DISCIPLINE_ID)
        .send(TEST_DISCIPLINE_DATA)
        .expect(200);
    });

  });
});

describe("Modules API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/modules/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/modules/" + TEST_MODULE_ID)
        .expect(200);
    });

  });

  describe("GET /api/modules", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/modules?disciplineid=" + TEST_DISCIPLINE_ID)
        .expect(200);
    });

  });

  describe("POST /api/modules", () => {

    it("should return 200 OK", () => {
      return agent.post("/api/modules")
        .send(TEST_MODULE_DATA)
        .expect(200);
    });

  });

  describe("PUT /api/modules/:id", () => {

    it("should return 200 OK", () => {
      return agent.put("/api/modules/" + TEST_MODULE_ID)
        .send(TEST_MODULE_DATA)
        .expect(200);
    });

  });

  describe("DELETE /api/modules/:id", () => {

    it("should return 200 OK", () => {
      return agent.delete("/api/modules/" + TEST_MODULE_ID)
        .expect(200);
    });

  });
});