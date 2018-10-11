import { Router } from "express";
import userRouter from "./user";

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

export default router;