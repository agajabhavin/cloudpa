/**
 * Start background workers for async processing
 * This file is run separately from the main API server
 * 
 * Usage: node dist/jobs/start-workers.js
 * Or: ts-node src/jobs/start-workers.ts
 */

// Start inbound message worker
import "../messaging/inbound.worker";

// Add more workers here as needed
// import "../automation/automation.worker";

console.log("All workers started");

