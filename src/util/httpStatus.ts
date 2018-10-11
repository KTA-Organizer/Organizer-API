
interface Status {
  [key: string]: number;
}

const status: Status = {
  OKAY: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_ALLOW: 405,
  NOT_ACCEPTABLE: 406,
  SERVER_ERROR: 500
};

export class HttpError extends Error {
  status: number;
  constructor(status: number, message?: string) {
    super(message);
    this.status = status;
  }
}

export default status;