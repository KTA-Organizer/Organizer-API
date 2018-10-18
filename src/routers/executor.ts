import { Request, Response } from "express";
import { isNumber, isError } from "util";
import httpStatus, { HttpError } from "../util/httpStatus";
import { matchedData } from "express-validator/filter";
import logger from "../util/logger";
import { validationResult } from "express-validator/check";

export function errorResponse(error: HttpError, res: Response) {
  const data = {
    status: "error",
    message: error.message
  };
  res.status(error.status).send(data);
}

type ExecutorFun = (req: Request, res: Response, matchedData: any) => Promise<Object | void>;
export default (cb: ExecutorFun) => (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(new HttpError(400, "Invalid body please check the documentation for this endpoint."), res);
    return;
  }
  const promise = cb(req, res, matchedData(req));
  if (!promise.then) {
    res.status(httpStatus.SERVER_ERROR)
      .send({
        status: "error",
        message: "Could not found a result"
      });
    return;
  }
  promise
    .then(function (result) {
      res.send(result);
    })
    .catch(function (error) {
      if (error instanceof HttpError) {
        errorResponse(error, res);
      } else {
        errorResponse(new HttpError(500, "Server error"), res);
        logger.error(error.message);
      }
    });
};