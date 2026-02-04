export type RoutineTask = {
  id: string;
  label: string;
  durationSeconds?: number;
};

export const routineTasks: RoutineTask[] = [
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
  // {
  //   id: "timer-tester",
  //   label: "Test timer for 3 seconds, auto-tick, sound",
  //   durationSeconds: 3,
  // },
];
