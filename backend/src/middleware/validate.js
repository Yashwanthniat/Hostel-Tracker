export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errors = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json({
          error: "Validation failed",
          details: errors,
        });
      }
      return res.status(400).json({ error: "Invalid request payload" });
    }
  };
};
