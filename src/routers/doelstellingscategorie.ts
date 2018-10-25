import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as doelstellingsCategoriesService from "../services/doelstellingsCategories";
import { HttpError } from "../util/httpStatus";
import { adminsOnly, usersOnly } from "../util/accessMiddleware";
import * as doelstellingenService from "../services/doelstellingen";
import * as evaluatieCriteriaService from "../services/evaluatieCriteria";


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
    adminsOnly,
    check("moduleId").exists(),
    check("name").exists(),
    check("inGebruik").exists(),
    check("creatorId").exists()
], executor(async function (req, res, { moduleId, name, inGebruik, creatorId }) {
    await doelstellingsCategoriesService.insertDoelstellingsCategorie({ moduleId, name, inGebruik, creatorId});
}));

router.put("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("moduleId").exists(),
    check("name").exists(),
    check("inGebruik").exists(),
    check("creatorId").exists()
], executor(async function (req, res, {id, moduleId, name, inGebruik, gewicht, creatorId }) {
    const existingDoelstellingsCategorie = await doelstellingsCategoriesService.fetchDoelstellingsCategorie(id);
    if (!existingDoelstellingsCategorie) {
        throw new HttpError(400, "A doelstellingscategorie with this id doesn't exist");
    }
    await doelstellingsCategoriesService.updateDoelstellingsCategorie({id, moduleId, name, inGebruik, creatorId});
}));

router.delete("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, res, matchedData) {
    const existingDoelstellingsCategorie = await doelstellingsCategoriesService.fetchDoelstellingsCategorie(matchedData.id);
    if (!existingDoelstellingsCategorie) {
        throw new HttpError(400, "A doelstellingscategorie with this id doesn't exist");
    }
    await doelstellingsCategoriesService.removeDoelstellingsCategorie(matchedData.id);
}));

export default router;