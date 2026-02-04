import type { RoutineTask } from "@/data/routineTasks";
import { TaskCardShell } from "@/components/TaskCardShell";

type TaskCardProps = {
  task: RoutineTask;
  checked: boolean;
  onToggle: (taskId: string) => void;
};

export function TaskCard({ task, checked, onToggle }: TaskCardProps) {
  return <TaskCardShell task={task} checked={checked} onToggle={onToggle} />;
}
