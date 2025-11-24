/**
 * Dual-worker: Supports both pg-boss (primary) and BullMQ (fallback)
 * Automatically detects and uses available queue system
 */

import { Worker } from "bullmq";
import IORedis from "ioredis";
import PgBoss from "pg-boss";
import { processInboundMessage, MessageJobData } from "./process-message";

const QUEUE_TYPE = (process.env.QUEUE_TYPE || "auto") as "pgboss" | "bullmq" | "auto";
const CONCURRENCY = Number(process.env.INGEST_CONCURRENCY || 15);

// Initialize pg-boss worker (primary)
async function startPgBossWorker() {
  try {
    const boss = new PgBoss({
      connectionString: process.env.DATABASE_URL,
      schema: "pgboss",
    });

    await boss.start();

    // pg-boss creates queues automatically when needed
    // No need to create queue explicitly before starting workers
    const queueName = "inbound-messages";

    // pg-boss work handler - processes jobs automatically
    // Start multiple workers for concurrency (pg-boss v11 doesn't have teamSize option)
    // Each worker processes jobs independently
    for (let i = 0; i < CONCURRENCY; i++) {
      // Start worker without awaiting (runs in background)
      boss.work(queueName, async (jobs) => {
        // Process each job in the batch concurrently
        await Promise.allSettled(
          jobs.map(async (job) => {
            const data = job.data as MessageJobData;
            console.log(`[pg-boss] Processing job ${job.id}`);
            
            try {
              const result = await processInboundMessage(data);
              console.log(`[pg-boss] Job ${job.id} completed`);
              return result;
            } catch (error) {
              console.error(`[pg-boss] Job ${job.id} failed:`, error);
              // Throw error - pg-boss will retry automatically
              throw error;
            }
          })
        );
      }).catch((error) => {
        console.error(`[pg-boss] Worker ${i} error:`, error);
      });
    }

    // Give workers a moment to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`✅ pg-boss worker started (primary) - ${CONCURRENCY} concurrent workers`);
    return boss;
  } catch (error) {
    console.error("❌ pg-boss worker failed:", error);
    return null;
  }
}

// Initialize BullMQ worker (fallback)
function startBullMQWorker() {
  try {
    const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    const worker = new Worker(
      "inbound-messages",
      async (job) => {
        const data = job.data as MessageJobData;
        console.log(`[BullMQ] Processing job ${job.id}`);
        
        try {
          const result = await processInboundMessage(data);
          console.log(`[BullMQ] Job ${job.id} completed`);
          return result;
        } catch (error) {
          console.error(`[BullMQ] Job ${job.id} failed:`, error);
          throw error; // BullMQ will retry
        }
      },
      {
        connection,
        concurrency: CONCURRENCY,
        limiter: {
          max: 100,
          duration: 1000,
        },
      }
    );

    worker.on("completed", (job) => {
      console.log(`[BullMQ] Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
      console.error(`[BullMQ] Job ${job?.id} failed:`, err);
    });

    console.log("✅ BullMQ worker started (fallback)");
    return { worker, connection };
  } catch (error) {
    console.error("❌ BullMQ worker failed:", error);
    return null;
  }
}

// Start workers based on configuration
let pgBossInstance: PgBoss | null = null;
let bullmqInstance: { worker: Worker; connection: IORedis } | null = null;

async function startWorkers() {
  console.log(`🚀 Starting workers (QUEUE_TYPE=${QUEUE_TYPE}, CONCURRENCY=${CONCURRENCY})`);

  // Start pg-boss if enabled
  if (QUEUE_TYPE === "pgboss" || QUEUE_TYPE === "auto") {
    pgBossInstance = await startPgBossWorker();
  }

  // Start BullMQ if enabled or if pg-boss failed
  if (QUEUE_TYPE === "bullmq" || (QUEUE_TYPE === "auto" && !pgBossInstance)) {
    bullmqInstance = startBullMQWorker();
  }

  if (!pgBossInstance && !bullmqInstance) {
    console.error("❌ No workers started! Check configuration.");
    process.exit(1);
  }

  console.log("✅ Inbound message worker(s) started");
}

// Graceful shutdown
async function shutdown() {
  console.log("🛑 Shutting down workers...");
  
  if (pgBossInstance) {
    await pgBossInstance.stop();
  }
  
  if (bullmqInstance) {
    await bullmqInstance.worker.close();
    await bullmqInstance.connection.quit();
  }
  
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start workers
startWorkers().catch((error) => {
  console.error("Failed to start workers:", error);
  process.exit(1);
});
