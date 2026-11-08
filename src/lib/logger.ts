/**
 * Minimal structured logger.
 *
 * In development: pretty-prints to console.
 * In production:  emits JSON lines (compatible with Vercel Log Drain / Datadog).
 *
 * Usage:
 *   import { log } from "@/lib/logger";
 *   log.info("DB connected", { durationMs: 42 });
 *   log.warn("Slow query", { collection: "transactions", ms: 800 });
 *   log.error("Unhandled error", { error: err.message });
 */

type Level = "debug" | "info" | "warn" | "error";
type Meta = Record<string, unknown>;

const IS_PROD = process.env.NODE_ENV === "production";

function emit(level: Level, message: string, meta?: Meta) {
  if (IS_PROD) {
    // Structured JSON for log aggregators
    console[level === "debug" ? "log" : level](
      JSON.stringify({ level, message, ...meta, ts: new Date().toISOString() })
    );
  } else {
    const prefix = `[${level.toUpperCase()}]`;
    if (meta && Object.keys(meta).length > 0) {
      console[level === "debug" ? "log" : level](prefix, message, meta);
    } else {
      console[level === "debug" ? "log" : level](prefix, message);
    }
  }
}

export const log = {
  debug: (msg: string, meta?: Meta) => emit("debug", msg, meta),
  info:  (msg: string, meta?: Meta) => emit("info",  msg, meta),
  warn:  (msg: string, meta?: Meta) => emit("warn",  msg, meta),
  error: (msg: string, meta?: Meta) => emit("error", msg, meta),

  /**
   * Wraps an async function and logs its execution time.
   * Usage: const result = await log.time("label", () => myAsyncFn());
   */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const t0 = Date.now();
    try {
      const result = await fn();
      emit("debug", `[timing] ${label}`, { ms: Date.now() - t0 });
      return result;
    } catch (err) {
      emit("error", `[timing] ${label} failed`, {
        ms: Date.now() - t0,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },
};

