export const wrapError = (fnCrll) => {
  return (req, res, next) => {
    fnCrll(req, res).catch((err) => next(err));
  };
};

export const errorHandler = (err, req, res, next) => {
  console.log("🚀 ~ file: errorsHandler.js:8 ~ errorHandler ~ err:", err);
  const statusCode = err.statusCode || 500;

  const errorResponse = {
    ok: false,
    message: err.message,
  };

  if (statusCode !== 400) {
    errorResponse.location = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};
