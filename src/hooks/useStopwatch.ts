import * as React from "react";

export function useStopwatch() {
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const lastTickRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!running) {
      return;
    }

    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      setElapsedMs((prev) => prev + delta);
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
    };
  }, [running]);

  const start = React.useCallback(() => setRunning(true), []);
  const pause = React.useCallback(() => setRunning(false), []);
  const reset = React.useCallback(() => {
    setRunning(false);
    setElapsedMs(0);
  }, []);
  const setTime = React.useCallback((ms: number) => {
    setElapsedMs(Math.max(0, ms));
  }, []);

  return {
    elapsedMs,
    running,
    start,
    pause,
    reset,
    setTime,
  };
}
