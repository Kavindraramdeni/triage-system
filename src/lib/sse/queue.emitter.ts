import { EventEmitter } from "events";
class QueueEmitter extends EventEmitter {}
const g = globalThis as any;
export const queueEmitter: QueueEmitter = g.queueEmitter ?? new QueueEmitter();
if (process.env.NODE_ENV !== "production") g.queueEmitter = queueEmitter;
