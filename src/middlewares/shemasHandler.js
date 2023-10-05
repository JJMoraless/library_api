export const shemasHandler = (schema, property) => {
  return async (req, res, next) => {
    try {
      const data = req[property];
      const body = await schema.validateAsync(data, { abortEarly: false });
      next();
    } catch (error) {
      console.log("🚀 ~ file: validateShemas.js:11 ~ return ~ error:", error);
      return res.status(400).json({
        errors: error.details.map(({ message, path: [path] }) => ({
          message,
          path,
        })),
      });
    }
  };
};
