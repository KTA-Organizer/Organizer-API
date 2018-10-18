import request from "supertest";
import app from "../src/app";

const TEST_LOGIN_DATA = {
  email: "test@test.be",
  password: "test"
};

const TEST_MELDING_DATA = {
  tekst: "Test Text",
  titel: "Test",
  teacherId: 4
};

const authWithTest = (agent) => () => {
  return agent.post("/api/auth/login").send(TEST_LOGIN_DATA);
};

describe("Authentication API", () => {
  const agent = request.agent(app);

  describe("POST /api/auth/login", () => {

    it("should return 200 on succesful login", () => {
      return agent
      .post("/api/auth/login")
      .send(TEST_LOGIN_DATA)
      .expect(200);
    });

    it("should return 401 on unexisting email", () => {
      return agent
      .post("/api/auth/login")
      .send({
        ...TEST_LOGIN_DATA,
        email: "random@email.com",
      })
      .expect(401);
    });

    it("should return 401 on wrong password", () => {
      return agent
      .post("/api/auth/login")
      .send({
        ...TEST_LOGIN_DATA,
        password: "wrong password"
      })
      .expect(401);
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
});

describe("Users API", () => {
  const agent = request.agent(app);

  beforeAll(authWithTest(agent));

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
  const agent = request.agent(app);

  beforeAll(authWithTest(agent));

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
  const agent = request.agent(app);

  beforeAll(authWithTest(agent));

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

  describe("POST /api/meldingen", () => {

    it("should return 200 on succesful melding post", () => {
            return agent
                .post("/api/meldingen")
                .send(TEST_MELDING_DATA)
                .expect(201);
        });
    });
});

describe("Evaluaties API", () => {
    const agent = request.agent(app);

    beforeAll(authWithTest(agent));

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

describe("Doelstellings Categorie API", () => {
  const agent = request.agent(app);

  beforeAll(authWithTest(agent));

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
  const agent = request.agent(app);

  beforeAll(authWithTest(agent));

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
  const agent = request.agent(app);

  beforeAll(authWithTest(agent));

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

describe("Teacher API", () => {
  const agent = request.agent(app);

  beforeAll(authWithTest(agent));

  describe("GET /api/teacher/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/teacher/4")
      .expect(200);
    });

  });
});

describe("Student API", () => {
  const agent = request.agent(app);

  beforeAll(authWithTest(agent));

  describe("GET /api/students/:id", () => {

    it("should return 200 OK", () => {
      return agent.get("/api/students/6")
      .expect(200);
    });

  });

  describe("GET /api/students", () => {

      it("should return 200 OK", () => {
          return agent.get("/api/students")
              .expect(200);
      });

  });
});

