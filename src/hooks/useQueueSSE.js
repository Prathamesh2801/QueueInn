// hooks/useQueueSSE.js
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config";

const QUEUE_URL = `${BASE_URL}/user/queue.php`;

export default function useQueueSSE(enabled = true) {
  const [waitingNumber, setWaitingNumber] = useState("");
  const [waitingMessage, setWaitingMessage] = useState("");
  const [remaining, setRemaining] = useState(null); // seconds for UI
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState(null);

  const navigate = useNavigate();

  // refs for mutable values (avoid re-running effects)
  const lastRawRef = useRef(null);
  const endTimeRef = useRef(null); // timestamp in ms
  const remainingRef = useRef(null);
  const esRef = useRef(null);
  const intervalRef = useRef(null);
  const fallbackTriedRef = useRef(false); // only attempt fetch-fallback once per connection

  const pad2 = (n) => String(n).padStart(2, "0");
  const formatCountdown = (seconds) => {
    if (seconds == null) return "00:00";
    if (seconds <= 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
  };

  // Parse server Waiting_Time into seconds or absolute timestamp (ms)
  const parseServerTime = (raw) => {
    if (raw == null) return null;
    const s = String(raw).trim();

    // HH:MM:SS => today's absolute time
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) {
      const [h, m, sec] = s.split(":").map((x) => Number(x));
      if ([h, m, sec].every((n) => !Number.isNaN(n))) {
        const now = new Date();
        const candidate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          h,
          m,
          sec
        ).getTime();
        if (candidate <= Date.now()) return { type: "seconds", seconds: 0 }; // already passed
        return { type: "absolute", ms: candidate };
      }
    }

    // MM:SS => relative seconds
    if (/^\d{1,2}:\d{2}$/.test(s)) {
      const [m, sec] = s.split(":").map((x) => Number(x));
      if (![m, sec].some(Number.isNaN))
        return { type: "seconds", seconds: m * 60 + sec };
    }

    // numeric string => seconds
    if (/^\d+$/.test(s)) {
      return { type: "seconds", seconds: Number(s) };
    }

    // float => treat as minutes
    const f = parseFloat(s);
    if (!Number.isNaN(f))
      return { type: "seconds", seconds: Math.round(f * 60) };

    return null;
  };

  // Centralized handler for any payload (string or parsed object)
  const handlePayload = (rawData, isErrorOrigin = false) => {
    let obj = rawData;
    let wasJSON = typeof rawData === "object";

    if (!wasJSON) {
      try {
        obj = JSON.parse(String(rawData));
        wasJSON = true;
      } catch (e) {
        obj = String(rawData);
        wasJSON = false;
      }
    }

    // If object, inspect fields
    if (wasJSON && obj && typeof obj === "object") {
      const isError =
        obj.error === true ||
        obj.Status === false ||
        obj.status === "error" ||
        obj.Status === "false" ||
        isErrorOrigin;

      const message =
        obj.Message ||
        obj.message ||
        obj.msg ||
        obj.error_message ||
        obj.Error ||
        "";

      // Special-case: Invalid Credentials → clear Token + redirect
      if (message.includes("Invalid Credentials")) {
        try {
          // remove only token, preserve Hotel_ID and Contact
          localStorage.removeItem("Token");
        } catch (e) {
          console.error("Failed to remove Token from localStorage", e);
        }

        const hotelId = localStorage.getItem("Hotel_ID") || "";
        // guard navigate call - wrap in try/catch in case hook used outside router
        try {
          navigate(`/startup?Hotel_ID=${encodeURIComponent(hotelId)}`);
        } catch (err) {
          console.error(
            "Navigation failed (useQueueSSE requires react-router context):",
            err
          );
        }

        // update error state and stop further processing
        setLastError(message);
        setWaitingMessage(message);
        setIsConnected(false);
        return;
      }

      if (isError) {
        setLastError(message || "Server reported error");
        setWaitingMessage(message || "");
        setIsConnected(false);

        // if Waiting_Time present even in error payload, try to use it
        if (obj.Waiting_Time !== undefined && obj.Waiting_Time !== null) {
          const parsed = parseServerTime(obj.Waiting_Time);
          if (parsed) {
            let candidateEndMs = null;
            if (parsed.type === "absolute") candidateEndMs = parsed.ms;
            else if (parsed.type === "seconds")
              candidateEndMs = Date.now() + parsed.seconds * 1000;

            if (candidateEndMs) {
              lastRawRef.current = obj.Waiting_Time;
              endTimeRef.current = candidateEndMs;
              const secs = Math.max(
                0,
                Math.floor((candidateEndMs - Date.now()) / 1000)
              );
              remainingRef.current = secs;
              setRemaining(secs);
            }
          }
        }
        return;
      }

      // Normal (non-error) object handling
      if (obj.Queue !== undefined) setWaitingNumber(obj.Queue);
      if (obj.Message !== undefined) setWaitingMessage(obj.Message);
      if (obj.waitingMessage !== undefined)
        setWaitingMessage(obj.waitingMessage);

      if (obj.Waiting_Time !== undefined && obj.Waiting_Time !== null) {
        const raw = obj.Waiting_Time;
        const parsed = parseServerTime(raw);
        if (!parsed) return;
        let candidateEndMs = null;
        if (parsed.type === "absolute") candidateEndMs = parsed.ms;
        else if (parsed.type === "seconds")
          candidateEndMs = Date.now() + parsed.seconds * 1000;
        if (candidateEndMs == null) return;

        const prevRaw = lastRawRef.current;
        const prevEnd = endTimeRef.current;
        const diffMs = prevEnd ? Math.abs(candidateEndMs - prevEnd) : Infinity;
        const shouldUpdate =
          prevRaw === null || prevRaw !== raw || diffMs > 2000;

        if (shouldUpdate) {
          lastRawRef.current = raw;
          endTimeRef.current = candidateEndMs;
          const secs = Math.max(
            0,
            Math.floor((candidateEndMs - Date.now()) / 1000)
          );
          remainingRef.current = secs;
          setRemaining(secs);
        }
      }
      return;
    }

    // raw text fallback
    const text = String(obj || "");
    if (isErrorOrigin) {
      setLastError(text);
      setWaitingMessage(text);
      setIsConnected(false);
    } else {
      setWaitingMessage(text);
    }
  };

  // fetch fallback when EventSource reports error — reads server body (one-shot)
  const fetchFallback = async (url) => {
    if (fallbackTriedRef.current) return;
    fallbackTriedRef.current = true;

    try {
      const res = await fetch(url, {
        method: "GET",
        cache: "no-cache",
        headers: { Accept: "application/json, text/plain" },
      });
      const ct = (res.headers.get("content-type") || "").toLowerCase();

      if (ct.includes("application/json") || ct.includes("text/json")) {
        const data = await res.json();
        // treat as error-origin if server indicates status false
        handlePayload(data, data && data.Status === false);
      } else {
        // try reading text and attempt JSON parse
        const txt = await res.text();
        try {
          const parsed = JSON.parse(txt);
          handlePayload(parsed, parsed && parsed.Status === false);
        } catch (e) {
          // not JSON — treat as raw text error
          handlePayload(txt, true);
        }
      }
    } catch (err) {
      console.error("fetchFallback error:", err);
      setLastError("Network / SSE fallback failed");
      setIsConnected(false);
    }
  };

  // SSE setup (reacts to enabled)
  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem("Token");
    const contact = localStorage.getItem("Contact");
    const hotelId = localStorage.getItem("Hotel_ID");

    if (!contact || !hotelId || !token) {
      console.error("Missing required data for SSE connection.");
      setLastError("Missing Token/Contact/Hotel_ID in localStorage");
      return;
    }

    const url = `${QUEUE_URL}?Contact=${encodeURIComponent(
      contact
    )}&Hotel_Id=${encodeURIComponent(hotelId)}&token=${encodeURIComponent(
      token
    )}`;

    // reset fallback flag for this connection
    fallbackTriedRef.current = false;

    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      console.log("SSE connected");
      setIsConnected(true);
      setLastError(null);
    };

    es.onmessage = (ev) => {
      if (!ev || !ev.data) return;
      try {
        handlePayload(ev.data, false);
      } catch (err) {
        console.error("Error handling SSE message:", err, "raw:", ev.data);
      }
    };

    // also listen for a named error event if server ever sends one
    es.addEventListener("sse_error", (ev) => {
      try {
        handlePayload(ev.data, true);
      } catch (err) {
        console.error("Error handling sse_error event:", err, "raw:", ev.data);
      }
    });

    es.onerror = (err) => {
      console.warn("EventSource error:", err);
      setIsConnected(false);

      // try one-off fetch to get a plain JSON/text error that the PHP might have returned
      fetchFallback(url);

      // close this EventSource - consumer can re-enable the hook to reconnect
      try {
        es.close();
      } catch (e) {}
      esRef.current = null;
    };

    return () => {
      try {
        if (esRef.current) esRef.current.close();
      } catch (e) {}
      esRef.current = null;
    };
  }, [enabled, navigate]); // include navigate in deps because we use it inside

  // Interval to update countdown UI
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      const end = endTimeRef.current;
      if (!end) {
        remainingRef.current = null;
        setRemaining(null);
        return;
      }
      const secs = Math.max(0, Math.floor((end - Date.now()) / 1000));
      remainingRef.current = secs;
      setRemaining(secs);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (esRef.current) {
        try {
          esRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  return {
    waitingNumber,
    waitingMessage,
    waitingTime: formatCountdown(remaining),
    remainingSeconds: remaining,
    isConnected,
    lastError,
  };
}
