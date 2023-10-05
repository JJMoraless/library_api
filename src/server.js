import express from "express";
import cors from "cors";
import morgan from "morgan";

import "dotenv/config.js";
import "./utils/auth/index.js";

import { router } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorsHandler.js";

class Server {
  constructor() {
    this.port = process.env.PORT;
    this.app = express();
    this.middlewares();
    this.routes();
    this.validateErrors();
  }

  routes() {
    this.app.use(router);
  }

  validateErrors() {
    this.app.use(errorHandler);
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(morgan("dev"));
    this.app.use(express.json());
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("server listening on port " + this.port);
    });
  }
}

export default Server;
