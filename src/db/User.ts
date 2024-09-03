import mongoose from "mongoose";
import { z } from "zod";
import { UserType, UserModel } from "../lib/types";
import { genHashPassword, Logging } from "../lib/utils";
import { validationPassword } from "../lib/utils";
import "./connect";

const usernameValidator = z.string().min(3);

// pasword must at least contains lowercase number and uppercase combination
// and password length must at least more than 3 character
const passwordValidator = z.string().refine((val: string) => {
  if (val.length < 3) return false;
  if (!(/[a-z]/.test(val) && /[0-9]/.test(val) && /[A-Z]/.test(val)))
    return false;
  return true;
});

const emailValidator = z.string().refine((val: string) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(val);
});

const UserSchema = new mongoose.Schema<UserType>({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v: string) => usernameValidator.safeParse(v).success,
      message: () => `username harus terdiri dari minimal 3 karakter`,
    },
  },
  password: {
    type: String,
    validate: {
      validator: (val: string) => passwordValidator.safeParse(val).success,
      message: () =>
        `password harus terdiri dari 3 character dan merupakan kombinasi dari angka, huruf kecil, dan huruf besar`,
    },
    required: true,
  },
  email: {
    type: String,
    required: true,
    validator: {
      validate: (val: string) => emailValidator.safeParse(val).success,
      message: () => `email harus valid`,
    },
  },
  name: {
    type: String,
    required: false,
  },
});

UserSchema.statics.login = async function (username: string, password: string) {
  const user = await this.findOne({ username });
  if (!user) throw new Error("username tidak ditemukan !!");
  if (!(await validationPassword(password, user.password)))
    throw new Error("password salah !!!");
  return user;
};

UserSchema.statics.signup = async function (userData: UserType) {
  const respon = await this.create(userData);
  return respon;
};

UserSchema.statics.drop = async function (username: string) {
  await this.deleteOne({ username });
};

UserSchema.statics.findByUsername = async function (username: string) {
  const user = await this.findOne({ username });
  return user;
};

UserSchema.statics.update = async function (
  username: string,
  data: Partial<UserType>
) {
  const dataValidation = z.object({
    username: usernameValidator.optional(),
    email: emailValidator.optional(),
    name: z.string().min(1).optional(),
  });

  const resValidation = dataValidation.safeParse(data);

  if (!resValidation.success) {
    throw new Error(`${resValidation.error.flatten().fieldErrors}`);
  }

  Logging.info(`username: ${username}`);
  await this.updateOne({ username }, { $set: { ...data } });
  Logging.info(`user ${username} telah berhasil di update`);

  const user = await this.findOne({ username });
  return user;
};

UserSchema.pre("save", async function (next: any) {
  const hashedPassword = await genHashPassword(this.password);
  this.password = hashedPassword;
  next();
});

UserSchema.pre("updateOne", async function (next: any) {
  const updateInfo = this.getUpdate() as Record<string, any>;
  const updatedPerson = updateInfo!["$set"] as Partial<UserType>;

  if (!!updatedPerson.password) {
    updatedPerson.password = await genHashPassword(
      updatedPerson.password as string
    );
    this.setUpdate(updatedPerson);
  }
  next();
});

UserSchema.post("updateOne", async function (result: any, next: any) {
  Logging.info(`operasi update berhasil ${JSON.stringify(result)}`);
  next();
});

UserSchema.post("save", async function (doc: UserType, next: any) {
  Logging.info(`user ${doc.username} telah berhasil dibuat`);
  next();
});

const User = mongoose.model<UserType, UserModel>("users", UserSchema);

export default User;
