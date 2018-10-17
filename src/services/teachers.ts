import logger from "../util/logger";
import getKnexInstance from "./db";
const knex = getKnexInstance();


export async function fetchTeacher(id: number)  {
    const rows = await knex("teachers")
        .select("*")
        .where({teacherId: id});
    if (rows.length < 1)
        return;
    return rows[0];
}

 // "moet user meegevraagd worden?? teacher heeft zelfde id als de userid dus zou zinloos zijn om hem ook mee te geven in teacher"