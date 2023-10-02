import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop(); // img.png => png
    cb(null, `${Date.now()}`);
  },
});

export const upload = multer({
  storage,
});
