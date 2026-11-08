import mongoose from "mongoose";
import dns from "dns";
import { once } from "events";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  connectTimeMs: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null, connectTimeMs: 0 };
global.mongooseCache = cached;

// ── Module-level connection: connect once at import, reuse across invocations ──
let moduleConnected = false;

once(globalThis, "connectDB", () => {
  if (moduleConnected) return;
  moduleConnected = true;
});

function once(obj: any, event: string, fn: () => void) {
  // Simple once guard for Node/serverless idempotency
  if (obj[event]) return;
  obj[event] = true;
  fn();
}

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
      maxPoolSize: 5,        // keep pool small for serverless; avoid exhausting sockets
      minPoolSize: 2,        // maintain warm sockets to eliminate cold connects
      maxIdleTimeMS: 60_000, // drop stale sockets after 60s of inactivity

      // ── Timeouts & Reliability ─────────────────────────────────────────
      // Use resilient 30s timeouts for cloud Atlas clusters across varying networks
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45_000,
      connectTimeoutMS: 30_000,
      heartbeatFrequencyMS: 10_000,

      retryWrites: true,
      retryReads: true,
      w: "majority",
    };

    const t0 = Date.now();
    cached.promise = mongoose.connect(uri, opts).then((m) => {
      cached.connectTimeMs = Date.now() - t0;
      console.log(`[DB] Connected in ${cached.connectTimeMs} ms`);
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
