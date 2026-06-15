import { Connection } from "mongoose";

declare global {
  var mongooseConnection: {
    connection: Connection | null;
    promise: Promise<Connection> | null;
  };
}

declare module "*.css";

export {};
