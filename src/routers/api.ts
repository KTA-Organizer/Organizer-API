import { Router } from "express";
import usersRouter from "./users";
import authRouter from "./auth";
import opleidingRouter from "./opleiding";
import teacherRouter from "./teacher";
import meldingRouter from "./melding";
import moduleRouter from "./module";
import studentRouter from "./student";
import doelstellingsCategorieRouter from "./doelstellingscategorie";
import doelstellingenRouter from "./doelstelling";

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

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/opleidingen", opleidingRouter);
router.use("/teacher", teacherRouter);
router.use("/meldingen", meldingRouter);
router.use("/modules", moduleRouter);
router.use("/student", studentRouter);
router.use("/doelstellingsCategorie", doelstellingsCategorieRouter);
router.use("/doelstellingen", doelstellingenRouter);


export default router;