import { MongoMemoryServer } from "mongodb-memory-server";

async function run() {
  console.log("Starting embedded local MongoDB server on port 27017...");
  try {
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: "academiq",
      },
    });
    console.log("==================================================");
    console.log(" Embedded MongoDB is RUNNING at port 27017");
    console.log(` URI: ${mongoServer.getUri()}`);
    console.log(" Press Ctrl+C to stop.");
    console.log("==================================================");

    process.on("SIGINT", async () => {
      console.log("\nStopping embedded MongoDB...");
      await mongoServer.stop();
      process.exit(0);
    });
  } catch (err) {
    console.error("Failed to start embedded MongoDB:", err);
  }
}

run();
