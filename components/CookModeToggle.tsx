"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface WakeLockSentinelLike {
  release: () => Promise<void>;
  addEventListener?: (type: "release", listener: () => void) => void;
}

interface WakeLockNavigator {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
}

function FlameIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={active ? "animate-pulse" : ""}
    >
      <path
        d="M7 1 C 7 4 10 5 10 8 C 10 10 8.5 11 7 11 C 5.5 11 4 10 4 8 C 4 6.5 5 6 5 4.5 C 5 3 6 2 7 1 Z"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="currentColor"
        fillOpacity="0.15"
        strokeLinejoin="round"
      />
      <path
        d="M3 10 C 3 13 5 15 7 15 C 9 15 11 13 11 10"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CookModeToggle() {
  const [enabled, setEnabled] = useState(false);
  const [locked, setLocked] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);

  const releaseLock = useCallback(async () => {
    try {
      await wakeLockRef.current?.release();
    } catch {
      /* noop */
    }
    wakeLockRef.current = null;
    setLocked(false);
  }, []);

  const acquireLock = useCallback(async () => {
    const nav = navigator as unknown as WakeLockNavigator;
    if (!nav.wakeLock) return;
    try {
      const sentinel = await nav.wakeLock.request("screen");
      sentinel.addEventListener?.("release", () => {
        wakeLockRef.current = null;
        setLocked(false);
      });
      wakeLockRef.current = sentinel;
      setLocked(true);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) root.classList.add("cook-mode");
    else root.classList.remove("cook-mode");
    return () => {
      root.classList.remove("cook-mode");
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const onVis = () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) {
        void acquireLock();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [enabled, acquireLock]);

  useEffect(() => {
    return () => {
      void releaseLock();
    };
  }, [releaseLock]);

  const handleToggle = () => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) void acquireLock();
      else void releaseLock();
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="tc-gb"
      aria-pressed={enabled}
    >
      <FlameIcon active={enabled} />
      <span>Mode cuisine{enabled ? " · actif" : ""}</span>
      {enabled && (
        <span
          aria-hidden
          title={locked ? "Écran maintenu allumé" : undefined}
          className={`inline-block h-2 w-2 rounded-full ${locked ? "bg-[#1f7a3d]" : "bg-black/30"}`}
        />
      )}
    </button>
  );
}
