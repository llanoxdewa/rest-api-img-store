import mongoose from "mongoose";
import { ImageType, ImageModel } from "../lib/types";
import "./connect";

const ImageSchema = new mongoose.Schema<ImageType>({
  name: String,
  filename: {
    type: String,
    required: true,
    unique: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  mimetype: String,
  size: Number,
  upload_by: String,
  create_at: {
    type: Date,
    default: Date.now,
  },
});

ImageSchema.index({ name: "text" });
ImageSchema.index({ date: 1 });
ImageSchema.index({ size: 1 });

ImageSchema.statics.store = async function (img: ImageType) {
  await this.create(img);
};

ImageSchema.statics.destroy = async function (filename) {
  await this.deleteOne({ filename });
};

ImageSchema.statics.findByFilename = async function (filename: string) {
  const file = await this.findOne({ filename });
  return file;
};

const Image = mongoose.model<ImageType, ImageModel>("images", ImageSchema);

export default Image;
