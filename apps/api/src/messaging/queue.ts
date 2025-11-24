import { Queue } from "bullmq";
import IORedis from "ioredis";
import PgBoss from "pg-boss";

// Primary: pg-boss (PostgreSQL-based)
let pgBoss: PgBoss | null = null;
let pgBossInitialized = false;

// Fallback: BullMQ + Redis
let bullmqQueue: Queue | null = null;
let redisConnection: IORedis | null = null;

// Queue type preference: 'pgboss' | 'bullmq' | 'auto'
const QUEUE_TYPE = (process.env.QUEUE_TYPE || "auto") as "pgboss" | "bullmq" | "auto";

async function initPgBoss() {
  if (pgBossInitialized) return pgBoss;
  
  try {
    const boss = new PgBoss({
      connectionString: process.env.DATABASE_URL,
      schema: "pgboss", // Creates schema automatically
    });

    await boss.start();
    pgBoss = boss;
    pgBossInitialized = true;
    console.log("✅ pg-boss initialized (primary queue)");
    return boss;
  } catch (error) {
    console.error("❌ pg-boss initialization failed:", error);
    return null;
  }
}

function initBullMQ() {
  if (bullmqQueue) return bullmqQueue;

  try {
    const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    const queue = new Queue("inbound-messages", {
      connection,
      defaultJobOptions: {
        removeOnComplete: 10000,
        removeOnFail: 5000,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    });

    redisConnection = connection;
    bullmqQueue = queue;
    console.log("✅ BullMQ initialized (fallback queue)");
    return queue;
  } catch (error) {
    console.error("❌ BullMQ initialization failed:", error);
    return null;
  }
}

// Unified queue interface
export const inboundQueue = {
  async add(name: string, data: any) {
    // Try pg-boss first (if enabled)
    if (QUEUE_TYPE === "pgboss" || QUEUE_TYPE === "auto") {
      try {
        const boss = await initPgBoss();
        if (boss) {
          // pg-boss creates queues automatically on first send
          // No need to create queue explicitly
          await boss.send(name, data);
          return { queue: "pgboss" };
        }
      } catch (error) {
        console.error("pg-boss enqueue failed, falling back to BullMQ:", error);
      }
    }

    // Fallback to BullMQ
    if (QUEUE_TYPE === "bullmq" || QUEUE_TYPE === "auto") {
      try {
        const queue = initBullMQ();
        if (queue) {
          await queue.add(name, data);
          return { queue: "bullmq" };
        }
      } catch (error) {
        console.error("BullMQ enqueue failed:", error);
        throw new Error("Both queue systems failed");
      }
    }

    throw new Error("No queue system available");
  },

  async close() {
    if (pgBoss) {
      await pgBoss.stop();
    }
    if (bullmqQueue) {
      await bullmqQueue.close();
    }
    if (redisConnection) {
      await redisConnection.quit();
    }
  },
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  await inboundQueue.close();
});
