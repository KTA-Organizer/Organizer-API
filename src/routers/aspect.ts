import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import * as aspectenService from "../services/aspecten";

const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/", executor(async function(req, res) {
    const aspecten = await aspectenService.fetchAllAspecten();
    if (aspecten.length < 1) {
        throw new HttpError(404, "Aspecten not found");
    }
    return aspecten;
}));

router.post("/", [
    usersOnly,
    check("evaluatiecriteriumId").exists(),
    check("name").exists(),
    check("inGebruik").exists(),
    check("gewicht").exists(),
    check("creatorId").exists(),
], executor(async function (req, res, { evaluatiecriteriumId, name, inGebruik, gewicht, creatorId }) {
    await aspectenService.insertAspect({ evaluatiecriteriumId, name, inGebruik, gewicht, creatorId});
}));

export default router;