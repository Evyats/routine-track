import * as React from "react";
import { Link, Route, Routes } from "react-router-dom";
import { ComponentExample } from "@/components/component-example";

type RoutineTask = {
  id: string;
  label: string;
  durationSeconds?: number;
};

const routineTasks: RoutineTask[] = [
  {
    id: "read-github",
    label: "Read high-quality existing GitHub code",
    durationSeconds: 20 * 60,
  },
  {
    id: "new-ai-tool",
    label: "Use a new AI tool",
    durationSeconds: 30 * 60,
  },
  {
    id: "generate-questions",
    label: "Generate 3 ChatGPT programming questions",
  },
  {
    id: "commit-github",
    label: "Commit changes to codebase and push to GitHub",
  },
];

function formatClock(totalMs: number, padHours = false) {
  const totalSeconds = Math.max(0, Math.floor(totalMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = padHours ? String(hours).padStart(2, "0") : String(hours);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return hours > 0 || padHours ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
}

function formatDateLabel(date = new Date()) {
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${dayName} | ${day}.${month}.${year}`;
}

function playChime() {
  try {
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.value = 0.0001;
    gain.connect(context.destination);

    const oscA = context.createOscillator();
    oscA.type = "sine";
    oscA.frequency.value = 523.25;
    oscA.connect(gain);

    const oscB = context.createOscillator();
    oscB.type = "sine";
    oscB.frequency.value = 659.25;
    oscB.connect(gain);

    oscA.start();
    oscB.start();
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.8);
    oscA.stop(context.currentTime + 1.85);
    oscB.stop(context.currentTime + 1.85);
  } catch {
    // Silent fail if audio context isn't available.
  }
}

function useCountdown(
  totalSeconds: number,
  onComplete?: () => void,
) {
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

function useStopwatch() {
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

export function App() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const stopwatch = useStopwatch();
  const [isDark, setIsDark] = React.useState(true);
  const [editMinutes, setEditMinutes] = React.useState(0);
  const [editSeconds, setEditSeconds] = React.useState(0);
  const [rippleKey, setRippleKey] = React.useState(0);
  const [rippleStyle, setRippleStyle] = React.useState<{
    left: number;
    top: number;
    size: number;
  } | null>(null);

  const handleToggle = React.useCallback((taskId: string) => {
    setChecked((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }, []);

  React.useLayoutEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  React.useEffect(() => {
    if (stopwatch.running) {
      return;
    }
    const totalSeconds = Math.floor(stopwatch.elapsedMs / 1000);
    setEditMinutes(Math.floor(totalSeconds / 60));
    setEditSeconds(totalSeconds % 60);
  }, [stopwatch.elapsedMs, stopwatch.running]);

  const handleCircleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const left = event.clientX - rect.left - size / 2;
      const top = event.clientY - rect.top - size / 2;
      setRippleStyle({ left, top, size });
      setRippleKey((prev) => prev + 1);
      if (stopwatch.running) {
        stopwatch.pause();
      } else {
        stopwatch.start();
      }
    },
    [stopwatch],
  );

  const handleSetTime = React.useCallback(() => {
    if (stopwatch.running) {
      return;
    }
    const minutes = Number.isFinite(editMinutes) ? editMinutes : 0;
    const seconds = Number.isFinite(editSeconds) ? editSeconds : 0;
    const clampedSeconds = Math.min(59, Math.max(0, Math.floor(seconds)));
    const clampedMinutes = Math.max(0, Math.floor(minutes));
    stopwatch.setTime((clampedMinutes * 60 + clampedSeconds) * 1000);
  }, [editMinutes, editSeconds, stopwatch]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="min-h-screen bg-muted px-4 py-10 text-foreground dark:bg-background">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
              <header className="rounded-2xl border border-border/70 bg-card/95 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.5)] backdrop-blur dark:bg-card/80">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Daily Routine
                    </p>
                    <h1 className="text-3xl font-semibold text-foreground">
                      Focus Tracker
                    </h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-md border border-border bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground">
                      {formatDateLabel()}
                    </div>
                    <Link
                      to="/example"
                      className="rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground"
                    >
                      Example
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsDark((prev) => !prev)}
                      className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-card/80 text-foreground/80 transition hover:bg-primary/10 hover:text-foreground dark:bg-card/70"
                      aria-label="Toggle dark mode"
                      title="Toggle dark mode"
                    >
                      {isDark ? <SunIcon /> : <MoonIcon />}
                    </button>
                  </div>
                </div>
              </header>

              <section className="flex items-center justify-center">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleCircleClick}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleCircleClick(
                        event as unknown as React.MouseEvent<HTMLDivElement>,
                      );
                    }
                  }}
                  className="relative flex h-[22rem] w-[22rem] flex-col items-center justify-center overflow-hidden rounded-full border border-border/70 bg-card/95 p-8 text-center text-card-foreground shadow-[0_30px_80px_-50px_rgba(15,23,42,0.25)] outline-none transition focus-visible:ring-2 focus-visible:ring-primary/40 dark:bg-card sm:h-[26rem] sm:w-[26rem]"
                >
                  {rippleStyle ? (
                    <span
                      key={rippleKey}
                      className="ripple"
                      style={{
                        width: rippleStyle.size,
                        height: rippleStyle.size,
                        left: rippleStyle.left,
                        top: rippleStyle.top,
                      }}
                    />
                  ) : null}
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                    Study Stopwatch
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    {formatClock(stopwatch.elapsedMs, true)}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Start this when you begin your learning session. Pause when
                    you step away. Reset at the end of the day to see your true
                    focused time.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="number"
                      min={0}
                      value={editMinutes}
                      onChange={(event) =>
                        setEditMinutes(Number(event.target.value))
                      }
                      onClick={(event) => event.stopPropagation()}
                      onFocus={(event) => event.stopPropagation()}
                      disabled={stopwatch.running}
                      className="w-16 rounded-md border border-border bg-background px-2 py-1 text-center text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Minutes"
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={editSeconds}
                      onChange={(event) =>
                        setEditSeconds(Number(event.target.value))
                      }
                      onClick={(event) => event.stopPropagation()}
                      onFocus={(event) => event.stopPropagation()}
                      disabled={stopwatch.running}
                      className="w-16 rounded-md border border-border bg-background px-2 py-1 text-center text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Seconds"
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSetTime();
                      }}
                      disabled={stopwatch.running}
                      className="rounded-md border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Set
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={
                        stopwatch.running ? stopwatch.pause : stopwatch.start
                      }
                      className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
                      aria-label={stopwatch.running ? "Pause" : "Start"}
                      title={stopwatch.running ? "Pause" : "Start"}
                      onMouseDown={(event) => event.stopPropagation()}
                    >
                      {stopwatch.running ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button
                      type="button"
                      onClick={stopwatch.reset}
                      className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
                      aria-label="Reset"
                      title="Reset"
                      onMouseDown={(event) => event.stopPropagation()}
                    >
                      <ResetIcon />
                    </button>
                  </div>
                </div>
              </section>

              <section className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Today&apos;s Checklist
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {Object.values(checked).filter(Boolean).length} /{" "}
                    {routineTasks.length} complete
                  </span>
                </div>

                <div className="grid gap-4">
                  {routineTasks.map((task) =>
                    typeof task.durationSeconds === "number" ? (
                      <TimedTaskCard
                        key={task.id}
                        task={task}
                        checked={checked[task.id] ?? false}
                        onToggle={handleToggle}
                        onComplete={(taskId) =>
                          setChecked((prev) => ({ ...prev, [taskId]: true }))
                        }
                      />
                    ) : (
                      <TaskCard
                        key={task.id}
                        task={task}
                        checked={checked[task.id] ?? false}
                        onToggle={handleToggle}
                      />
                    ),
                  )}
                </div>
              </section>
            </div>
          </main>
        }
      />
      <Route
        path="/example"
        element={
          <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto w-full max-w-5xl px-4 py-10">
              <ComponentExample />
            </div>
          </main>
        }
      />
    </Routes>
  );
}

export default App;

type TaskCardProps = {
  task: RoutineTask;
  checked: boolean;
  onToggle: (taskId: string) => void;
};

function TaskCard({ task, checked, onToggle }: TaskCardProps) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.35)] backdrop-blur dark:bg-card/80">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-base font-medium text-foreground">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(task.id)}
            className="h-5 w-5 rounded border-border text-primary focus:ring-primary/40"
          />
          <span>{task.label}</span>
        </label>
      </div>
    </article>
  );
}

type TimedTaskCardProps = TaskCardProps & {
  onComplete: (taskId: string) => void;
};

function TimedTaskCard({
  task,
  checked,
  onToggle,
  onComplete,
}: TimedTaskCardProps) {
  const timer = useCountdown(task.durationSeconds ?? 0, () => {
    playChime();
    onComplete(task.id);
  });

  return (
    <article className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.35)] backdrop-blur dark:bg-card/80">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-base font-medium text-foreground">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(task.id)}
            className="h-5 w-5 rounded border-border text-primary focus:ring-primary/40"
          />
          <span>{task.label}</span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
            {formatClock(timer.remainingMs)}
          </div>
          <button
            type="button"
            onClick={timer.running ? timer.pause : timer.start}
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
            aria-label={timer.running ? "Pause timer" : "Start timer"}
            title={timer.running ? "Pause timer" : "Start timer"}
          >
            {timer.running ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            onClick={timer.reset}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
            aria-label="Reset timer"
            title="Reset timer"
          >
            <ResetIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M8 5.5a1 1 0 0 1 1.52-.86l8.5 5a1 1 0 0 1 0 1.72l-8.5 5A1 1 0 0 1 8 15.5V5.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M7.5 5.5A1.5 1.5 0 0 1 9 7v10a1.5 1.5 0 0 1-3 0V7a1.5 1.5 0 0 1 1.5-1.5Zm9 0A1.5 1.5 0 0 1 18 7v10a1.5 1.5 0 0 1-3 0V7a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12a8 8 0 0 1 13.66-5.66" />
      <path d="M18 4v5h-5" />
      <path d="M20 12a8 8 0 0 1-13.66 5.66" />
      <path d="M6 20v-5h5" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2" />
      <path d="M12 19v2" />
      <path d="M4.2 6.2l1.4 1.4" />
      <path d="M18.4 18.4l1.4 1.4" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
      <path d="M4.2 17.8l1.4-1.4" />
      <path d="M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z" />
    </svg>
  );
}
