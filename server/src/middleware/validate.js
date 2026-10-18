const ApiError = require('../utils/ApiError');

// validate(schema) checks req.body against a zod schema. On success the cleaned values
// (trimmed, lowercased email, unknown fields removed) replace req.body.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(400, 'VALIDATION_ERROR', details[0].message, details));
    }
    req.body = result.data;
    return next();
  };
}

module.exports = validate;
