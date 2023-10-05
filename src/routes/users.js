import { Router } from "express";
import { UserCrll } from "../controllers/users.js";
import { wrapError } from "../middlewares/errorsHandler.js";
import { postUserShema, putUserSchema } from "../shemas/index.js";
import { shemasHandler } from "../middlewares/shemasHandler.js";
import { passportJwt } from "../utils/auth/index.js";
export const router = Router();

router.post(
  "/",
  shemasHandler(postUserShema, "body"),
  wrapError(UserCrll.create)
);

router.get("/", wrapError(UserCrll.get));

router.put(
  "/:id",
  shemasHandler(putUserSchema, "body"),
  wrapError(UserCrll.update)
);

router.get(
  "/my_reservations",
  passportJwt,
  wrapError(UserCrll.getReservations)
);
