import { Request, Response } from "express";
import { isNumber, isError } from "util";
import httpStatus, { HttpError } from "./httpStatus";
import { matchedData } from "express-validator/filter";
import logger from "./logger";
import { validationResult } from "express-validator/check";
import { createTrx } from "../config/db";
import { Transaction } from "knex";

export function errorResponse(error: HttpError, res: Response) {
  const data = {
    status: "error",
    message: error.message
  };
  res.status(error.status).send(data);
}

type ExecutorFun = (req: Request, trx: Transaction, matchedData: any, res: Response) => Promise<Object | void>;
export default (cb: ExecutorFun) => (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(new HttpError(400, "Invalid body please check the documentation for this endpoint."), res);
    return;
  }
  let trx: Transaction;
  createTrx()
    .then((transaction) => {
      trx = transaction;
      return cb(req, trx, matchedData(req), res);
    })
    .then(function (result) {
      res.send(result);
      trx.commit();
    })
    .catch(function (error) {
      if (error instanceof HttpError) {
        errorResponse(error, res);
      } else {
        errorResponse(new HttpError(500, "Server error"), res);
        logger.error(error.message);
      }
      trx.rollback();
    });
};