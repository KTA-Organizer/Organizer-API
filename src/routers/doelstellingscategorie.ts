import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "../util/executor";
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
], executor(async function(req, trx, matchedData) {
    const doelstellingsCategorie = await doelstellingsCategoriesService.fetchDoelstellingsCategorie(trx, matchedData.id);
    if (!doelstellingsCategorie) {
        throw new HttpError(404, "DoelstellingsCategorie doesn't exist");
    }
    return doelstellingsCategorie;
}));

router.get("/", executor(async function(req, trx) {
    const doelstellingsCategories = await doelstellingsCategoriesService.fetchAllDoelstellingsCategories(trx);
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
], executor(async function (req, trx, { moduleId, name, inGebruik, creatorId }) {
    return await doelstellingsCategoriesService.insertDoelstellingsCategorie(trx, { moduleId, name, inGebruik, creatorId});
}));

router.put("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt(),
    check("name").exists()
], executor(async function (req, trx, {id, name}) {
    const existingDoelstellingsCategorie = await doelstellingsCategoriesService.fetchDoelstellingsCategorie(trx, id);
    if (!existingDoelstellingsCategorie) {
        throw new HttpError(400, "A doelstellingscategorie with this id doesn't exist");
    }
    await doelstellingsCategoriesService.updateDoelstellingsCategorie(trx, {id, name});
}));

router.delete("/:id", [
    adminsOnly,
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function (req, trx, matchedData) {
    const existingDoelstellingsCategorie = await doelstellingsCategoriesService.fetchDoelstellingsCategorie(trx, matchedData.id);
    if (!existingDoelstellingsCategorie) {
        throw new HttpError(400, "A doelstellingscategorie with this id doesn't exist");
    }
    await doelstellingsCategoriesService.removeDoelstellingsCategorie(trx, matchedData.id);
}));

export default router;