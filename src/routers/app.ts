import { Router } from "express";

const router = Router({
  mergeParams: true,
  strict: true
});

router.get("/", (req, res, next) => {
  res.render("home", {
    title: "Home"
  });
});

export default router;