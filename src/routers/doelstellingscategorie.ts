import { Router } from "express";
import { check } from "express-validator/check";
import { sanitize } from "express-validator/filter";
import executor from "./executor";
import * as doelstellingsCategoriesService from "../services/doelstellingsCategories";
import { HttpError } from "../util/httpStatus";

const router = Router({
    mergeParams: true,
    strict: true
});

router.get("/:id", [
    check("id").isNumeric(),
    sanitize("id").toInt()
], executor(async function(req, res, matchedData) {
    const melding = await doelstellingsCategoriesService.fetchDoelstellingsCategorie(matchedData.id);
    if (!melding) {
        throw new HttpError(404, "DoelstellingsCategorie doesn't exist");
    }
    return melding;
}));

router.get("/", executor(async function(req, res) {
    const meldingen = await doelstellingsCategoriesService.fetchAllDoelstellingsCategories();
    if (meldingen.length < 1) {
        throw new HttpError(404, "DoelstellingsCategories not found");
    }
    return meldingen;
}));


export default router;