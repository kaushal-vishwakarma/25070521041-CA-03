import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// Place after a validator chain. If any rule failed, respond 400 with details.
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result
    .array({ onlyFirstError: true })
    .map((e) => ({ field: e.path, message: e.msg }));

  // message = first problem, so the UI toast is immediately useful
  throw new ApiError(400, errors[0].message, errors);
};

export default validate;
