import request from "supertest";
import { loadConfig } from "../src/config/storage";
import { createApp } from "../src/app";

jest.setTimeout(30000);

const TEST_LOGIN_DATA = {
  email: "kenny.depecker@student.howest.be",
  password: "test"
};

const TEST_ASPECT_DATA = {
  "evaluatiecriteriumId": 36,
  "name": "test",
  "inGebruik": 1,
  "gewicht": 1,
  "creatorId": 3
};

const TEST_MELDING_DATA = {
  tekst: "Test Text",
  titel: "Test",
  teacherId: 4
};

const TEST_STUDENT_DATA = {
  "firstname": "jeanke",
  "lastname": "bonny",
  "email": "jeankebonnytje@gmail.com",
  "opleidingId": 1,
  "moduleIds": [1, 2]
};

const TEST_STUDENT_DATA_UPDATE = {
  "firstname": "jeanke",
  "lastname": "bonny",
  "email": "jeankebonnyy@gmail.com",
  "opleidingId": 1,
  "moduleIds": [1, 2]
};

const TEST_MELDING_DATA_FAILED = {
  tekst: "Test Text",
  titel: "Test"
};

async function authWithTest(agent) {
  await agent.post("/api/auth/login").send(TEST_LOGIN_DATA);
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
        .send(TEST_LOGIN_DATA)
        .expect(200);
    });

    it("should return 403 on unexisting email", () => {
      return agent
        .post("/api/auth/login")
        .send({
          ...TEST_LOGIN_DATA,
          email: "random@email.com",
        })
        .expect(403);
    });

    it("should return 403 on wrong password", () => {
      return agent
        .post("/api/auth/login")
        .send({
          ...TEST_LOGIN_DATA,
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

  // describe("POST /api/auth/forgot", () => {

  //   it("should return 200 OK", () => {
  //     return agent
  //     .post("/api/auth/forgot")
  //     .send({
  //       email: TEST_LOGIN_DATA.email
  //     })
  //     .expect(200);
  //   });

  // });
});

describe("Users API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/users/current", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/users/current")
        .expect(200);
    });

  });

  describe("GET /api/users/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/users/10")
        .expect(200);
    });

  });

});

describe("Opleidingen API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/opleidingen/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/opleidingen/10")
        .expect(200);
    });

  });

  describe("GET /api/opleidingen", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/opleidingen")
        .expect(200);
    });

  });

  describe("GET /api/opleidingen/:id/full", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/opleidingen/1/full")
        .expect(200);
    });

  });
});

describe("Meldingen API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/meldingen/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/meldingen/1")
        .expect(200);
    });

  });

  describe("GET /api/meldingen", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/meldingen")
        .expect(200);
    });

  });

  // describe("POST /api/meldingen", () => {

  //   it("should return 200 on succesful melding post", () => {
  //           return agent
  //               .post("/api/meldingen")
  //               .send(TEST_MELDING_DATA)
  //               .expect(201);
  //       });
  //   });

  //   describe("POST /api/meldingen", () => {

  //       it("should return 404 on failed melding post", () => {
  //           return agent
  //               .post("/api/meldingen")
  //               .send(TEST_MELDING_DATA_FAILED)
  //               .expect(404);
  //       });
  //   });
});

describe("Aspecten API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/aspecten", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/aspecten")
        .expect(200);
    });

  });

  describe("POST /api/aspecten", () => {

    it("should return 200 on succesful aspect post", () => {
      return agent
        .post("/api/aspecten")
        .send(TEST_ASPECT_DATA)
        .expect(200);
    });
  });
});

describe("Evaluaties API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/evaluaties/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/evaluaties/1")
        .expect(200);
    });

  });

  describe("GET /api/evaluaties", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/evaluaties")
        .expect(200);
    });

  });
});

describe("EvaluatieCriteria API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/evaluatieCriteria/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/evaluatieCriteria/1")
        .expect(200);
    });

  });

  describe("GET /api/evaluatieCriteria", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/evaluatieCriteria")
        .expect(200);
    });

  });
});

describe("Doelstellings Categorie API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/doelstellingscategorie/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/doelstellingscategorie/1")
        .expect(200);
    });

  });

  describe("GET /api/doelstellingscategorie", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/doelstellingscategorie")
        .expect(200);
    });

  });
});

describe("Doelstelling API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/doelstellingen/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/doelstellingen/1")
        .expect(200);
    });

  });

  describe("GET /api/doelstellingen", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/doelstellingen")
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
      return agent.get("/api/modules/1")
        .expect(200);
    });

  });

  describe("GET /api/modules", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/modules")
        .expect(200);
    });

  });
});

describe("Student API", () => {
  let agent: any;
  beforeAll(async function () {
    agent = await getAgent();
    await authWithTest(agent);
  });

  describe("GET /api/students", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/students")
        .expect(200);
    });

  });

  // describe("POST /api/students", () => {

  //   it("should return 200 on succesful student post", () => {
  //     return agent
  //       .post("/api/students")
  //       .send(TEST_STUDENT_DATA)
  //       .expect(200);
  //   });
  // });
});

