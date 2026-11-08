import mongoose from "mongoose";
import dns from "dns";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env"
    );
  }

  // ── Fast path: already connected ──────────────────────────────────────────
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // ── If the connection dropped (e.g. after long idle), reset the promise ───
  if (cached.promise && mongoose.connection.readyState === 0) {
    cached.promise = null;
    cached.conn = null;
  }

  // ── Initiate a new connection (deduplicated across concurrent requests) ───
  if (!cached.promise) {
    // If an SRV URI (mongodb+srv://) is used, some local DNS servers / ISPs reject
    // SRV lookups with ECONNREFUSED. Setting public DNS resolves this reliably.
    if (uri.startsWith("mongodb+srv://")) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
      } catch {
        // Ignore if environment does not allow modifying DNS servers
      }
    }

    const opts: mongoose.ConnectOptions = {
      dbName: "expensetracker",
      bufferCommands: false, // fail fast on model calls if not connected

      // ── Pool tuning ───────────────────────────────────────────────────
      maxPoolSize: 10,       // maximum concurrent sockets
      minPoolSize: 2,        // maintain warm sockets to eliminate cold connects
      maxIdleTimeMS: 60_000, // drop stale sockets after 60s of inactivity

      // ── Timeouts & Reliability ─────────────────────────────────────────
      // Use resilient 30s timeouts for cloud Atlas clusters across varying networks
      serverSelectionTimeoutMS: 30_000,
      socketTimeoutMS: 45_000,
      connectTimeoutMS: 30_000,
      heartbeatFrequencyMS: 10_000,

      retryWrites: true,
      retryReads: true,
      w: "majority",
    };

    const t0 = Date.now();
    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`[DB] Connected in ${Date.now() - t0} ms`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Clear cache on failure so next request can attempt fresh reconnect
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
