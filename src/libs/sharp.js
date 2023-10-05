import sharp from "sharp";
import { uploadImage } from "./cloudinary.js";
import fs from "fs-extra";

export const resizeImg = async (pathImg) => {
  fs.unlink(pathImg);
  return await uploadImage(pathOptimized);
};
