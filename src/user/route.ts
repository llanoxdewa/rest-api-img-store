import { Router, Request, Response, NextFunction } from "express";
import User from "../db/User";
import { Logging, giveMeToken } from "../lib/utils";
import { verifyJwt } from "../lib/utils";

const userRouter = Router();

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authToken = req.cookies["jwt-token"];
  if (!authToken) {
    res.status(401).json({ msg: "anda harus login terlebih dahulu" }).end();
    return;
  }
  const token = verifyJwt(authToken) as any;
  if (!token) {
    res.status(401).json({ msg: "auth token tidak valid" }).end();
    return;
  }
  req.token = token;
  next();
};

userRouter.get("/logout", auth, async (req: Request, res: Response) => {
  res.clearCookie("jwt-token");
  Logging.info(`user ${req.token.username} telah logout`);
  res.status(200).send({ msg: "anda telah logout" });
});

userRouter.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.login(username, password);
    Logging.info(`user ${user.username} telah berhasil login`);
    const jwtToken = giveMeToken(user.toJSON());

    res.cookie("jwt-token", jwtToken, {
      maxAge: 60 * 1000 * 60 * 24, // will expire in 24H / 1 day
    });

    res.status(200).json({
      msg: "Login berhasil",
    });
  } catch (e) {
    Logging.error("login gagal dilakukan");
    Logging.exception(e);
    res.status(400).json({
      msg: "login tidak valid",
      err: (e as Error).message,
    });
  }
});

userRouter.post("/signup", async (req: Request, res: Response) => {
  const data = req.body;
  try {
    const response = await User.signup(data);
    Logging.info(`user ${response.username} telah berhasil dibuat`);
    res.status(200).json({
      msg: `user ${response.username} telah berhasil dibuat`,
    });
  } catch (e) {
    Logging.error(`user dengan data ${data} tidak berhasil untuk dibuat`);
    Logging.exception(e);
    res.status(500).json({
      msg: "signup data tidak valid",
      err: (e as Error).message,
    });
  }
});

userRouter.get("/profile", auth, async (req: Request, res: Response) => {
  res.status(200).json({
    username: req.token.username,
    email: req.token.email,
    name: req.token.name,
  });
});

userRouter.patch("/", auth, async (req: Request, res: Response) => {
  const username = req.token.username;
  const updateData = req.body;
  // update user operation
  try {
    const updatedUser = await User.update(username, updateData);

    const updatedToken = giveMeToken(updatedUser.toJSON());

    res.cookie("jwt-token", updatedToken, {
      // update the cookie
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(200).json({ msg: `${username} telah berhasil di update` });
  } catch (e) {
    Logging.error("operasi update gagal dilakukan");
    Logging.exception(e);
    res
      .status(500)
      .json({ msg: "operation update fail", err: (e as Error).message });
  }
});

userRouter.delete("/", auth, async (req: Request, res: Response) => {
  // delete user operaton
  const username = req.token.username;
  try {
    await User.drop(username);
    Logging.info(`user ${username} telah berhasil dihapus`);
    res.clearCookie("jwt-token");
    res.status(200).json({ msg: "user telah berhasil di hapus" });
  } catch (e) {
    Logging.error("terjadi masalah saat untuk menghapus user " + username);
    Logging.exception(e);
    res
      .status(500)
      .json({ msg: "delete user operation fail", err: (e as Error).message });
  }
});

export default userRouter;
