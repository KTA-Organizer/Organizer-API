import fs from "fs";
import csv from "csv-stream";
import * as usersService from "./users";
import { Transaction } from "knex";
import { UserRole } from "../models/User";
import { createTrx } from "../config/db";

interface CsvRow {
  lastname: string; firstname: string; nationalRegisterNumber?: string; email?: string;
}

async function executeTask(row: CsvRow) {
  const trx = await createTrx();
  const userExists = await usersService.checkIfPersonExists(trx, row);
  console.log("exists", userExists);
  if (!userExists) {
    await usersService.insertUser(trx, { roles: [UserRole.student], ...row });
    console.log("added user", row.email, row.firstname, row.lastname);
  }
  trx.commit();
}

function delay(ms: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(undefined), ms);
  });
}

export function csvInput(trx: Transaction, csvPath: string) {
  const taskQueue: CsvRow[]  = [];
  const options = {
    delimiter : ";", // default is ,
    endLine : "\n", // default is \n,
    columns : ["lastname", "firstname", "nationalRegisterNumber", "email"], // by default read the first line and use values found as columns
    columnOffset : 0, // default is 0
    escapeChar : "", // default is an empty string
    enclosedChar : "" // default is an empty string
  };

  let rowCount = 0;
  let done = false;
  const csvStream = csv.createStream(options);
  fs.createReadStream(csvPath)
    .pipe(csvStream)
    .on("error", function(err: any) {
      console.error(err);
    })
    .on("end", function() {
      done = true;
    })
    .on("data", function(data: CsvRow) {
      rowCount++;
      const hasRequiredFields = data.firstname.length > 1 && data.lastname.length > 1;
      if (rowCount === 1 || !hasRequiredFields) {
        return;
      }
      taskQueue.push(data);
    });

  // Process row with 200 ms timeout
  setTimeout(async function() {
    while (!done || taskQueue.length > 0) {
      const first = taskQueue.shift();
      if (first) {
        await executeTask(first);
      }
      delay(200);
    }
  }, 500);

}
