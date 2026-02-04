import * as React from "react";

export function useStopwatch() {
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const lastTickRef = React.useRef(0);

  React.useEffect(() => {
    if (!running) {
      return;
    }

    lastTickRef.current = Date.now();
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      setElapsedMs((prev) => prev + delta);
    }, 250);

    return () => window.clearInterval(intervalId);
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
