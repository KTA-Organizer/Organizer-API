import request from "supertest";
import { loadConfig } from "../src/config/storage";
import { createApp } from "../src/app";

jest.setTimeout(30000);

const TEST_LOGIN_ADMIN_DATA = {
  email: "admin@test.test",
  password: "test"
};

const TEST_USER_ID = 107;
const TEST_ADMIN_USER_ID = 105;
const TEST_EVALUATION_ID = 35;

const TEST_LOGIN_TEACHER_DATA = {
  email: "teacher@test.test",
  password: "test"
};

const TEST_REPORTS_ID = 5715999101812736;

const TEST_DOMAINS_INSERT_DATA = {
  name: "Test domain",
  moduleid: 52
};

const TEST_EVALUATION_INSERT_DATA = {
  studentid: 107,
  moduleid: 52,
  startdate: "2018-11-06",
  periodname: "Kerst"
};

const TEST_REPORTS_INSERT_DATA = {
  evaluationsheetid: 35
};

const TEST_LOGIN_STAFF_DATA = {
  email: "staff@test.test",
  password: "test"
};

const TEST_LOGIN_STUDENT_DATA = {
  email: "student@test.test",
  password: "test"
};

const TEST_ACCESS_TOKEN =
  "00174be80dc622bc6cdd084f5c35a186ad15a6806dfaca04beda695f07fcf8eb";

const TEST_MELDING_DATA = {
  titel: "Test",
  tekst: "Test Text"
};

const TEST_MELDING_ID = 208;

const TEST_USER_INSERT_DATA = {
  firstname: "John",
  lastname: "Doe",
  email: "testemail@gmail.com",
  gender: "F",
  roles: ["ADMIN"],
  nationalRegisterNumber: "13051828367"
};

const TEST_DISCIPLINE_ID = 24;

const TEST_DISCIPLINE_DATA = {
  name: "test opleiding"
};

const TEST_OPLEIDING_INSERT_DATA = {
  name: "Opleiding Test",
  active: 1,
  creatorId: 105
};

const TEST_GOALS_INSERT_DATA = {
  name: "Goal Test",
  domainid: 19,
  creatorId: 105
};

const TEST_CRITERIA_INSERT_DATA = {
  name: "Criteria Test",
  goalid: 29,
  weight: 1
};

const TEST_MODULE_INSERT_DATA = {
  name: "Module Test",
  disciplineid: TEST_DISCIPLINE_ID
};

const TEST_NAME_UPDATE_DATA = {
  name: "Test Update"
};

const TEST_USER_UPDATE_DATA = {
  firstname: "jeanke",
  lastname: "bonny",
  email: "testemail@gmail.com",
  gender: "F",
  roles: ["ADMIN", "TEACHER"]
};

const TEST_MODULE_ID = 52;
const TEST_GOAL_ID = 29;
const TEST_DOMAIN_ID = 19;
const TEST_CRITERIA_ID = 17;

const TEST_MODULE_DATA = {
  disciplineid: TEST_DISCIPLINE_ID,
  name: "test module"
};

async function authWithTest(agent: any) {
  await agent.post("/api/auth/login").send(TEST_LOGIN_ADMIN_DATA);
}

async function authTeacherWithTest(agent: any) {
  await agent.post("/api/auth/login").send(TEST_LOGIN_TEACHER_DATA);
}

async function getAgent() {
  const config = await loadConfig();
  const app = createApp(config);
  return request.agent(app);
}

describe("Authentication API", () => {
  let agent: any;
  beforeAll(async function() {
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
          email: "random@email.com"
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
      return agent.get(`/api/auth/token/${TEST_ACCESS_TOKEN}`).expect(200);
    });
  });

  // describe("PUT /api/auth/token/:token", () => {

  //  it("should return 200 OK", () => {
  //    return agent
  //      .put(`/api/auth/token/${TEST_ACCESS_TOKEN}`)
  //      .send({
  //        password: "new password"
  //      })
  //     .expect(200);
  //  });

  // });
});

describe("Users API", () => {
  let agent: any;
  beforeAll(async function() {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/users", () => {
    it("should return 200 OK", () => {
      return agent.get("/api/users").expect(200);
    });
  });

  describe("GET /api/users/current", () => {
    it("should return 200 OK", () => {
      return agent.get("/api/users/current").expect(200);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return 200 OK", () => {
      return agent.get("/api/users/" + TEST_USER_ID).expect(200);
    });
  });

  describe("POST /api/users", () => {
    it("should return 200 OK", () => {
      return agent
        .post("/api/users")
        .send(TEST_USER_INSERT_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/users/" + TEST_USER_ID)
        .send(TEST_USER_INSERT_DATA)
        .expect(200);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should return 200 OK", () => {
      return agent.delete("/api/users/" + TEST_USER_ID).expect(200);
    });
  });
});

describe("Disciplines API", () => {
  let agent: any;
  beforeAll(async function() {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/disciplines/:id", () => {
    it("should return 200 OK", () => {
      return agent.get("/api/disciplines/" + TEST_DISCIPLINE_ID).expect(200);
    });
  });

  describe("GET /api/disciplines", () => {
    it("should return 200 OK", () => {
      return agent.get("/api/disciplines").expect(200);
    });
  });

  describe("POST /api/disciplines", () => {
    it("should return 200 OK", () => {
      return agent
        .post("/api/disciplines")
        .send(TEST_OPLEIDING_INSERT_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/disciplines/:id", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/disciplines/" + TEST_DISCIPLINE_ID)
        .send(TEST_NAME_UPDATE_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/disciplines/:id/status", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/disciplines/" + TEST_DISCIPLINE_ID + "/status")
        .send({ active: 0 })
        .expect(200);
    });
  });

  describe("Disciplines API", () => {
    let agent: any;
    beforeAll(async function() {
      agent = await getAgent();
      await authWithTest(agent);
    });
  });

  describe("GET /api/disciplines", () => {
    it("should return 200 OK", () => {
      return agent.get("/api/disciplines/").expect(200);
    });
  });

  describe("POST /api/disciplines", () => {
    it("should return 200 OK", () => {
      return agent
        .get("/api/disciplines/")
        .send(TEST_DISCIPLINE_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/disciplines/:id", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/disciplines/" + TEST_DISCIPLINE_ID)
        .send(TEST_DISCIPLINE_DATA)
        .expect(200);
    });
  });

  describe("GET /api/disciplines/student/:id", () => {
    it("should return 200 OK", () => {
      return agent.get("/api/disciplines/student/" + TEST_USER_ID).expect(200);
    });
  });

  describe("PUT /api/disciplines/student/:id", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/disciplines/student/" + TEST_ADMIN_USER_ID)
        .send({ disciplineid: TEST_DISCIPLINE_ID })
        .expect(200);
    });
  });

  describe("DELETE /api/disciplines/student/:id", () => {
    it("should return 200 OK", () => {
      return agent
        .delete("/api/disciplines/student/" + TEST_USER_ID)
        .expect(200);
    });
  });
});

describe("Modules API", () => {
  let agent: any;
  beforeAll(async function() {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/modules/:id", () => {
    it("should return 200 OK", () => {
      return agent.get("/api/modules/" + TEST_MODULE_ID).expect(200);
    });
  });

  describe("PUT /api/modules/:id/status", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/modules/" + TEST_MODULE_ID + "/status")
        .send({ active: 0 })
        .expect(200);
    });
  });

  describe("GET /api/modules", () => {
    it("should return 200 OK", () => {
      return agent
        .get("/api/modules?disciplineid=" + TEST_DISCIPLINE_ID)
        .expect(200);
    });
  });

  describe("POST /api/modules", () => {
    it("should return 200 OK", () => {
      return agent
        .post("/api/modules")
        .send(TEST_MODULE_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/modules/:id", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/modules/" + TEST_MODULE_ID)
        .send(TEST_MODULE_DATA)
        .expect(200);
    });
  });

  describe("POST /api/modules", () => {
    it("should return 200 OK", () => {
      return agent
        .post("/api/modules")
        .send(TEST_MODULE_INSERT_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/modules/:id", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/modules/" + TEST_MODULE_ID)
        .send(TEST_NAME_UPDATE_DATA)
        .expect(200);
    });
  });
});

describe("Goals API", () => {
  let agent: any;
  beforeAll(async function() {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("POST /api/goals", () => {
    it("should return 200 OK", () => {
      return agent
        .post("/api/goals")
        .send(TEST_GOALS_INSERT_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/goals/:id", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/goals/" + TEST_GOAL_ID)
        .send(TEST_NAME_UPDATE_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/goals/:id/status", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/goals/" + TEST_GOAL_ID + "/status")
        .send({ active: 0 })
        .expect(200);
    });
  });
});

describe("Domains API", () => {
  let agent: any;
  beforeAll(async function() {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("POST /api/domains", () => {
    it("should return 200 OK", () => {
      return agent
        .post("/api/domains")
        .send(TEST_DOMAINS_INSERT_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/domains/:id", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/domains/" + TEST_DOMAIN_ID)
        .send(TEST_NAME_UPDATE_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/domains/:id/status", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/domains/" + TEST_DOMAIN_ID + "/status")
        .send({ active: 0 })
        .expect(200);
    });
  });
});

describe("Criteria API", () => {
  let agent: any;
  beforeAll(async function() {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("POST /api/criteria", () => {
    it("should return 200 OK", () => {
      return agent
        .post("/api/criteria")
        .send(TEST_CRITERIA_INSERT_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/criteria/:id", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/criteria/" + TEST_CRITERIA_ID)
        .send(TEST_NAME_UPDATE_DATA)
        .expect(200);
    });
  });

  describe("PUT /api/criteria/:id/status", () => {
    it("should return 200 OK", () => {
      return agent
        .put("/api/criteria/" + TEST_CRITERIA_ID + "/status")
        .send({ active: 0 })
        .expect(200);
    });
  });
});

describe("Meldingen API", () => {
  let agent: any;
  beforeAll(async function() {
    agent = await getAgent();
    await authWithTest(agent);
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

describe("Evaluation API", () => {
  let agent: any;
  beforeAll(async function() {
    agent = await getAgent();
    await authTeacherWithTest(agent);
  });

  describe("GET /api/evaluations/", () => {
    it("should return 200 OK", () => {
      return agent
        .get("/api/evaluations")
        .query({ studentid: 107, moduleid: 56 })
        .expect(200);
    });
  });

  describe("GET /api/evaluations/:id", () => {
    it("should return 200 OK", () => {
      return agent.get("/api/evaluations/" + TEST_EVALUATION_ID).expect(200);
    });
  });

  describe("POST /api/evaluations", () => {
    it("should return 200 OK", () => {
      return agent
        .post("/api/evaluations")
        .send(TEST_EVALUATION_INSERT_DATA)
        .expect(200);
    });
  });

  describe("DELETE /api/evaluations/:id", () => {
    it("should return 200 OK", () => {
      return agent.delete("/api/evaluations/" + TEST_EVALUATION_ID).expect(200);
    });
  });
});

describe("Reports API", () => {
  let agent: any;
  beforeAll(async function() {
    agent = await getAgent();
    await authTeacherWithTest(agent);
  });

  describe("GET /api/reports/", () => {
    it("should return 200 OK", () => {
      return agent
        .get("/api/reports")
        .query({ page: 1, perpage: 5 })
        .expect(200);
    });
  });

  describe("POST /api/reports/", () => {
    it("should return 200 OK", () => {
      return agent
        .post("/api/reports")
        .send(TEST_REPORTS_INSERT_DATA)
        .expect(200);
    });

    describe("GET /api/reports/:id", () => {
      it("should return 200 OK", () => {
        return agent.get("/api/reports/" + TEST_REPORTS_ID).expect(200);
      });
    });
  });
});
