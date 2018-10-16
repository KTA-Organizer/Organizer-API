import { Router } from "express";
import userRouter from "./user";
import loginRouter from "./login";
import opleidingRouter from "./opleiding";
import teacherRouter from "./teacher";
import meldingRouter from "./melding";

const router = Router({
  mergeParams: true,
  strict: true
});

// router.use(function(req, res, next) {
//   if (req.user) {
//     next();
//   } else {
//     res.status(401);
//     res.send();
//   }
// });

router.use("/user", userRouter);
router.use("/login", loginRouter);
router.use("/opleidingen", opleidingRouter);
router.use("/teacher", teacherRouter);
router.use("/meldingen", meldingRouter);


export default router;