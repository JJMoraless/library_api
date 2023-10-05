import Joi from "joi";
import objectId from "joi-objectid";
Joi.objectId = objectId(Joi);

const title = Joi.string();
const categorys = Joi.string();
const seller = Joi.string();
const description = Joi.string();
const stock = Joi.number().integer();
const genre = Joi.string();
const price = Joi.number();
const resume = Joi.string();

// Reservations
const returnDate = Joi.date();
const startDate = Joi.date();

export const postProductShema = Joi.object({
  title: title.required(),
  categories: categorys.required(),
  seller: seller.required(),
  description: description.required(),
  stock: stock.required(),
  genre: genre.required(),
  price: price.required(),
  resume: resume.required(),
});

export const getProductSchema = Joi.object({
  id: Joi.objectId(),
});

export const postReservationSchema = Joi.object({
  start_date: startDate.required(),
  return_date: returnDate.required(),
});
