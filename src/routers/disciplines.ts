import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
import * as disciplinesService from "../services/disciplines";
import * as studentDisciplinesService from "../services/studentDisciplines";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly, teacherOrAdminOnly } from "../util/accessMiddleware";
import { User } from "../models/User";

const router = Router({
  mergeParams: true,
  strict: true
});

router.use(usersOnly);

router.get(
  "/",
  executor(async function (req, trx) {
    const opleidingen = await disciplinesService.fetchAllDisciplines(trx);
    return opleidingen;
  })
);

router.get(
  "/:id",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function (req, trx, { id }) {
    const opleiding = await disciplinesService.fetchDiscipline(trx, id);
    if (!opleiding) {
      throw new HttpError(404, "Discipline does not exist");
    }
    return opleiding;
  })
);

router.get(
  "/student/:id",
  [check("id").isNumeric(), sanitize("id").toInt()],
  executor(async function (req, trx, { id }) {
    const opleiding = await studentDisciplinesService.fetchStudentDiscipline(trx, id);
    return opleiding;
  })
);

router.put("/student/:id", [
  adminsOnly,
  check("id").isNumeric(),
  sanitize("id").toInt(),
  check("disciplineid").isNumeric(),
  sanitize("disciplineid").toInt(),
], executor(async function (req, trx, { id, disciplineid }) {
  const currentDiscipline = await studentDisciplinesService.fetchStudentDiscipline(trx, id);
  if (currentDiscipline) {
    await studentDisciplinesService.updateDisciplineForStudent(trx, { studentid: id, disciplineid });
    // throw new HttpError(400, "User already has a discipline");
  } else {
    const discipline = await disciplinesService.fetchDiscipline(trx, disciplineid);
    if (!discipline) {
      throw new HttpError(404, "A opleiding with this id doesn't exist");
    }
    await studentDisciplinesService.addStudentToDiscipline(trx, { studentid: id, disciplineid });
  }
}));

router.delete("/student/:id", [
  adminsOnly,
  check("id").isNumeric(),
  sanitize("id").toInt(),
], executor(async function (req, trx, { id }) {
  const opleiding = await studentDisciplinesService.fetchStudentDiscipline(trx, id);
  if (!opleiding) {
    throw new HttpError(404, "A opleiding with this id doesn't exist");
  }
  await studentDisciplinesService.removeStudentFromDiscipline(trx, id);
}));

router.post("/", [
  adminsOnly,
  check("active").exists(),
  check("name").exists(),
], executor(async function (req, trx, { name }) {
  const user = req.user as User;
  return await disciplinesService.insertDiscipline(trx, { name, creatorId: user.id });
}));

router.put("/:id", [
  adminsOnly,
  check("id").isNumeric(),
  sanitize("id").toInt(),
  check("name").exists()
], executor(async function (req, trx, { id, name }) {
  const existingDiscipline = await disciplinesService.fetchDiscipline(trx, id);
  if (!existingDiscipline) {
    throw new HttpError(404, "A opleiding with this id doesn't exist");
  }
  await disciplinesService.updateDiscipline(trx, id, { name });
}));

 router.put("/:id/status", [
   adminsOnly,
   check("id").isNumeric(),
   sanitize("id").toInt(),
   check("active").isNumeric(),
   sanitize("active").toInt(),
 ], executor(async function (req, trx, { id, active }) {
   const existingDiscipline = await disciplinesService.fetchDiscipline(trx, id);
   if (!existingDiscipline) {
     throw new HttpError(400, "A discipline with this id doesn't exist");
   }
   await disciplinesService.updateDisciplineStatus(trx, id, { active });
 }));

// router.delete("/:id", [
//   adminsOnly,
//   check("id").isNumeric(),
//   sanitize("id").toInt()
// ], executor(async function (req, trx, matchedData) {
//   const existingDiscipline = await doelstellingsCategoriesService.fetchDoelstellingsCategorie(trx, matchedData.id);
//   if (!existingDiscipline) {
//     throw new HttpError(400, "A opleiding with this id doesn't exist");
//   }
//   await disciplinesService.removeOpleiding(trx, matchedData.id);
// }));


export default router;
