import sharp from "sharp";

export const resizeImg = async (filePath, fileName, size = 300) => {
  const pathOptimized = `./uploads/optimize/${fileName}`;
  const resultOptimize = await sharp(filePath).resize(size).toFile(pathOptimized);
  return { pathOptimized, resultOptimize };
};
