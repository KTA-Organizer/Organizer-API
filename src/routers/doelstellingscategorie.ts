import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as doelstellingsCategoriesService from "../services/doelstellingsCategories";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";


const router = Router({
    mergeParams: true,
    strict: true
});

router.use(usersOnly);

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
    const doelstellingsCategorie = await doelstellingsCategoriesService.fetchDoelstellingsCategorie(matchedData.id);
    if (!doelstellingsCategorie) {
        throw new HttpError(404, "DoelstellingsCategorie doesn't exist");
    }
    return doelstellingsCategorie;
}));

router.get("/", executor(async function(req, res) {
    const doelstellingsCategories = await doelstellingsCategoriesService.fetchAllDoelstellingsCategories();
    if (doelstellingsCategories.length < 1) {
        throw new HttpError(404, "DoelstellingsCategories not found");
    }
    return doelstellingsCategories;
}));

router.post("/", [
    usersOnly,
    check("moduleId").exists(),
    check("name").exists(),
    check("inGebruik").exists(),
    check("creatorId").exists()
], executor(async function (req, res, { moduleId, name, inGebruik, creatorId }) {
    await doelstellingsCategoriesService.insertDoelstellingsCategorie({ moduleId, name, inGebruik, creatorId});
}));


export default router;