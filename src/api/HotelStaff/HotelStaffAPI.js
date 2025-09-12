// src/api/HotelStaff/HotelStaffAPI.js
import { BASE_URL } from "../../../config";

const QUEUE_URL = `${BASE_URL}/hotelStaff/queue.php`;

/**
 * createQueueSSE({ tableType, tableSize })
 * returns { buildUrl, start(onMessage,onError), close() }
 *
 * - Tries EventSource (SSE) first by appending token as query param (EventSource cannot set headers).
 * - If EventSource errors or isn't accepted by server, falls back to polling using fetch (with Authorization header).
 */
export function createQueueSSE({ tableType = "", tableSize = "" } = {}) {
  let eventSource = null;
  let polling = null;
  let lastEtag = null; // for optional caching/eTag support (not used here but handy)
  const token = () => localStorage.getItem("Token");

  function buildUrl(withTokenAsQuery = false) {
    const params = new URLSearchParams();
    if (tableType) params.append("TableType", tableType);
    if (tableSize) params.append("TableSize", tableSize);
    if (withTokenAsQuery && token()) params.append("token", token());
    const qs = params.toString();
    return qs ? `${QUEUE_URL}?${qs}` : QUEUE_URL;
  }

  function start(onMessage, onError) {
    console.log("[QueueSSE] start() called. tableType:", tableType, "tableSize:", tableSize);
    // First try native SSE (EventSource). Remember EventSource cannot set headers.
    const urlForSse = buildUrl(true); // append Token as query param (if present)
    let attemptedEventSource = false;

    function startPolling() {
      if (polling) return;
      console.log("[QueueSSE] starting polling fallback (every 5s). URL:", buildUrl(false));
      // immediate one-shot fetch
      (async () => {
        try {
          const res = await fetch(buildUrl(false), {
            cache: "no-store",
            headers: {
              Authorization: token() ? `Bearer ${token()}` : undefined,
            },
          });
          const json = await res.json();
          console.log("[QueueSSE][poll] immediate fetch response:", json);
          onMessage && onMessage(json);
        } catch (err) {
          console.error("[QueueSSE][poll] immediate fetch error:", err);
          onError && onError(err);
        }
      })();

      polling = setInterval(async () => {
        try {
          const res = await fetch(buildUrl(false), {
            cache: "no-store",
            headers: {
              Authorization: token() ? `Bearer ${token()}` : undefined,
            },
          });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const json = await res.json();
          console.log("[QueueSSE][poll] response:", json);
          onMessage && onMessage(json);
        } catch (err) {
          console.error("[QueueSSE][poll] error:", err);
          onError && onError(err);
        }
      }, 5000);
    }

    // Try EventSource only if environment supports it
    if (typeof window !== "undefined" && window.EventSource) {
      try {
        attemptedEventSource = true;
        console.log("[QueueSSE] attempting EventSource (SSE) at:", urlForSse);
        eventSource = new EventSource(urlForSse);

        eventSource.onopen = (ev) => {
          // console.log("[QueueSSE][SSE] connection opened", ev);
        };

        eventSource.onmessage = (ev) => {
          try {
            // many SSE servers send plain text lines or JSON in ev.data
            const parsed = JSON.parse(ev.data);
            // console.log("[QueueSSE][SSE] message:", parsed);
            onMessage && onMessage(parsed);
          } catch (err) {
            console.warn("[QueueSSE][SSE] parse error, raw data:", ev.data, err);
          }
        };

        eventSource.onerror = (err) => {
          console.error("[QueueSSE][SSE] error/closed. Falling back to polling.", err);
          try {
            eventSource.close();
          } catch (e) {}
          eventSource = null;
          startPolling();
          onError && onError(err);
        };

        // safety: if server never sends data, do an immediate polling fetch after 4s
        setTimeout(() => {
          if (!eventSource || (eventSource && eventSource.readyState === 2)) {
            // closed -> ensure polling started
            startPolling();
          }
        }, 4000);
        return;
      } catch (e) {
        console.warn("[QueueSSE] EventSource threw - falling back to polling:", e);
        eventSource = null;
        startPolling();
      }
    } else {
      console.warn("[QueueSSE] EventSource not available in this environment. Using polling.");
      startPolling();
    }
  }

  function close() {
    if (eventSource) {
      try {
        eventSource.close();
        console.log("[QueueSSE] EventSource closed.");
      } catch (e) {
        console.warn("[QueueSSE] error closing EventSource:", e);
      }
      eventSource = null;
    }
    if (polling) {
      clearInterval(polling);
      polling = null;
      console.log("[QueueSSE] polling stopped.");
    }
  }

  return {
    buildUrl: () => buildUrl(false),
    start,
    close,
  };
}
