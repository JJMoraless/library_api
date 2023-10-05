import { verifyToken } from "../utils/jwt.js";
import { ClientError } from "../utils/errors.js";
import { response } from "express";

export const authHandler = (req, res = response, next) => {
  const { token } = req.cookies;
  if (!token) {
    throw new ClientError("token not found");
  }

  const checkToken = verifyToken(token);
  if (!checkToken) {
    throw new ClientError("token incorrect");
  }

  req.user = checkToken;
  next();
};
