import express from "express";
import cors from "cors";
import morgan from "morgan";

import "dotenv/config.js";
import "./utils/auth/index.js";

import { router } from "./routes/index.js";
import { errorHandler } from "./middlewares/errorsHandler.js";

class Server {
  constructor() {
    this.host = "192.168.129.72";
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
    const server = {
      hostname: this.host,
      port: this.port,
    };
    this.app.listen(server, () => {
      console.log(
        "server listening on port " + `http://${server.hostname}:${server.port}`
      );
    });
  }
}

export default Server;
