// import { ImageQuery } from "../lib/types";

interface ImageQuery {
  name: string;
  order_by: "date" | "title" | "size" | "-date" | "-title" | "-size";
  page: number;
  limit: number;
}
declare namespace Express {
  export interface Request {
    token?: any;
    cleanQuery?: ImageQuery;
  }
}
