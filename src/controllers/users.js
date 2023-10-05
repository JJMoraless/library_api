import { request, response } from "express";

import db from "../../db/conection.js";
import { resOk } from "../utils/functions.js";
import { hash } from "bcrypt";
import { ClientError } from "../utils/errors.js";
import { ObjectId } from "mongodb";

const User = db.collection("users");
const Product = db.collection("product");

export class UserCrll {
  static async create(req, res) {
    const user = req.body;
    const checkEmail = await User.findOne({ email: user.email });
    if (checkEmail) {
      throw new ClientError("email is already in use");
    }

    const userCreated = await User.insertOne({
      ...user,
      password: await hash(user.password, 10),
      role: "reader",
    });
    
    resOk(res, { user_create: userCreated });
  }

  static async delete(res, req = request) {}

  static async get(req, res) {
    const usersFound = await User.find(
      {},
      {
        projection: { password: 0 },
      }
    ).toArray();
    resOk(res, { users: usersFound });
  }

  static async update(req, res) {
    const { id } = req.params;
    const { role } = req.body;
    const userUpdate = User.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { role } },
      { returnDocument: "after" }
    );
    resOk(res, { users: userUpdate });
  }

  static async getReservations(req, res) {
    const { user } = req;
    const booksReservationsByUser = await Product.aggregate([
      {
        $unwind: "$reservations",
      },
      {
        $match: {
          $and: [
            { "reservations.user_id": new ObjectId(user.sub) },
            { "reservations.state": "reserved" },
          ],
        },
      },
      {
        $group: {
          _id: null,
          total_reservations: { $sum: 1 },
          reservations: { $push: "$reservations" }, // Agregar las reservas al resultado
        },
      },
      {
        $project: {
          _id: 0,
          total_reservations: 1,
          reservations: 1,
        },
      },
    ]).toArray();

    resOk(res, { reservations: booksReservationsByUser });
  }

  static async returnBook(req, res) {}
}
