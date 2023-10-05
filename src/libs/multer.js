import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname;
    cb(null, `${Date.now()}` + ext);
  },
});

export const upload = multer({
  storage,
});
