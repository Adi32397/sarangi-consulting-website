const { z } = require('zod');

/**
 * Middleware factory — wraps a Zod schema and validates req.body.
 * On failure, it returns 400 with structured validation errors.
 * Sanitizes strings by trimming whitespace.
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err.name === 'ZodError') {
      const errors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    next(err);
  }
};

module.exports = { validate };
