import { request } from "express";
import { ObjectId } from "mongodb";
import fs from "fs-extra";

import { deleteImage, resizeImg, uploadImage } from "../libs/index.js";
import { resOk, ClientError } from "../utils/index.js";

import db from "../../db/conection.js";

const Product = db.collection("product");

export class ProductsCrll {
  static async create(req = request, res) {
    const data = req.body;
    if (!req?.file) throw new ClientError("product must have an image");

    const pathImg = req.file.path;

    const result = await uploadImage(pathImg);
    data.image = {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };

    fs.unlink(pathImg);

    const product = await Product.insertOne({
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
    });

    resOk(res, {
      product: {
        _id: product.insertedId,
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
      },
    });
  }

  static async getReservationsByBook(req = request, res) {
    const return_date = new Date(req.body.return_date);
    const start_date = new Date(req.body.start_date);

    const { id } = req.params;
    const product = await Product.findOne({ _id: new ObjectId(id) });

    if (!product) {
      throw new ClientError("id book no existe");
    }

    const { stock } = await Product.findOne({ _id: new ObjectId(id) });
    const booksFullReserved = await Product.aggregate([
      {
        $match: { _id: new ObjectId(id) },
      },
      {
        $unwind: "$reservations",
      },
      {
        $match: {
          $and: [
            { "reservations.start_date": { $lte: new Date(return_date) } },
            { "reservations.return_date": { $gte: new Date(start_date) } },
            { _id: new ObjectId(id) },
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

    const totalReservation = booksFullReserved[0].total_reservations;
    const booksAvailable = stock - totalReservation;

    resOk(res, {
      books_available: booksAvailable,
      total_books: stock,
      ...booksFullReserved[0],
    });
  }

  static async createReservation(req, res) {
    const { id } = req.params;
    const product = await Product.findOne({ _id: new ObjectId(id) });
    if (!product) throw new ClientError("book not found");

    const { user } = req;
    const return_date = new Date(req.body.return_date);
    const start_date = new Date(req.body.start_date);
    const { stock } = product;

    // const clearReservations = await Product.findOneAndUpdate(
    //   { _id: new ObjectId(id) },

    //   {
    //     $set: {
    //       reservations: [],
    //     },
    //   },
    //   {
    //     returnDocument: "after",
    //   }
    // );

    // throw new ClientError("borrados")

    // Validar que no los libros enten completamente reservados

    
    const booksReservations = await Product.aggregate([
      {
        $match: { _id: new ObjectId(id) },
      },
      {
        $unwind: "$reservations",
      },
      {
        $match: {
          $and: [
            { "reservations.start_date": { $lte: new Date(return_date) } },
            { "reservations.return_date": { $gte: new Date(start_date) } },
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

    const totalReservation = (() => {
      if (booksReservations.length === 0) return 0;
      return booksReservations[0].total_reservations;
    })();

    if (totalReservation === stock) {
      throw new ClientError("all books is reserved");
    }

    // // Validar que el lector solo pueda reservar una sola vez
    const booksReservationsByUser = await Product.aggregate([
      {
        $match: { _id: new ObjectId(id) },
      },
      {
        $unwind: "$reservations",
      },
      {
        $match: {
          $and: [
            { "reservations.start_date": { $lte: new Date(return_date) } },
            { "reservations.return_date": { $gte: new Date(start_date) } },
            { "reservations.user_id": new ObjectId(user.sub) },
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

    const totalReservationByUser = (() => {
      if (booksReservationsByUser.length === 0) return 0;
      return booksReservationsByUser[0].total_reservations;
    })();

    if (totalReservationByUser) {
      throw new ClientError("you have already reserved this book");
    }

    // Agregar reservacion al libro
    const reservation = {
      _id: new ObjectId(),
      return_date,
      start_date,
      user_id: new ObjectId(user.sub),
      state: "reserved",
    };

    Product.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          reservations: { ...reservation, book_details: product },
        },
      },
      {
        returnDocument: "after",
      }
    );

    const booksAvailable = stock - (totalReservation + 1);

    if (booksReservations.length === 0) {
      booksReservations[0] = { reservations: [] };
      booksReservations[0].total_reservations = 0;
    }

    booksReservations[0].total_reservations += 1;
    booksReservations[0].reservations.push(reservation);

    resOk(res, {
      reservations: booksReservations,
      total_reservations: totalReservation + 1,
      books_available: stock,
      books_stock: booksAvailable,
    });
  }

  static async get(req = request, res) {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;

    const totalBooks = await Product.countDocuments();
    const producsFound = await Product.find(
      {},
      {
        projection: { reservations: 0 },
      }
    )
      .skip(skip)
      .limit(pageSize)
      .sort({ _id: -1 })
      .toArray();

    resOk(res, { products: producsFound, total_books: totalBooks });
  }

  static async getTotalBooksNow(req, res) {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    const product = await Product.findOne({ _id: new ObjectId(id) });
    if (!product) throw new ClientError("book not found");

    const { stock } = product;

    console.log({
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    });

    const booksReservations = await Product.aggregate([
      {
        $match: { _id: new ObjectId(id) },
      },
      {
        $unwind: "$reservations",
      },
      {
        $match: {
          $and: [
            { "reservations.start_date": { $lte: new Date(end_date) } },
            { "reservations.return_date": { $gte: new Date(start_date) } },
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
          // reservations: 0,
        },
      },
    ]).toArray();

    const totalReservation = (() => {
      if (booksReservations.length === 0) return 0;
      return booksReservations[0].total_reservations;
    })();

    const booksAvailable = stock - totalReservation;

    if (booksReservations.length === 0) {
      booksReservations[0] = {};
      booksReservations[0].total_reservations = 0;
    }

    resOk(res, {
      books_availables: booksAvailable,
      total_reservations: totalReservation,
      book_stock: stock,
    });
  }

  static async getById(req = request, res) {
    const { id } = req.params;
    const producsFound = await Product.findOne({ _id: new ObjectId(id) });
    resOk(res, { product: producsFound });
  }

  static async put(req = request, res) {
    const { id } = req.params;
    const { product } = req.body;

    const productoCreate = await Product.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...product } }
    );

    resOk(res, { product: productoCreate });
  }

  static async delete(req, res) {
    const id = req.params;

    const producFound = await Product.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!producFound) throw new ClientError("product does no exists");
    await deleteImage(producFound?.image?.public_id);
    resOk(res, { product: producFound });
  }
}
