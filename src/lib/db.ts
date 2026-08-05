import mongoose from "mongoose";

declare global {
  var __hmsMongooseConn: Promise<typeof mongoose> | undefined;
}

function connect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local.");
  }

  return mongoose.connect(uri);
}

// Connection is established lazily, on first call, rather than at module
// import time — standalone scripts (e.g. scripts/seed.ts) load env vars
// themselves before calling connectDB(), and under ESM those imports are
// hoisted ahead of any top-level side effects, so a connect-at-import-time
// design would read process.env before it's populated.
export default function connectDB(): Promise<typeof mongoose> {
  if (!global.__hmsMongooseConn) {
    global.__hmsMongooseConn = connect();
  }
  return global.__hmsMongooseConn;
}
