import { Request, Response, Router } from "express";
import { getValidFilename, uploadImage } from "./utils";
import { Logging } from "../lib/utils";
import { auth } from "../user/route";
import Image from "../db/Image";
import fs from "fs";
import path from "path";
import { queryValidation } from "./utils";
export const imagesRoute = Router();

imagesRoute.get(
  "/q",
  auth,
  queryValidation,
  async (req: Request, res: Response) => {
    const { name, order_by, limit, page } = req.cleanQuery as ImageQuery;

    try {
      // query builder
      // Logging.dbg(cleanQuery);

      const searchKey =
        (!!name && {
          $text: { $search: name as string },
        }) ||
        {}; // default

      const desc = order_by?.includes("-");

      let orderBy = order_by as string;

      // remove '-' from query
      if (desc) orderBy = [...orderBy]?.slice(1).join("");

      const desOrAs = (!!orderBy && (desc ? -1 : 1)) || 1; // defualt

      const orderQuery = !!orderBy ? { [orderBy]: desOrAs } : {};

      // hard to implement cursor based pagination when deal with random / not in order page number
      // const prevId = get from cookies
      // const cursorPagination = !!prevId
      //   ? {
      //       _id: {
      //         $gt: mongoose.Types.ObjectId.createFromHexString(prevId),
      //       },
      //     }
      //   : {};

      const userImageFilter = {
        // shown current user only images
        upload_by: req.token.username,
      };

      const data = await Image.find({ ...userImageFilter, ...searchKey })
        .sort(orderQuery as any)
        .skip((page - 1) * (limit || 1)) // implementation (not effisien for larger collection)
        .limit((limit as number) || Infinity)
        .exec();

      Logging.info("query operation success");
      res.status(200).json({
        msg: "query berhasil",
        data,
      });
    } catch (e) {
      Logging.error(`query by ${req.token.username} operation failed`);
      Logging.exception(e);
      res.status(500).json({ msg: "query operation failed" });
    }
  }
);

imagesRoute.delete(
  "/:filename",
  auth,
  getValidFilename,
  async (req: Request, res: Response) => {
    const filename = req.params.filename;
    try {
      const filePath = path.join(__dirname, "store/images/" + filename);
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ msg: `${filename} tidak ditemukan !` });
        return;
      }
      fs.unlinkSync(filePath);
      (await Image.destroy(filename)) as any;
      Logging.info(`${filename} telah berhasil dihapus dari kenyataan`);
      res.status(200).json({ msg: `${filename} telah berhasil di hapus` });
    } catch (e) {
      Logging.exception(e);
      res.status(500).json({ msg: "something happen" });
    }
  }
);

imagesRoute.post("/", auth, (req: Request, res: Response) => {
  uploadImage(req, res, async (err) => {
    if (err) {
      Logging.error(`file gagal di upload`);
      res
        .status(500)
        .json({ msg: "something wrong with upload image", err: err.message })
        .end();
      return;
    }
    Logging.dbg(JSON.stringify(req.file));
    if (!req.file) {
      Logging.error("file tidak di seleksi");
      res.status(500).json({ msg: "file not selected" }).end();
      return;
    }

    const { filename, path, mimetype, size, originalname } = req.file;

    Logging.info(`file ${filename} telah berhasil di upload`);

    try {
      await Image.store({
        name: originalname,
        filename,
        path,
        mimetype,
        size,
        upload_by: req.token.username,
      });
      Logging.info(`${filename} telah berhasil di simpan di database`);
    } catch (e) {
      Logging.error("failed to store ", filename, " on database");
      Logging.exception(e);
    }

    res.status(200).json({ msg: `file ${filename} telah berhasil di upload` });
  });
});
