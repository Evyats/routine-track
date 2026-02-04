import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { RoutineTask } from "@/data/routineTasks";

type TaskCardShellProps = {
  task: RoutineTask;
  checked: boolean;
  onToggle: (taskId: string) => void;
  children?: React.ReactNode;
};

export function TaskCardShell({
  task,
  checked,
  onToggle,
  children,
}: TaskCardShellProps) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.35)] backdrop-blur dark:bg-card/80">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-base font-medium text-foreground">
          <Checkbox checked={checked} onCheckedChange={() => onToggle(task.id)} />
          <span>{task.label}</span>
        </label>
        {children}
      </div>
    </article>
  );
}
