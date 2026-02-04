import { IconPlayerPauseFilled, IconPlayerPlayFilled, IconRefresh } from "@tabler/icons-react";
import { TaskCardShell } from "@/components/TaskCardShell";
import type { RoutineTask } from "@/data/routineTasks";
import { useCountdown } from "@/hooks/useCountdown";
import { playChime } from "@/lib/audio";
import { formatClock } from "@/lib/time";

type TimedTaskCardProps = {
  task: RoutineTask;
  checked: boolean;
  onToggle: (taskId: string) => void;
  onComplete: (taskId: string) => void;
};

export function TimedTaskCard({
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
    <TaskCardShell task={task} checked={checked} onToggle={onToggle}>
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
          {timer.running ? (
            <IconPlayerPauseFilled className="h-4 w-4" />
          ) : (
            <IconPlayerPlayFilled className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={timer.reset}
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
          aria-label="Reset timer"
          title="Reset timer"
        >
          <IconRefresh className="h-4 w-4" />
        </button>
      </div>
    </TaskCardShell>
  );
}
