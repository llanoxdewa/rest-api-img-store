import express, { Request, Response } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

// import { auth, requiresAuth } from "express-openid-connect";

import userRouter from "./user/route";
import { imagesRoute } from "./images-api/route";

dotenv.config({ path: ".env.local" });

const logger = morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);

const app = express();
const PORT = process.env.API_PORT;

// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: process.env.AUTH_SECRET as string,
//   baseURL: process.env.AUTH_IURL as string,
//   clientID: process.env.AUTH_CLIENTID as string,
//   issuerBaseURL: process.env.AUTH_IURL as string,
// };

// auth router attaches /login, /logout, and /callback routes to the baseURL
// app.use(auth(config));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(cookieParser());
app.use(logger);

// use requiresAuth to secure the path
// app.get("/profile", requiresAuth(), (req, res) => {
//   res.json(req.oidc.user);
// });

app.use("/user", userRouter);
app.use("/images", imagesRoute);

app.get("/", (req: Request, res: Response) => {
  res.send(`
    <h1>hello kamu disana, YA kamu</h1>
    <strong>ini adalah API yang sangat keren, dimana kamu bisa menyimpan gambar dan juga gambar</strong>
    berikut adalah link menuju dokumentasi lengkapnya
  `);
});

app.listen(PORT, () => {
  console.log("server is running on port " + PORT + "...");
});
