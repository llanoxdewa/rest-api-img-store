import bcrypt from "bcrypt";
import { LoggingLevel, UserType } from "./types";
const chalk = require("chalk");
import jwt from "jsonwebtoken";

export const validationPassword = async (
  password: string,
  rpassword: string
) => {
  const valid = await bcrypt.compare(password, rpassword);
  return valid;
};

export const genHashPassword = async (originalPassword: string) => {
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(originalPassword, salt);
  return hashed;
};

export const verifyJwt = (jwtToken: string) => {
  const data = jwt.verify(jwtToken, process.env.JWT_SECRET as string);
  return data;
};

// cookies management
export const giveMeToken = (data: UserType) => {
  const token = jwt.sign(data, process.env.JWT_SECRET as string);
  Logging.info(`token untuk user ${data.username} telah berhasil dibuat`);
  return token;
};

export class Logging {
  static genColor(type: LoggingLevel) {
    const COLOR_DATA: {
      [k in LoggingLevel]: any;
    } = {
      ERROR: chalk.bold.red,
      INFO: chalk.bold.blue,
      WARNING: chalk.bold.yellow,
      EXCEPTION: chalk.bold.redBright,
      DEBUG: chalk.bold.greenBright,
    } as const;
    return COLOR_DATA[type];
  }

  static build(type: LoggingLevel) {
    return `[${new Date().toLocaleTimeString()}][${type}]`;
  }

  static log(type: LoggingLevel, ...s: any[]) {
    console.log(
      `${Logging.genColor(type)(Logging.build(type))}: ${s.join(" ")}`
    );
  }

  static info(...s: any[]) {
    Logging.log("INFO", s);
  }
  static error(...s: any[]) {
    Logging.log("ERROR", s);
  }
  static warning(...s: any[]) {
    Logging.log("WARNING", s);
  }

  static dbg(...s: any[]) {
    const val = [] as any[];
    for (let ss of s) {
      if (ss instanceof Object) val.push(JSON.stringify(ss));
      else val.push(ss);
    }
    Logging.log("DEBUG", s);
  }

  static exception(e: any) {
    Logging.log("EXCEPTION", JSON.stringify(e as Error));
  }
}
