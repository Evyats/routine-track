import * as React from "react";
import { Link, Route, Routes } from "react-router-dom";
import { ComponentExample } from "@/components/component-example";
import { TaskCard } from "@/components/TaskCard";
import { TimedTaskCard } from "@/components/TimedTaskCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { routineTasks } from "@/data/routineTasks";
import { useStopwatch } from "@/hooks/useStopwatch";
import { formatDateLabel } from "@/lib/date";
import { formatStopwatchDisplay, getMinuteProgress } from "@/lib/time";
import {
  IconMoonFilled,
  IconPencil,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconRefresh,
  IconSunFilled,
} from "@tabler/icons-react";

export function App() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const stopwatch = useStopwatch();
  const [isDark, setIsDark] = React.useState(true);
  const [editHours, setEditHours] = React.useState(0);
  const [editMinutes, setEditMinutes] = React.useState(0);
  const [editSeconds, setEditSeconds] = React.useState(0);
  const [rippleKey, setRippleKey] = React.useState(0);
  const [rippleStyle, setRippleStyle] = React.useState<{
    left: number;
    top: number;
    size: number;
  } | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const stopwatchDisplay = formatStopwatchDisplay(stopwatch.elapsedMs, true);

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
    setEditHours(Math.floor(totalSeconds / 3600));
    setEditMinutes(Math.floor((totalSeconds % 3600) / 60));
    setEditSeconds(totalSeconds % 60);
  }, [stopwatch.elapsedMs, stopwatch.running]);

  const toggleStopwatch = React.useCallback(() => {
    if (stopwatch.running) {
      stopwatch.pause();
    } else {
      stopwatch.start();
    }
  }, [stopwatch]);

  const spawnRippleFromPointer = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isEditOpen) {
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const left = event.clientX - rect.left - size / 2;
      const top = event.clientY - rect.top - size / 2;
      setRippleStyle({ left, top, size });
      setRippleKey((prev) => prev + 1);
    },
    [isEditOpen],
  );

  const handleCircleClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isEditOpen) {
        return;
      }
      spawnRippleFromPointer(event);
      toggleStopwatch();
    },
    [isEditOpen, spawnRippleFromPointer, toggleStopwatch],
  );

  const handleSetTime = React.useCallback(() => {
    if (stopwatch.running) {
      return;
    }
    const hours = Number.isFinite(editHours) ? editHours : 0;
    const minutes = Number.isFinite(editMinutes) ? editMinutes : 0;
    const seconds = Number.isFinite(editSeconds) ? editSeconds : 0;
    const clampedSeconds = Math.min(59, Math.max(0, Math.floor(seconds)));
    const clampedMinutes = Math.max(0, Math.floor(minutes));
    const clampedHours = Math.max(0, Math.floor(hours));
    stopwatch.setTime(
      (clampedHours * 3600 + clampedMinutes * 60 + clampedSeconds) * 1000,
    );
  }, [editHours, editMinutes, editSeconds, stopwatch]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="min-h-screen bg-muted px-4 py-10 text-foreground dark:bg-background">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
              <header className="flex items-center justify-center">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/example"
                    className="rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground"
                  >
                    Example
                  </Link>
                  <div className="rounded-md border border-border bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground">
                    {formatDateLabel()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDark((prev) => !prev)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-card/80 text-foreground/80 transition hover:bg-primary/10 hover:text-foreground dark:bg-card/70"
                    aria-label="Toggle dark mode"
                    title="Toggle dark mode"
                  >
                    {isDark ? (
                      <IconSunFilled className="h-5 w-5" />
                    ) : (
                      <IconMoonFilled className="h-5 w-5" />
                    )}
                  </button>
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
                      if (!isEditOpen) {
                        toggleStopwatch();
                      }
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
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                      {stopwatchDisplay.main}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground/70 sm:text-base">
                      {stopwatchDisplay.hundredths}
                    </span>
                  </div>
                  <Progress
                    value={getMinuteProgress(stopwatch.elapsedMs)}
                    className="mt-3 w-full max-w-xs"
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Start this when you begin your learning session. Pause when
                    you step away. Reset at the end of the day to see your true
                    focused time.
                  </p>
                  <div className="mt-4 flex items-start gap-3">
                    <AlertDialog
                      open={isEditOpen}
                      onOpenChange={setIsEditOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Edit time"
                          title="Edit time"
                          disabled={stopwatch.running}
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Set Stopwatch Time</AlertDialogTitle>
                          <AlertDialogDescription>
                            Enter minutes and seconds. This is only available
                            while paused.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="mt-3 flex items-center gap-3">
                          <input
                            type="number"
                            min={0}
                            value={editHours}
                            onChange={(event) =>
                              setEditHours(Number(event.target.value))
                            }
                            disabled={stopwatch.running}
                            className="w-24 rounded-md border border-border bg-background px-3 py-2 text-center text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Hours"
                          />
                          <span className="text-muted-foreground">:</span>
                          <input
                            type="number"
                            min={0}
                            value={editMinutes}
                            onChange={(event) =>
                              setEditMinutes(Number(event.target.value))
                            }
                            disabled={stopwatch.running}
                            className="w-24 rounded-md border border-border bg-background px-3 py-2 text-center text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Minutes"
                          />
                          <span className="text-muted-foreground">:</span>
                          <input
                            type="number"
                            min={0}
                            max={59}
                            value={editSeconds}
                            onChange={(event) =>
                              setEditSeconds(Number(event.target.value))
                            }
                            disabled={stopwatch.running}
                            className="w-24 rounded-md border border-border bg-background px-3 py-2 text-center text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Seconds"
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSetTime();
                              setIsEditOpen(false);
                            }}
                            disabled={stopwatch.running}
                          >
                            Set Time
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <button
                      type="button"
                      className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
                      aria-label={stopwatch.running ? "Pause" : "Start"}
                      title={stopwatch.running ? "Pause" : "Start"}
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        stopwatch.running ? stopwatch.pause() : stopwatch.start();
                      }}
                    >
                      {stopwatch.running ? (
                        <IconPlayerPauseFilled className="h-5 w-5" />
                      ) : (
                        <IconPlayerPlayFilled className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        stopwatch.reset();
                      }}
                      className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
                      aria-label="Reset"
                      title="Reset"
                      onMouseDown={(event) => event.stopPropagation()}
                    >
                      <IconRefresh className="h-4 w-4" />
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
