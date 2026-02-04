import * as React from "react";

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
    label: "Commit changes to codebase and send to GitHub",
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

function playChime() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.0001;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.25, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.1);
    oscillator.stop(context.currentTime + 1.15);
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

  return {
    elapsedMs,
    running,
    start,
    pause,
    reset,
  };
}

export function App() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const stopwatch = useStopwatch();

  const handleToggle = React.useCallback((taskId: string) => {
    setChecked((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f3efe6_0%,_#f8f6f1_40%,_#efe7da_100%)] px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.5)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Daily Routine
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">
                Focus Tracker
              </h1>
            </div>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-100">
              Today
            </div>
          </div>
        </header>

        <section className="rounded-[2.5rem] border border-black/10 bg-slate-950 p-8 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.8)]">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">
                Study Stopwatch
              </p>
              <h2 className="mt-2 text-5xl font-semibold tracking-tight text-amber-50 sm:text-6xl">
                {formatClock(stopwatch.elapsedMs, true)}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-amber-100/80">
                Start this when you begin your learning session. Pause when you
                step away. Reset at the end of the day to see your true focused
                time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={stopwatch.running ? stopwatch.pause : stopwatch.start}
                className="rounded-full bg-amber-200 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-100"
              >
                {stopwatch.running ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={stopwatch.reset}
                className="rounded-full border border-amber-200/40 px-6 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-200/70 hover:text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Today&apos;s Checklist
            </h2>
            <span className="text-sm text-slate-500">
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
    <article className="rounded-2xl border border-black/5 bg-white/80 p-5 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-base font-medium text-slate-900">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(task.id)}
            className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-300"
          />
          <span>{task.label}</span>
        </label>
      </div>
    </article>
  );
}

function TimedTaskCard({ task, checked, onToggle }: TaskCardProps) {
  const timer = useCountdown(task.durationSeconds ?? 0, playChime);

  return (
    <article className="rounded-2xl border border-black/5 bg-white/80 p-5 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-base font-medium text-slate-900">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(task.id)}
            className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-300"
          />
          <span>{task.label}</span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {formatClock(timer.remainingMs)}
          </div>
          <button
            type="button"
            onClick={timer.running ? timer.pause : timer.start}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100 transition hover:bg-slate-800"
          >
            {timer.running ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={timer.reset}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            Reset
          </button>
        </div>
      </div>
    </article>
  );
}
