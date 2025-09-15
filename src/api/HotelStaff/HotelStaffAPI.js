// src/api/HotelStaff/HotelStaffAPI.js
import { BASE_URL } from "../../../config";

const QUEUE_URL = `${BASE_URL}/hotelStaff/queue.php`;

/**
 * createQueueSSE({ tableType, tableSize, opts })
 *
 * EventSource-only implementation with:
 *  - token as query param (EventSource can't set headers)
 *  - auto-reconnect with exponential backoff
 *  - heartbeat monitoring (reconnect if no messages for heartbeatTimeout)
 *  - explicit close() to stop reconnection
 *
 * opts:
 *  - withCredentials: boolean (include cookies)
 *  - initialBackoff: ms
 *  - maxBackoff: ms
 *  - heartbeatTimeout: ms
 */
export function createQueueSSE({
  tableType = "",
  tableSize = "",
  opts = {},
} = {}) {
  let eventSource = null;
  let reconnectTimer = null;
  let heartbeatTimer = null;
  let backoff = opts.initialBackoff || 1000;
  const MAX_BACKOFF = opts.maxBackoff || 30000;
  const HEARTBEAT_TIMEOUT = opts.heartbeatTimeout || 30000;
  let lastMessageAt = 0;
  let closedByUser = false;

  const token = () => localStorage.getItem("Token");

  function buildUrl(withTokenAsQuery = true) {
    const params = new URLSearchParams();
    if (tableType) params.append("TableType", tableType);
    if (tableSize) params.append("TableSize", tableSize);
    if (withTokenAsQuery && token()) params.append("token", token());
    const qs = params.toString();
    return qs ? `${QUEUE_URL}?${qs}` : QUEUE_URL;
  }

  function clearReconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function scheduleReconnect(onMessage, onError) {
    clearReconnect();
    const wait = backoff;
    console.warn(`[QueueSSE] scheduling reconnect in ${wait}ms`);
    reconnectTimer = setTimeout(() => {
      // increase backoff with jitter
      backoff = Math.min(
        MAX_BACKOFF,
        Math.round(backoff * (1.5 + Math.random() * 0.5))
      );
      start(onMessage, onError);
    }, wait);
  }

  function clearHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function startHeartbeat(onMessage, onError) {
    lastMessageAt = Date.now();
    clearHeartbeat();
    heartbeatTimer = setInterval(() => {
      const delta = Date.now() - lastMessageAt;
      if (delta > HEARTBEAT_TIMEOUT) {
        console.warn(
          "[QueueSSE] heartbeat timeout — restart connection. delta:",
          delta
        );
        // Force close and reconnect
        try {
          if (eventSource) eventSource.close();
        } catch (e) {}
        eventSource = null;
        if (!closedByUser) {
          // exponential backoff is applied by scheduleReconnect
          scheduleReconnect(onMessage, onError);
        }
      } else {
        // optionally ping UI by calling onMessage with a small heartbeat event or nothing
      }
    }, Math.max(1000, Math.floor(HEARTBEAT_TIMEOUT / 3)));
  }

  function start(onMessage, onError) {
    closedByUser = false;
    // ensure any previous connections are closed
    try {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    } catch (e) {}

    clearReconnect();
    clearHeartbeat();

    // reset backoff when we explicitly start a fresh connection
    backoff = opts.initialBackoff || 1000;

    // Build URL with token query param
    const url = buildUrl(true);
    console.log("[QueueSSE] starting EventSource at:", url);

    try {
      // EventSource accepts an init dict: { withCredentials: boolean }
      eventSource = new EventSource(url, {
        withCredentials: !!opts.withCredentials,
      });

      eventSource.onopen = (ev) => {
        console.log("[QueueSSE] SSE open");
        lastMessageAt = Date.now();
        backoff = opts.initialBackoff || 1000; // reset backoff on success
        startHeartbeat(onMessage, onError);
      };

      eventSource.onmessage = (ev) => {
        lastMessageAt = Date.now();
        // try parse JSON; if server uses custom events, handle them accordingly
        try {
          const parsed = JSON.parse(ev.data);
          // console.debug("[QueueSSE] message:", parsed);
          onMessage && onMessage(parsed);
        } catch (err) {
          // if server sends plain text, still pass raw
          try {
            onMessage && onMessage({ data: ev.data });
          } catch (e) {}
          console.warn("[QueueSSE] parse error, raw data:", ev.data, err);
        }
      };

      eventSource.onerror = (err) => {
        // EventSource may fire an error when server closes connection, or on network fail
        console.error("[QueueSSE] SSE error", err);
        onError && onError(err);

        // eventSource.readyState values:
        // 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
        const state = eventSource && eventSource.readyState;
        try {
          eventSource && eventSource.close();
        } catch (e) {}
        eventSource = null;
        clearHeartbeat();

        if (!closedByUser) {
          // schedule reconnect with backoff
          scheduleReconnect(onMessage, onError);
        }
      };

      return; // started successfully
    } catch (err) {
      console.error("[QueueSSE] failed to start EventSource", err);
      onError && onError(err);
      // schedule reconnect
      if (!closedByUser) scheduleReconnect(onMessage, onError);
    }
  }

  function close() {
    closedByUser = true;
    clearReconnect();
    clearHeartbeat();
    if (eventSource) {
      try {
        eventSource.close();
        console.log("[QueueSSE] EventSource closed by client");
      } catch (e) {}
      eventSource = null;
    }
  }

  return {
    buildUrl: () => buildUrl(false),
    start,
    close,
  };
}
