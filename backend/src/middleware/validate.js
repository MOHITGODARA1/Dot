const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after express-validator chains.
 * Collects field errors and forwards a 400 ApiError.
 */
function validate(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(new ApiError(400, 'Validation failed', errors));
  }

  return next();
}

module.exports = validate;
