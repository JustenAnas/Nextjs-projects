import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

// Validate MongoDB URI at module load time — fail fast before any connection attempt
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

/**
 * Shape of the cached Mongoose connection stored on the global object.
 * - `conn`    : the resolved Mongoose instance (set after a successful connect)
 * - `promise` : the in-flight connection promise (prevents duplicate attempts)
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Augment the Node.js global namespace so TypeScript recognises our cache
 * property without resorting to `any`.
 *
 * `var` is intentional here — only `var` declarations are hoisted onto the
 * global object in Node.js module scope.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

/**
 * Reuse the existing cache across hot-reloads in development.
 * In production, module-level state is stable so this is effectively a
 * module-level singleton.
 */
const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };

if (!global._mongoose) {
  global._mongoose = cached;
}

/**
 * Connects to MongoDB and returns the Mongoose instance.
 *
 * Call this at the top of every API route / Server Action that needs the DB.
 * Subsequent calls within the same process return the cached connection
 * immediately without re-connecting.
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Fast path — already connected
  if (cached.conn) {
    return cached.conn;
  }

  // Start a new connection only if one isn't already in progress
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      /**
       * Disable Mongoose's internal command buffering.
       * With buffering off, operations throw immediately when the DB is
       * unreachable instead of silently queuing — better for debugging.
       */
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset the promise so the next call can attempt a fresh connection
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

// Also export as default to support both import styles:
// import connectDB from "@/lib/mongodb"
// import { connectDB } from "@/lib/mongodb"
export default connectDB;