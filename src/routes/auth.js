import { Router } from "express";
import { AuthCrll } from "../controllers/auth.js";
import { wrapError } from "../middlewares/errorsHandler.js";
import { passportLocal } from "../utils/auth/index.js";
import { shemasHandler } from "../middlewares/shemasHandler.js";
import { postLoginShema } from "../shemas/userShema.js";

export const router = Router();
router.post(
  "/login",
  shemasHandler(postLoginShema, "body"),
  passportLocal,
  wrapError(AuthCrll.login)
);
