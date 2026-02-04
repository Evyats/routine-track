export function formatClock(totalMs: number, padHours = false) {
  const totalSeconds = Math.max(0, Math.floor(totalMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = padHours ? String(hours).padStart(2, "0") : String(hours);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return hours > 0 || padHours ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatStopwatchDisplay(totalMs: number, padHours = false) {
  const safeMs = Math.max(0, totalMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = padHours ? String(hours).padStart(2, "0") : String(hours);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const hundredths = String(Math.floor((safeMs % 1000) / 10)).padStart(2, "0");

  return {
    main: hours > 0 || padHours ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`,
    hundredths,
  };
}

export function getMinuteProgress(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minuteSeconds = totalSeconds % 60;
  return (minuteSeconds / 60) * 100;
}
