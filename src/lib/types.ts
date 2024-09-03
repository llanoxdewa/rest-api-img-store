import { Document, Model } from "mongoose";

export interface Product {
  id: number;
  category_id: number; // Field can be nullable
  name: string;
  description: string; // Field can be nullable
  price: number;
  stock: number; // Defaults to 0 if not provided
  image_url: string; // Field can be nullable
  created_at: Date;
  updated_at: Date;
  attribute?: string | null; // Assuming this is a JSON string or a large text field
  long_description: string; // Field can be nullable
}

export interface ImageQuery {
  name: string;
  order_by: "date" | "title" | "size" | "-date" | "-title" | "-size";
  page: number;
  limit: number;
}

export interface UserType extends Document {
  username: string;
  password: string;
  email: string;
  name: string;
}

export interface UserModel extends Model<UserType> {
  login(userame: string, password: string): Promise<UserType>;
  signup(userData: UserType): Promise<UserType>;
  update(username: string, d: Partial<UserType>): Promise<UserType>;
  drop(username: string): Promise<void>;
  findByUsername(username: string): Promise<UserType>;
  remove(username: string): Promise<void>;
}

export interface ImageTypeOnly {
  filename: string;
  path: string;
  create_at?: Date;
  size: Number;
  mimetype: String;
  upload_by: String;
  name: string;
}

export interface ImageType extends Document, ImageTypeOnly {}

export interface ImageModel extends Model<ImageType> {
  store(img: ImageTypeOnly): Promise<void>;
  destroy(k: String): Promise<void>;
}

export type LoggingLevel = "INFO" | "WARNING" | "EXCEPTION" | "ERROR" | "DEBUG";
