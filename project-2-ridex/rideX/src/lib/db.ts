import mongoose from "mongoose";
const mongodbUri = process.env.MONGODB_URI;

if (!mongodbUri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

if (!global.mongooseConnection) {
  global.mongooseConnection = {
    connection: null,
    promise: null,
  };
}

let cache = global.mongooseConnection;

if (!cache) {
  cache = {
    connection: null,
    promise: null,
  };
}

const connectDB = async () => {
  if (cache.connection) {
    return cache.connection;
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(mongodbUri).then((c) => c.connection);
  }
  try {
    const conn = await cache.promise;
    return conn;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
