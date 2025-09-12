// hooks/useQueueSSE.js
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../../config";

const QUEUE_URL = `${BASE_URL}/user/queue.php`;
const DAY_MS = 24 * 3600 * 1000;

export default function useQueueSSE(enabled = true) {
  const [waitingNumber, setWaitingNumber] = useState("");
  const [waitingMessage, setWaitingMessage] = useState("");
  const [remaining, setRemaining] = useState(null); // seconds for UI

  // refs for mutable values (avoid re-running effects)
  const lastRawRef = useRef(null);
  const endTimeRef = useRef(null); // timestamp in ms
  const remainingRef = useRef(null);
  const esRef = useRef(null);
  const intervalRef = useRef(null);

  // helpers
  const pad2 = (n) => String(n).padStart(2, "0");
  const formatCountdown = (seconds) => {
    if (seconds == null) return "00:00";
    if (seconds <= 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${pad2(h)}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
  };

  // Parse server Waiting_Time into seconds or an absolute timestamp (in ms).
  // Returns one of:
  //   { type: "absolute", ms }  -> countdown to today's absolute time
  //   { type: "seconds", seconds } -> countdown that lasts N seconds
  //   null -> unrecognized
  const parseServerTime = (raw) => {
    if (raw == null) return null;
    const s = String(raw).trim();

    // Case 1: HH:MM:SS -> treat as time-of-day (today only, no rollover)
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

        if (candidate <= Date.now()) {
          // already passed → expired immediately
          return { type: "seconds", seconds: 0 };
        }

        return { type: "absolute", ms: candidate };
      }
    }

    // Case 2: MM:SS -> treat as relative duration
    if (/^\d{1,2}:\d{2}$/.test(s)) {
      const [m, sec] = s.split(":").map((x) => Number(x));
      if (![m, sec].some(Number.isNaN)) {
        return { type: "seconds", seconds: m * 60 + sec };
      }
    }

    // Case 3: pure number string -> seconds
    if (/^\d+$/.test(s)) {
      const num = Number(s);
      return { type: "seconds", seconds: num };
    }

    // Case 4: numeric float string -> minutes
    const f = parseFloat(s);
    if (!Number.isNaN(f)) {
      return { type: "seconds", seconds: Math.round(f * 60) };
    }

    // Case 5: totally unrecognized
    return null;
  };

  // SSE setup (run once when enabled toggles true)
  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem("Token");
    const contact = localStorage.getItem("Contact");
    const hotelId = localStorage.getItem("Hotel_ID");

    if (!contact || !hotelId || !token) {
      console.error("Missing required data for SSE connection.");
      return;
    }

    const url = `${QUEUE_URL}?Contact=${encodeURIComponent(
      contact
    )}&Hotel_Id=${encodeURIComponent(hotelId)}&token=${encodeURIComponent(
      token
    )}`;

    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        console.log("SSE message:", data);

        if (data?.Queue !== undefined) setWaitingNumber(data.Queue);
        if (data?.Message !== undefined) setWaitingMessage(data.Message);

        // handle Waiting_Time intelligently
        if (data?.Waiting_Time !== undefined && data.Waiting_Time !== null) {
          const raw = data.Waiting_Time;
          const parsed = parseServerTime(raw);
          if (!parsed) return;

          // derive candidateEndMs
          let candidateEndMs = null;
          if (parsed.type === "absolute") {
            candidateEndMs = parsed.ms;
          } else if (parsed.type === "seconds") {
            candidateEndMs = Date.now() + parsed.seconds * 1000;
          }

          if (candidateEndMs == null) return;

          const prevRaw = lastRawRef.current;
          const prevEnd = endTimeRef.current;

          // shouldUpdate when:
          // - first time (prevRaw null)
          // - raw string changed (server sent new string)
          // - OR derived candidateEndMs differs from prevEnd by > 2 seconds (server corrected)
          const diffMs = prevEnd
            ? Math.abs(candidateEndMs - prevEnd)
            : Infinity;
          const shouldUpdate =
            prevRaw === null || prevRaw !== raw || diffMs > 2000;

          if (shouldUpdate) {
            lastRawRef.current = raw;
            endTimeRef.current = candidateEndMs;
            // update remaining immediately
            const secs = Math.max(
              0,
              Math.floor((candidateEndMs - Date.now()) / 1000)
            );
            remainingRef.current = secs;
            setRemaining(secs);
            // optionally set stateful endTime if needed:
            // setEndTime(candidateEndMs);
            console.log(
              "SSE -> set new end time:",
              new Date(candidateEndMs).toISOString(),
              "remaining:",
              secs
            );
          } else {
            // ignore identical/insignificant update
            // console.log("SSE -> ignoring repeated/insignificant Waiting_Time:", raw);
          }
        }
      } catch (err) {
        console.error("Error handling SSE message:", err, "raw:", ev.data);
      }
    };

    es.onerror = (err) => {
      console.error("SSE error:", err);
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
  }, [enabled]); // run only once per enabled change

  // Single interval that computes remaining as endTimeRef - now (using Date.now())
  useEffect(() => {
    // clear any existing interval
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
  };
}
