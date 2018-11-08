import { Router } from "express";
import usersRouter from "./users";
import authRouter from "./auth";
import disciplinesRouter from "./disciplines";
import meldingRouter from "./melding";
import moduleRouter from "./module";
import domainsRouter from "./domains";
import goalsRouter from "./goals";
import { errorResponse } from "../util/executor";
import { HttpError } from "../util/httpStatus";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/disciplines", disciplinesRouter);
router.use("/meldingen", meldingRouter);
router.use("/modules", moduleRouter);
router.use("/goals", goalsRouter);
router.use("/domains", domainsRouter);

router.use("/*", (req, res, next) => {
  errorResponse(new HttpError(404, "This route doesn't exist"), res);
});


export default router;