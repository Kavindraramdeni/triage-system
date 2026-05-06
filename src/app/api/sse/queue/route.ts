import { NextRequest } from "next/server";
import { requireClinician } from "@/lib/auth/jwt";
import { queueEmitter } from "@/lib/sse/queue.emitter";

export const runtime = "nodejs"; // SSE requires Node runtime

export async function GET(req: NextRequest) {
  const auth = await requireClinician(req);
  if (!auth.ok) return auth.error;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode("data: {\"type\":\"connected\"}\n\n"));

      const listener = (event: object) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Client disconnected
        }
      };

      queueEmitter.on("queue:update", listener);

      // Heartbeat every 25s to keep connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode("data: {\"type\":\"ping\"}\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25_000);

      // Clean up on disconnect
      req.signal.addEventListener("abort", () => {
        queueEmitter.off("queue:update", listener);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable Nginx buffering
    },
  });
}
