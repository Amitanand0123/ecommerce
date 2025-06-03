import mongoose, { Mongoose as MongooseInstanceType } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
    );
}
interface MongooseDbCache {
  conn: MongooseInstanceType | null;
  promise: Promise<MongooseInstanceType> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseDbCache | undefined;
}

let cached: MongooseDbCache;

if (global.mongoose) {
  cached = global.mongoose;
} else {
  cached = { conn: null, promise: null };
  global.mongoose = cached;
}


async function dbConnect(): Promise<MongooseInstanceType> {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, 
        };
        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
            return mongooseInstance;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    if (!cached.conn) {
      throw new Error("Failed to establish Mongoose connection.");
    }

    return cached.conn;
}

export default dbConnect;