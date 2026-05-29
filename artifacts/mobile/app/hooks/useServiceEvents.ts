import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListServicesQueryKey } from "@workspace/api-client-react";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
const WS_URL = DOMAIN ? `wss://${DOMAIN}/api/ws` : "";

export function useServiceEvents() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!WS_URL) return;

    let aborted = false;

    function connect() {
      if (aborted) return;
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {};

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.event === "service-update") {
              queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
            }
          } catch {}
        };

        ws.onclose = () => {
          if (!aborted) {
            reconnectRef.current = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        if (!aborted) {
          reconnectRef.current = setTimeout(connect, 5000);
        }
      }
    }

    connect();

    return () => {
      aborted = true;
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, []);
}
