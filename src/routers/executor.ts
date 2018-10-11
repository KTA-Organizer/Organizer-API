import { Request, Response } from "express";
import { isNumber, isError } from "util";
import httpStatus, { HttpError } from "../util/httpStatus";
import { matchedData } from "express-validator/filter";
import logger from "../util/logger";

function errorResponse(error: HttpError, res: Response) {
  const data = {
    status: "error",
    message: error.message
  };
  res.status(error.status).send(data);
}

export default (cb: (req: Request, res: Response, matchedData: any) => Promise<Object>) => (req: Request, res: Response) => {
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
      errorResponse(error, res);
    });
};