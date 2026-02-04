import * as React from "react";

export function useCountdown(totalSeconds: number, onComplete?: () => void) {
  const [remainingMs, setRemainingMs] = React.useState(totalSeconds * 1000);
  const [running, setRunning] = React.useState(false);
  const lastTickRef = React.useRef(0);
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    if (!running) {
      return;
    }

    lastTickRef.current = Date.now();
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      setRemainingMs((prev) => Math.max(0, prev - delta));
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [running]);

  React.useEffect(() => {
    if (remainingMs === 0 && running) {
      setRunning(false);
    }

    if (remainingMs === 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [remainingMs, onComplete, running]);

  const start = React.useCallback(() => {
    if (remainingMs === 0) {
      setRemainingMs(totalSeconds * 1000);
      completedRef.current = false;
    }
    setRunning(true);
  }, [remainingMs, totalSeconds]);

  const pause = React.useCallback(() => setRunning(false), []);

  const reset = React.useCallback(() => {
    setRunning(false);
    completedRef.current = false;
    setRemainingMs(totalSeconds * 1000);
  }, [totalSeconds]);

  return {
    remainingMs,
    running,
    start,
    pause,
    reset,
  };
}
