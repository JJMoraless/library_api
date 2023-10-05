import Joi from "joi";

const email = Joi.string().email();
const password = Joi.string();
const username = Joi.string();
const description = Joi.string();
const role = Joi.string();

export const postUserShema = Joi.object({
  username: username.required(),
  email: email.required(),
  password: password.required(),
  // role: Joi.string().valid("admin", "reader", "publisher").required(),
});

export const postLoginShema = Joi.object({
  email: email.required(),
  password: password.required(),
});

export const putUserSchema = Joi.object({
  username,
  email,
  role,
});
