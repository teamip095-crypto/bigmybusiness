/**
 * Big My Business — Live Visitors Count mini-service
 * ----------------------------------------------------
 * Independent Bun + socket.io service running on a FIXED port (3003).
 *
 * Responsibilities:
 *   - Tracks currently-connected socket clients (= live visitors).
 *   - On connect: increments count, broadcasts `live-count` to all clients.
 *   - On disconnect: decrements count, broadcasts `live-count`.
 *   - Exposes an HTTP GET `/` returning `{ ok: true, live: <count> }`
 *     so admins can poll without holding a socket connection.
 *
 * Gateway rule: the public/admin front-ends reach this service through
 * the Caddy gateway using:
 *   - socket:  `io("/?XTransformPort=3003")`  (engine.io-client appends
 *              its default `/socket.io/` path internally, so socket.io
 *              polling requests hit `/socket.io/?EIO=4&transport=...&XTransformPort=3003`)
 *   - health:  `fetch("/?XTransformPort=3003")` (HTTP GET to URL `/`)
 *
 * Routing:
 *   We register the HTTP health handler on the httpServer BEFORE
 *   socket.io attaches (socket.io caches existing "request" listeners
 *   and only intercepts URLs that start with `/socket.io/`). So:
 *     - GET `/`           -> cached listener -> health JSON
 *     - GET `/socket.io/?` -> engine.io handleRequest -> socket.io traffic
 *
 * We intentionally do NOT override socket.io's `path` to "/" — that would
 * make engine.io intercept every URL (including `/`) and break the health
 * endpoint. The default `/socket.io/` path is what socket.io-client uses
 * by default on the browser side, so everything lines up cleanly.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Server } from "socket.io";

const PORT = 3003;

// In-memory live visitor counter.
let liveCount = 0;

// Health / polling endpoint. Registered FIRST so socket.io caches it and
// only intercepts its own /socket.io/ traffic — everything else (i.e.
// GET "/") falls through to here.
function healthHandler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  // Pre-flight CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const pathname = (req.url || "/").split("?")[0];
  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        ok: true,
        live: liveCount,
        ts: Date.now(),
        service: "big-my-business/live-count",
      }),
    );
    return;
  }

  // Anything that doesn't match socket.io and isn't "/" -> 404
  res.writeHead(404);
  res.end(JSON.stringify({ ok: false, error: "Not found" }));
}

const httpServer = createServer(healthHandler);

const io = new Server(httpServer, {
  // Use the default socket.io path (/socket.io/). DO NOT set path: "/"
  // — that would make engine.io intercept every URL, including our
  // health endpoint at GET "/", and return "Transport unknown".
  // The client connects via `io("/?XTransformPort=3003")` and
  // engine.io-client appends "/socket.io/" automatically.
  serveClient: false,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

function broadcastLiveCount() {
  io.emit("live-count", { live: liveCount, ts: Date.now() });
  console.log(`[live-count] broadcast -> ${liveCount}`);
}

io.on("connection", (socket) => {
  liveCount += 1;
  console.log(
    `[live-count] +connect id=${socket.id} -> live=${liveCount}`,
  );

  // Send the freshest count to just-joined client immediately,
  // then broadcast to everyone else.
  socket.emit("live-count", { live: liveCount, ts: Date.now() });
  broadcastLiveCount();

  socket.on("disconnect", (reason) => {
    liveCount = Math.max(0, liveCount - 1);
    console.log(
      `[live-count] -disconnect id=${socket.id} reason=${reason} -> live=${liveCount}`,
    );
    broadcastLiveCount();
  });

  socket.on("error", (err: unknown) => {
    console.error(`[live-count] socket error id=${socket.id}:`, err);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[live-count] service listening on http://localhost:${PORT}`);
  console.log(`[live-count] socket.io path=/socket.io/ (default)`);
  console.log(`[live-count] socket.io clients connect via io("/?XTransformPort=3003")`);
  console.log(`[live-count] GET / -> { ok: true, live: <number> }`);
});

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`[live-count] ${signal} received, shutting down...`);
  io.close(() => {
    httpServer.close(() => {
      console.log("[live-count] closed");
      process.exit(0);
    });
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
