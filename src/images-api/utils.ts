import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Logging } from "../lib/utils";
import { z } from "zod";
import { ImageQuery } from "../lib/types";

export const queryValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const queryValidator = z.object({
    name: z.string().optional(),
    limit: z.coerce
      .number()
      .gt(0, "limit tidak boleh kurang dari 0")
      .optional(),
    order_by: z
      .enum(["date", "size", "title", "-date", "-size", "-title"], {
        message: "order by harus bernilai (-)date|title|size",
      })
      .optional(),
    page: z.coerce.number().gt(0, "page harus lebih besar dari 0").optional(),
  });

  const { query } = req;
  const resultQueryValidation = queryValidator.safeParse(query);
  if (!resultQueryValidation.success) {
    res.status(500).json({
      msg: "query tidak valid",
      err: JSON.stringify(resultQueryValidation.error.flatten().fieldErrors),
    });
    return;
  }
  req.cleanQuery = resultQueryValidation.data as ImageQuery;
  next();
};

export const getValidFilename = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const filename = req.params.filename as string;
  Logging.dbg("filename: ", filename);
  if (!filename) {
    res.status(500).json({ msg: "filename tidak boleh kosong" });
    return;
  }
  req.params.filename = req.token._id + "-" + filename;
  next();
};

const storage = multer.diskStorage({
  destination: path.join(__dirname, "store/images/"),
  filename(req, file, cb) {
    cb(null, `${req.token._id}-${file.originalname}`);
  },
});

function checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
  const filetypes = /jpeg|jpg|png|gif/; // Allowed file extensions
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images Only!"));
  }
}

export const uploadImage = multer({
  storage,
  limits: { fileSize: 3 * 100_0000 }, // Limit file size to 3MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb); // Filter file types (only images)
  },
}).single("image"); // Accept a single file with the key 'image'
