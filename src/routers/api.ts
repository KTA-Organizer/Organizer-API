import { Router } from "express";
import usersRouter from "./users";
import authRouter from "./auth";
import opleidingRouter from "./opleiding";
import meldingRouter from "./melding";
import moduleRouter from "./module";
import studentRouter from "./student";
import doelstellingsCategorieRouter from "./doelstellingscategorie";
import doelstellingenRouter from "./doelstelling";
import evaluatiesRouter from "./evaluaties";
import studentmodulesRouter from "./studentmodule";
import aspectenRouter from "./aspect";
import evaluatieCriteriaRouter from "./evaluatiecriteria";
import { errorResponse } from "../util/executor";
import { HttpError } from "../util/httpStatus";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/opleidingen", opleidingRouter);
router.use("/meldingen", meldingRouter);
router.use("/modules", moduleRouter);
router.use("/students", studentRouter);
router.use("/doelstellingsCategorie", doelstellingsCategorieRouter);
router.use("/doelstellingen", doelstellingenRouter);
router.use("/evaluaties", evaluatiesRouter);
router.use("/studentModules", studentmodulesRouter);
router.use("/aspecten", aspectenRouter);
router.use("/evaluatieCriteria", evaluatieCriteriaRouter);

router.use("/*", (req, res, next) => {
  errorResponse(new HttpError(404, "This route doesn't exist"), res);
});


export default router;