import { Router } from "express";
import { shemasHandler, wrapError } from "../middlewares/index.js";
import {
  getProductSchema,
  postProductShema,
  postReservationSchema,
} from "../shemas/index.js";

import { ProductsCrll } from "../controllers/products.js";
import { passportJwt } from "../utils/auth/index.js";
import { upload } from "../libs/multer.js";

export const router = Router();

router.get("/", passportJwt, wrapError(ProductsCrll.get));

router.post(
  "/",
  passportJwt,
  upload.single("image"),
  shemasHandler(postProductShema, "body"),
  wrapError(ProductsCrll.create)
);

router.get(
  "/:id/reservations",
  passportJwt,
  shemasHandler(getProductSchema, "params"),
  wrapError(ProductsCrll.getTotalBooksNow)
);

router.post(
  "/:id/reservations",
  passportJwt,
  shemasHandler(getProductSchema, "params"),
  shemasHandler(postReservationSchema, "body"),
  wrapError(ProductsCrll.createReservation)
);

router.put(
  "/:id",
  passportJwt,
  shemasHandler(getProductSchema, "params"),
  wrapError(ProductsCrll.put)
);

router.delete(
  "/:id",
  passportJwt,
  shemasHandler(getProductSchema, "params"),
  wrapError(ProductsCrll.delete)
);

router.get(
  "/:id",
  passportJwt,
  shemasHandler(getProductSchema, "params"),
  wrapError(ProductsCrll.getById)
);
