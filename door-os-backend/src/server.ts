import { createServer } from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { attachSockets } from "./socket";

async function main() {
  const server = createServer(app);
  attachSockets(server);

  server.listen(env.port, "0.0.0.0", () => {
    console.log(`Door OS API listening on port ${env.port} (0.0.0.0)`);
  });

  // Connect to MongoDB asynchronously to avoid blocking the initial health check on Render
  connectDB().catch((e) => {
    console.error("MongoDB connection notice:", e.message);
    console.log("Please ensure MONGODB_URI is configured with a valid connection string (e.g. MongoDB Atlas).");
  });

  const stop = () => server.close(() => process.exit(0));
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((e) => {
  console.error("Failed to start server", e);
  process.exit(1);
});
