"use client";
import { useEffect, useCallback } from "react";
type QueueEvent = { type: string; visitId?: string; esiLevel?: string; timestamp?: string; };
export function useQueueSSE(onEvent: (e: QueueEvent) => void) {
  const connect = useCallback(() => {
    const es = new EventSource("/api/sse/queue");
    es.onmessage = (e) => { try { const d = JSON.parse(e.data); if (d.type !== "ping") onEvent(d); } catch {} };
    es.onerror = () => { es.close(); setTimeout(connect, 3000); };
    return es;
  }, [onEvent]);
  useEffect(() => { const es = connect(); return () => es.close(); }, [connect]);
}
